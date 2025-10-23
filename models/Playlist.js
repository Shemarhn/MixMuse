const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  album: String,
  duration: Number, // in seconds
  service: {
    type: String,
    enum: ['spotify', 'youtube', 'apple', 'lastfm'],
    required: true
  },
  serviceId: String, // ID from the service (Spotify track ID, YouTube video ID, etc.)
  url: String, // Direct link to the track
  audioFeatures: {
    danceability: Number,
    energy: Number,
    key: Number,
    loudness: Number,
    mode: Number,
    speechiness: Number,
    acousticness: Number,
    instrumentalness: Number,
    liveness: Number,
    valence: Number,
    tempo: Number,
    timeSignature: Number
  },
  position: Number // Position in the playlist
});

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tracks: [trackSchema],
  metadata: {
    totalDuration: Number, // in seconds
    averageTempo: Number,
    dominantKey: String,
    energyLevel: Number,
    mood: String,
    genre: String
  },
  settings: {
    isPublic: { type: Boolean, default: false },
    allowSharing: { type: Boolean, default: true },
    autoUpdate: { type: Boolean, default: false },
    updateFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
    }
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'manual', 'hybrid'],
    default: 'ai'
  },
  sourceServices: [String], // Which services were used to generate this playlist
  exportStatus: {
    spotify: { exported: Boolean, playlistId: String, exportedAt: Date },
    youtube: { exported: Boolean, playlistId: String, exportedAt: Date },
    apple: { exported: Boolean, playlistId: String, exportedAt: Date }
  },
  analytics: {
    playCount: { type: Number, default: 0 },
    skipCount: { type: Number, default: 0 },
    completionRate: Number,
    userRating: Number,
    lastPlayed: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate playlist metadata before saving
playlistSchema.pre('save', function(next) {
  if (this.tracks.length > 0) {
    // Calculate total duration
    this.metadata.totalDuration = this.tracks.reduce((total, track) => total + (track.duration || 0), 0);
    
    // Calculate average tempo
    const tracksWithTempo = this.tracks.filter(track => track.audioFeatures?.tempo);
    if (tracksWithTempo.length > 0) {
      this.metadata.averageTempo = tracksWithTempo.reduce((sum, track) => sum + track.audioFeatures.tempo, 0) / tracksWithTempo.length;
    }
    
    // Calculate average energy
    const tracksWithEnergy = this.tracks.filter(track => track.audioFeatures?.energy !== undefined);
    if (tracksWithEnergy.length > 0) {
      this.metadata.energyLevel = tracksWithEnergy.reduce((sum, track) => sum + track.audioFeatures.energy, 0) / tracksWithEnergy.length;
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

// Update track positions when tracks are modified
playlistSchema.pre('save', function(next) {
  this.tracks.forEach((track, index) => {
    track.position = index + 1;
  });
  next();
});

// Virtual for track count
playlistSchema.virtual('trackCount').get(function() {
  return this.tracks.length;
});

// Method to add track
playlistSchema.methods.addTrack = function(track) {
  track.position = this.tracks.length + 1;
  this.tracks.push(track);
  return this.save();
};

// Method to remove track
playlistSchema.methods.removeTrack = function(trackId) {
  this.tracks = this.tracks.filter(track => track._id.toString() !== trackId);
  return this.save();
};

// Method to reorder tracks
playlistSchema.methods.reorderTracks = function(newOrder) {
  const reorderedTracks = newOrder.map((trackId, index) => {
    const track = this.tracks.find(t => t._id.toString() === trackId);
    if (track) {
      track.position = index + 1;
      return track;
    }
  }).filter(Boolean);
  
  this.tracks = reorderedTracks;
  return this.save();
};

module.exports = mongoose.model('Playlist', playlistSchema);
