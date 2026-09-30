// ============================================
// RideNow — Panel de Administrador
// ============================================

let adminSocket = null;
let activeSupportRooms = [];
let currentAdminRoom = null;

function initAdminPanel() {
    adminSocket = socket; // reutiliza socket global de app.js

    // Listen for new support requests from users
    adminSocket.on("support:new_request", (data) => {
        showAdminNotification(`💬 ${data.userName} solicita soporte`);
        addSupportRoom(data);
        renderSupportRooms();
    });

    // Listen for messages in the current room
    adminSocket.on("support:message", (msg) => {
        if (msg.sender === "user") {
            appendAdminChatMessage(msg.text, "user", msg.senderName);
        }
    });

    // Listen for room list
    adminSocket.on("support:room_list", (rooms) => {
        activeSupportRooms = rooms;
        renderSupportRooms();
    });

    // Request existing rooms
    adminSocket.emit("support:list");

    // Listen for changes in bays or reservations
    adminSocket.on("bayUpdated", () => {
        loadAdminReservations();
        loadAdminBays();
    });

    // Real-time car spot sensor updates
    adminSocket.on("carSpotUpdated", () => {
        loadAdminCarSpots();
    });

    loadAdminReservations();
    loadAdminBays();
    loadAdminUsers();
    loadAdminQRCodes();
    loadAdminCarSpots();
}

// ─── RESERVATIONS ─────────────────────────────────────────

async function loadAdminReservations() {
    const token = getToken();
    const container = document.getElementById("adminReservationsList");
    if (!container) return;

    container.innerHTML = `<div class="admin-loading">⏳ Cargando reservas...</div>`;

    try {
        const res = await fetch("/api/admin/reservations/all", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
            container.innerHTML = `<div class="admin-error">⚠️ ${data.error}</div>`;
            return;
        }

        if (!data.length) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div style="font-size:48px;margin-bottom:10px">✅</div>
                    <p>No hay reservas activas en este momento.</p>
                </div>`;
            return;
        }

        container.innerHTML = data.map(r => `
            <div class="admin-reservation-card" id="res-card-${r.id}">
                <div class="admin-res-info">
                    <div class="admin-res-badge ${r.status === 'checked_in' ? 'badge-charging' : 'badge-active'}">
                        ${r.status === 'checked_in' ? '⚡ Cargando' : '🟡 Activa'}
                    </div>
                    <div class="admin-res-user">
                        <strong>${r.user_name} ${r.user_last_name || ''}</strong>
                        <span>${r.user_email}</span>
                    </div>
                    <div class="admin-res-details">
                        <span>🏷️ <strong>${r.code}</strong></span>
                        <span>⚡ Bahía <strong>${r.bay}</strong> (${r.vehicle_type})</span>
                        <span>🕒 Llegada: ${r.arrival}</span>
                    </div>
                </div>
                <button class="admin-cancel-btn" onclick="adminCancelReservation(${r.id})" id="cancel-btn-${r.id}">
                    Quitar reserva
                </button>
            </div>
        `).join("");

    } catch (err) {
        container.innerHTML = `<div class="admin-error">Error de conexión: ${err.message}</div>`;
    }
}

async function adminCancelReservation(reservationId) {
    const btn = document.getElementById(`cancel-btn-${reservationId}`);
    if (!btn) return;

    if (!confirm("¿Estás seguro de que quieres cancelar esta reserva?")) return;

    btn.disabled = true;
    btn.textContent = "Cancelando...";

    try {
        const token = getToken();
        const res = await fetch(`/api/admin/reservations/${reservationId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`Error: ${data.error}`);
            btn.disabled = false;
            btn.textContent = "Quitar reserva";
            return;
        }

        // Animate card out
        const card = document.getElementById(`res-card-${reservationId}`);
        if (card) {
            card.style.transition = "opacity 0.4s, transform 0.4s";
            card.style.opacity = "0";
            card.style.transform = "translateX(40px)";
            setTimeout(() => card.remove(), 400);
        }

        showAdminNotification("✅ Reserva cancelada y bahía liberada");

    } catch (err) {
        alert(`Error: ${err.message}`);
        btn.disabled = false;
        btn.textContent = "Quitar reserva";
    }
}

// ─── BAYS ─────────────────────────────────────────────────

async function loadAdminBays() {
    const token = getToken();
    const container = document.getElementById("adminBaysList");
    if (!container) return;

    try {
        const res = await fetch("/api/bays", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();

        const statusEmoji = { available: "🟢", reserved: "🟡", occupied: "🔴", offline: "⚪" };
        const statusLabel = { available: "Libre", reserved: "Reservada", occupied: "Ocupada", offline: "Fuera de servicio" };

        container.innerHTML = data.map(b => `
            <div class="admin-bay-pill ${b.status}">
                ${statusEmoji[b.status] || "⚪"} ${b.code}
                <small>${statusLabel[b.status] || b.status}</small>
            </div>
        `).join("");

    } catch (err) {
        container.innerHTML = "<small style='color:var(--muted)'>Error cargando bahías</small>";
    }
}

// ─── USERS ─────────────────────────────────────────────────

async function loadAdminUsers() {
    const token = getToken();
    const container = document.getElementById("adminUsersList");
    if (!container) return;
    
    container.innerHTML = `<div class="admin-loading">⏳ Cargando usuarios...</div>`;

    try {
        const res = await fetch("/api/auth/users", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (!res.ok) {
            container.innerHTML = `<div class="admin-error">⚠️ ${data.error}</div>`;
            return;
        }

        if (!data.length) {
            container.innerHTML = `<p style="color:var(--muted);">No hay usuarios registrados.</p>`;
            return;
        }

        container.innerHTML = data.map(u => `
            <div style="background:var(--card); padding:15px; border-radius:12px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="font-size:16px;">${u.name} ${u.last_name || ''}</strong>
                    <span style="background: ${u.role === 'admin' ? 'var(--red)' : 'var(--green)'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 8px;">${u.role.toUpperCase()}</span>
                    <div style="color:var(--muted); font-size:14px; margin-top:4px;">✉️ ${u.email}</div>
                    <div style="color:var(--muted); font-size:13px; margin-top:2px;">🚗 ${u.vehicle_type} • 🗓️ ${new Date(u.created_at).toLocaleDateString()}</div>
                </div>
                <button
                    onclick="deleteUserFromAdmin(${u.id}, '${u.name} ${u.last_name || ''}')"
                    style="padding:8px 14px; border-radius:8px; border:1px solid var(--red); background:transparent; color:var(--red); font-size:13px; font-weight:600; cursor:pointer;"
                    title="Eliminar cuenta de ${u.name}"
                >🗑️ Eliminar</button>
            </div>
        `).join("");

    } catch (err) {
        container.innerHTML = "<small style='color:var(--muted)'>Error cargando usuarios</small>";
    }
}

async function deleteUserFromAdmin(userId, userName) {
    if (!confirm(`¿Eliminar la cuenta de "${userName}"? Esta acción no se puede deshacer.`)) return;
    try {
        const res = await fetch(`/api/auth/users/${userId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${getToken()}` }
        });
        if (res.ok) {
            showAdminNotification(`✅ Cuenta de ${userName} eliminada`);
            loadAdminUsers();
        } else {
            const data = await res.json();
            showAdminNotification(`⚠️ ${data.error || "Error eliminando cuenta"}`);
        }
    } catch (err) {
        showAdminNotification("⚠️ Error de conexión");
    }
}

// ─── SUPPORT CHAT ─────────────────────────────────────────

function addSupportRoom(data) {
    const exists = activeSupportRooms.find(r => r.roomId === data.roomId);
    if (!exists) {
        activeSupportRooms.push({
            roomId: data.roomId,
            userName: data.userName,
            userId: data.userId,
            messageCount: 0
        });
    }
}

function renderSupportRooms() {
    const list = document.getElementById("adminSupportRooms");
    if (!list) return;

    if (!activeSupportRooms.length) {
        list.innerHTML = `<div style="color:var(--muted); font-size:13px; padding:10px 0">Sin solicitudes activas</div>`;
        return;
    }

    list.innerHTML = activeSupportRooms.map(room => `
        <button class="support-room-btn ${currentAdminRoom === room.roomId ? 'active' : ''}"
                onclick="adminJoinRoom('${room.roomId}', '${room.userName}')">
            <span style="font-size:18px">💬</span>
            <div>
                <strong>${room.userName}</strong>
                <small>${room.messageCount} mensajes</small>
            </div>
        </button>
    `).join("");
}

function adminJoinRoom(roomId, userName) {
    currentAdminRoom = roomId;

    // Join the socket room
    adminSocket.emit("support:admin_join", { roomId });

    // Update UI
    renderSupportRooms();

    // Show chat pane
    const chatArea = document.getElementById("adminSupportChat");
    if (chatArea) {
        chatArea.classList.remove("hidden");
        document.getElementById("adminChatHeader").textContent = `Chat con ${userName}`;
        document.getElementById("adminChatMessages").innerHTML = `
            <div class="support-msg system">Conectado al chat con <strong>${userName}</strong>. Ya puedes escribir.</div>
        `;
    }
}

function appendAdminChatMessage(text, sender, name) {
    const container = document.getElementById("adminChatMessages");
    if (!container) return;

    const div = document.createElement("div");
    div.className = `support-msg ${sender}`;
    div.innerHTML = `<strong>${name}:</strong> ${text}`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function adminSendMessage() {
    if (!currentAdminRoom) return;

    const input = document.getElementById("adminChatInput");
    const text = input.value.trim();
    if (!text) return;

    adminSocket.emit("support:message", {
        roomId: currentAdminRoom,
        text,
        sender: "admin",
        senderName: "Administrador 👨‍💼"
    });

    appendAdminChatMessage(text, "admin", "Administrador 👨‍💼");
    input.value = "";
}

function adminCloseRoom() {
    if (!currentAdminRoom) return;
    adminSocket.emit("support:close", { roomId: currentAdminRoom });
    activeSupportRooms = activeSupportRooms.filter(r => r.roomId !== currentAdminRoom);
    currentAdminRoom = null;
    renderSupportRooms();

    const chatArea = document.getElementById("adminSupportChat");
    if (chatArea) chatArea.classList.add("hidden");
    showAdminNotification("Sesión de soporte cerrada.");
}

// ─── NOTIFICATIONS ────────────────────────────────────────

function showAdminNotification(text) {
    const el = document.getElementById("adminNotification");
    if (!el) return;
    el.textContent = text;
    el.classList.remove("hidden");
    el.classList.add("show");
    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.classList.add("hidden"), 400);
    }, 3500);
}

// ─── QR DE PUERTOS ────────────────────────────────────────

async function loadAdminQRCodes() {
    const container = document.getElementById("adminQRGrid");
    if (!container) return;

    container.innerHTML = `<div class="admin-loading">⏳ Generando QR de puertos...</div>`;

    try {
        const res = await fetch("/api/reservations/all-bay-qr");
        const data = await res.json();

        if (!res.ok || !data.length) {
            container.innerHTML = `<div class="admin-empty">No hay puertos configurados.</div>`;
            return;
        }

        container.innerHTML = data.map(port => `
            <div class="admin-qr-card" id="qr-card-${port.bay}">
                <div class="admin-qr-port-label">
                    <span class="admin-qr-port-code">⚡ ${port.bay}</span>
                    <span class="admin-qr-port-loc">${port.location || ''}</span>
                </div>
                <div class="admin-qr-image-wrap">
                    <img src="${port.qr_image}" alt="QR Puerto ${port.bay}" class="admin-qr-img">
                </div>
                <div class="admin-qr-url">${port.qr_text}</div>
                <div class="admin-qr-actions">
                    <a href="${port.qr_image}" download="QR-Puerto-${port.bay}.png" class="admin-qr-btn-dl">⬇ Descargar</a>
                    <button class="admin-qr-btn-print" onclick="printOneQR('${port.bay}', '${port.qr_image}', '${port.location || ''}')">🖨️ Imprimir</button>
                </div>
            </div>
        `).join('');

        // Store data globally for print-all
        window._allPortQRs = data;

    } catch (err) {
        container.innerHTML = `<div class="admin-error">Error cargando QR: ${err.message}</div>`;
    }
}

function printOneQR(bayCode, qrImage, location) {
    const win = window.open('', '_blank', 'width=500,height=600');
    win.document.write(`
        <!DOCTYPE html><html><head>
        <title>QR Puerto ${bayCode}</title>
        <style>
            body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: white; }
            .card { border: 3px solid #152c24; border-radius: 20px; padding: 30px; text-align: center; max-width: 340px; }
            .logo { font-size: 32px; margin-bottom: 8px; }
            h1 { margin: 0 0 4px; font-size: 28px; color: #152c24; }
            .loc { color: #64748b; font-size: 14px; margin-bottom: 18px; }
            img { width: 260px; height: 260px; }
            .code { margin-top: 14px; font-size: 13px; color: #334155; word-break: break-all; }
            .hint { margin-top: 12px; font-size: 12px; color: #94a3b8; }
            @media print { body { margin: 0; } }
        </style></head><body>
        <div class="card">
            <div class="logo">☀️</div>
            <h1>Puerto ${bayCode}</h1>
            <div class="loc">${location}</div>
            <img src="${qrImage}" alt="QR">
            <div class="hint">📱 Escanea para reservar o confirmar tu llegada</div>
        </div>
        <script>window.onload=()=>window.print();<\/script>
        </body></html>
    `);
    win.document.close();
}

function printAllQRCodes() {
    const data = window._allPortQRs;
    if (!data || !data.length) {
        alert('Primero carga los QR de puertos.');
        return;
    }
    const win = window.open('', '_blank', 'width=900,height=700');
    const cards = data.map(port => `
        <div class="card">
            <div class="logo">☀️</div>
            <h2>Puerto ${port.bay}</h2>
            <div class="loc">${port.location || ''}</div>
            <img src="${port.qr_image}" alt="QR ${port.bay}">
            <div class="hint">📱 Escanea para reservar o confirmar tu llegada</div>
        </div>
    `).join('');
    win.document.write(`
        <!DOCTYPE html><html><head>
        <title>QR Todos los Puertos — RideNow</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; background: white; }
            h1.main { text-align: center; padding: 20px; color: #152c24; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; padding: 20px; }
            .card { border: 3px solid #152c24; border-radius: 16px; padding: 20px; text-align: center; break-inside: avoid; }
            .logo { font-size: 24px; }
            h2 { margin: 4px 0; color: #152c24; font-size: 22px; }
            .loc { color: #64748b; font-size: 12px; margin-bottom: 12px; }
            img { width: 200px; height: 200px; }
            .hint { margin-top: 10px; font-size: 11px; color: #94a3b8; }
            @media print { body { margin: 0; } .card { page-break-inside: avoid; } }
        </style></head><body>
        <h1 class="main">☀️ RideNow — QR de Puertos de Carga</h1>
        <div class="grid">${cards}</div>
        <script>window.onload=()=>window.print();<\/script>
        </body></html>
    `);
    win.document.close();
}

// ─── ADMIN LOGOUT ─────────────────────────────────────────

function adminLogout() {
    clearSession();
    location.reload();
}

async function deleteAdminAccount() {
    if (!confirm("¿Estás seguro de que deseas eliminar tu cuenta de administrador? Esta acción no se puede deshacer.")) return;
    try {
        const res = await fetch("/api/auth/me", {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${getToken()}` }
        });
        if (res.ok) {
            alert("Cuenta eliminada exitosamente.");
            clearSession();
            location.reload();
        } else {
            const data = await res.json();
            alert(data.error || "Error eliminando la cuenta");
        }
    } catch (error) {
        alert("Error de conexión");
    }
}

// ─── CAR PARKING SPOTS (Sensors) ──────────────────────────

async function loadAdminCarSpots() {
    const container = document.getElementById("adminCarSpotsList");
    if (!container) return;

    container.innerHTML = `<div class="admin-loading">⏳ Cargando sensores...</div>`;

    try {
        const res = await fetch("/api/car-spots");
        if (!res.ok) throw new Error("Error cargando parqueaderos");
        const data = await res.json();
        const { spots = [], summary = {} } = data;

        if (spots.length === 0) {
            container.innerHTML = `<p style="color:var(--muted); text-align:center; padding:20px;">No hay parqueaderos registrados.</p>`;
            return;
        }

        const freeCount = summary.free ?? spots.filter(s => s.status === 'free').length;
        const total = summary.total ?? spots.length;

        container.innerHTML = `
            <div style="margin-bottom:16px; padding:14px; background:var(--green-light); border-radius:12px; display:flex; gap:20px; flex-wrap:wrap;">
                <span>🟢 Libres: <strong>${freeCount}</strong></span>
                <span>🔴 Ocupados: <strong>${spots.filter(s => s.status === 'occupied').length}</strong></span>
                <span>🔧 Mantenimiento: <strong>${spots.filter(s => s.status === 'maintenance').length}</strong></span>
                <span>📍 Total: <strong>${total}</strong></span>
            </div>
            ${spots.map(spot => `
                <div class="admin-car-spot-card" style="
                    background:var(--card);
                    border:2px solid ${ spot.status === 'free' ? '#bbf7d0' : spot.status === 'occupied' ? '#fecaca' : '#fed7aa' };
                    border-radius:14px;
                    padding:14px;
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:10px;
                ">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="font-size:24px;">🚗</div>
                        <div>
                            <strong style="font-size:15px;">${spot.code}</strong>
                            <div style="font-size:12px; color:var(--muted);">${spot.zone} · 📡 ${spot.sensor_id || 'Sin sensor'}</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="
                            padding:4px 10px;
                            border-radius:20px;
                            font-size:12px;
                            font-weight:700;
                            background:${ spot.status === 'free' ? '#dcfce7' : spot.status === 'occupied' ? '#fee2e2' : '#fef3c7' };
                            color:${ spot.status === 'free' ? '#15803d' : spot.status === 'occupied' ? '#dc2626' : '#d97706' };
                        ">${ spot.status === 'free' ? '🟢 Libre' : spot.status === 'occupied' ? '🔴 Ocupado' : '🔧 Mantenimiento' }</span>
                        <button
                            onclick="simulateCarSpotSensor(${spot.id})"
                            style="
                                padding:6px 12px;
                                border-radius:8px;
                                border:1px solid var(--border);
                                background:var(--background);
                                font-size:12px;
                                font-weight:600;
                                cursor:pointer;
                            "
                            title="Simular sensor: alternar libre/ocupado"
                        >📡 Simular</button>
                    </div>
                </div>
            `).join('')}
        `;
    } catch (err) {
        container.innerHTML = `<p style="color:var(--red); text-align:center; padding:20px;">⚠️ ${err.message}</p>`;
    }
}

async function simulateCarSpotSensor(spotId) {
    const token = getToken();
    try {
        const res = await fetch("/api/car-spots/simulate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ spotId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error simulando sensor");
        showAdminNotification(`📡 ${data.message}`);
        loadAdminCarSpots();
    } catch (err) {
        showAdminNotification(`⚠️ ${err.message}`);
    }
}
