import axios from 'axios';

// API iTunes
// - buscar artistas
// - obtener álbumes
// - obtener pistas
// - buscar carátula

const BASE_ITUNES = 'https://itunes.apple.com';

export async function buscarArtistas(termino, limite = 15) {
  if (!termino) return [];
  try {
    const consulta = encodeURIComponent(termino);
    const url = `${BASE_ITUNES}/search?term=${consulta}&entity=musicArtist&limit=${limite}`;
    const { data: datos } = await axios.get(url);
    if (!datos || !datos.results) return [];
    const artistas = datos.results.map(r => ({
      id: r.artistId,
      nombre: r.artistName,
      generoPrincipal: r.primaryGenreName || null,
    }));

    // enriquecer miniatura
    // paralelo, ignorar fallos
    const enrichPromises = artistas.map(async (artista) => {
      try {
        const consultaAlbum = encodeURIComponent(artista.nombre + ' album');
        const urlAlbum = `${BASE_ITUNES}/search?term=${consultaAlbum}&entity=album&limit=1`;
        const { data: adatos } = await axios.get(urlAlbum);
        if (adatos && adatos.results && adatos.results[0] && adatos.results[0].artworkUrl100) {
          return { ...artista, caratula100: adatos.results[0].artworkUrl100 };
        }
      } catch (e) {
        // ignorar
      }
      return artista;
    });

    const enriquecidos = await Promise.all(enrichPromises);
    return enriquecidos;
  } catch (err) {
    return [];
  }
}

export async function obtenerAlbumesArtista(artistaId) {
  try {
    const url = `${BASE_ITUNES}/lookup?id=${artistaId}&entity=album&limit=200`;
    const { data: datos } = await axios.get(url);
    if (!datos || !datos.results) return [];
    // artista + álbumes
    const albumes = datos.results.filter(r => r.collectionType === 'Album' || r.wrapperType === 'collection');
    return albumes.map(al => ({
      coleccionId: al.collectionId,
      nombre: al.collectionName,
      nombreArtista: al.artistName,
      caratula100: al.artworkUrl100,
      fechaLanzamiento: al.releaseDate,
      totalPistas: al.trackCount,
    }));
  } catch (err) {
    return [];
  }
}

export async function obtenerPistasAlbum(coleccionId) {
  try {
    const url = `${BASE_ITUNES}/lookup?id=${coleccionId}&entity=song`;
    const { data: datos } = await axios.get(url);
    if (!datos || !datos.results) return [];
    // info colección
    const pistas = datos.results.filter(r => r.wrapperType === 'track');
    return pistas.map(pista => ({
      pistaId: pista.trackId,
      nombrePista: pista.trackName,
      urlPreview: pista.previewUrl || null,
      numeroPista: pista.trackNumber,
      duracionMs: pista.trackTimeMillis,
      caratula100: pista.artworkUrl100,
      nombreArtista: pista.artistName,
      nombreColeccion: pista.collectionName,
    }));
  } catch (err) {
    return [];
  }
}

export async function buscarCaratulaItunes(artista, album) {
  try {
    const terminoConsulta = encodeURIComponent(`${artista} ${album}`);
    const url = `${BASE_ITUNES}/search?term=${terminoConsulta}&entity=album&limit=5`;
    const { data: datos } = await axios.get(url);
    if (datos && datos.results && datos.results.length) {
      const candidato = datos.results.find(r => (r.collectionName || '').toLowerCase() === album.toLowerCase()) || datos.results[0];
      if (candidato && candidato.artworkUrl100) {
        const imgAlta = candidato.artworkUrl100.replace(/100x100bb.jpg$/, '600x600bb.jpg');
        return imgAlta;
      }
    }
  } catch (err) {
    // ignorar
  }
  return null;
}

