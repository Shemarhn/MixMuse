const express = require('express');
const Playlist = require('../models/Playlist');
const RecommendationEngine = require('../services/recommendationEngine');
const { auth, requireService } = require('../middleware/auth');

const router = express.Router();

// Get user's playlists
router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'profile.displayName');

    res.json({
      playlists: playlists.map(playlist => ({
        id: playlist._id,
        name: playlist.name,
        description: playlist.description,
        trackCount: playlist.trackCount,
        metadata: playlist.metadata,
        settings: playlist.settings,
        generatedBy: playlist.generatedBy,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific playlist
router.get('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({
      id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      tracks: playlist.tracks,
      metadata: playlist.metadata,
      settings: playlist.settings,
      generatedBy: playlist.generatedBy,
      sourceServices: playlist.sourceServices,
      exportStatus: playlist.exportStatus,
      analytics: playlist.analytics,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate new playlist
router.post('/generate', auth, async (req, res) => {
  try {
    const {
      name = 'Daily Mix',
      description = 'AI-curated playlist based on your listening habits',
      length = req.user.profile.preferences.playlistLength,
      mood = null,
      genre = null,
      explorationLevel = req.user.profile.preferences.explorationLevel
    } = req.body;

    // Check if user has any connected services
    if (req.user.getConnectedServicesCount() === 0) {
      return res.status(400).json({ 
        message: 'Please connect at least one music service to generate playlists' 
      });
    }

    // Initialize recommendation engine
    const recommendationEngine = new RecommendationEngine(req.user);

    // Generate playlist
    const playlistData = await recommendationEngine.generatePlaylist({
      name,
      description,
      length,
      mood,
      genre
    });

    // Save playlist to database
    const playlist = new Playlist({
      name: playlistData.name,
      description: playlistData.description,
      user: req.user._id,
      tracks: playlistData.tracks,
      metadata: playlistData.metadata,
      generatedBy: playlistData.generatedBy,
      sourceServices: playlistData.sourceServices
    });

    await playlist.save();

    // Add playlist to user's playlists
    req.user.playlists.push(playlist._id);
    await req.user.save();

    res.status(201).json({
      message: 'Playlist generated successfully',
      playlist: {
        id: playlist._id,
        name: playlist.name,
        description: playlist.description,
        trackCount: playlist.trackCount,
        metadata: playlist.metadata,
        generatedBy: playlist.generatedBy,
        sourceServices: playlist.sourceServices,
        createdAt: playlist.createdAt
      }
    });
  } catch (error) {
    console.error('Error generating playlist:', error);
    res.status(500).json({ 
      message: 'Error generating playlist',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update playlist
router.put('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const { name, description, settings } = req.body;

    if (name) playlist.name = name;
    if (description) playlist.description = description;
    if (settings) {
      playlist.settings = { ...playlist.settings, ...settings };
    }

    await playlist.save();

    res.json({
      message: 'Playlist updated successfully',
      playlist: {
        id: playlist._id,
        name: playlist.name,
        description: playlist.description,
        settings: playlist.settings,
        updatedAt: playlist.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete playlist
router.delete('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    // Remove from user's playlists
    req.user.playlists = req.user.playlists.filter(
      playlistId => playlistId.toString() !== req.params.id
    );
    await req.user.save();

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reorder tracks in playlist
router.put('/:id/reorder', auth, async (req, res) => {
  try {
    const { trackOrder } = req.body;

    if (!Array.isArray(trackOrder)) {
      return res.status(400).json({ message: 'trackOrder must be an array' });
    }

    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    await playlist.reorderTracks(trackOrder);

    res.json({ 
      message: 'Tracks reordered successfully',
      tracks: playlist.tracks.map(track => ({
        id: track._id,
        name: track.name,
        artist: track.artist,
        position: track.position
      }))
    });
  } catch (error) {
    console.error('Error reordering tracks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add track to playlist
router.post('/:id/tracks', auth, async (req, res) => {
  try {
    const { name, artist, album, duration, service, serviceId, url } = req.body;

    if (!name || !artist) {
      return res.status(400).json({ message: 'Track name and artist are required' });
    }

    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const track = {
      name,
      artist,
      album: album || 'Unknown Album',
      duration: duration || 0,
      service: service || 'unknown',
      serviceId: serviceId || `${artist} - ${name}`,
      url: url || ''
    };

    await playlist.addTrack(track);

    res.json({
      message: 'Track added successfully',
      track: {
        id: playlist.tracks[playlist.tracks.length - 1]._id,
        name: track.name,
        artist: track.artist,
        position: playlist.tracks.length
      }
    });
  } catch (error) {
    console.error('Error adding track:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove track from playlist
router.delete('/:id/tracks/:trackId', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    await playlist.removeTrack(req.params.trackId);

    res.json({ message: 'Track removed successfully' });
  } catch (error) {
    console.error('Error removing track:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export playlist to service
router.post('/:id/export/:service', auth, requireService('spotify'), async (req, res) => {
  try {
    const { service } = req.params;
    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // This would integrate with the specific service's export functionality
    // For now, return a placeholder response
    res.json({
      message: `Playlist export to ${service} initiated`,
      exportId: `export_${Date.now()}`,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error exporting playlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get playlist analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    res.json({
      analytics: playlist.analytics,
      metadata: playlist.metadata,
      trackCount: playlist.trackCount,
      totalDuration: playlist.metadata.totalDuration
    });
  } catch (error) {
    console.error('Error fetching playlist analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
