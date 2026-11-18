/* ==========================================================================
   ELECTRA — DICCIONARIO COMPLETO DE INTERNACIONALIZACIÓN (ES / EN)
   Cubre absolutamente toda la aplicación: Auth, Home, Bahías, Reserva,
   QR, Mapa, Clima, Asistente AI, Accesibilidad, Modales, Perfil y Admin.
   ========================================================================== */

const translations = {
    es: {
        // Branding & Navegación
        brandName: "ELECTRA",
        brandSubtitle: "Movilidad eléctrica inteligente",
        skipLink: "Saltar al contenido principal",
        campusName: "Campus Universidad de Medellín",
        greeting: "Hola",
        welcomePill: "⚡ Estación Solar • Campus UdeM",
        welcomeDesc: "Carga tu patineta o bicicleta eléctrica con energía 100% solar. Consulta la disponibilidad en tiempo real o reserva tu turno antes de llegar al campus.",
        seeBays: "Ver bahías disponibles",
        seeMap: "Ver mapa de llegada",
        home: "Inicio",
        baysTitle: "Bahías",
        myQR: "Mi Reserva",
        location: "Ubicación",
        chat: "Chat",
        help: "Ayuda",
        backHome: "← Volver",
        cancel: "Cancelar",
        close: "Cerrar",

        // Autenticación
        login: "Iniciar sesión",
        createAccount: "Crear cuenta",
        loginSubtitle: "Portal de acceso para usuarios",
        loginSubtitleAdmin: "Portal de acceso seguro para administradores",
        email: "Correo electrónico",
        password: "Contraseña",
        forgotPassword: "¿Olvidaste tu contraseña?",
        alreadyHaveAccount: "Ya tengo una cuenta",
        roleUser: "Usuario",
        roleAdmin: "Administrador",
        firstName: "Nombre",
        lastName: "Apellido",
        confirmPassword: "Confirmar contraseña",
        mainVehicle: "Vehículo principal",
        vehicleScooter: "🛴 Patineta Eléctrica",
        vehicleBike: "🚲 Bicicleta Eléctrica",
        passwordHint: "Mínimo 8 caracteres con al menos un carácter especial (!@#$%&*)",
        register: "Crear cuenta",
        verifyEmailNotice: "Hemos enviado un código a tu correo. Por favor, ingrésalo para verificar tu cuenta.",
        verificationCode: "Código de verificación",
        verifyBtn: "Verificar correo",
        backToLogin: "Volver al inicio de sesión",
        forgotNotice: "Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.",
        sendCodeBtn: "Enviar código",
        resetNotice: "Ingresa el código que recibiste y tu nueva contraseña.",
        recoveryCode: "Código de recuperación",
        newPassword: "Nueva contraseña",
        resetPasswordBtn: "Restablecer contraseña",

        // Validación de contraseñas
        pwWeak: "Débil",
        pwMedium: "Media",
        pwStrong: "Fuerte",
        pwMinLength: "⚠️ Mínimo 8 caracteres. ",
        pwNeedSpecial: "⚠️ Falta un carácter especial. ",
        pwValid: "✅ Contraseña válida — ",
        passwordsNoMatch: "Las contraseñas no coinciden",
        passwordMinLength: "La contraseña debe tener mínimo 8 caracteres",
        passwordNeedSpecial: "La contraseña debe incluir al menos un carácter especial (!@#$%^&*...)",

        // Clima y Estimaciones
        weatherConsulting: "Consultando estación...",
        normalCondition: "Condición habitual",
        warmCondition: "Clima favorable",
        hotCondition: "Día caluroso",
        coolCondition: "Ambiente fresco",
        chargeEstimateTitle: "Tiempo estimado para recarga",
        humidity: "Humedad",
        wind: "Viento",
        solarGeneration: "Generación solar",
        solarActive: "Activa (100%)",
        solarOptimal: "Óptima ☀️",
        solarMedium: "Media ⛅",
        solarLow: "Baja 🌧️",
        solarNight: "Nocturna (Red)",
        condSunny: "Soleado y despejado",
        condSunnyNight: "Noche despejada",
        condPartlyCloudy: "Parcialmente nublado",
        condFog: "Neblina suave",
        condLightRain: "Lluvia ligera",
        condModerateRain: "Lluvia moderada",
        condStorm: "Tormenta eléctrica",

        // Bahías y Reserva
        chargingBays: "Bahías de carga",
        realTime: "Disponibilidad y reserva en tiempo real",
        available: "🟢 Disponible",
        occupied: "🔴 Ocupada",
        reserved: "🟡 Reservada",
        offline: "⚪ Fuera de servicio",
        statusAvailable: "Disponible",
        statusOccupied: "Ocupada",
        statusReserved: "Reservada",
        statusOffline: "Fuera de servicio",
        makeReservation: "Reservar puerto",
        currentDateTime: "Hora y fecha actual:",
        vehicleQuestion: "¿Qué vehículo vas a cargar?",
        reservationDate: "📅 Fecha de reserva",
        arrival: "Hora de llegada (05:00 - 22:00)",
        departure: "Hora de salida (hasta las 22:00)",
        confirmReservationBtn: "Confirmar reserva",
        bay: "Bahía",
        vehicle: "Vehículo",
        duration: "Duración",
        noReservation: "No tienes una reserva activa en este momento.",

        // Ubicación
        mapInApp: "Mapa en la app",
        stationHoursDesc: "Lunes a Viernes: 6:00 AM - 10:00 PM | Sábados: 8:00 AM - 6:00 PM",
        walkingTime: "3 minutos caminando",

        // Asistente AI
        assistantTitle: "Asistente ☀️",
        assistantSubtitle: "Responde en tiempo real",
        clearChat: "🗑️ Limpiar",
        chatWelcome: "¡Hola! Soy tu asistente de ELECTRA. ¿En qué te puedo ayudar? ☀️",
        chatPlaceholder: "Escribe un mensaje...",
        chipAvailable: "⚡ ¿Disponibles?",
        chipMyRes: "📋 Mi reserva",
        chipRecommend: "🎯 Recomiéndame",
        chipHowItWorks: "🚀 ¿Cómo funciona?",
        chipChargeTime: "⏱️ Tiempo de carga",
        chipCancelReservation: "❌ Cancelar reserva",
        chipSolarEnergy: "☀️ Energía solar",
        chipConnectors: "🔌 Conectores",
        chipCost: "💰 ¿Cuánto cuesta?",
        chipSchedule: "🕐 Horario",
        chipLocation: "📍 Ubicación",
        chipTotalTime: "🔋 Tiempo total de carga",
        chipSecurity: "🔒 Seguridad",
        chipAdmin: "👨‍💼 Hablar con admin",

        // Modales de Reserva y Cancelación
        modalResSuccessTitle: "¡Reserva confirmada! 🎉",
        modalResSuccessDesc: "Tu bahía ha sido reservada exitosamente.",
        modalViewQR: "Ver mi QR ▸",
        reservationCodeLabel: "Código de reserva",
        modalCancelTitle: "¿Cancelar reserva?",
        modalCancelDesc: "Esta acción liberará tu bahía y no se puede deshacer.",
        modalCancelConfirm: "Sí, cancelar",
        modalCancelBack: "Volver",

        // Modal de Salida Anticipada
        exitEarlyModalTitle: "Finalizar Carga y Salir",
        exitEarlySubtitle: "Desconexión anticipada",
        exitEarlyNotice: "Por favor selecciona el motivo de tu salida anticipada para liberar la bahía.",
        exitReasonLabel: "Motivo de salida",
        reasonBatteryFull: "Carga de batería suficiente",
        reasonUrgency: "Retiro de emergencia / Prisa",
        reasonTechIssue: "Falla técnica en puerto o cargador",
        reasonVehicleIssue: "Inconveniente con el vehículo",
        reasonOther: "Otro motivo",
        exitDetailsPlaceholder: "Detalles de la sesión...",
        exitScanBtn: "📷 Escanear QR de bahía para salir",
        exitConfirmBtn: "Confirmar salida y liberar bahía",
        exitContinueBtn: "Continuar cargando",

        // Accesibilidad
        accessibilityTitle: "Opciones de accesibilidad",
        textSize: "Tamaño de texto",
        colorContrast: "Contraste de color",
        normalMode: "Normal",
        highContrastDark: "Alto Contraste (Oscuro)",
        highContrastLight: "Alto Contraste (Claro)",
        voiceAssistant: "Asistente de voz (Lectura en voz alta)",
        enableVoice: "🔊 Activar Voz",
        muteVoice: "🔇 Silenciar",
        screenReader: "Lector de pantalla manual",
        readScreen: "🔊 Leer pantalla actual (Audio)",
        readingScreenNow: "⏹️ Detener lectura en voz alta",
        contrastUpdated: "Modo de contraste actualizado",
        textIncreased: "Tamaño de texto aumentado",
        textDecreased: "Tamaño de texto reducido",
        textReset: "Tamaño normal restaurado",
        voiceEnabledMsg: "Asistente de voz activado",

        // Escáner de Llegada
        confirmArrivalTitle: "Confirmar llegada",
        scannerInstructions: "Apunta la cámara al código QR en el punto de carga.",
        startingCamera: "Iniciando cámara...",
        manualCodeLabel: "Código de la bahía (ej: ELECTRA-BAY-A1)",
        confirmArrivalManual: "Confirmar llegada",

        // Perfil
        profileTitle: "Mi Perfil",
        profileLevel1: "Nivel 1 • Inicial",
        profileLevel2: "Nivel 2 • Usuario Activo",
        profileLevel3: "Nivel 3 • Cargador Frecuente",
        profileLevel4: "Nivel 4 • Eco Champion",
        profileLevel5: "Nivel 5 • Leyenda Solar",
        profileMaxLevel: "Nivel Máximo",
        profileNextLevel: "para",
        profilePts: "pts",
        profileTotalCharges: "Cargas totales",
        profileSolarEnergy: "Energía solar",
        profileCo2Saved: "CO₂ evitado",
        profileRulesTitle: "Reglas de la estación",
        profileRule1: "Máximo 4 horas continuas de carga para asegurar rotación justa.",
        profileRule2: "Usa cargadores originales y compatibles con tomas 110V/220V.",
        profileRule3: "Libera la bahía escaneando el código al terminar tu sesión.",
        profileAccountInfo: "Información de la cuenta",
        profileEmailLabel: "Correo electrónico",
        profileVehicleLabel: "Vehículo principal",
        profileMemberSince: "Miembro desde",
        profileRoleLabel: "Rol en plataforma",
        profileRoleAdmin: "Administrador",
        profileRoleUser: "Usuario",
        profileLogoutBtn: "Cerrar sesión",
        profileDeleteBtn: "Eliminar mi cuenta",
        profileVersion: "ELECTRA • Movilidad Eléctrica Inteligente v1.2",
        profileConfirmDeleteTitle: "¿Eliminar cuenta?",
        profileConfirmDeleteDesc: "Esta acción borrará permanentemente tu usuario, reservas e historial. No se puede revertir.",
        profileConfirmCancel: "Cancelar",
        profileConfirmDelete: "Sí, eliminar cuenta",

        // Admin
        adminPanelTitle: "ELECTRA — Panel Admin",
        adminLogout: "Cerrar sesión 🚪",
        adminDeleteAccount: "Eliminar cuenta 🗑️",
        adminReservationsTab: "🗓️ Reservas activas",
        adminReservationsSub: "Puedes ver quién tiene una reserva y cancelarla para liberar la bahía inmediatamente.",
        adminBaysTab: "⚡ Estado de bahías",
        adminUsersTab: "👥 Usuarios registrados",
        adminSupportTab: "💬 Soporte en vivo",
        supportRequestsTitle: "Solicitudes",
        adminQRTab: "🔲 QR de Puertos",
        adminPrintAllQR: "🖨️ Imprimir todos",
        adminRefreshBtn: "↺ Actualizar",
        adminDevTab: "🛠️ Opciones de desarrollador",
        adminNoReservations: "No hay reservas activas en este momento.",
        adminCancelBookingBtn: "Quitar reserva",
        adminUsersRegistered: "Usuarios registrados en la plataforma"
    },
    en: {
        // Branding & Navigation
        brandName: "ELECTRA",
        brandSubtitle: "Smart electric mobility",
        skipLink: "Skip to main content",
        campusName: "Universidad de Medellín Campus",
        greeting: "Hello",
        welcomePill: "⚡ Solar Station • UdeM Campus",
        welcomeDesc: "Charge your electric scooter or bicycle with 100% solar energy. Check real-time availability or reserve your spot before arriving.",
        seeBays: "View available bays",
        seeMap: "View arrival map",
        home: "Home",
        baysTitle: "Bays",
        myQR: "My Booking",
        location: "Location",
        chat: "Chat",
        help: "Help",
        backHome: "← Back",
        cancel: "Cancel",
        close: "Close",

        // Authentication
        login: "Log in",
        createAccount: "Create account",
        loginSubtitle: "User access portal",
        loginSubtitleAdmin: "Secure access portal for administrators",
        email: "Email address",
        password: "Password",
        forgotPassword: "Forgot your password?",
        alreadyHaveAccount: "I already have an account",
        roleUser: "User",
        roleAdmin: "Administrator",
        firstName: "First name",
        lastName: "Last name",
        confirmPassword: "Confirm password",
        mainVehicle: "Primary vehicle",
        vehicleScooter: "🛴 Electric Scooter",
        vehicleBike: "🚲 Electric Bike",
        passwordHint: "Minimum 8 characters with at least one special character (!@#$%&*)",
        register: "Create account",
        verifyEmailNotice: "We sent a verification code to your email. Please enter it below.",
        verificationCode: "Verification code",
        verifyBtn: "Verify email",
        backToLogin: "Back to login",
        forgotNotice: "Enter your email and we'll send a recovery code.",
        sendCodeBtn: "Send recovery code",
        resetNotice: "Enter the code you received and your new password.",
        recoveryCode: "Recovery code",
        newPassword: "New password",
        resetPasswordBtn: "Reset password",

        // Password validation
        pwWeak: "Weak",
        pwMedium: "Medium",
        pwStrong: "Strong",
        pwMinLength: "⚠️ At least 8 characters. ",
        pwNeedSpecial: "⚠️ Special character required. ",
        pwValid: "✅ Valid password — ",
        passwordsNoMatch: "Passwords do not match",
        passwordMinLength: "Password must be at least 8 characters",
        passwordNeedSpecial: "Password must include at least one special character (!@#$%^&*...)",

        // Weather & Estimates
        weatherConsulting: "Checking station...",
        normalCondition: "Normal conditions",
        warmCondition: "Favorable weather",
        hotCondition: "Warm day",
        coolCondition: "Cool day",
        chargeEstimateTitle: "Estimated charging time",
        humidity: "Humidity",
        wind: "Wind",
        solarGeneration: "Solar generation",
        solarActive: "Active (100%)",
        solarOptimal: "Optimal ☀️",
        solarMedium: "Moderate ⛅",
        solarLow: "Low 🌧️",
        solarNight: "Night (Grid)",
        condSunny: "Sunny and clear",
        condSunnyNight: "Clear night",
        condPartlyCloudy: "Partly cloudy",
        condFog: "Gentle mist",
        condLightRain: "Light rain",
        condModerateRain: "Moderate rain",
        condStorm: "Thunderstorm",

        // Bays & Booking
        chargingBays: "Charging bays",
        realTime: "Real-time availability and booking",
        available: "🟢 Available",
        occupied: "🔴 Occupied",
        reserved: "🟡 Reserved",
        offline: "⚪ Out of service",
        statusAvailable: "Available",
        statusOccupied: "Occupied",
        statusReserved: "Reserved",
        statusOffline: "Out of service",
        makeReservation: "Reserve a bay",
        currentDateTime: "Current date and time:",
        vehicleQuestion: "Which vehicle are you charging?",
        reservationDate: "📅 Reservation date",
        arrival: "Arrival time (05:00 - 22:00)",
        departure: "Departure time (until 22:00)",
        confirmReservationBtn: "Confirm reservation",
        bay: "Bay",
        vehicle: "Vehicle",
        duration: "Duration",
        noReservation: "You have no active reservation at this moment.",

        // Location
        mapInApp: "Map in app",
        stationHoursDesc: "Monday to Friday: 6:00 AM - 10:00 PM | Saturdays: 8:00 AM - 6:00 PM",
        walkingTime: "3 minutes walking",

        // AI Assistant
        assistantTitle: "Assistant ☀️",
        assistantSubtitle: "Responds in real time",
        clearChat: "🗑️ Clear",
        chatWelcome: "Hello! I am your ELECTRA assistant. How can I help you today? ☀️",
        chatPlaceholder: "Type a message...",
        chipAvailable: "⚡ Available bays?",
        chipMyRes: "📋 My reservation",
        chipRecommend: "🎯 Recommend a bay",
        chipHowItWorks: "🚀 How it works",
        chipChargeTime: "⏱️ Charging time",
        chipCancelReservation: "❌ Cancel booking",
        chipSolarEnergy: "☀️ Solar energy",
        chipConnectors: "🔌 Connectors",
        chipCost: "💰 Pricing",
        chipSchedule: "🕐 Hours",
        chipLocation: "📍 Location",
        chipTotalTime: "🔋 Full charge time",
        chipSecurity: "🔒 Security",
        chipAdmin: "👨‍💼 Contact admin",

        // Booking & Cancel Modals
        modalResSuccessTitle: "Reservation Confirmed! 🎉",
        modalResSuccessDesc: "Your charging bay has been reserved successfully.",
        modalViewQR: "View my QR ▸",
        reservationCodeLabel: "Booking code",
        modalCancelTitle: "Cancel reservation?",
        modalCancelDesc: "This will release your bay and cannot be undone.",
        modalCancelConfirm: "Yes, cancel",
        modalCancelBack: "Go back",

        // Early Exit Modal
        exitEarlyModalTitle: "End Charge & Exit",
        exitEarlySubtitle: "Early disconnection",
        exitEarlyNotice: "Please select the reason for early departure to release the bay.",
        exitReasonLabel: "Exit reason",
        reasonBatteryFull: "Battery sufficiently charged",
        reasonUrgency: "Emergency / In a rush",
        reasonTechIssue: "Technical issue with bay or charger",
        reasonVehicleIssue: "Vehicle issue",
        reasonOther: "Other reason",
        exitDetailsPlaceholder: "Session details...",
        exitScanBtn: "📷 Scan bay QR code to exit",
        exitConfirmBtn: "Confirm exit & release bay",
        exitContinueBtn: "Continue charging",

        // Accessibility
        accessibilityTitle: "Accessibility Options",
        textSize: "Text Size",
        colorContrast: "Color Contrast",
        normalMode: "Normal",
        highContrastDark: "High Contrast (Dark)",
        highContrastLight: "High Contrast (Light)",
        voiceAssistant: "Voice Assistant (Audio reading)",
        enableVoice: "🔊 Enable Voice",
        muteVoice: "🔇 Mute",
        screenReader: "Manual Screen Reader",
        readScreen: "🔊 Read Current Screen (Audio)",
        readingScreenNow: "⏹️ Stop screen reading",
        contrastUpdated: "Contrast mode updated",
        textIncreased: "Text size increased",
        textDecreased: "Text size decreased",
        textReset: "Default text size restored",
        voiceEnabledMsg: "Voice assistant enabled",

        // Check-in Scanner
        confirmArrivalTitle: "Confirm arrival",
        scannerInstructions: "Point your camera at the QR code on the charging bay.",
        startingCamera: "Starting camera...",
        manualCodeLabel: "Bay code (e.g., ELECTRA-BAY-A1)",
        confirmArrivalManual: "Confirm arrival",

        // Profile
        profileTitle: "My Profile",
        profileLevel1: "Level 1 • Starter",
        profileLevel2: "Level 2 • Active Rider",
        profileLevel3: "Level 3 • Frequent Charger",
        profileLevel4: "Level 4 • Eco Champion",
        profileLevel5: "Level 5 • Solar Legend",
        profileMaxLevel: "Max Level",
        profileNextLevel: "to reach",
        profilePts: "pts",
        profileTotalCharges: "Total charges",
        profileSolarEnergy: "Solar energy",
        profileCo2Saved: "CO₂ saved",
        profileRulesTitle: "Station Rules",
        profileRule1: "Maximum 4 continuous hours of charge to ensure fair access.",
        profileRule2: "Use original chargers compatible with 110V/220V outlets.",
        profileRule3: "Release your bay by scanning the code when you finish.",
        profileAccountInfo: "Account Information",
        profileEmailLabel: "Email address",
        profileVehicleLabel: "Primary vehicle",
        profileMemberSince: "Member since",
        profileRoleLabel: "Role",
        profileRoleAdmin: "Administrator",
        profileRoleUser: "User",
        profileLogoutBtn: "Log out",
        profileDeleteBtn: "Delete my account",
        profileVersion: "ELECTRA • Smart Electric Mobility v1.2",
        profileConfirmDeleteTitle: "Delete account?",
        profileConfirmDeleteDesc: "This will permanently delete your user profile, reservations, and history. This cannot be undone.",
        profileConfirmCancel: "Cancel",
        profileConfirmDelete: "Yes, delete account",

        // Admin
        adminPanelTitle: "ELECTRA — Admin Panel",
        adminLogout: "Log out 🚪",
        adminDeleteAccount: "Delete account 🗑️",
        adminReservationsTab: "🗓️ Active Bookings",
        adminReservationsSub: "Monitor who holds a booking and release it if unattended.",
        adminBaysTab: "⚡ Bay Statuses",
        adminUsersTab: "👥 Registered Users",
        adminSupportTab: "💬 Live Support",
        supportRequestsTitle: "Requests",
        adminQRTab: "🔲 Port QR Codes",
        adminPrintAllQR: "🖨️ Print all",
        adminRefreshBtn: "↺ Refresh",
        adminDevTab: "🛠️ Developer Controls",
        adminNoReservations: "No active reservations at this time.",
        adminCancelBookingBtn: "Cancel booking",
        adminUsersRegistered: "Registered users on the platform"
    }
};

let currentLanguage = localStorage.getItem("ELECTRA_language") || "es";

function t(key) {
    return (translations[currentLanguage] && translations[currentLanguage][key])
        || (translations["es"] && translations["es"][key])
        || key;
}

function translatePage() {
    // 1. Textos con data-i18n
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        const value = t(key);
        if (value) element.innerHTML = value;
    });

    // 2. Placeholders con data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
        const key = element.dataset.i18nPlaceholder;
        const value = t(key);
        if (value) element.placeholder = value;
    });

    // 3. Options de selects con data-i18n-opt
    document.querySelectorAll("[data-i18n-opt]").forEach(element => {
        const key = element.dataset.i18nOpt;
        const value = t(key);
        if (value) element.textContent = value;
    });

    // 4. Atributo lang del html
    document.documentElement.lang = currentLanguage;

    // 5. Botón de idioma en header
    const langBtn = document.getElementById("languageButton");
    if (langBtn) {
        langBtn.textContent = currentLanguage.toUpperCase();
        langBtn.setAttribute("aria-label", currentLanguage === "es" ? "Cambiar idioma a inglés" : "Switch language to Spanish");
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === "es" ? "en" : "es";
    localStorage.setItem("ELECTRA_language", currentLanguage);
    translatePage();

    // Notificar al resto de módulos (app.js, profile.js, admin.js, etc.)
    document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang: currentLanguage } }));

    // Si la voz está activa, confirmar en el nuevo idioma
    if (typeof speak === "function") {
        speak(currentLanguage === "es" ? "Idioma cambiado a español" : "Language switched to English");
    }
}
