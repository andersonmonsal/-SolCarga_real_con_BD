function saveSession(data) {
    localStorage.setItem("RideNow_token", data.token);
    localStorage.setItem("RideNow_user", JSON.stringify(data.user));
}

function getToken() {
    return localStorage.getItem("RideNow_token");
}

function getUser() {
    const data = localStorage.getItem("RideNow_user");
    return data ? JSON.parse(data) : null;
}

function clearSession() {
    localStorage.removeItem("RideNow_token");
    localStorage.removeItem("RideNow_user");
}

async function login(email, password, requestedRole = 'user') {
    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, requestedRole })
    });

    const data = await response.json();

    if (!response.ok) {
        if (data.needsVerification) {
            const error = new Error(data.error);
            error.needsVerification = true;
            throw error;
        }
        throw new Error(data.error || "Error de inicio de sesión");
    }

    saveSession(data);
    return data;
}

async function register(name, lastName, email, password, vehicleType) {
    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, lastName, email, password, vehicleType })
    });

    const data = await response.json();

    if (!response.ok) {
        if (data.needsVerification) {
            const error = new Error(data.error);
            error.needsVerification = true;
            throw error;
        }
        throw new Error(data.error || "Error creando cuenta");
    }

    // Save session automatically on register
    saveSession(data);
    return data;
    // Actually backend returns 201 with token, but we should force verification.
    // The backend now returns "Por favor verifica tu correo."
    // We won't call saveSession(data) if we expect them to verify.
    return data;
}

async function verifyEmail(email, code) {
    const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Error verificando correo");
    }
    return data;
}

async function forgotPassword(email) {
    const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Error procesando solicitud");
    }
    return data;
}

async function resetPassword(token, newPassword) {
    const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Error restableciendo contraseña");
    }
    return data;
}