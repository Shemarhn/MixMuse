const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get connected services status
router.get('/status', auth, async (req, res) => {
  try {
    const connectedServices = {};
    const services = ['spotify', 'youtube', 'apple', 'lastfm'];

    services.forEach(service => {
      connectedServices[service] = {
        connected: req.user.isServiceConnected(service),
        userId: req.user.connectedServices[service]?.userId || null,
        connectedAt: req.user.connectedServices[service]?.connected ? 
          req.user.updatedAt : null
      };
    });

    res.json({
      connectedServices,
      totalConnected: req.user.getConnectedServicesCount(),
      primaryService: req.user.profile.preferences.primaryService
    });
  } catch (error) {
    console.error('Error getting services status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Connect Last.fm service
router.post('/lastfm', auth, async (req, res) => {
  try {
    const { username, apiKey } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Last.fm username is required' });
    }

    // Update user's Last.fm connection
    req.user.connectedServices.lastfm = {
      username,
      apiKey: apiKey || process.env.LASTFM_API_KEY,
      connected: true
    };

    await req.user.save();

    res.json({
      message: 'Last.fm connected successfully',
      service: {
        name: 'lastfm',
        connected: true,
        username
      }
    });
  } catch (error) {
    console.error('Error connecting Last.fm:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Disconnect service
router.delete('/:service', auth, async (req, res) => {
  try {
    const { service } = req.params;
    const validServices = ['spotify', 'youtube', 'apple', 'lastfm'];

    if (!validServices.includes(service)) {
      return res.status(400).json({ message: 'Invalid service' });
    }

    // Reset service connection
    req.user.connectedServices[service] = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      userId: null,
      username: null,
      apiKey: null,
      connected: false
    };

    // If disconnecting primary service, set a new one
    if (req.user.profile.preferences.primaryService === service) {
      const remainingServices = validServices.filter(s => 
        s !== service && req.user.isServiceConnected(s)
      );
      
      if (remainingServices.length > 0) {
        req.user.profile.preferences.primaryService = remainingServices[0];
      }
    }

    await req.user.save();

    res.json({
      message: `${service} disconnected successfully`,
      service: {
        name: service,
        connected: false
      }
    });
  } catch (error) {
    console.error('Error disconnecting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set primary service
router.put('/primary', auth, async (req, res) => {
  try {
    const { service } = req.body;
    const validServices = ['spotify', 'youtube', 'apple', 'lastfm'];

    if (!validServices.includes(service)) {
      return res.status(400).json({ message: 'Invalid service' });
    }

    if (!req.user.isServiceConnected(service)) {
      return res.status(400).json({ 
        message: `${service} is not connected. Please connect the service first.` 
      });
    }

    req.user.profile.preferences.primaryService = service;
    await req.user.save();

    res.json({
      message: `Primary service set to ${service}`,
      primaryService: service
    });
  } catch (error) {
    console.error('Error setting primary service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Sync listening data from connected services
router.post('/sync', auth, async (req, res) => {
  try {
    const { service } = req.body;

    if (service && !req.user.isServiceConnected(service)) {
      return res.status(400).json({ 
        message: `${service} is not connected` 
      });
    }

    // This would trigger a background job to sync listening data
    // For now, return a placeholder response
    res.json({
      message: 'Listening data sync initiated',
      syncId: `sync_${Date.now()}`,
      status: 'pending',
      services: service ? [service] : Object.keys(req.user.connectedServices).filter(s => req.user.isServiceConnected(s))
    });
  } catch (error) {
    console.error('Error syncing listening data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service-specific data
router.get('/:service/data', auth, async (req, res) => {
  try {
    const { service } = req.params;
    const { type = 'recent', limit = 20 } = req.query;

    if (!req.user.isServiceConnected(service)) {
      return res.status(400).json({ 
        message: `${service} is not connected` 
      });
    }

    // This would fetch data from the specific service
    // For now, return a placeholder response
    res.json({
      service,
      type,
      data: [],
      total: 0,
      message: 'Service data fetching not implemented yet'
    });
  } catch (error) {
    console.error('Error fetching service data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test service connection
router.post('/:service/test', auth, async (req, res) => {
  try {
    const { service } = req.params;

    if (!req.user.isServiceConnected(service)) {
      return res.status(400).json({ 
        message: `${service} is not connected` 
      });
    }

    // This would test the service connection
    // For now, return a placeholder response
    res.json({
      service,
      status: 'connected',
      message: `${service} connection is working`,
      testedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing service connection:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
