# MixMuse 🎧

An AI-powered playlist generator that creates seamless, mood-matching transitions between tracks by analyzing your listening habits across multiple music services.

## ✨ Features

### 🎵 Multi-Service Integration
- **Spotify** - Access your playlists, top tracks, and recently played
- **Apple Music** - Import your library and listening history
- **YouTube Music** - Sync your watch history and liked videos
- **Last.fm** - Comprehensive scrobbling data and recommendations

### 🤖 AI-Powered Curation
- **Smart Recommendations** - Advanced algorithms analyze your taste patterns
- **Mood-Based Filtering** - Generate playlists for specific moods and activities
- **Genre Discovery** - Explore new genres based on your preferences
- **Exploration Control** - Balance between familiar and new music

### 🎧 Seamless Transitions
- **Audio Analysis** - BPM, key, energy, and tempo matching
- **Harmonic Mixing** - Camelot wheel-based key compatibility
- **Flow Optimization** - Intelligent track ordering for smooth transitions
- **Crossfade Simulation** - Preview how tracks will blend together

### 📊 Deep Analytics
- **Listening Insights** - Understand your music taste patterns
- **Genre Analysis** - Track your evolving preferences
- **Mood Trends** - See how your music choices change over time
- **Artist Discovery** - Find new artists based on your habits

### 🎨 Modern Interface
- **Responsive Design** - Works perfectly on desktop and mobile
- **Dark Theme** - Easy on the eyes for long listening sessions
- **Real-time Updates** - See changes as they happen
- **Intuitive Navigation** - Clean, user-friendly interface

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Redis 6+ (optional, for caching)
- API keys for music services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shemarhn/MixMuse.git
   cd mixmuse
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   npm install
   
   # Frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys and configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/mixmuse
   
   # JWT
   JWT_SECRET=your_jwt_secret_key_here
   
   # Spotify API
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   
   # Apple Music API
   APPLE_MUSIC_TEAM_ID=your_apple_team_id
   APPLE_MUSIC_KEY_ID=your_apple_key_id
   
   # YouTube Music API
   YOUTUBE_CLIENT_ID=your_youtube_client_id
   YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
   
   # Last.fm API
   LASTFM_API_KEY=your_lastfm_api_key
   ```

4. **Start the development servers**
   ```bash
   # Start backend (from root directory)
   npm run dev
   
   # Start frontend (in another terminal)
   cd client
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Authentication** - JWT-based auth with OAuth 2.0 flows
- **API Routes** - RESTful endpoints for all functionality
- **Data Models** - MongoDB schemas for users, playlists, and analytics
- **Service Integrations** - Modular services for each music platform
- **Recommendation Engine** - AI-powered music discovery algorithms

### Frontend (React)
- **Modern UI** - Styled Components with Framer Motion animations
- **State Management** - React Context for authentication
- **Data Fetching** - React Query for efficient API calls
- **Responsive Design** - Mobile-first approach with glassmorphism

### Database (MongoDB)
- **User Management** - Profiles, preferences, and connected services
- **Playlist Storage** - Track metadata and audio features
- **Analytics Data** - Listening habits and recommendation history
- **Service Tokens** - Secure storage of OAuth tokens

## 🔧 API Documentation

### Authentication
```javascript
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Playlists
```javascript
GET    /api/playlists           // Get user's playlists
POST   /api/playlists/generate  // Generate new playlist
GET    /api/playlists/:id       // Get specific playlist
PUT    /api/playlists/:id       // Update playlist
DELETE /api/playlists/:id       // Delete playlist
```

### Recommendations
```javascript
GET /api/recommendations        // Get personalized recommendations
GET /api/recommendations/habits // Get listening habits analysis
POST /api/recommendations/similar // Get similar tracks
```

### Services
```javascript
GET    /api/services/status     // Get connected services
POST   /api/services/lastfm     // Connect Last.fm
DELETE /api/services/:service   // Disconnect service
```

## 🎯 Usage Examples

### Generate a Playlist
```javascript
const playlist = await fetch('/api/playlists/generate', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    name: 'My Daily Mix',
    length: 30,
    mood: 'energetic',
    explorationLevel: 0.7
  })
});
```

### Get Recommendations
```javascript
const recommendations = await fetch('/api/recommendations?limit=20&mood=happy', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🔐 Security Features

- **OAuth 2.0** - Secure authentication with major music services
- **JWT Tokens** - Stateless authentication
- **Rate Limiting** - API protection against abuse
- **Data Encryption** - Sensitive data encrypted at rest
- **GDPR Compliance** - Data export and deletion options

## 🚀 Deployment

### Production Setup
1. **Environment Variables** - Set production values
2. **Database** - Use MongoDB Atlas or self-hosted
3. **Redis** - Configure for session storage and caching
4. **SSL** - Enable HTTPS for secure connections
5. **Monitoring** - Set up logging and error tracking

### Docker Deployment
```bash
docker-compose up -d
```

### Heroku Deployment
```bash
git push heroku main
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spotify Web API** - For comprehensive music data
- **Last.fm API** - For detailed listening statistics
- **YouTube Music API** - For video and music integration
- **Apple Music API** - For iOS ecosystem integration
- **Framer Motion** - For smooth animations
- **Styled Components** - For component styling

**Made with ❤️ for music lovers everywhere**
