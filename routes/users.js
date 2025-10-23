const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        profile: req.user.profile,
        connectedServices: req.user.connectedServices,
        listeningData: req.user.listeningData,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, preferences } = req.body;

    if (displayName) {
      req.user.profile.displayName = displayName;
    }

    if (preferences) {
      req.user.profile.preferences = {
        ...req.user.profile.preferences,
        ...preferences
      };
    }

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      profile: req.user.profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const {
      primaryService,
      explorationLevel,
      playlistLength,
      moodPreferences,
      genrePreferences
    } = req.body;

    if (primaryService && !req.user.isServiceConnected(primaryService)) {
      return res.status(400).json({ 
        message: `${primaryService} is not connected. Please connect the service first.` 
      });
    }

    if (primaryService) {
      req.user.profile.preferences.primaryService = primaryService;
    }

    if (explorationLevel !== undefined) {
      req.user.profile.preferences.explorationLevel = Math.max(0, Math.min(1, explorationLevel));
    }

    if (playlistLength) {
      req.user.profile.preferences.playlistLength = Math.max(10, Math.min(100, playlistLength));
    }

    if (moodPreferences) {
      req.user.profile.preferences.moodPreferences = moodPreferences;
    }

    if (genrePreferences) {
      req.user.profile.preferences.genrePreferences = genrePreferences;
    }

    await req.user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: req.user.profile.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = {
      totalPlaylists: req.user.playlists.length,
      connectedServices: req.user.getConnectedServicesCount(),
      totalTracks: req.user.listeningData.totalTracks,
      topGenres: req.user.listeningData.topGenres.slice(0, 5),
      topArtists: req.user.listeningData.topArtists.slice(0, 5),
      lastSync: req.user.listeningData.lastSync,
      accountAge: Math.floor((Date.now() - req.user.createdAt) / (1000 * 60 * 60 * 24)), // days
      lastLogin: req.user.lastLogin
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({ message: 'Password confirmation is required' });
    }

    // Verify password
    const isMatch = await req.user.comparePassword(confirmPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Deactivate account instead of deleting for data retention
    req.user.isActive = false;
    await req.user.save();

    res.json({ 
      message: 'Account deactivated successfully',
      deactivatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export user data (GDPR compliance)
router.get('/export', auth, async (req, res) => {
  try {
    const userData = {
      profile: req.user.profile,
      connectedServices: req.user.connectedServices,
      listeningData: req.user.listeningData,
      playlists: req.user.playlists,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin,
      exportedAt: new Date().toISOString()
    };

    res.json({
      message: 'User data exported successfully',
      data: userData
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Verify current password
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
