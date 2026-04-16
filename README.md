<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <br/>
  🎵 🎧 🎶
</p>

#
![Typing](https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=22&pause=1000&color=2F80ED&center=true&width=900&lines=Wavify+%7C+Music+Dashboard+con+Next.js,+React+y+Audius)

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![VSCode](https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Audius API](https://img.shields.io/badge/Audius-7C2BFF?style=for-the-badge&logo=musicbrainz&logoColor=white)](https://audius.co/)

---

# 🚀 Implementación local

Sigue estos pasos para obtener una copia local del proyecto y ejecutarlo por primera vez:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/EduMoralesCar/MusicDashboard.git
   cd MusicDashboard/
   ```

2. **Instala las dependencias:**
   ```bash
   pnpm install
   ```

3. **Corre el proyecto:**
   ```bash
   pnpm dev
   ```

   ¡Y listo! La aplicación estará corriendo en **localhost:3000**.

4. **Abre la app:**
   Visita el proyecto local en [http://localhost:3000](http://localhost:3000).

---

# ¿Qué incluye?

MusicDashboard, también llamado Wavify en la interfaz, es un dashboard musical estilo Spotify construido con Next.js 16, React 19 y Audius.

- Home con tendencias semanales, música latina y selecciones underground.
- Búsqueda de canciones y artistas con resultados en tiempo real.
- Biblioteca con playlists trending.
- Lista de canciones favoritas persistida en el navegador.
- Reproductor con play, pause, siguiente, anterior, shuffle, repeat y control de volumen.

---

# APIs externas usadas

Resumen rápido de las APIs externas que consume la aplicación y su propósito.

- Audius API
  - Endpoint base: `https://api.audius.co` y nodos de discovery de Audius.
  - Propósito: búsqueda de tracks, usuarios y playlists, tendencias globales, reproducción de audio y metadata de artistas.
  - Wrappers en el proyecto: `lib/audius.ts`.

- Audius Discovery Provider
  - Endpoint base: `https://discoveryprovider.audius.co`.
  - Propósito: fallback cuando no se puede resolver un host público desde `api.audius.co`.
  - Uso: gestionado internamente por `lib/audius.ts`.

Notas
- Este proyecto no requiere variables de entorno para correr en local.
- Las imágenes y previews dependen de la disponibilidad pública de Audius.
- Si quieres, también puedo agregar una sección de capturas de pantalla o desplegarlo con tu URL final de Vercel.

---

# Scripts disponibles

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

---

# Demo

Si ya está desplegado, puedes visitar la versión en línea desde aquí:

- [MusicDashboard](https://musicdashboard-snowy.vercel.app/)

---