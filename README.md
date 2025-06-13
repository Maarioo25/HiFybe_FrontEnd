# HiFybe
# HiFybe – Aplicación Web 🎷🌍

Este repositorio contiene el **FrontEnd Web** de **HiFybe**, una red social musical que conecta a personas según sus gustos musicales y ubicación geográfica. Descubre usuarios cercanos, comparte canciones y crea conversaciones con tus amigos a través de una experiencia visual e interactiva.

🔗 Repositorio: [HiFybe\_FrontEnd](https://github.com/Maarioo25/HiFybe_FrontEnd)
🚪 Aplicación desplegada: [https://mariobueno.info](https://mariobueno.info)
🚪 Backend desplegado: [https://api.mariobueno.info](https://api.mariobueno.info)
📽️ Presentación: [Ver en Canva](https://www.canva.com/design/DAGqML3KOHU/Gmd0HagvLIDl1Kx24MKn_w/view?utm_content=DAGqML3KOHU&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=haca5c05453)

---

## 🚀 Tecnologías principales

Este proyecto hace uso de una **stack moderna** y optimizada para desarrollo de interfaces interactivas:

| Tecnología           | Descripción                                                           |
| -------------------- | --------------------------------------------------------------------- |
| **React**            | Librería para construir interfaces de usuario basadas en componentes. |
| **React Router DOM** | Navegación entre páginas con rutas protegidas.                        |
| **Context API**      | Gestión del estado global de usuario y reproductor.                   |
| **Leaflet**          | Mapa interactivo con geolocalización de usuarios en tiempo real.      |
| **i18next**          | Soporte multilenguaje para internacionalización.                      |
| **React Hot Toast**  | Notificaciones visuales y rápidas con estilos personalizados.         |
| **Axios**            | Cliente HTTP para conectarse al backend y manejar peticiones REST.    |
| **Tailwind CSS**     | Framework CSS utilitario para estilizar componentes con rapidez.      |
| **JWT**              | Manejo seguro de autenticación con tokens y cookies.                  |
| **Vite**             | Empaquetador rápido para entorno de desarrollo optimizado.            |

---

## 📦 Instalación y ejecución

```bash
# Clonar repositorio
git clone https://github.com/Maarioo25/HiFybe_FrontEnd.git
cd HiFybe_FrontEnd

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Acceder a la aplicación
http://localhost:5173
```

> ⚠️ Asegúrate de tener configurado el backend (ver [HiFybe\_BackEnd](https://github.com/Maarioo25/HiFybe_BackEnd)) y las variables de entorno adecuadas.

---

## 📁 Estructura del proyecto

```
public/
├── avatars/             # Avatares de usuarios
├── data/                # Datos JSON estáticos (recomendaciones, etc.)
├── images/              # Imágenes públicas usadas en la app
└── lenguajes/           # Archivos de traducción estáticos

src/
├── components/          # Componentes reutilizables (HeaderBar, FooterPlayer, etc.)
├── context/             # Contextos globales (AuthContext, PlayerContext)
├── pages/               # Vistas principales (MainPage, Friends, Playlists, etc.)
├── services/            # Conexión con el backend (userService, musicService, etc.)
├── styles/              # Archivos de estilos personalizados
├── App.jsx              # Configuración de rutas y layout principal
├── main.jsx             # Punto de entrada del proyecto
├── i18n.js              # Configuración del sistema multilenguaje
└── index.css            # Estilos globales (Tailwind incluido)
```

---

## 🔐 Autenticación

* Autenticación local y mediante Spotify / Google con OAuth 2.0.
* Gestión de sesión mediante JWT:

  * En **web**: cookie segura (`HttpOnly`, `SameSite=None`, `Secure`).
  * En **móvil**: token en `Authorization` (modo Bearer).
* Acceso a datos del usuario, playlists privadas y amigos.

---

## 🗽️ Funcionalidades destacadas

* 🌍 Mapa con usuarios cercanos mediante Leaflet y localización real.
* 🎵 Reproductor musical conectado a la cuenta de Spotify del usuario.
* 🧑‍🤝‍🧑 Sistema de amistad y solicitudes entre usuarios.
* 💬 Chats privados entre amigos, con opción de compartir canciones.
* 📁 Playlists públicas y privadas gestionadas desde Spotify.
* ⚙️ Perfil configurable con redes sociales, preferencias y visibilidad.
* 🔔 Notificaciones integradas y personalizadas.
* 🌐 Interfaz multilingüe gracias a i18next.
* 📱 Diseño responsive y accesible en escritorio.

---

## 📜 Licencia

Este proyecto ha sido desarrollado como parte de un **proyecto de final de grado**. Su uso, distribución y modificación están prohibidos sin autorización expresa del autor.

---

## 🤝 Contacto

Desarrollado por **Mario Bueno López**

* 📧 [mariobueno060@gmail.com](mailto:mariobueno060@gmail.com)
* 🔗 [LinkedIn](https://www.linkedin.com/in/mario-bueno-l%C3%B3pez-a35181250/)
* 💻 [HiFybe\_BackEnd](https://github.com/Maarioo25/HiFybe_BackEnd)
