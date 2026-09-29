// ============================================
// RideNow — Asistente (chat con historial + soporte en vivo)
// ============================================

let chatHistory = [];
let isTyping = false;
let supportMode = false;      // When true, messages go to admin via Socket.IO
let supportRoomId = null;

// ─── Support Mode ─────────────────────────────────────────

function activateSupportMode() {
    const user = getUser();
    if (!user) return;

    supportMode = true;
    supportRoomId = `support_${user.id}`;

    // Show visual indicator
    const header = document.querySelector(".chat-header p");
    if (header) {
        header.textContent = "🔴 EN VIVO — Esperando administrador...";
        header.style.color = "#dc2626";
    }

    // Hide chips and show disconnect option
    const chips = document.querySelector(".chat-chips");
    if (chips) {
        chips.innerHTML = `<button class="chip" style="background:#fee2e2; color:#dc2626; border-color:#dc2626" onclick="deactivateSupportMode()">✕ Salir del soporte</button>`;
    }

    // Request connection via socket
    socket.emit("support:request", {
        userId: user.id,
        userName: user.name
    });

    socket.on("support:connected", (data) => {
        addAIMessage(data.message || "Conectando con soporte...", "bot");
    });

    socket.on("support:admin_joined", (data) => {
        addAIMessage("👨‍💼 " + (data.message || "El administrador se unió al chat."), "bot");
        const header = document.querySelector(".chat-header p");
        if (header) {
            header.textContent = "🟢 Administrador conectado";
            header.style.color = "#16a34a";
        }
    });

    socket.on("support:message", (msg) => {
        if (msg.sender === "admin") {
            addAIMessage(`${msg.text}`, "bot");
        }
    });

    socket.on("support:closed", (data) => {
        addAIMessage(data.message || "El administrador cerró la sesión.", "bot");
        deactivateSupportMode();
    });
}

function deactivateSupportMode() {
    supportMode = false;
    supportRoomId = null;

    // Restore header
    const header = document.querySelector(".chat-header p");
    if (header) {
        header.textContent = "Responde en tiempo real";
        header.style.color = "";
    }

    // Restore chips
    const chips = document.querySelector(".chat-chips");
    if (chips) {
        chips.innerHTML = `
            <button class="chip" onclick="sendChip('¿Qué bahías están disponibles ahora?')">¿Disponibles?</button>
            <button class="chip" onclick="sendChip('Recomiéndame una bahía para mi vehículo')">Recomiéndame</button>
            <button class="chip" onclick="sendChip('¿Cómo funciona el sistema de carga?')">¿Cómo funciona?</button>
            <button class="chip" onclick="sendChip('¿Cuánto tiempo puedo cargar?')">⏱️ Tiempo de carga</button>
            <button class="chip" onclick="sendChip('¿Cómo cancelo mi reserva?')">❌ Cancelar reserva</button>
            <button class="chip" onclick="sendChip('¿Cuánta energía solar genera la estación?')">📊 Energía solar</button>
            <button class="chip" onclick="sendChip('¿Qué tipo de conectores tienen las bahías?')">🔌 Conectores</button>
            <button class="chip" onclick="sendChip('¿Cuánto cuesta cargar mi vehículo?')">💰 ¿Cuánto cuesta?</button>
            <button class="chip" onclick="sendChip('¿Cuál es el horario de la estación?')">🕐 Horario</button>
            <button class="chip" onclick="sendChip('¿Dónde queda la estación de carga?')">📍 Ubicación</button>
            <button class="chip" onclick="sendChip('¿Cuánto tarda en cargar completamente mi vehículo?')">🔋 Tiempo total de carga</button>
            <button class="chip" onclick="sendChip('¿Es seguro dejar mi vehículo cargando?')">🔒 Seguridad</button>
            <button class="chip support-chip" onclick="requestAdminSupport()">👨‍💼 Hablar con administrador</button>
        `;
    }
}

function requestAdminSupport() {
    addAIMessage("Solicitud enviada. Conectando con el administrador...", "bot");
    activateSupportMode();
}


async function askRideBot(message) {
    // If in support mode, relay message to admin via socket
    if (supportMode && supportRoomId) {
        const user = getUser();
        socket.emit("support:message", {
            roomId: supportRoomId,
            text: message,
            sender: "user",
            senderName: user ? user.name : "Usuario"
        });
        return null; // app.js won't show any AI response; admin responds live
    }

    const token = getToken();
    chatHistory.push({ role: "user", content: message });

    const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            messages: chatHistory,
            language: typeof currentLanguage !== "undefined" ? currentLanguage : "es"
        })
    });

    const data = await response.json();

    if (!response.ok) {
        chatHistory.pop();
        throw new Error(data.error || "Error consultando al asistente");
    }

    chatHistory.push({ role: "assistant", content: data.answer });
    return data.answer;
}

async function getRecommendation() {
    const token = getToken();
    const user = getUser();

    const response = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            vehicleType: user?.vehicle_type || "Patineta",
            language: typeof currentLanguage !== "undefined" ? currentLanguage : "es"
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error pidiendo recomendación");
    }

    return data;
}

function addAIMessage(text, sender) {
    const container = document.getElementById("aiMessages");
    if (!container) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `ai-message ${sender}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });

    msgDiv.innerHTML = `
        <div class="msg-bubble">${formatAIText(text)}</div>
        <div class="msg-time">${timeStr}</div>
    `;

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById("aiMessages");
    if (!container || isTyping) return;

    isTyping = true;
    const indicator = document.createElement("div");
    indicator.className = "ai-message bot typing-indicator-wrapper";
    indicator.id = "typingIndicator";
    indicator.innerHTML = `
        <div class="msg-bubble typing-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    isTyping = false;
    const indicator = document.getElementById("typingIndicator");
    if (indicator) indicator.remove();
}

function clearChatHistory() {
    chatHistory = [];
    const container = document.getElementById("aiMessages");
    if (!container) return;

    container.innerHTML = `
        <div class="ai-message bot">
            <div class="msg-bubble">¡Hola! Soy tu asistente de RideNow. ¿En qué te puedo ayudar? ☀️</div>
        </div>
    `;
}

// Format text: convert markdown-like ** to bold, newlines to <br>
function formatAIText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br>");
}
