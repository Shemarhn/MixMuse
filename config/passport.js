const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // Update tokens
      user.connectedServices.youtube = {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        userId: profile.id,
        connected: true
      };
      await user.save();
      return done(null, { user, accessToken, refreshToken });
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.googleId = profile.id;
      user.connectedServices.youtube = {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 3600 * 1000),
        userId: profile.id,
        connected: true
      };
      await user.save();
      return done(null, { user, accessToken, refreshToken });
    }

    // Create new user
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      profile: {
        displayName: profile.displayName,
        avatar: profile.photos[0]?.value
      },
      connectedServices: {
        youtube: {
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 3600 * 1000),
          userId: profile.id,
          connected: true
        }
      }
    });

    await user.save();
    return done(null, { user, accessToken, refreshToken });
  } catch (error) {
    return done(error, null);
  }
}));

// Spotify OAuth Strategy
passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: '/api/auth/spotify/callback'
}, async (accessToken, refreshToken, expires_in, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ 'connectedServices.spotify.userId': profile.id });
    
    if (user) {
      // Update tokens
      user.connectedServices.spotify = {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        userId: profile.id,
        connected: true
      };
      await user.save();
      return done(null, { user, accessToken, refreshToken, expiresIn: expires_in, spotifyId: profile.id });
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.connectedServices.spotify = {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        userId: profile.id,
        connected: true
      };
      await user.save();
      return done(null, { user, accessToken, refreshToken, expiresIn: expires_in, spotifyId: profile.id });
    }

    // Create new user
    user = new User({
      email: profile.emails[0].value,
      profile: {
        displayName: profile.displayName,
        avatar: profile.photos[0]?.value
      },
      connectedServices: {
        spotify: {
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + expires_in * 1000),
          userId: profile.id,
          connected: true
        }
      }
    });

    await user.save();
    return done(null, { user, accessToken, refreshToken, expiresIn: expires_in, spotifyId: profile.id });
  } catch (error) {
    return done(error, null);
  }
}));

// Apple Music OAuth Strategy (simplified - would need proper Apple implementation)
passport.use('apple', new (require('passport-apple'))({
  clientID: process.env.APPLE_MUSIC_TEAM_ID,
  teamID: process.env.APPLE_MUSIC_TEAM_ID,
  keyID: process.env.APPLE_MUSIC_KEY_ID,
  privateKeyPath: process.env.APPLE_MUSIC_PRIVATE_KEY_PATH,
  callbackURL: '/api/auth/apple/callback'
}, async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    // Apple Music OAuth implementation
    // This is a simplified version - full implementation would require proper Apple Music API integration
    return done(null, { user: null, accessToken, refreshToken });
  } catch (error) {
    return done(error, null);
  }
}));

// YouTube Music OAuth Strategy (using Google OAuth with YouTube scope)
passport.use('youtube', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/youtube/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Similar to Google OAuth but specifically for YouTube Music
    let user = await User.findOne({ 'connectedServices.youtube.userId': profile.id });
    
    if (user) {
      user.connectedServices.youtube = {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 3600 * 1000),
        userId: profile.id,
        connected: true
      };
      await user.save();
      return done(null, { user, accessToken, refreshToken, youtubeId: profile.id });
    }

    // Create or update user with YouTube connection
    user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      user.connectedServices.youtube = {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 3600 * 1000),
        userId: profile.id,
        connected: true
      };
      await user.save();
      return done(null, { user, accessToken, refreshToken, youtubeId: profile.id });
    }

    // Create new user
    user = new User({
      email: profile.emails[0].value,
      profile: {
        displayName: profile.displayName,
        avatar: profile.photos[0]?.value
      },
      connectedServices: {
        youtube: {
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 3600 * 1000),
          userId: profile.id,
          connected: true
        }
      }
    });

    await user.save();
    return done(null, { user, accessToken, refreshToken, youtubeId: profile.id });
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;
