import axios from 'axios';

const LASTFM_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const BASE = 'https://ws.audioscrobbler.com/2.0/';

export async function getTrackInfo(artistName, trackName) {
  try {
    const params = {
      method: 'track.getInfo',
      artist: artistName,
      track: trackName,
      api_key: LASTFM_KEY,
      format: 'json'
    };
    const { data } = await axios.get(BASE, { params });
    return data.track || null;
  } catch (err) {
    return null;
  }
}
