<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</div>

<h1 align="center">🎵 Eumora Music - Plataforma de Streaming Premium</h1>

<p align="center">
  Plataforma web moderna y robusta inspirada en Spotify para la reproducción de música completa oficial, gestión de playlists en tiempo real y visualización de videoclips sincronizados en un panel flotante.
</p>

<div align="center">
  <h3>
    <a href="https://music-dashboard-gamma.vercel.app/">🚀 VER DEMO EN VIVO</a>
  </h3>
</div>

---

## 🌟 Sobre el Proyecto

**Eumora Music** es una plataforma musical premium construida al estilo de Spotify, desarrollada como un proyecto académico avanzado de alto impacto utilizando **Next.js 16 (App Router)**, **React 19**, **TypeScript** y **MongoDB Atlas**. 

A diferencia de clones convencionales que solo reproducen cortos de 30 segundos, Eumora Music integra un backend inteligente que busca pistas comerciales oficiales y las transmite de forma **100% completa (Full-Length)** usando la YouTube Iframe Player API en segundo plano, acompañado de un panel de videoclip flotante premium y almacenamiento en la nube en tiempo real.

---

## ✨ Funcionalidades Principales

El proyecto utiliza una arquitectura moderna y escalable que se conecta a MongoDB Atlas para garantizar la persistencia de perfiles, favoritos y playlists personalizadas creadas por cada usuario.

### 🔒 Acceso y Registro Seguro
- **Middleware & JWT:** Todo el sistema se encuentra protegido por un middleware de Next.js. El acceso a la biblioteca y reproductor requiere sesión activa.
- **Seguridad por OTP (Verificación Real):** Registro de usuarios y recuperación de contraseñas validados mediante códigos de un solo uso (OTP) enviados directamente a correos reales por SMTP (compatible con Gmail y Resend).

### 🎵 Reproductor de Música Premium
- **Música Completa y Oficial:** Escucha canciones comerciales originales completas mediante el reproductor de YouTube sincronizado en segundo plano, en lugar de demos recortadas.
- **Modo Video Clip ("Videoclip Flotante"):** Un elegante panel flotante expandible y colapsable en la barra lateral inferior que reproduce el videoclip oficial de YouTube en sincronía con el reproductor de música.

### ☁️ Playlists y Personalización en la Nube
- **Gestión de Playlists (CRUD):** Crea playlists personalizadas en tiempo real desde la barra lateral.
- **Menús Contextuales:** Añade o elimina pistas desde cualquier sección de la app (Home, Búsquedas, Álbumes o Artistas) y almacénalas en tu cuenta.
- **Sincronización de Favoritos (Liked Songs):** Canciones marcadas con "me gusta" guardadas de forma segura en tu perfil de MongoDB.

### 👤 Navegación Dinámica e Interactiva
- **Perfiles de Artista:** Con banners en alta definición, insignia de verificación, oyentes mensuales reales, top 5 de canciones populares y cuadrícula de álbumes oficiales.
- **Vistas de Álbum:** Cabeceras detalladas con portada del disco, año de lanzamiento, cantidad de pistas y el tracklist oficial listo para reproducir.

---

## 🔑 Credenciales de Acceso (Demo)

Puedes ingresar al demo en vivo registrándote directamente con tu correo electrónico o utilizando credenciales de prueba que crees tú mismo.

> **Nota de Registro:** Al registrarte, recibirás un correo electrónico real con el código OTP de verificación. Si deseas probar de forma local y decides omitir la configuración SMTP, la aplicación cuenta con un simulador integrado que imprime el código OTP de 6 dígitos directamente en la consola/terminal del servidor para facilitar tus pruebas.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript.
- **Estilos:** TailwindCSS 4, Componentes UI basados en Radix UI.
- **Base de Datos & ORM:** MongoDB Atlas, Mongoose.
- **Iconos:** Lucide-React.
- **Servicios de Correo:** Nodemailer (SMTP).
- **APIs Consumidas:** Deezer API (catálogo y metadatos) e YouTube Iframe API (audio y videoclips).
- **Despliegue:** Vercel.

---

## 🚀 Despliegue Local (Para Desarrolladores)

Si deseas clonar el proyecto y correrlo en tu máquina:

1. **Clonar el repositorio:**
```bash
git clone https://github.com/EduMoralesCar/MusicDashboard.git
cd MusicDashboard
```

2. **Configurar las Variables de Enorno:**
Crea un archivo `.env.local` en la raíz del proyecto con la siguiente estructura:
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

3. **Instalar dependencias:**
```bash
pnpm install
```

4. **Ejecutar en modo desarrollo:**
```bash
pnpm dev
```

5. **Abrir en tu navegador:**
Navega a `http://localhost:3000` para ver la aplicación funcionando localmente.

---