const express = require('express');
const RecommendationEngine = require('../services/recommendationEngine');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get personalized recommendations
router.get('/', auth, async (req, res) => {
  try {
    const {
      limit = 20,
      explorationLevel = null,
      mood = null,
      genre = null
    } = req.query;

    // Check if user has any connected services
    if (req.user.getConnectedServicesCount() === 0) {
      return res.status(400).json({ 
        message: 'Please connect at least one music service to get recommendations' 
      });
    }

    // Initialize recommendation engine
    const recommendationEngine = new RecommendationEngine(req.user);

    // Generate recommendations
    const recommendations = await recommendationEngine.generateRecommendations({
      limit: parseInt(limit),
      explorationLevel: explorationLevel ? parseFloat(explorationLevel) : req.user.profile.preferences.explorationLevel,
      mood,
      genre
    });

    res.json({
      recommendations: recommendations.map(rec => ({
        name: rec.name,
        artist: rec.artist,
        album: rec.album,
        service: rec.service,
        serviceId: rec.serviceId,
        url: rec.url,
        duration: rec.duration,
        match: rec.match,
        popularity: rec.popularity
      })),
      total: recommendations.length,
      filters: {
        explorationLevel: explorationLevel || req.user.profile.preferences.explorationLevel,
        mood,
        genre
      }
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      message: 'Error getting recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get listening habits analysis
router.get('/habits', auth, async (req, res) => {
  try {
    // Check if user has any connected services
    if (req.user.getConnectedServicesCount() === 0) {
      return res.status(400).json({ 
        message: 'Please connect at least one music service to analyze listening habits' 
      });
    }

    // Initialize recommendation engine
    const recommendationEngine = new RecommendationEngine(req.user);

    // Get aggregated listening data
    const listeningData = await recommendationEngine.getAggregatedListeningData();

    res.json({
      listeningData: {
        totalTracks: listeningData.totalTracks,
        recentTracks: listeningData.recentTracks.slice(0, 20), // Limit for response size
        topTracks: listeningData.topTracks.slice(0, 20),
        topArtists: listeningData.topArtists.slice(0, 20),
        topGenres: listeningData.topGenres,
        lastSync: req.user.listeningData.lastSync
      },
      insights: {
        mostPlayedArtist: listeningData.topArtists[0]?.name || 'Unknown',
        mostPlayedGenre: listeningData.topGenres[0]?.name || 'Unknown',
        totalPlayTime: listeningData.recentTracks.reduce((sum, track) => sum + (track.duration || 0), 0),
        averageTrackLength: listeningData.recentTracks.length > 0 
          ? listeningData.recentTracks.reduce((sum, track) => sum + (track.duration || 0), 0) / listeningData.recentTracks.length
          : 0
      }
    });
  } catch (error) {
    console.error('Error analyzing listening habits:', error);
    res.status(500).json({ 
      message: 'Error analyzing listening habits',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get similar tracks for a specific track
router.post('/similar', auth, async (req, res) => {
  try {
    const { name, artist, service } = req.body;

    if (!name || !artist) {
      return res.status(400).json({ message: 'Track name and artist are required' });
    }

    // Check if user has the required service connected
    if (service && !req.user.isServiceConnected(service)) {
      return res.status(400).json({ 
        message: `${service} service not connected` 
      });
    }

    // Initialize recommendation engine
    const recommendationEngine = new RecommendationEngine(req.user);

    let similarTracks = [];

    // Get similar tracks based on connected services
    if (req.user.connectedServices.lastfm?.connected) {
      const lastfmService = recommendationEngine.services.lastfm;
      if (lastfmService) {
        const lastfmSimilar = await lastfmService.getSimilarTracks(artist, name, 10);
        similarTracks.push(...lastfmSimilar);
      }
    }

    if (req.user.connectedServices.spotify?.connected) {
      const spotifyService = recommendationEngine.services.spotify;
      if (spotifyService) {
        // Search for the track first
        const searchResults = await spotifyService.searchTracks(`${name} ${artist}`, 5);
        if (searchResults.length > 0) {
          const trackId = searchResults[0].serviceId;
          const spotifySimilar = await spotifyService.getRecommendations([trackId], [], [], 10);
          similarTracks.push(...spotifySimilar);
        }
      }
    }

    // Remove duplicates
    const uniqueSimilar = recommendationEngine.removeDuplicateTracks(similarTracks);

    res.json({
      similarTracks: uniqueSimilar.slice(0, 20).map(track => ({
        name: track.name,
        artist: track.artist,
        album: track.album,
        service: track.service,
        serviceId: track.serviceId,
        url: track.url,
        match: track.match,
        duration: track.duration
      })),
      originalTrack: { name, artist, service },
      total: uniqueSimilar.length
    });
  } catch (error) {
    console.error('Error getting similar tracks:', error);
    res.status(500).json({ 
      message: 'Error getting similar tracks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get mood-based recommendations
router.get('/mood/:mood', auth, async (req, res) => {
  try {
    const { mood } = req.params;
    const { limit = 20 } = req.query;

    // Validate mood
    const validMoods = ['happy', 'sad', 'energetic', 'calm', 'melancholic', 'intense', 'neutral'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({ 
        message: 'Invalid mood. Valid moods: ' + validMoods.join(', ') 
      });
    }

    // Check if user has any connected services
    if (req.user.getConnectedServicesCount() === 0) {
      return res.status(400).json({ 
        message: 'Please connect at least one music service to get mood-based recommendations' 
      });
    }

    // Initialize recommendation engine
    const recommendationEngine = new RecommendationEngine(req.user);

    // Generate mood-based recommendations
    const recommendations = await recommendationEngine.generateRecommendations({
      limit: parseInt(limit),
      mood,
      explorationLevel: req.user.profile.preferences.explorationLevel
    });

    res.json({
      recommendations: recommendations.map(rec => ({
        name: rec.name,
        artist: rec.artist,
        album: rec.album,
        service: rec.service,
        serviceId: rec.serviceId,
        url: rec.url,
        duration: rec.duration,
        match: rec.match
      })),
      mood,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Error getting mood-based recommendations:', error);
    res.status(500).json({ 
      message: 'Error getting mood-based recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get genre-based recommendations
router.get('/genre/:genre', auth, async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = 20 } = req.query;

    // Check if user has any connected services
    if (req.user.getConnectedServicesCount() === 0) {
      return res.status(400).json({ 
        message: 'Please connect at least one music service to get genre-based recommendations' 
      });
    }

    // Initialize recommendation engine
    const recommendationEngine = new RecommendationEngine(req.user);

    // Generate genre-based recommendations
    const recommendations = await recommendationEngine.generateRecommendations({
      limit: parseInt(limit),
      genre,
      explorationLevel: req.user.profile.preferences.explorationLevel
    });

    res.json({
      recommendations: recommendations.map(rec => ({
        name: rec.name,
        artist: rec.artist,
        album: rec.album,
        service: rec.service,
        serviceId: rec.serviceId,
        url: rec.url,
        duration: rec.duration,
        match: rec.match
      })),
      genre,
      total: recommendations.length
    });
  } catch (error) {
    console.error('Error getting genre-based recommendations:', error);
    res.status(500).json({ 
      message: 'Error getting genre-based recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get discovery recommendations (high exploration level)
router.get('/discovery', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // Check if user has any connected services
    if (req.user.getConnectedServicesCount() === 0) {
      return res.status(400).json({ 
        message: 'Please connect at least one music service to get discovery recommendations' 
      });
    }

    // Initialize recommendation engine
    const recommendationEngine = new RecommendationEngine(req.user);

    // Generate discovery recommendations with high exploration level
    const recommendations = await recommendationEngine.generateRecommendations({
      limit: parseInt(limit),
      explorationLevel: 0.8 // High exploration
    });

    res.json({
      recommendations: recommendations.map(rec => ({
        name: rec.name,
        artist: rec.artist,
        album: rec.album,
        service: rec.service,
        serviceId: rec.serviceId,
        url: rec.url,
        duration: rec.duration,
        match: rec.match
      })),
      type: 'discovery',
      total: recommendations.length
    });
  } catch (error) {
    console.error('Error getting discovery recommendations:', error);
    res.status(500).json({ 
      message: 'Error getting discovery recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
