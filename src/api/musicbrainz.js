// carátulas MB
import axios from 'axios';

const BASE_MUSICBRAINZ = 'https://musicbrainz.org/ws/2/';
const JSON_CAA = 'https://coverartarchive.org/release/';

export async function buscarMBIDLanzamiento(artista, lanzamiento) {
  try {
    const consulta = `artist:"${artista}" AND release:"${lanzamiento}"`;
    const url = `${BASE_MUSICBRAINZ}release/?query=${encodeURIComponent(consulta)}&fmt=json&limit=1`;
    const { data: datos } = await axios.get(url, { headers: { 'User-Agent': 'my-music-dashboard/1.0 (edo@example.com)' } });
    if (datos.releases && datos.releases.length) return datos.releases[0].id;
  } catch (err) {
    // ignorar
  }
  return null;
}

// obtener carátula
export async function obtenerCaratulaPorMBID(mbid) {
  if (!mbid) return null;
  try {
    const url = `${JSON_CAA}${mbid}`; // devuelve JSON con imágenes
    const { data: datos } = await axios.get(url, { headers: { 'User-Agent': 'my-music-dashboard/1.0 (edo@example.com)' } });
    if (datos && datos.images && datos.images.length) {
      // preferir frontal
      const frontal = datos.images.find(img => img.front) || datos.images[0];
      if (frontal) {
        // devolver grande
        return frontal.thumbnails?.large || frontal.image || frontal.thumbnails?.['250'] || null;
      }
    }
  } catch (err) {
    // ignorar
  }
  return null;
}

export async function buscarCaratulaPorArtistaYAlbum(artista, album) {
  const mbid = await buscarMBIDLanzamiento(artista, album);
  if (!mbid) return null;
  const caratula = await obtenerCaratulaPorMBID(mbid);
  return caratula;
}
