const translations = {
    es: {
        // Auth
        loginSubtitle: "Portal de acceso para usuarios",
        loginSubtitleAdmin: "Portal de acceso seguro para administradores",
        email: "Correo electrónico",
        password: "Contraseña",
        login: "Iniciar sesión",
        createAccount: "Crear una cuenta",
        register: "Crear cuenta",
        forgotPassword: "¿Olvidaste tu contraseña?",
        alreadyHaveAccount: "Ya tengo una cuenta",
        roleUser: "Usuario",
        roleAdmin: "Administrador",
        // Register form
        firstName: "Nombre",
        lastName: "Apellido",
        confirmPassword: "Confirmar contraseña",
        mainVehicle: "Vehículo principal",
        vehicleScooter: "🛴 Patineta Eléctrica",
        vehicleBike: "🚲 Bicicleta Eléctrica",
        passwordHint: "Mínimo 8 caracteres con al menos un carácter especial (!@#$%&*)",
        // Home section
        greeting: "Hola",
        heroEnergy: "Tu energía, siempre en movimiento.",
        heroSubtitle: "Encuentra una estación, reserva tu bahía y continúa tu viaje.",
        greetingSubtitle: "¿Qué deseas hacer?",
        findBay: "Encontrar una estación →",
        solarEnergy: "ENERGÍA SOLAR",
        generatedToday: "Energía generada hoy",
        chargingBays: "Bahías de carga",
        realTime: "Disponibilidad en tiempo real",
        available: "🟢 Disponible",
        occupied: "🔴 Ocupada",
        reserved: "🟡 Reservada",
        offline: "⚪ Fuera de servicio",
        // Reservation
        makeReservation: "Reservar bahía",
        backHome: "← Volver",
        vehicleQuestion: "¿Qué vehículo vas a cargar?",
        arrival: "Hora de llegada (05:00 - 22:00)",
        departure: "Hora de salida (hasta las 22:00)",
        confirmReservationBtn: "Confirmar reserva",
        bay: "Bahía",
        vehicle: "Vehículo",
        duration: "Duración",
        // QR
        myQR: "Mi QR",
        noReservation: "No tienes una reserva",
        noReservationDesc: "Reserva una bahía disponible para obtener tu QR.",
        viewMap: "Ver Mapa",
        scanAtStation: "📷 Escanear en estación",
        reservationConfirmed: "Reserva confirmada ✓",
        cancelReservation: "Cancelar reserva",
        confirmArrival: "📷 Confirmar mi llegada",
        confirmArrivalHint: "Escanea el QR del punto de carga al llegar",
        charging: "⚡ Cargando",
        // Location
        location: "Ubicación",
        walkingTime: "🚶‍♂️ 3 minutos caminando",
        // Navigation
        home: "Inicio",
        chat: "Chat",
        // Chat / AI
        assistantTitle: "Asistente ☀️",
        assistantSubtitle: "Responde en tiempo real",
        clearChat: "🗑️ Limpiar",
        chatPlaceholder: "Escribe un mensaje...",
        chatWelcome: "¡Hola! Soy tu asistente de ELECTRA. ¿En qué te puedo ayudar? ☀️",
        // Chat chips
        chipAvailable: "¿Disponibles?",
        chipRecommend: "Recomiéndame",
        chipHowItWorks: "¿Cómo funciona?",
        chipChargeTime: "⏱️ Tiempo de carga",
        chipCancelReservation: "❌ Cancelar reserva",
        chipSolarEnergy: "📊 Energía solar",
        chipConnectors: "🔌 Conectores",
        chipCost: "💰 ¿Cuánto cuesta?",
        chipSchedule: "🕐 Horario",
        chipLocation: "📍 Ubicación",
        chipTotalTime: "🔋 Tiempo total de carga",
        chipSecurity: "🔒 Seguridad",
        chipAdmin: "👨‍💼 Hablar con administrador",
        // QR Scanner overlay
        confirmArrivalTitle: "Confirmar llegada",
        scannerInstructions: "Apunta la cámara al código QR en el punto de carga.",
        startingCamera: "Iniciando cámara...",
        manualCodeLabel: "Código de la bahía (ej: ELECTRA-BAY-A1)",
        confirmArrivalManual: "Confirmar llegada",
        cancel: "Cancelar",
        // Accessibility
        accessibilityTitle: "Opciones de accesibilidad",
        textSize: "Tamaño de texto",
        colorContrast: "Contraste de color",
        voiceAssistant: "Asistente de voz (Lectura en voz alta)",
        enableVoice: "🔊 Activar Voz",
        muteVoice: "🔇 Silenciar",
        screenReader: "Lector de pantalla manual",
        readScreen: "Leer pantalla actual (Audio)",
        normalMode: "Normal",
        highContrastDark: "Alto Contraste (Oscuro)",
        highContrastLight: "Alto Contraste (Claro)",
        // Bay status labels (used in JS)
        statusAvailable: "Disponible",
        statusOccupied: "Ocupada",
        statusReserved: "Reservada",
        statusOffline: "Fuera de servicio",
        // Password strength
        pwWeak: "Débil",
        pwMedium: "Media",
        pwStrong: "Fuerte",
        pwMinLength: "⚠️ Mínimo 8 caracteres. ",
        pwNeedSpecial: "⚠️ Falta un carácter especial. ",
        pwValid: "✅ Contraseña válida — ",
        // Error messages (used in JS)
        passwordsNoMatch: "Las contraseñas no coinciden",
        passwordMinLength: "La contraseña debe tener mínimo 8 caracteres",
        passwordNeedSpecial: "La contraseña debe incluir al menos un carácter especial (!@#$%^&*...)",
        selectTimes: "Por favor selecciona la hora de llegada y de salida.",
        operatingHours: "Solo operamos entre las 05:00 y las 22:00.",
        departureAfterArrival: "La hora de salida debe ser mayor a la hora de llegada.",
        reservationConfirmedMsg: "Reserva confirmada con éxito",
        reservationCancelledMsg: "Reserva cancelada",
        // Bay card
        bayLabel: "Puerto",
        universalConnector: "Universal",
        // Theme
        themeLight: "Modo claro",
        themeDark: "Modo oscuro",
        bayNotAvailable: "La bahía {bay} no está disponible actualmente.",
        // Scanner dynamic texts
        scanToBook: "Escanear para reservar",
        scanToBookInstructions: "Apunta al código QR de la bahía física que deseas usar para reservarla de inmediato.",
        scanToCheckinInstructions: "Apunta la cámara al código QR en el punto de carga para iniciar la carga.",
        findBayBtn: "Buscar bahía",
        scannerPointQR: "Apunta al QR del punto de carga",
        cameraError: "No se pudo acceder a la cámara. Ingresa el código manualmente:",
        enterCodeError: "Ingresa el código del QR",
        student: "Estudiante"
    },
    en: {
        // Auth
        loginSubtitle: "User access portal",
        loginSubtitleAdmin: "Secure access portal for administrators",
        email: "Email address",
        password: "Password",
        login: "Log in",
        createAccount: "Create an account",
        register: "Sign up",
        forgotPassword: "Forgot your password?",
        alreadyHaveAccount: "I already have an account",
        roleUser: "User",
        roleAdmin: "Administrator",
        // Register form
        firstName: "First name",
        lastName: "Last name",
        confirmPassword: "Confirm password",
        mainVehicle: "Main vehicle",
        vehicleScooter: "🛴 Electric Scooter",
        vehicleBike: "🚲 Electric Bicycle",
        passwordHint: "Minimum 8 characters with at least one special character (!@#$%&*)",
        // Home section
        greeting: "Hello, Anderson 👋, Anderson 👋",
        heroEnergy: "Your energy, always in motion.",
        heroSubtitle: "Find a station, reserve your bay and continue your journey.",
        greetingSubtitle: "What do you want to do?",
        findBay: "Find a station →",
        solarEnergy: "SOLAR ENERGY",
        generatedToday: "Energy generated today",
        chargingBays: "Charging bays",
        realTime: "Real-time availability",
        available: "🟢 Available",
        occupied: "🔴 Occupied",
        reserved: "🟡 Reserved",
        offline: "⚪ Out of service",
        // Reservation
        makeReservation: "Reserve bay",
        backHome: "← Back",
        vehicleQuestion: "Which vehicle are you going to charge?",
        arrival: "Arrival time (05:00 - 22:00)",
        departure: "Departure time (until 22:00)",
        confirmReservationBtn: "Confirm reservation",
        bay: "Bay",
        vehicle: "Vehicle",
        duration: "Duration",
        // QR
        myQR: "My QR",
        noReservation: "You have no reservation",
        noReservationDesc: "Reserve an available bay to get your QR code.",
        viewMap: "View Map",
        scanAtStation: "📷 Scan at station",
        reservationConfirmed: "Reservation confirmed ✓",
        cancelReservation: "Cancel reservation",
        confirmArrival: "📷 Confirm my arrival",
        confirmArrivalHint: "Scan the QR at the charging point when you arrive",
        charging: "⚡ Charging",
        // Location
        location: "Location",
        walkingTime: "🚶‍♂️ 3 minutes walking",
        // Navigation
        home: "Home",
        chat: "Chat",
        // Chat / AI
        assistantTitle: "Assistant ☀️",
        assistantSubtitle: "Responds in real time",
        clearChat: "🗑️ Clear",
        chatPlaceholder: "Type a message...",
        chatWelcome: "Hi! I'm your ELECTRA assistant. How can I help you? ☀️",
        // Chat chips
        chipAvailable: "Available?",
        chipRecommend: "Recommend me",
        chipHowItWorks: "How does it work?",
        chipChargeTime: "⏱️ Charge time",
        chipCancelReservation: "❌ Cancel reservation",
        chipSolarEnergy: "📊 Solar energy",
        chipConnectors: "🔌 Connectors",
        chipCost: "💰 How much does it cost?",
        chipSchedule: "🕐 Schedule",
        chipLocation: "📍 Location",
        chipTotalTime: "🔋 Total charge time",
        chipSecurity: "🔒 Security",
        chipAdmin: "👨‍💼 Talk to administrator",
        // QR Scanner overlay
        confirmArrivalTitle: "Confirm arrival",
        scannerInstructions: "Point the camera at the QR code at the charging point.",
        startingCamera: "Starting camera...",
        manualCodeLabel: "Bay code (e.g.: ELECTRA-BAY-A1)",
        confirmArrivalManual: "Confirm arrival",
        cancel: "Cancel",
        // Accessibility
        accessibilityTitle: "Accessibility options",
        textSize: "Text size",
        colorContrast: "Color contrast",
        voiceAssistant: "Voice assistant (Read aloud)",
        enableVoice: "🔊 Enable Voice",
        muteVoice: "🔇 Mute",
        screenReader: "Manual screen reader",
        readScreen: "Read current screen (Audio)",
        normalMode: "Normal",
        highContrastDark: "High Contrast (Dark)",
        highContrastLight: "High Contrast (Light)",
        // Bay status labels (used in JS)
        statusAvailable: "Available",
        statusOccupied: "Occupied",
        statusReserved: "Reserved",
        statusOffline: "Out of service",
        // Password strength
        pwWeak: "Weak",
        pwMedium: "Medium",
        pwStrong: "Strong",
        pwMinLength: "⚠️ Minimum 8 characters. ",
        pwNeedSpecial: "⚠️ Missing a special character. ",
        pwValid: "✅ Valid password — ",
        // Error messages (used in JS)
        passwordsNoMatch: "Passwords do not match",
        passwordMinLength: "Password must be at least 8 characters",
        passwordNeedSpecial: "Password must include at least one special character (!@#$%^&*...)",
        selectTimes: "Please select an arrival and departure time.",
        operatingHours: "We only operate between 05:00 and 22:00.",
        departureAfterArrival: "Departure time must be after arrival time.",
        reservationConfirmedMsg: "Reservation confirmed successfully",
        reservationCancelledMsg: "Reservation cancelled",
        // Bay card
        bayLabel: "Bay",
        universalConnector: "Universal",
        // Theme
        themeLight: "Light mode",
        themeDark: "Dark mode",
        bayNotAvailable: "Bay {bay} is not currently available.",
        // Scanner dynamic texts
        scanToBook: "Scan to reserve",
        scanToBookInstructions: "Point at the QR code of the physical bay you want to use to reserve it immediately.",
        scanToCheckinInstructions: "Point the camera at the QR code at the charging point to start charging.",
        findBayBtn: "Find bay",
        scannerPointQR: "Point at the QR at the charging point",
        cameraError: "Could not access the camera. Enter the code manually:",
        enterCodeError: "Enter the QR code",
        student: "Student"
    }
};

let currentLanguage = localStorage.getItem("ELECTRA_language") || "es";

/** Returns a translated string for the current language. Falls back to Spanish. */
function t(key) {
    return (translations[currentLanguage] && translations[currentLanguage][key])
        || (translations["es"] && translations["es"][key])
        || key;
}

function translatePage() {
    // Translate textContent
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        const value = t(key);
        if (value) element.innerHTML = value;
    });

    // Translate placeholder attributes
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.dataset.i18nPlaceholder;
        const value = t(key);
        if (value) element.placeholder = value;
    });

    document.documentElement.lang = currentLanguage;

    const langBtn = document.getElementById("languageButton");
    if (langBtn) langBtn.textContent = currentLanguage.toUpperCase();
}

function toggleLanguage() {
    currentLanguage = currentLanguage === "es" ? "en" : "es";
    localStorage.setItem("ELECTRA_language", currentLanguage);
    translatePage();
    // Notify app.js so dynamic/JS-rendered content also updates
    document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: currentLanguage } }));
}