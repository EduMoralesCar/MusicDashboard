<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <br/>
  🎵 🎧 🎶
</p>

# Eumora Music 🎵

**Eumora Music** es una plataforma musical premium construida al estilo de Spotify, desarrollada como un proyecto académico avanzado de alto impacto utilizando **Next.js 16 (App Router)**, **React 19**, **TypeScript** y **MongoDB Atlas**. 

A diferencia de clones convencionales que solo reproducen cortos de 30 segundos, Eumora Music integra un backend inteligente que busca pistas comerciales oficiales y las transmite de forma **100% completa (Full-Length)** usando la YouTube Iframe Player API en segundo plano, acompañado de un panel de videoclip flotante premium y almacenamiento en la nube en tiempo real.

---

## 🔥 Características Clave y Premium

*   **Acceso Seguro (Middleware & JWT):** Todo el sistema se encuentra protegido por un middleware de Next.js. El acceso requiere iniciar sesión.
*   **Seguridad por OTP (Verificación de Correo Real):** Registro de usuarios y recuperación de contraseñas validados mediante códigos de un solo uso (OTP) enviados directamente a correos reales por SMTP (compatible con Gmail y Resend).
*   **Música Completa y Oficial:** Escucha canciones comerciales originales completas mediante el reproductor de YouTube sincronizado en segundo plano, en lugar de demos recortadas.
*   **Panel de Video Opcional ("Modo Video Clip"):** Un elegante panel flotante expandible y colapsable en la barra lateral inferior que reproduce el videoclip oficial de YouTube en sincronía con el reproductor de música.
*   **Playlists en la Nube (MongoDB Atlas):** Crea playlists personalizadas en tiempo real desde la barra lateral, añade o elimina pistas desde cualquier sección de la app (Home, Búsquedas, Álbumes o Artistas) usando menús contextuales, y almacénalas en la nube.
*   **Navegación Dinámica e Interactiva:**
    *   **Perfiles de Artista:** Con banners en alta definición, insignia de verificación, oyentes mensuales reales, top 5 de canciones populares y cuadrícula de álbumes oficiales.
    *   **Vistas de Álbum:** Cabeceras detalladas con portada del disco, año de lanzamiento, cantidad de pistas, y el tracklist oficial listo para reproducir o añadir a tus playlists.
    *   **Sincronización de Favoritos (Liked Songs):** Canciones marcadas con me gusta guardadas en tu perfil de MongoDB.

---

## 🛠️ Requisitos de Entorno (`.env.local`)

Para ejecutar la aplicación localmente o desplegarla en plataformas como Render o Vercel, crea un archivo `.env.local` en la raíz del proyecto con la siguiente estructura:

```bash
# Conexión a Base de Datos (MongoDB Atlas Cloud o Local)
MONGODB_URI=mongodb+srv://tu_usuario:tu_contraseña@cluster0.mongodb.net/eumora_music

# Clave Secreta para Cifrar Sesiones JWT
JWT_SECRET=eumora_music_super_secret_jwt_key_2026_university_project_token_secret

# Configuración SMTP para envío de correos OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu_cuenta@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion_gmail # Clave de 16 caracteres de Google
SMTP_FROM=Eumora Music <tu_cuenta@gmail.com>
```

> [!TIP]
> **Simulador de Correo:** Si decides omitir la configuración SMTP, la aplicación no fallará: cuenta con un simulador integrado que imprime el código OTP de 6 dígitos directamente en la consola/terminal del servidor para que puedas completar registros de prueba fácilmente.

---

## 🚀 Instalación y Ejecución Local

Sigue estos sencillos pasos para levantar el entorno de desarrollo:

1.  **Clona este repositorio:**
    ```bash
    git clone https://github.com/EduMoralesCar/MusicDashboard.git
    cd MusicDashboard/
    ```

2.  **Instala las dependencias necesarias:**
    ```bash
    pnpm install
    ```

3.  **Inicia el servidor en modo de desarrollo:**
    ```bash
    pnpm dev
    ```

4.  **Abre el navegador:**
    Visita el dashboard local en [http://localhost:3000](http://localhost:3000) e inicia sesión o crea una cuenta nueva.

---

## 📦 Scripts Disponibles

*   `pnpm dev`: Inicia el servidor local de desarrollo.
*   `pnpm build`: Compila la aplicación Next.js y genera la versión optimizada de producción de forma limpia.
*   `pnpm start`: Arranca el servidor de producción compilado.
*   `pnpm lint`: Ejecuta el validador de sintaxis y estilos de código de ESLint.

---

## 🎓 Proyecto Universitario
*   **Enfoque:** Académico/Educativo.
*   **Diseño Visual:** Dark-Mode estilo Obsidian-Black con micro-animaciones premium en Radix UI.
*   **APIs consumidas:** Deezer API (para catálogo y perfiles oficiales) y YouTube API / Iframe API (para reproducción legal y videoclips sincronizados).