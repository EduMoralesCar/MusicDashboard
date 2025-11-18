
import React, { useState } from 'react';
import { obtenerAlbumesArtista, obtenerPistasAlbum } from '../api/itunes';

export default function ArtistCard({ artist, onSelect }) {
	if (!artist) return null;

	// varias formas imagen
	const getImageUrl = () => {
		if (!artist) return '';
		if (artist.caratula100) return artist.caratula100;
		if (artist.artworkUrl100) return artist.artworkUrl100;
		if (artist.artworkUrl) return artist.artworkUrl;
		if (artist.image) {
			const img = Array.isArray(artist.image)
				? artist.image.find((i) => i.size === 'extralarge') || artist.image.find(i => i.size === 'large') || artist.image[0]
				: artist.image;
			return img ? img['#text'] || '' : '';
		}
		return '';
	};

	const imageUrl = getImageUrl();

	const handleClick = () => onSelect && onSelect(artist);

	const [meta, setMeta] = useState({ albums: null, tracks: null });
	const [loadingMeta, setLoadingMeta] = useState(false);

	const fetchMeta = async () => {
		if (!artist || !artist.id || meta.albums !== null || loadingMeta) return;
		setLoadingMeta(true);
		try {
			const albums = await obtenerAlbumesArtista(artist.id);
			const albumsCount = Array.isArray(albums) ? albums.length : 0;
			const tracksCount = Array.isArray(albums) ? albums.reduce((acc, a) => acc + (a.totalPistas || a.trackCount || 0), 0) : 0;
			setMeta({ albums: albumsCount, tracks: tracksCount });
		} catch (err) {
			setMeta({ albums: 0, tracks: 0 });
		} finally {
			setLoadingMeta(false);
		}
	};

	return (
		<div
			className="card mb-2 artist-card"
			role="button"
			tabIndex={0}
			onClick={handleClick}
			onMouseEnter={fetchMeta}
		>
			<div className="d-flex align-items-center">
				<div className="artist-thumb me-2">
					{imageUrl ? (
						<img src={imageUrl.replace(/100x100bb.jpg$/, '300x300bb.jpg')} alt={`${artist.nombre || artist.name} cover`} className="img-fluid rounded" />
					) : (
						<div className="placeholder-thumb" aria-hidden />
					)}
				</div>
				<div className="flex-grow-1 py-2">
					<div className="d-flex align-items-center justify-content-between">
						<div style={{minWidth:0}}>
							<div className="fw-bold small text-truncate">{artist.nombre || artist}</div>
							{loadingMeta ? (
								<div className="text-muted small">Cargando...</div>
							) : (
								<div className="text-muted small">
									{meta.albums !== null ? `Álbumes: ${meta.albums} • Canciones: ${meta.tracks}` : (artist.generoPrincipal ? artist.generoPrincipal : '')}
								</div>
							)}
						</div>
						<div className="ms-2 d-flex align-items-center">
							<button className="btn btn-sm btn-secondary" onClick={handleClick}>Abrir</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

