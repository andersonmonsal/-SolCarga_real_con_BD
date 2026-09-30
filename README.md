#  RideNow — Estación Inteligente

RideNow es una plataforma moderna para gestionar estaciones de carga de vehículos eléctricos livianos (patinetas y bicicletas eléctricas) con alimentación de paneles solares.

##  Funcionalidades Principales

- **Dashboard de disponibilidad en tiempo real** (con Socket.IO)
- **Sistema de reservas** de bahías con generación de código QR
- **Chatbot Inteligente (RideBot)** con IA para recomendaciones
- **Sistema de Autenticación** seguro (JWT y bcrypt)
- **Multi-idioma** (Español e Inglés)
- **Accesibilidad** (Alto contraste, control de fuente, lector de pantalla TTS)
- **Diseño responsive** y moderno (Glassmorphism, animaciones)

## Tecnologías

- **Frontend:** HTML5, CSS3 Variables/Grid/Flex, Vanilla JS (SPA architecture), Socket.IO Client.
- **Backend:** Node.js, Express, Socket.IO, JSON Web Tokens.
- **Base de Datos:** SQLite.


##  Cómo ejecutar localmente

### Opción 1: Con Node.js y npm (Recomendado para desarrollo)

1. Ve a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Copia el archivo de entorno y edítalo si deseas usar la IA:
   ```bash
   cp .env.example .env
   ```
4. Inicia el servidor:
   ```bash
   npm start
   # o para desarrollo con recarga: npm run dev
   ```
5. Abre en tu navegador: `http://localhost:3000`

### Opción 2: Con Docker Compose

1. En la raíz del proyecto, ejecuta:
   ```bash
   docker-compose up -d
   ```
2. Abre en tu navegador: `https://solcarga-app.onrender.com/`

##  Usuarios de Prueba

Para probar el sistema, puedes crear una cuenta nueva haciendo clic en **"Crear una cuenta"** en la pantalla inicial de inicio de sesión.
