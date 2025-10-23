const SpotifyService = require('./spotifyService');
const YouTubeService = require('./youtubeService');
const LastFMService = require('./lastfmService');

class RecommendationEngine {
  constructor(user) {
    this.user = user;
    this.services = this.initializeServices();
  }

  initializeServices() {
    const services = {};

    if (this.user.connectedServices.spotify?.connected) {
      services.spotify = new SpotifyService(this.user.connectedServices.spotify.accessToken);
    }

    if (this.user.connectedServices.youtube?.connected) {
      services.youtube = new YouTubeService(this.user.connectedServices.youtube.accessToken);
    }

    if (this.user.connectedServices.lastfm?.connected) {
      services.lastfm = new LastFMService(
        process.env.LASTFM_API_KEY,
        this.user.connectedServices.lastfm.username
      );
    }

    return services;
  }

  // Get aggregated listening data from all connected services
  async getAggregatedListeningData() {
    const listeningData = {
      recentTracks: [],
      topTracks: [],
      topArtists: [],
      topGenres: [],
      totalTracks: 0
    };

    try {
      // Get data from each connected service
      const promises = [];

      if (this.services.spotify) {
        promises.push(
          this.services.spotify.getRecentlyPlayed(50),
          this.services.spotify.getTopTracks('medium_term', 50),
          this.services.spotify.getTopArtists('medium_term', 50)
        );
      }

      if (this.services.youtube) {
        promises.push(
          this.services.youtube.getWatchHistory(50),
          this.services.youtube.getLikedVideos(50)
        );
      }

      if (this.services.lastfm) {
        promises.push(
          this.services.lastfm.getRecentTracks(50),
          this.services.lastfm.getTopTracks('3month', 50),
          this.services.lastfm.getTopArtists('3month', 50)
        );
      }

      const results = await Promise.allSettled(promises);
      
      // Process results
      let resultIndex = 0;
      
      if (this.services.spotify) {
        const [recent, topTracks, topArtists] = results.slice(resultIndex, resultIndex + 3);
        if (recent.status === 'fulfilled') listeningData.recentTracks.push(...recent.value);
        if (topTracks.status === 'fulfilled') listeningData.topTracks.push(...topTracks.value);
        if (topArtists.status === 'fulfilled') listeningData.topArtists.push(...topArtists.value);
        resultIndex += 3;
      }

      if (this.services.youtube) {
        const [watchHistory, likedVideos] = results.slice(resultIndex, resultIndex + 2);
        if (watchHistory.status === 'fulfilled') listeningData.recentTracks.push(...watchHistory.value);
        if (likedVideos.status === 'fulfilled') listeningData.topTracks.push(...likedVideos.value);
        resultIndex += 2;
      }

      if (this.services.lastfm) {
        const [recent, topTracks, topArtists] = results.slice(resultIndex, resultIndex + 3);
        if (recent.status === 'fulfilled') listeningData.recentTracks.push(...recent.value);
        if (topTracks.status === 'fulfilled') listeningData.topTracks.push(...topTracks.value);
        if (topArtists.status === 'fulfilled') listeningData.topArtists.push(...topArtists.value);
      }

      // Remove duplicates and calculate totals
      listeningData.recentTracks = this.removeDuplicateTracks(listeningData.recentTracks);
      listeningData.topTracks = this.removeDuplicateTracks(listeningData.topTracks);
      listeningData.topArtists = this.removeDuplicateArtists(listeningData.topArtists);
      listeningData.totalTracks = listeningData.recentTracks.length + listeningData.topTracks.length;

      // Analyze genres
      listeningData.topGenres = this.analyzeGenres(listeningData.topArtists);

      return listeningData;
    } catch (error) {
      console.error('Error getting aggregated listening data:', error);
      throw error;
    }
  }

  // Generate recommendations based on user's listening habits
  async generateRecommendations(options = {}) {
    const {
      limit = 50,
      explorationLevel = this.user.profile.preferences.explorationLevel,
      mood = null,
      genre = null
    } = options;

    try {
      const listeningData = await this.getAggregatedListeningData();
      const recommendations = [];

      // Get recommendations from each service
      const promises = [];

      if (this.services.spotify && listeningData.topTracks.length > 0) {
        const spotifyTracks = listeningData.topTracks.filter(track => track.service === 'spotify');
        if (spotifyTracks.length > 0) {
          const seedTracks = spotifyTracks.slice(0, 5).map(track => track.serviceId);
          const seedArtists = listeningData.topArtists
            .filter(artist => artist.service === 'spotify')
            .slice(0, 3)
            .map(artist => artist.serviceId);

          promises.push(
            this.services.spotify.getRecommendations(seedTracks, seedArtists, [], limit)
          );
        }
      }

      if (this.services.lastfm && listeningData.topTracks.length > 0) {
        const lastfmTracks = listeningData.topTracks.filter(track => track.service === 'lastfm');
        if (lastfmTracks.length > 0) {
          // Get similar tracks for top tracks
          const similarPromises = lastfmTracks.slice(0, 5).map(track => 
            this.services.lastfm.getSimilarTracks(track.artist, track.name, 10)
          );
          promises.push(Promise.all(similarPromises));
        }
      }

      const results = await Promise.allSettled(promises);

      // Process results
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          if (Array.isArray(result.value)) {
            // Spotify recommendations
            recommendations.push(...result.value);
          } else {
            // Last.fm similar tracks (flattened)
            result.value.forEach(similarTracks => {
              recommendations.push(...similarTracks);
            });
          }
        }
      });

      // Remove duplicates and filter by exploration level
      const uniqueRecommendations = this.removeDuplicateTracks(recommendations);
      const filteredRecommendations = this.filterByExplorationLevel(
        uniqueRecommendations, 
        explorationLevel
      );

      // Apply mood and genre filters if specified
      let finalRecommendations = filteredRecommendations;
      
      if (mood) {
        finalRecommendations = await this.filterByMood(finalRecommendations, mood);
      }
      
      if (genre) {
        finalRecommendations = await this.filterByGenre(finalRecommendations, genre);
      }

      return finalRecommendations.slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  // Generate a curated playlist
  async generatePlaylist(options = {}) {
    const {
      name = 'Daily Mix',
      description = 'AI-curated playlist based on your listening habits',
      length = this.user.profile.preferences.playlistLength,
      mood = null,
      genre = null
    } = options;

    try {
      // Get recommendations
      const recommendations = await this.generateRecommendations({
        limit: length * 2, // Get more than needed for better selection
        mood,
        genre
      });

      if (recommendations.length === 0) {
        throw new Error('No recommendations available');
      }

      // Get audio features for Spotify tracks
      const spotifyTracks = recommendations.filter(track => track.service === 'spotify');
      let audioFeatures = [];

      if (spotifyTracks.length > 0 && this.services.spotify) {
        const trackIds = spotifyTracks.map(track => track.serviceId);
        audioFeatures = await this.services.spotify.getAudioFeatures(trackIds);
      }

      // Create playlist tracks with audio features
      const playlistTracks = recommendations.slice(0, length).map((track, index) => {
        const features = audioFeatures.find(f => f && track.service === 'spotify') || {};
        
        return {
          name: track.name,
          artist: track.artist,
          album: track.album || 'Unknown Album',
          duration: track.duration || 0,
          service: track.service,
          serviceId: track.serviceId,
          url: track.url,
          position: index + 1,
          audioFeatures: {
            danceability: features.danceability,
            energy: features.energy,
            key: features.key,
            loudness: features.loudness,
            mode: features.mode,
            speechiness: features.speechiness,
            acousticness: features.acousticness,
            instrumentalness: features.instrumentalness,
            liveness: features.liveness,
            valence: features.valence,
            tempo: features.tempo,
            timeSignature: features.timeSignature
          }
        };
      });

      // Optimize track order for smooth transitions
      const optimizedTracks = this.optimizeTrackOrder(playlistTracks);

      return {
        name,
        description,
        tracks: optimizedTracks,
        metadata: this.calculatePlaylistMetadata(optimizedTracks),
        generatedBy: 'ai',
        sourceServices: Object.keys(this.services)
      };
    } catch (error) {
      console.error('Error generating playlist:', error);
      throw error;
    }
  }

  // Remove duplicate tracks based on name and artist
  removeDuplicateTracks(tracks) {
    const seen = new Set();
    return tracks.filter(track => {
      const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Remove duplicate artists
  removeDuplicateArtists(artists) {
    const seen = new Set();
    return artists.filter(artist => {
      const key = artist.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Analyze genres from artists
  analyzeGenres(artists) {
    const genreCount = {};
    
    artists.forEach(artist => {
      if (artist.genres) {
        artist.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    return Object.entries(genreCount)
      .map(([genre, count]) => ({ name: genre, playCount: count }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10);
  }

  // Filter recommendations by exploration level
  filterByExplorationLevel(recommendations, explorationLevel) {
    if (explorationLevel === 0) {
      // Return only familiar tracks
      return recommendations.filter(track => track.match && track.match > 0.7);
    } else if (explorationLevel === 1) {
      // Return only new/unknown tracks
      return recommendations.filter(track => !track.match || track.match < 0.3);
    } else {
      // Return mixed recommendations
      const familiar = recommendations.filter(track => track.match && track.match > 0.5);
      const newTracks = recommendations.filter(track => !track.match || track.match < 0.5);
      
      const familiarCount = Math.floor(recommendations.length * (1 - explorationLevel));
      const newCount = recommendations.length - familiarCount;
      
      return [
        ...familiar.slice(0, familiarCount),
        ...newTracks.slice(0, newCount)
      ];
    }
  }

  // Filter by mood (simplified implementation)
  async filterByMood(tracks, mood) {
    // This would ideally use audio features to filter by mood
    // For now, return tracks as-is
    return tracks;
  }

  // Filter by genre
  async filterByGenre(tracks, genre) {
    // This would ideally use genre information from services
    // For now, return tracks as-is
    return tracks;
  }

  // Optimize track order for smooth transitions
  optimizeTrackOrder(tracks) {
    if (tracks.length <= 1) return tracks;

    const optimized = [tracks[0]]; // Start with first track
    const remaining = tracks.slice(1);

    while (remaining.length > 0) {
      const lastTrack = optimized[optimized.length - 1];
      const bestNext = this.findBestNextTrack(lastTrack, remaining);
      
      optimized.push(bestNext);
      const index = remaining.indexOf(bestNext);
      remaining.splice(index, 1);
    }

    return optimized;
  }

  // Find the best next track based on audio features
  findBestNextTrack(currentTrack, candidates) {
    if (!currentTrack.audioFeatures || candidates.length === 0) {
      return candidates[0];
    }

    let bestTrack = candidates[0];
    let bestScore = -1;

    candidates.forEach(track => {
      if (!track.audioFeatures) return;

      const score = this.calculateTransitionScore(currentTrack.audioFeatures, track.audioFeatures);
      if (score > bestScore) {
        bestScore = score;
        bestTrack = track;
      }
    });

    return bestTrack;
  }

  // Calculate transition score between two tracks
  calculateTransitionScore(features1, features2) {
    if (!features1 || !features2) return 0;

    const weights = {
      tempo: 0.3,
      key: 0.2,
      energy: 0.2,
      valence: 0.15,
      danceability: 0.15
    };

    let score = 0;

    // Tempo compatibility (prefer similar tempos)
    if (features1.tempo && features2.tempo) {
      const tempoDiff = Math.abs(features1.tempo - features2.tempo);
      score += weights.tempo * Math.max(0, 1 - tempoDiff / 50);
    }

    // Key compatibility (prefer harmonic keys)
    if (features1.key !== undefined && features2.key !== undefined) {
      const keyCompatibility = this.getKeyCompatibility(features1.key, features2.key);
      score += weights.key * keyCompatibility;
    }

    // Energy compatibility
    if (features1.energy !== undefined && features2.energy !== undefined) {
      const energyDiff = Math.abs(features1.energy - features2.energy);
      score += weights.energy * Math.max(0, 1 - energyDiff);
    }

    // Valence compatibility
    if (features1.valence !== undefined && features2.valence !== undefined) {
      const valenceDiff = Math.abs(features1.valence - features2.valence);
      score += weights.valence * Math.max(0, 1 - valenceDiff);
    }

    // Danceability compatibility
    if (features1.danceability !== undefined && features2.danceability !== undefined) {
      const danceabilityDiff = Math.abs(features1.danceability - features2.danceability);
      score += weights.danceability * Math.max(0, 1 - danceabilityDiff);
    }

    return score;
  }

  // Get key compatibility (simplified Camelot wheel)
  getKeyCompatibility(key1, key2) {
    const camelotWheel = {
      0: '8B', 1: '3B', 2: '10B', 3: '5B', 4: '12B', 5: '7B',
      6: '2B', 7: '9B', 8: '4B', 9: '11B', 10: '6B', 11: '1B'
    };

    const camelot1 = camelotWheel[key1];
    const camelot2 = camelotWheel[key2];

    if (!camelot1 || !camelot2) return 0.5;

    // Same key
    if (camelot1 === camelot2) return 1.0;

    // Adjacent keys (perfect transitions)
    const adjacentKeys = this.getAdjacentCamelotKeys(camelot1);
    if (adjacentKeys.includes(camelot2)) return 0.8;

    // Relative major/minor
    if (this.isRelativeKey(camelot1, camelot2)) return 0.6;

    return 0.3; // Default compatibility
  }

  // Get adjacent Camelot keys
  getAdjacentCamelotKeys(key) {
    const wheel = ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B'];
    const index = wheel.indexOf(key);
    if (index === -1) return [];

    const prev = wheel[(index - 1 + wheel.length) % wheel.length];
    const next = wheel[(index + 1) % wheel.length];
    
    return [prev, next];
  }

  // Check if keys are relative major/minor
  isRelativeKey(key1, key2) {
    // Simplified relative key mapping
    const relativeKeys = {
      '1B': '1A', '2B': '2A', '3B': '3A', '4B': '4A',
      '5B': '5A', '6B': '6A', '7B': '7A', '8B': '8A',
      '9B': '9A', '10B': '10A', '11B': '11A', '12B': '12A'
    };

    return relativeKeys[key1] === key2 || relativeKeys[key2] === key1;
  }

  // Calculate playlist metadata
  calculatePlaylistMetadata(tracks) {
    if (tracks.length === 0) {
      return {
        totalDuration: 0,
        averageTempo: 0,
        dominantKey: null,
        energyLevel: 0,
        mood: 'neutral',
        genre: 'mixed'
      };
    }

    const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    
    const tracksWithTempo = tracks.filter(track => track.audioFeatures?.tempo);
    const averageTempo = tracksWithTempo.length > 0 
      ? tracksWithTempo.reduce((sum, track) => sum + track.audioFeatures.tempo, 0) / tracksWithTempo.length
      : 0;

    const tracksWithEnergy = tracks.filter(track => track.audioFeatures?.energy !== undefined);
    const energyLevel = tracksWithEnergy.length > 0
      ? tracksWithEnergy.reduce((sum, track) => sum + track.audioFeatures.energy, 0) / tracksWithEnergy.length
      : 0;

    const tracksWithValence = tracks.filter(track => track.audioFeatures?.valence !== undefined);
    const averageValence = tracksWithValence.length > 0
      ? tracksWithValence.reduce((sum, track) => sum + track.audioFeatures.valence, 0) / tracksWithValence.length
      : 0.5;

    // Determine mood based on valence and energy
    let mood = 'neutral';
    if (averageValence > 0.6 && energyLevel > 0.6) mood = 'happy';
    else if (averageValence > 0.6 && energyLevel < 0.4) mood = 'calm';
    else if (averageValence < 0.4 && energyLevel > 0.6) mood = 'intense';
    else if (averageValence < 0.4 && energyLevel < 0.4) mood = 'melancholic';

    return {
      totalDuration,
      averageTempo,
      dominantKey: this.getDominantKey(tracks),
      energyLevel,
      mood,
      genre: 'mixed' // Would need genre analysis
    };
  }

  // Get dominant key from tracks
  getDominantKey(tracks) {
    const keyCount = {};
    tracks.forEach(track => {
      if (track.audioFeatures?.key !== undefined) {
        keyCount[track.audioFeatures.key] = (keyCount[track.audioFeatures.key] || 0) + 1;
      }
    });

    const dominantKey = Object.entries(keyCount)
      .sort(([,a], [,b]) => b - a)[0];

    return dominantKey ? dominantKey[0] : null;
  }
}

module.exports = RecommendationEngine;
