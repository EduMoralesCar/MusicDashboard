# <p align="center">React + Vite</p>

![Typing](https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=22&pause=1000&color=2F80ED&center=true&width=800&lines=Music+Dashboard+2025+%7C+React+y+Vite)

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![VSCode](https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)

## Ejecución 

1.  **Instala las dependencias:**
    ```bash
    npm install
    ```

2.  **Corre el proyecto:**
    ```bash
    npm run dev
    ```

¡Y listo! La aplicación estará corriendo en [http://localhost:5173](http://localhost:5173) 🌐

# APIs externas usadas

Resumen rápido de las APIs externas que consume la aplicación y su propósito.

- iTunes Search API
  - Endpoint base: `https://itunes.apple.com/`
  - Propósito: búsqueda de artistas, álbumes y pistas; fuente principal de previews (`previewUrl`) y artwork cuando está disponible.
  - Wrappers en el proyecto: `src/api/itunes.js` (funciones exportadas en español: `buscarArtistas`, `obtenerAlbumesArtista`, `obtenerPistasAlbum`, `buscarCaratulaItunes`).

- MusicBrainz WS2
  - Endpoint base: `https://musicbrainz.org/ws/2/`
  - Propósito: buscar MBID de releases cuando necesitamos resolver un lanzamiento por artista+álbum (fallback para carátulas).
  - Wrappers en el proyecto: `src/api/musicbrainz.js` (funciones en español: `buscarMBIDLanzamiento`, `obtenerCaratulaPorMBID`, `buscarCaratulaPorArtistaYAlbum`).

- Cover Art Archive (CAA)
  - Endpoint base: `https://coverartarchive.org/release/{MBID}`
  - Propósito: devolver JSON con imágenes de release (thumbnails y URLs grandes). Usado por `musicbrainz.js` tras obtener el MBID.

- Last.fm Web API
  - Endpoint base: `https://ws.audioscrobbler.com/2.0/`
  - Propósito: enriquecer metadata de pistas (por ejemplo `track.getInfo` para playcount, duración detallada o tags). Requiere clave API.
  - Env required: colocar `VITE_LASTFM_API_KEY` en `.env.local` para usar `src/api/lastfm.js`.
  - Wrapper en el proyecto: `src/api/lastfm.js` (función actual: `getTrackInfo`).

Notas
- MusicBrainz y CAA son servicios relacionados (MBID -> CAA), pero técnicamente son endpoints diferentes y por eso se listan por separado.
- Si quieres cambiar nombres públicos de funciones (`getTrackInfo` → `obtenerInfoPista`) puedo traducirlos y actualizar imports en todo el proyecto.
- También puedo copiar esta sección al `README.md` raíz del proyecto si prefieres tener la referencia fuera del código.

---
Generado automáticamente para tener las APIs a mano. Mantener actualizado cuando se añadan/quiten servicios externos.
