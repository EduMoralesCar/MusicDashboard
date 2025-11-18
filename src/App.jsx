import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import useDebouncedValue from './hooks/useDebouncedValue';
import { buscarArtistas, obtenerAlbumesArtista, obtenerPistasAlbum } from './api/itunes';
import { getTrackInfo } from './api/lastfm';
import ArtistDashboard from './pages/ArtistDashboard';
import './App.css';
import ArtistCard from './components/ArtistCard';
import './App.css';

export default function App() {
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 500);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [defaultArtists, setDefaultArtists] = useState([]);
  const [defaultTracks, setDefaultTracks] = useState([]);
  const [defaultAlbums, setDefaultAlbums] = useState([]);
  const [view, setView] = useState('home'); // 'home' | 'albums' | 'artists'
  const [apiError, setApiError] = useState(null);

  // sugerencias
  React.useEffect(() => {
    let cancelled = false;
    if (!debouncedQ) {
      setSuggestions([]);
      return;
    }
    (async () => {
      try {
        const res = await buscarArtistas(debouncedQ, 12);
        if (!cancelled) setSuggestions(res);
      } catch (err) {
        if (!cancelled) setSuggestions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedQ]);

  // carga inicial
  useEffect(() => {
    (async () => {
      try {
        // artistas muestra
        const sampleNames = ['Belee', 'Ariana Grande', 'Ed Sheeran', 'Nicki Minaj', 'Bad Bunny', 'The Weeknd', 'Coldplay', 'Ozuna', 'Sia', 'Dua Lipa'];
        const artistsPromises = sampleNames.map(n => buscarArtistas(n, 1));
        const artistsResults = await Promise.all(artistsPromises);
        const flattened = artistsResults.flat().filter(Boolean);
        setDefaultArtists(flattened);

        // cargar álbumes
        const albumsAcc = [];
        const toFetch = flattened.slice(0, 6);
        for (const a of toFetch) {
          try {
            if (a && a.id) {
              const aAlbums = await obtenerAlbumesArtista(a.id);
              if (Array.isArray(aAlbums) && aAlbums.length) {
                albumsAcc.push(...aAlbums.map(al => ({ ...al, nombreArtista: a.nombre || al.nombreArtista })));
              }
            }
          } catch (inner) {
            // ignorar errores
          }
        }
        const slicedAlbums = albumsAcc.slice(0, 30);
        setDefaultAlbums(slicedAlbums);

        // pistas inicio
        const tracksAcc = [];
        const albumsToTry = slicedAlbums.slice(0, 8);
        for (const al of albumsToTry) {
          try {
            if (al.coleccionId) {
              const tracks = await obtenerPistasAlbum(al.coleccionId);
              if (Array.isArray(tracks) && tracks.length) {
                tracksAcc.push(...tracks.slice(0, 4));
              }
            }
          } catch (err) {
            // ignorar errores
          }
          if (tracksAcc.length >= 20) break;
          await new Promise(r => setTimeout(r, 120));
        }

        // enriquecer datos
        const enrichedTracks = await Promise.all(tracksAcc.slice(0, 20).map(async (t) => {
          try {
            const tf = await getTrackInfo(t.nombreArtista || '', t.nombrePista || '');
            if (tf) {
              return { ...t, lastfm: { playcount: tf.playcount || tf['@attr']?.playcount || null, listeners: tf.listeners || null } };
            }
          } catch (e) {
            // ignorar
          }
          return t;
        }));
        setDefaultTracks(enrichedTracks.slice(0, 20));
      } catch (err) {
        setApiError('Error cargando datos iniciales. Revisa tu conexión.');
      }
    })();
  }, []);

  // reproducir álbum
  const playAlbum = async (album) => {
    if (!album || !album.coleccionId) return;
    if (!window.__MY_APP_AUDIO) window.__MY_APP_AUDIO = new Audio();
    const audio = window.__MY_APP_AUDIO;
    try {
      const tracks = await obtenerPistasAlbum(album.coleccionId);
      const withPreview = (tracks || []).filter(t => t.urlPreview);
      if (withPreview.length) {
        const pick = withPreview[Math.floor(Math.random() * withPreview.length)];
        audio.src = pick.urlPreview;
        await audio.play();
        window.__MY_APP_PLAYING = pick.pistaId || pick.nombrePista;
      }
    } catch (err) {
      console.warn('No se pudo reproducir el álbum', err);
    }
  };

  // abrir artista
  const openArtistAlbum = async (album) => {
    if (!album) return;
    // buscar artista
    try {
      const found = await buscarArtistas(album.nombreArtista || album.artist || '', 1);
      const artistObj = (found && found.length) ? found[0] : { id: null, nombre: album.nombreArtista || album.artist || '' };
      // focus álbum
      const withFocus = { ...artistObj, focusAlbum: album.coleccionId || album.nombre };
      setSelectedArtist(withFocus);
      setView('artists');
    } catch (err) {
      setSelectedArtist({ id: null, nombre: album.nombreArtista || album.artist || '', focusAlbum: album.coleccionId || album.nombre });
      setView('artists');
    }
  };

  return (
    <div className="app-root">
      <nav className="navbar navbar-dark bg-dark py-3">
        <div className="container-fluid app-container d-flex align-items-center">
          <div className="d-flex align-items-center">
            <div >
              {/* importar imagen de logo de la carpeta public*/}
              <img src="/logo.png" alt="Logo" style={{ width: 150, height: 100, borderRadius: 10, marginRight: 20 }} />
            </div>
            <h2 className="mb-0 text-primary" style={{ fontWeight: 700 }}>Music Dashboard</h2>
          </div>
          <div style={{ minWidth: 300 }}>
            <SearchBar value={q} onChange={setQ} suggestions={suggestions} onSelectSuggestion={(nameOrObj) => {
              // seleccionar artista
              // objeto artista
              const sel = suggestions.find(s => (s.nombre || '') === (nameOrObj || '')) || nameOrObj;
              setSelectedArtist(sel);
              setView('artists');
              setQ('');
            }} />
          </div>
        </div>
      </nav>

      <div className="container-fluid app-container">
        <div className="row mt-4">
          <aside className="col-md-4 mb-4">
            <h5 className="text-light">Resultados</h5>
            <div style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
              {q ? (
                // mostrar sugerencias
                suggestions.length === 0 ? <div className="text-muted">Sin sugerencias</div> : suggestions.map((a) => (
                  <ArtistCard key={a.id || a.nombre} artist={a} onSelect={(nameOrId) => { setSelectedArtist(a); setView('artists'); }} />
                ))
              ) : (
                // artistas por defecto
                defaultArtists.length === 0 ? <div className="text-muted">Cargando artistas...</div> : defaultArtists.map((a) => (
                  <ArtistCard key={a.id || a.nombre} artist={a} onSelect={(nameOrId) => { setSelectedArtist(a); setView('artists'); }} />
                ))
              )}
            </div>
          </aside>

          <main className="col-md-8">
            {apiError && <div className="alert alert-warning">{apiError}</div>}

            <div className="mb-3">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button className={`nav-link ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>Inicio</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${view === 'albums' ? 'active' : ''}`} onClick={() => setView('albums')}>Álbumes</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link ${view === 'artists' ? 'active' : ''}`} onClick={() => setView('artists')}>Artistas</button>
                </li>
              </ul>
            </div>

            <div className="card bg-transparent border-0 text-light">
              <div className="card-body p-0">
                {view === 'home' && (
                  <div>
                    <h4 className="text-light">Top Tracks</h4>
                    {defaultTracks.length === 0 ? (
                      <div className="text-muted">Cargando tracks...</div>
                    ) : (
                      <ol className="list-group list-group-numbered mb-3">
                        {defaultTracks.map((t, i) => (
                          <li key={t.pistaId || t.nombrePista + i} className="list-group-item d-flex align-items-center">
                            <div style={{ width: 56, height: 56, background: '#eee', marginRight: 12, borderRadius: 6, overflow: 'hidden' }}>
                              {t.caratula100 ? (
                                <img src={t.caratula100.replace(/100x100bb.jpg$/, '300x300bb.jpg')} alt={t.nombrePista} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '100%', height: '100%', background: '#151515' }} />
                              )}
                            </div>

                            <div className="flex-grow-1">
                              <div className="fw-bold small text-truncate">{t.nombrePista}</div>
                              <div className="small text-muted">{t.nombreArtista}</div>
                            </div>

                            <div className="d-flex align-items-center ms-3">
                              <div className="me-2 text-muted small">
                                {t.lastfm?.playcount ? `Views: ${t.lastfm.playcount}` : ''}
                              </div>
                              <div>
                                <button className="btn btn-sm btn-outline-secondary" onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!window.__MY_APP_AUDIO) window.__MY_APP_AUDIO = new Audio();
                                  const audio = window.__MY_APP_AUDIO;
                                  if (window.__MY_APP_PLAYING === (t.pistaId || t.nombrePista)) {
                                    audio.pause();
                                    window.__MY_APP_PLAYING = null;
                                    return;
                                  }
                                  // reproducir preview
                                  if (t.urlPreview) {
                                    audio.src = t.urlPreview;
                                    await audio.play();
                                    window.__MY_APP_PLAYING = t.pistaId || t.nombrePista;
                                    audio.onended = () => { window.__MY_APP_PLAYING = null; };
                                  }
                                }}>
                                  {window.__MY_APP_PLAYING === (t.pistaId || t.nombrePista) ? '■' : '▶'}
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                {view === 'albums' && (
                  <div>
                    <h4 className="text-light">Álbumes</h4>
                    {defaultAlbums.length === 0 ? (
                      <div className="text-muted">Cargando álbumes...</div>
                    ) : (
                      <div className="row g-3">
                        {defaultAlbums.map((al, idx) => (
                          <div key={(al.coleccionId || al.nombre) + idx} className="col-12 col-sm-6 col-md-4">
                            <div className="card text-dark" role="button" tabIndex={0} onClick={() => openArtistAlbum(al)} style={{ cursor: 'pointer' }}>
                              <div style={{ height: 140, overflow: 'hidden', background: '#eee' }}>
                                {al.caratula100 ? (
                                  <img src={al.caratula100.replace(/100x100bb.jpg$/, '600x600bb.jpg')} alt={al.nombre} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ height: 140, background: '#eee' }} />
                                )}
                              </div>
                              <div className="card-body p-2">
                                <div className="fw-bold small text-truncate">{al.nombre}</div>
                                <div className="small text-muted">{al.nombreArtista || al.artist || ''}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {view === 'artists' && (
                  <div>
                    {selectedArtist ? (
                      <ArtistDashboard artista={selectedArtist} />
                    ) : (
                      <div className="text-muted">Selecciona un artista de la lista o búsqueda.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}