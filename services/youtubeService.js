const axios = require('axios');
const ytmusic = require('ytmusicapi');

class YouTubeService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://www.googleapis.com/youtube/v3';
    this.ytmusic = new ytmusic.YTMusic();
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const config = {
        method: 'GET',
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          ...params,
          key: process.env.YOUTUBE_API_KEY
        }
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('YouTube API error:', error.response?.data || error.message);
      throw new Error(`YouTube API error: ${error.response?.status || 'Unknown error'}`);
    }
  }

  // Get user's watch history (YouTube Music)
  async getWatchHistory(maxResults = 50) {
    try {
      // Get the watch history playlist ID
      const playlists = await this.makeRequest('/playlists', {
        part: 'snippet',
        mine: true,
        maxResults: 50
      });

      const watchHistoryPlaylist = playlists.items.find(
        playlist => playlist.snippet.title === 'Watch history'
      );

      if (!watchHistoryPlaylist) {
        throw new Error('Watch history playlist not found');
      }

      // Get playlist items
      const playlistItems = await this.makeRequest('/playlistItems', {
        part: 'snippet',
        playlistId: watchHistoryPlaylist.id,
        maxResults
      });

      return playlistItems.items.map(item => ({
        name: item.snippet.title,
        artist: item.snippet.videoOwnerChannelTitle,
        album: item.snippet.channelTitle,
        playedAt: new Date(item.snippet.publishedAt),
        service: 'youtube',
        serviceId: item.snippet.resourceId.videoId,
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        thumbnail: item.snippet.thumbnails?.default?.url
      }));
    } catch (error) {
      console.error('Error fetching watch history:', error);
      return [];
    }
  }

  // Get user's liked videos (YouTube Music)
  async getLikedVideos(maxResults = 50) {
    try {
      const playlists = await this.makeRequest('/playlists', {
        part: 'snippet',
        mine: true,
        maxResults: 50
      });

      const likedPlaylist = playlists.items.find(
        playlist => playlist.snippet.title === 'Liked videos'
      );

      if (!likedPlaylist) {
        throw new Error('Liked videos playlist not found');
      }

      const playlistItems = await this.makeRequest('/playlistItems', {
        part: 'snippet',
        playlistId: likedPlaylist.id,
        maxResults
      });

      return playlistItems.items.map(item => ({
        name: item.snippet.title,
        artist: item.snippet.videoOwnerChannelTitle,
        album: item.snippet.channelTitle,
        service: 'youtube',
        serviceId: item.snippet.resourceId.videoId,
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        thumbnail: item.snippet.thumbnails?.default?.url
      }));
    } catch (error) {
      console.error('Error fetching liked videos:', error);
      return [];
    }
  }

  // Search for music videos
  async searchMusic(query, maxResults = 20) {
    try {
      const data = await this.makeRequest('/search', {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults
      });

      return data.items.map(item => ({
        name: item.snippet.title,
        artist: item.snippet.channelTitle,
        service: 'youtube',
        serviceId: item.id.videoId,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails?.default?.url,
        publishedAt: new Date(item.snippet.publishedAt)
      }));
    } catch (error) {
      console.error('Error searching music:', error);
      return [];
    }
  }

  // Get video details
  async getVideoDetails(videoId) {
    try {
      const data = await this.makeRequest('/videos', {
        part: 'snippet,contentDetails,statistics',
        id: videoId
      });

      if (data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = data.items[0];
      return {
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        duration: this.parseDuration(video.contentDetails.duration),
        viewCount: parseInt(video.statistics.viewCount),
        likeCount: parseInt(video.statistics.likeCount),
        publishedAt: new Date(video.snippet.publishedAt),
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails?.default?.url
      };
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  }

  // Create playlist
  async createPlaylist(title, description = '', privacyStatus = 'private') {
    try {
      const data = await this.makeRequest('/playlists', {
        part: 'snippet,status'
      }, {
        method: 'POST',
        data: {
          snippet: {
            title,
            description
          },
          status: {
            privacyStatus
          }
        }
      });

      return {
        id: data.id,
        title: data.snippet.title,
        description: data.snippet.description,
        url: `https://www.youtube.com/playlist?list=${data.id}`
      };
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  // Add video to playlist
  async addVideoToPlaylist(playlistId, videoId) {
    try {
      const data = await this.makeRequest('/playlistItems', {
        part: 'snippet'
      }, {
        method: 'POST',
        data: {
          snippet: {
            playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId
            }
          }
        }
      });

      return {
        id: data.id,
        videoId: data.snippet.resourceId.videoId
      };
    } catch (error) {
      console.error('Error adding video to playlist:', error);
      throw error;
    }
  }

  // Get related videos
  async getRelatedVideos(videoId, maxResults = 20) {
    try {
      const data = await this.makeRequest('/search', {
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults
      });

      return data.items.map(item => ({
        name: item.snippet.title,
        artist: item.snippet.channelTitle,
        service: 'youtube',
        serviceId: item.id.videoId,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails?.default?.url
      }));
    } catch (error) {
      console.error('Error fetching related videos:', error);
      return [];
    }
  }

  // Parse YouTube duration format (PT4M13S -> seconds)
  parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Get user's playlists
  async getUserPlaylists(maxResults = 50) {
    try {
      const data = await this.makeRequest('/playlists', {
        part: 'snippet,contentDetails',
        mine: true,
        maxResults
      });

      return data.items.map(playlist => ({
        id: playlist.id,
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        itemCount: playlist.contentDetails.itemCount,
        thumbnail: playlist.snippet.thumbnails?.default?.url,
        url: `https://www.youtube.com/playlist?list=${playlist.id}`
      }));
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      return [];
    }
  }
}

module.exports = YouTubeService;
