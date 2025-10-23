const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId && !this.appleId;
    },
    minlength: 6
  },
  googleId: String,
  appleId: String,
  profile: {
    displayName: String,
    avatar: String,
    preferences: {
      primaryService: {
        type: String,
        enum: ['spotify', 'youtube', 'apple', 'lastfm'],
        default: 'spotify'
      },
      explorationLevel: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      playlistLength: {
        type: Number,
        min: 10,
        max: 100,
        default: 30
      },
      moodPreferences: [String],
      genrePreferences: [String]
    }
  },
  connectedServices: {
    spotify: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      userId: String,
      connected: { type: Boolean, default: false }
    },
    youtube: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      userId: String,
      connected: { type: Boolean, default: false }
    },
    apple: {
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      userId: String,
      connected: { type: Boolean, default: false }
    },
    lastfm: {
      username: String,
      apiKey: String,
      connected: { type: Boolean, default: false }
    }
  },
  listeningData: {
    lastSync: Date,
    totalTracks: { type: Number, default: 0 },
    topArtists: [{
      name: String,
      playCount: Number,
      genres: [String]
    }],
    topGenres: [{
      name: String,
      playCount: Number
    }],
    recentTracks: [{
      name: String,
      artist: String,
      album: String,
      playedAt: Date,
      service: String
    }]
  },
  playlists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist'
  }],
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get connected services count
userSchema.methods.getConnectedServicesCount = function() {
  return Object.values(this.connectedServices).filter(service => service.connected).length;
};

// Check if service is connected
userSchema.methods.isServiceConnected = function(serviceName) {
  return this.connectedServices[serviceName]?.connected || false;
};

module.exports = mongoose.model('User', userSchema);
