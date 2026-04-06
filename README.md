<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E"/>
<img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white"/>  <br/>
  🎵 🎧 🎶
</p>

#
![Typing](https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=22&pause=1000&color=2F80ED&center=true&width=800&lines=Music+Dashboard+2025+%7C+React,+Vite+y+API)


[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![VSCode](https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![iTunes API](https://img.shields.io/badge/iTunes%20Search-000000?style=for-the-badge&logo=apple&logoColor=white)](https://itunes.apple.com/)
[![MusicBrainz](https://img.shields.io/badge/MusicBrainz-BA478F?style=for-the-badge&logo=musicbrainz&logoColor=white)](https://musicbrainz.org/ws/2/)
[![Cover Art Archive](https://img.shields.io/badge/Cover%20Art%20Archive-FF6600?style=for-the-badge&logo=archive&logoColor=white)](https://coverartarchive.org/)
[![Last.fm](https://img.shields.io/badge/Last.fm-D51007?style=for-the-badge&logo=lastdotfm&logoColor=white)](https://www.last.fm/api)

---
# 🚀 Implementación local

Sigue estos pasos para obtener una copia local del proyecto y ejecutarlo por primera vez:

1. **Clona el repositorio:**
    ```bash
    git clone https://github.com/EduMoralesCar/MusicDashboard.git
    cd MusicDashboard/
    ```

2. Configura las Variables de Entorno creando un archivo .env.local
   ```bash
   # API Key de Last.fm
   VITE_LASTFM_API_KEY=tu_api_key_de_Last.fm
   ```
   Registrate en la url: [https://www.last.fm/api/account/create](https://www.last.fm/api/account/create)
   > Luego crea la API
   <img width="1346" height="609" alt="image" src="https://github.com/user-attachments/assets/84d701ce-97b2-40f1-8d20-f0095b30393e" />

3.  **Instala las dependencias:**
    > **Nota:** Realizar los siguientes pasos una vez implementado el entorno local

    ```bash
    npm install
    ```

4.  **Corre el proyecto:**
    ```bash
    npm run dev
    ```

    ¡Y listo! La aplicación estará corriendo en [http://localhost:5173](http://localhost:5173) 

5. MusicDashboard

   Visita el proyecto completo [aquí!](https://musicdashboard-snowy.vercel.app/)🌐

---

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

