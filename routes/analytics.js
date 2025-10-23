const express = require('express');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's listening analytics
router.get('/listening', auth, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const analytics = {
      period,
      startDate,
      endDate: now,
      totalTracks: req.user.listeningData.totalTracks,
      topArtists: req.user.listeningData.topArtists.slice(0, 10),
      topGenres: req.user.listeningData.topGenres.slice(0, 10),
      recentTracks: req.user.listeningData.recentTracks.slice(0, 20),
      connectedServices: Object.keys(req.user.connectedServices).filter(
        service => req.user.isServiceConnected(service)
      ),
      lastSync: req.user.listeningData.lastSync
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching listening analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get playlist analytics
router.get('/playlists', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id });

    const analytics = {
      totalPlaylists: playlists.length,
      totalTracks: playlists.reduce((sum, playlist) => sum + playlist.trackCount, 0),
      totalDuration: playlists.reduce((sum, playlist) => sum + (playlist.metadata.totalDuration || 0), 0),
      averagePlaylistLength: playlists.length > 0 
        ? playlists.reduce((sum, playlist) => sum + playlist.trackCount, 0) / playlists.length 
        : 0,
      mostPlayedPlaylist: playlists.length > 0 
        ? playlists.reduce((max, playlist) => 
            (playlist.analytics.playCount || 0) > (max.analytics.playCount || 0) ? playlist : max
          )
        : null,
      generatedBy: {
        ai: playlists.filter(p => p.generatedBy === 'ai').length,
        manual: playlists.filter(p => p.generatedBy === 'manual').length,
        hybrid: playlists.filter(p => p.generatedBy === 'hybrid').length
      },
      exportStatus: {
        spotify: playlists.filter(p => p.exportStatus.spotify.exported).length,
        youtube: playlists.filter(p => p.exportStatus.youtube.exported).length,
        apple: playlists.filter(p => p.exportStatus.apple.exported).length
      },
      recentPlaylists: playlists
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(playlist => ({
          id: playlist._id,
          name: playlist.name,
          trackCount: playlist.trackCount,
          createdAt: playlist.createdAt,
          generatedBy: playlist.generatedBy
        }))
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching playlist analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get genre analysis
router.get('/genres', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const genreAnalysis = {
      topGenres: req.user.listeningData.topGenres.slice(0, parseInt(limit)),
      genreDistribution: req.user.listeningData.topGenres.reduce((acc, genre) => {
        acc[genre.name] = genre.playCount;
        return acc;
      }, {}),
      totalGenres: req.user.listeningData.topGenres.length,
      mostPlayedGenre: req.user.listeningData.topGenres[0] || null
    };

    res.json({ genreAnalysis });
  } catch (error) {
    console.error('Error fetching genre analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get artist analysis
router.get('/artists', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const artistAnalysis = {
      topArtists: req.user.listeningData.topArtists.slice(0, parseInt(limit)),
      artistDistribution: req.user.listeningData.topArtists.reduce((acc, artist) => {
        acc[artist.name] = artist.playCount;
        return acc;
      }, {}),
      totalArtists: req.user.listeningData.topArtists.length,
      mostPlayedArtist: req.user.listeningData.topArtists[0] || null,
      averagePlayCount: req.user.listeningData.topArtists.length > 0
        ? req.user.listeningData.topArtists.reduce((sum, artist) => sum + artist.playCount, 0) / req.user.listeningData.topArtists.length
        : 0
    };

    res.json({ artistAnalysis });
  } catch (error) {
    console.error('Error fetching artist analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get mood analysis
router.get('/moods', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id });

    const moodCounts = {};
    playlists.forEach(playlist => {
      const mood = playlist.metadata.mood || 'neutral';
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });

    const moodAnalysis = {
      moodDistribution: moodCounts,
      totalMoods: Object.keys(moodCounts).length,
      dominantMood: Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral',
      moodTrends: Object.entries(moodCounts)
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count)
    };

    res.json({ moodAnalysis });
  } catch (error) {
    console.error('Error fetching mood analysis:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service usage analytics
router.get('/services', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id });

    const serviceUsage = {};
    playlists.forEach(playlist => {
      playlist.sourceServices.forEach(service => {
        serviceUsage[service] = (serviceUsage[service] || 0) + 1;
      });
    });

    const serviceAnalysis = {
      connectedServices: Object.keys(req.user.connectedServices).filter(
        service => req.user.isServiceConnected(service)
      ),
      serviceUsage,
      primaryService: req.user.profile.preferences.primaryService,
      totalServices: Object.keys(serviceUsage).length,
      mostUsedService: Object.entries(serviceUsage)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null
    };

    res.json({ serviceAnalysis });
  } catch (error) {
    console.error('Error fetching service analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comprehensive dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user._id });

    const dashboard = {
      overview: {
        totalPlaylists: playlists.length,
        totalTracks: playlists.reduce((sum, playlist) => sum + playlist.trackCount, 0),
        totalDuration: playlists.reduce((sum, playlist) => sum + (playlist.metadata.totalDuration || 0), 0),
        connectedServices: req.user.getConnectedServicesCount(),
        accountAge: Math.floor((Date.now() - req.user.createdAt) / (1000 * 60 * 60 * 24))
      },
      listening: {
        totalTracks: req.user.listeningData.totalTracks,
        topGenres: req.user.listeningData.topGenres.slice(0, 5),
        topArtists: req.user.listeningData.topArtists.slice(0, 5),
        lastSync: req.user.listeningData.lastSync
      },
      playlists: {
        generatedBy: {
          ai: playlists.filter(p => p.generatedBy === 'ai').length,
          manual: playlists.filter(p => p.generatedBy === 'manual').length,
          hybrid: playlists.filter(p => p.generatedBy === 'hybrid').length
        },
        exportStatus: {
          spotify: playlists.filter(p => p.exportStatus.spotify.exported).length,
          youtube: playlists.filter(p => p.exportStatus.youtube.exported).length,
          apple: playlists.filter(p => p.exportStatus.apple.exported).length
        },
        recentPlaylists: playlists
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .map(playlist => ({
            id: playlist._id,
            name: playlist.name,
            trackCount: playlist.trackCount,
            createdAt: playlist.createdAt
          }))
      },
      preferences: {
        primaryService: req.user.profile.preferences.primaryService,
        explorationLevel: req.user.profile.preferences.explorationLevel,
        playlistLength: req.user.profile.preferences.playlistLength,
        moodPreferences: req.user.profile.preferences.moodPreferences,
        genrePreferences: req.user.profile.preferences.genrePreferences
      }
    };

    res.json({ dashboard });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
