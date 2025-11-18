import React, { useState, useEffect, useRef } from 'react';
import { obtenerAlbumesArtista, obtenerPistasAlbum, buscarCaratulaItunes } from '../api/itunes';
import { buscarCaratulaPorArtistaYAlbum } from '../api/musicbrainz';

export default function ArtistDashboard({ artista }) {
    const [info, setInfo] = useState(null);
    const [topTracks, setTopTracks] = useState([]);
    const [topAlbums, setTopAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef(null);
    const [playingTrack, setPlayingTrack] = useState(null);
    const [highlightedAlbum, setHighlightedAlbum] = useState(null);

    useEffect(() => {
        if (!artista) return;
        setLoading(true);
        (async () => {
            try {
                // artista (obj|string)
                const artistObj = typeof artista === 'object' ? artista : { id: null, nombre: artista };
                setInfo(artistObj);

                // cargar álbumes
                const albums = artistObj.id ? await obtenerAlbumesArtista(artistObj.id) : [];
                const enriched = Array.isArray(albums) ? albums : [];

                // carátulas fallback
                const maxEnrich = Math.min(enriched.length, 24);
                for (let i = 0; i < maxEnrich; i++) {
                    const a = enriched[i];
                    if (!a.caratula100) {
                        // iTunes búsqueda
                        try {
                            const cover = await buscarCaratulaItunes(artistObj.nombre || '', a.nombre || '');
                            if (cover) {
                                a.caratula100 = cover;
                                continue;
                            }
                        } catch (err) {
                            // ignorar
                        }

                        // CAA MB
                        try {
                            const caa = await buscarCaratulaPorArtistaYAlbum(artistObj.nombre || '', a.nombre || '');
                            if (caa) {
                                // CAA imagen
                                a.caratula100 = caa;
                                continue;
                            }
                        } catch (err) {
                            // ignorar
                        }

                        // respetar límites
                        await new Promise(r => setTimeout(r, 250));
                    }
                }
                setTopAlbums(enriched.slice(0, 36));

                // construir lista pistas
                const tracksAcc = [];
                const albumsToTry = enriched.slice(0, 8);
                for (const al of albumsToTry) {
                    try {
                        const tracks = await obtenerPistasAlbum(al.coleccionId);
                        if (Array.isArray(tracks) && tracks.length) {
                            tracksAcc.push(...tracks.slice(0, 6));
                        }
                    } catch (_) {
                        // ignorar álbum
                    }
                    if (tracksAcc.length >= 15) break;
                    await new Promise(r => setTimeout(r, 150));
                }
                setTopTracks(tracksAcc.slice(0, 15));

                // focus álbum (si viene de la cuadrícula de Álbumes)
                if (artistObj.focusAlbum) {
                    const focus = enriched.find(x => (x.coleccionId && String(x.coleccionId) === String(artistObj.focusAlbum)) || (x.coleccionId && String(artistObj.focusAlbum).includes(String(x.coleccionId))) || (x.nombre && String(x.nombre) === String(artistObj.focusAlbum)));
                    if (focus && focus.coleccionId) {
                        try {
                            const albumTracks = await obtenerPistasAlbum(focus.coleccionId);
                            if (Array.isArray(albumTracks) && albumTracks.length) {
                                setTopTracks(albumTracks.slice(0, 20));
                                // autoplay aleatorio
                                const withPreview = albumTracks.filter(t => t.urlPreview);
                                if (withPreview.length) {
                                    const pick = withPreview[Math.floor(Math.random() * withPreview.length)];
                                    if (!audioRef.current) audioRef.current = new Audio();
                                    audioRef.current.src = pick.urlPreview;
                                    audioRef.current.play();
                                    setPlayingTrack(pick.pistaId || pick.nombrePista);
                                    audioRef.current.onended = () => setPlayingTrack(null);
                                }
                            }
                        } catch (e) {
                            // ignorar
                        }
                    }
                }
            } catch (err) {
                setInfo(null);
                setTopTracks([]);
                setTopAlbums([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [artista]);

    // sin playcount
    const getArtistImage = () => {
        // usar primera carátula
        if (topAlbums && topAlbums.length && topAlbums[0].caratula100) return topAlbums[0].caratula100.replace(/100x100bb.jpg$/, '600x600bb.jpg');
        return '';
    };

    if (!artista) return <div>Selecciona un artista.</div>;
    if (loading) return <div>Cargando artista...</div>;

    const artistImage = getArtistImage();

    return (
        <div>
            <div className="d-flex align-items-center mb-3">
                {artistImage ? (
                    <img src={artistImage} alt={info?.nombre} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginRight: 16 }} />
                ) : (
                    <div style={{ width: 120, height: 120, background: '#181818', borderRadius: 8, marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 40, height: 40, background: '#1DB954', borderRadius: 6 }} />
                    </div>
                )}

                <div>
                    <h3 className="mb-0">{info?.nombre}</h3>
                    <div className="text-muted small">{info?.generoPrincipal || ''}</div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <h5>Top Tracks</h5>
                    <ul className="list-group mb-3">
                        {topTracks.map((t, idx) => (
                            <li key={t.pistaId || t.nombrePista + idx} className="list-group-item d-flex align-items-center">
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
                                <div className="ms-3 d-flex align-items-center">
                                    {t.urlPreview ? (
                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => {
                                            if (!audioRef.current) audioRef.current = new Audio();
                                            if (playingTrack === t.pistaId) {
                                                audioRef.current.pause();
                                                setPlayingTrack(null);
                                            } else {
                                                audioRef.current.src = t.urlPreview;
                                                audioRef.current.play();
                                                setPlayingTrack(t.pistaId);
                                                audioRef.current.onended = () => setPlayingTrack(null);
                                            }
                                        }}>{playingTrack === t.pistaId ? '■' : '▶'}</button>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div>
                <h5>Top Albums</h5>
                <div className="row g-3">
                    {topAlbums.map((a, i) => (
                        <div key={(a.coleccionId || a.nombre) + i} className="col-6 col-md-4 col-lg-3">
                            <div
                                className={`card ${highlightedAlbum && ((highlightedAlbum === a.coleccionId) || (highlightedAlbum === a.nombre)) ? 'border-primary' : ''}`}
                                role="button"
                                tabIndex={0}
                                onClick={async () => {
                                    // click álbum: cargar y autoplay
                                    try {
                                        const albumTracks = await obtenerPistasAlbum(a.coleccionId);
                                        if (Array.isArray(albumTracks) && albumTracks.length) {
                                            setTopTracks(albumTracks.slice(0, 20));
                                            setHighlightedAlbum(a.coleccionId || a.nombre);
                                            const withPreview = albumTracks.filter(t => t.urlPreview);
                                            if (withPreview.length) {
                                                const pick = withPreview[Math.floor(Math.random() * withPreview.length)];
                                                if (!audioRef.current) audioRef.current = new Audio();
                                                audioRef.current.src = pick.urlPreview;
                                                await audioRef.current.play();
                                                setPlayingTrack(pick.pistaId || pick.nombrePista);
                                                audioRef.current.onended = () => setPlayingTrack(null);
                                            }
                                        }
                                    } catch (e) {
                                        // ignorar
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{ height: 140, overflow: 'hidden', background: '#eee' }}>
                                    {a.caratula100 ? (
                                        <img src={a.caratula100.replace(/100x100bb.jpg$/, '600x600bb.jpg')} alt={a.nombre} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ height: 140, background: '#121212' }} />
                                    )}
                                </div>
                                <div className="card-body p-2">
                                    <div className="small fw-bold text-truncate">{a.nombre}</div>
                                    <div className="small text-muted">{a.nombreArtista || a.artist || ''}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-3">
                <h6>Bio</h6>
                <div dangerouslySetInnerHTML={{ __html: info?.bio?.summary || 'Sin bio' }} />
            </div>
        </div>
    );
}