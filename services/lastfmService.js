const axios = require('axios');

class LastFMService {
  constructor(apiKey, username) {
    this.apiKey = apiKey;
    this.username = username;
    this.baseURL = 'http://ws.audioscrobbler.com/2.0/';
  }

  async makeRequest(params) {
    try {
      const config = {
        method: 'GET',
        url: this.baseURL,
        params: {
          ...params,
          api_key: this.apiKey,
          format: 'json'
        }
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('Last.fm API error:', error.response?.data || error.message);
      throw new Error(`Last.fm API error: ${error.response?.status || 'Unknown error'}`);
    }
  }

  // Get user's recent tracks
  async getRecentTracks(limit = 50) {
    const data = await this.makeRequest({
      method: 'user.getrecenttracks',
      user: this.username,
      limit
    });

    if (!data.recenttracks || !data.recenttracks.track) {
      return [];
    }

    const tracks = Array.isArray(data.recenttracks.track) 
      ? data.recenttracks.track 
      : [data.recenttracks.track];

    return tracks.map(track => ({
      name: track.name,
      artist: track.artist['#text'],
      album: track.album['#text'],
      playedAt: track.date ? new Date(track.date['#text']) : new Date(),
      service: 'lastfm',
      serviceId: `${track.artist['#text']} - ${track.name}`,
      url: track.url,
      image: track.image?.[2]?.['#text'] // Large image
    }));
  }

  // Get user's top tracks
  async getTopTracks(period = '3month', limit = 50) {
    const data = await this.makeRequest({
      method: 'user.gettoptracks',
      user: this.username,
      period,
      limit
    });

    if (!data.toptracks || !data.toptracks.track) {
      return [];
    }

    const tracks = Array.isArray(data.toptracks.track) 
      ? data.toptracks.track 
      : [data.toptracks.track];

    return tracks.map(track => ({
      name: track.name,
      artist: track.artist.name,
      playCount: parseInt(track.playcount),
      service: 'lastfm',
      serviceId: `${track.artist.name} - ${track.name}`,
      url: track.url,
      image: track.image?.[2]?.['#text']
    }));
  }

  // Get user's top artists
  async getTopArtists(period = '3month', limit = 50) {
    const data = await this.makeRequest({
      method: 'user.gettopartists',
      user: this.username,
      period,
      limit
    });

    if (!data.topartists || !data.topartists.artist) {
      return [];
    }

    const artists = Array.isArray(data.topartists.artist) 
      ? data.topartists.artist 
      : [data.topartists.artist];

    return artists.map(artist => ({
      name: artist.name,
      playCount: parseInt(artist.playcount),
      service: 'lastfm',
      serviceId: artist.name,
      url: artist.url,
      image: artist.image?.[2]?.['#text']
    }));
  }

  // Get user's top albums
  async getTopAlbums(period = '3month', limit = 50) {
    const data = await this.makeRequest({
      method: 'user.gettopalbums',
      user: this.username,
      period,
      limit
    });

    if (!data.topalbums || !data.topalbums.album) {
      return [];
    }

    const albums = Array.isArray(data.topalbums.album) 
      ? data.topalbums.album 
      : [data.topalbums.album];

    return albums.map(album => ({
      name: album.name,
      artist: album.artist.name,
      playCount: parseInt(album.playcount),
      service: 'lastfm',
      serviceId: `${album.artist.name} - ${album.name}`,
      url: album.url,
      image: album.image?.[2]?.['#text']
    }));
  }

  // Get similar tracks
  async getSimilarTracks(artist, track, limit = 10) {
    const data = await this.makeRequest({
      method: 'track.getsimilar',
      artist,
      track,
      limit
    });

    if (!data.similartracks || !data.similartracks.track) {
      return [];
    }

    const tracks = Array.isArray(data.similartracks.track) 
      ? data.similartracks.track 
      : [data.similartracks.track];

    return tracks.map(track => ({
      name: track.name,
      artist: track.artist.name,
      match: parseFloat(track.match),
      service: 'lastfm',
      serviceId: `${track.artist.name} - ${track.name}`,
      url: track.url,
      image: track.image?.[2]?.['#text']
    }));
  }

  // Get similar artists
  async getSimilarArtists(artist, limit = 10) {
    const data = await this.makeRequest({
      method: 'artist.getsimilar',
      artist,
      limit
    });

    if (!data.similarartists || !data.similarartists.artist) {
      return [];
    }

    const artists = Array.isArray(data.similarartists.artist) 
      ? data.similarartists.artist 
      : [data.similarartists.artist];

    return artists.map(artist => ({
      name: artist.name,
      match: parseFloat(artist.match),
      service: 'lastfm',
      serviceId: artist.name,
      url: artist.url,
      image: artist.image?.[2]?.['#text']
    }));
  }

  // Get track info
  async getTrackInfo(artist, track) {
    const data = await this.makeRequest({
      method: 'track.getinfo',
      artist,
      track
    });

    if (!data.track) {
      return null;
    }

    const trackData = data.track;
    return {
      name: trackData.name,
      artist: trackData.artist.name,
      album: trackData.album?.name,
      duration: parseInt(trackData.duration) || 0,
      playCount: parseInt(trackData.playcount) || 0,
      listeners: parseInt(trackData.listeners) || 0,
      tags: trackData.toptags?.tag ? 
        (Array.isArray(trackData.toptags.tag) ? 
          trackData.toptags.tag.map(tag => tag.name) : 
          [trackData.toptags.tag.name]) : [],
      service: 'lastfm',
      serviceId: `${trackData.artist.name} - ${trackData.name}`,
      url: trackData.url,
      image: trackData.album?.image?.[2]?.['#text']
    };
  }

  // Get artist info
  async getArtistInfo(artist) {
    const data = await this.makeRequest({
      method: 'artist.getinfo',
      artist
    });

    if (!data.artist) {
      return null;
    }

    const artistData = data.artist;
    return {
      name: artistData.name,
      playCount: parseInt(artistData.stats?.playcount) || 0,
      listeners: parseInt(artistData.stats?.listeners) || 0,
      bio: artistData.bio?.summary,
      tags: artistData.tags?.tag ? 
        (Array.isArray(artistData.tags.tag) ? 
          artistData.tags.tag.map(tag => tag.name) : 
          [artistData.tags.tag.name]) : [],
      similar: artistData.similar?.artist ? 
        (Array.isArray(artistData.similar.artist) ? 
          artistData.similar.artist.map(artist => artist.name) : 
          [artistData.similar.artist.name]) : [],
      service: 'lastfm',
      serviceId: artistData.name,
      url: artistData.url,
      image: artistData.image?.[2]?.['#text']
    };
  }

  // Get user's loved tracks
  async getLovedTracks(limit = 50) {
    const data = await this.makeRequest({
      method: 'user.getlovedtracks',
      user: this.username,
      limit
    });

    if (!data.lovedtracks || !data.lovedtracks.track) {
      return [];
    }

    const tracks = Array.isArray(data.lovedtracks.track) 
      ? data.lovedtracks.track 
      : [data.lovedtracks.track];

    return tracks.map(track => ({
      name: track.name,
      artist: track.artist.name,
      lovedAt: new Date(track.date['#text']),
      service: 'lastfm',
      serviceId: `${track.artist.name} - ${track.name}`,
      url: track.url,
      image: track.image?.[2]?.['#text']
    }));
  }

  // Get user's weekly chart
  async getWeeklyChart(from, to) {
    const data = await this.makeRequest({
      method: 'user.getweeklytrackchart',
      user: this.username,
      from,
      to
    });

    if (!data.weeklytrackchart || !data.weeklytrackchart.track) {
      return [];
    }

    const tracks = Array.isArray(data.weeklytrackchart.track) 
      ? data.weeklytrackchart.track 
      : [data.weeklytrackchart.track];

    return tracks.map(track => ({
      name: track.name,
      artist: track.artist['#text'],
      playCount: parseInt(track.playcount),
      rank: parseInt(track['@attr'].rank),
      service: 'lastfm',
      serviceId: `${track.artist['#text']} - ${track.name}`,
      url: track.url
    }));
  }
}

module.exports = LastFMService;
