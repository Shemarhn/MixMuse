const axios = require('axios');

class SpotifyService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.spotify.com/v1';
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Spotify API error:', error.response?.data || error.message);
      throw new Error(`Spotify API error: ${error.response?.status || 'Unknown error'}`);
    }
  }

  // Get user's recently played tracks
  async getRecentlyPlayed(limit = 50) {
    const data = await this.makeRequest(`/me/player/recently-played?limit=${limit}`);
    return data.items.map(item => ({
      name: item.track.name,
      artist: item.track.artists[0].name,
      album: item.track.album.name,
      playedAt: new Date(item.played_at),
      service: 'spotify',
      serviceId: item.track.id,
      url: item.track.external_urls.spotify,
      duration: Math.round(item.track.duration_ms / 1000),
      popularity: item.track.popularity
    }));
  }

  // Get user's top tracks
  async getTopTracks(timeRange = 'medium_term', limit = 50) {
    const data = await this.makeRequest(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`);
    return data.items.map(track => ({
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      service: 'spotify',
      serviceId: track.id,
      url: track.external_urls.spotify,
      duration: Math.round(track.duration_ms / 1000),
      popularity: track.popularity
    }));
  }

  // Get user's top artists
  async getTopArtists(timeRange = 'medium_term', limit = 50) {
    const data = await this.makeRequest(`/me/top/artists?time_range=${timeRange}&limit=${limit}`);
    return data.items.map(artist => ({
      name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity,
      followers: artist.followers.total,
      service: 'spotify',
      serviceId: artist.id,
      url: artist.external_urls.spotify
    }));
  }

  // Get audio features for tracks
  async getAudioFeatures(trackIds) {
    if (!Array.isArray(trackIds)) {
      trackIds = [trackIds];
    }

    const data = await this.makeRequest(`/audio-features?ids=${trackIds.join(',')}`);
    return data.audio_features.map(features => ({
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
      timeSignature: features.time_signature,
      duration: Math.round(features.duration_ms / 1000)
    }));
  }

  // Get recommendations
  async getRecommendations(seedTracks = [], seedArtists = [], seedGenres = [], limit = 20) {
    const params = new URLSearchParams();
    
    if (seedTracks.length > 0) params.append('seed_tracks', seedTracks.join(','));
    if (seedArtists.length > 0) params.append('seed_artists', seedArtists.join(','));
    if (seedGenres.length > 0) params.append('seed_genres', seedGenres.join(','));
    
    params.append('limit', limit);

    const data = await this.makeRequest(`/recommendations?${params.toString()}`);
    return data.tracks.map(track => ({
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      service: 'spotify',
      serviceId: track.id,
      url: track.external_urls.spotify,
      duration: Math.round(track.duration_ms / 1000),
      popularity: track.popularity
    }));
  }

  // Search for tracks
  async searchTracks(query, limit = 20) {
    const data = await this.makeRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`);
    return data.tracks.items.map(track => ({
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      service: 'spotify',
      serviceId: track.id,
      url: track.external_urls.spotify,
      duration: Math.round(track.duration_ms / 1000),
      popularity: track.popularity
    }));
  }

  // Create playlist
  async createPlaylist(userId, name, description = '', isPublic = false) {
    const data = await this.makeRequest(`/users/${userId}/playlists`, 'POST', {
      name,
      description,
      public: isPublic
    });

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      url: data.external_urls.spotify,
      tracks: data.tracks.total
    };
  }

  // Add tracks to playlist
  async addTracksToPlaylist(playlistId, trackUris) {
    const data = await this.makeRequest(`/playlists/${playlistId}/tracks`, 'POST', {
      uris: trackUris
    });

    return {
      snapshotId: data.snapshot_id,
      addedTracks: trackUris.length
    };
  }

  // Get user profile
  async getUserProfile() {
    const data = await this.makeRequest('/me');
    return {
      id: data.id,
      displayName: data.display_name,
      email: data.email,
      followers: data.followers.total,
      country: data.country,
      product: data.product
    };
  }

  // Get available genres
  async getAvailableGenres() {
    const data = await this.makeRequest('/recommendations/available-genre-seeds');
    return data.genres;
  }
}

module.exports = SpotifyService;
