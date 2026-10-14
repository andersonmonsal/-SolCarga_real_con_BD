let html5QrCodeInstance = null;
let scannerActive = false;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
function openCheckinScanner(mode = 'checkin') {
    window.scannerMode = mode;
    const overlay = document.getElementById("checkinScannerOverlay");
    if (!overlay) return;
    const headerTitle = overlay.querySelector('.scanner-header h3');
    const instructions = overlay.querySelector('.scanner-instructions');
    const manualBtn = document.getElementById("manualSubmitBtn");
    if (mode === 'book') {
        if (headerTitle) headerTitle.textContent = typeof t === 'function' ? t('scanToBook') : 'Escanear para reservar';
        if (instructions) instructions.textContent = typeof t === 'function' ? t('scanToBookInstructions') : 'Apunta al código QR de la bahía física que deseas usar para reservarla de inmediato.';
        if (manualBtn) manualBtn.textContent = typeof t === 'function' ? t('findBayBtn') : 'Buscar bahía';
    } else if (mode === 'checkout') {
        if (headerTitle) headerTitle.textContent = 'Confirmar salida y desconexión';
        if (instructions) instructions.textContent = 'Apunta la cámara al código QR de tu punto de carga para liberar la bahía.';
        if (manualBtn) manualBtn.textContent = 'Liberar bahía y salir';
    } else {
        if (headerTitle) headerTitle.textContent = typeof t === 'function' ? t('confirmArrivalTitle') : 'Confirmar llegada';
        if (instructions) instructions.textContent = typeof t === 'function' ? t('scanToCheckinInstructions') : 'Apunta la cámara al código QR en el punto de carga para iniciar la carga.';
        if (manualBtn) manualBtn.textContent = typeof t === 'function' ? t('confirmArrivalManual') : 'Confirmar llegada';
    }
    overlay.style.display = "flex";
    requestAnimationFrame(() => {
        overlay.classList.add("visible");
    });
    if (isIOS && isSafari) {
        setTimeout(() => showManualFallback(), 300);
    } else {
        setTimeout(() => startQRScanner(), 350);
    }
}
function closeCheckinScanner() {
    stopQRScanner();
    const overlay = document.getElementById("checkinScannerOverlay");
    if (overlay) {
        overlay.classList.remove("visible");
        setTimeout(() => { overlay.style.display = "none"; }, 320);
    }
}
async function startQRScanner() {
    const readerEl = document.getElementById("qrReaderElement");
    if (!readerEl) return;
    if (typeof Html5Qrcode === "undefined") {
        showManualFallback("La librería de escaneo no cargó. Ingresa el código manualmente:");
        return;
    }
    if (html5QrCodeInstance) {
        try { await html5QrCodeInstance.stop(); } catch (_) {}
        html5QrCodeInstance = null;
    }
    readerEl.innerHTML = "";
    try {
        html5QrCodeInstance = new Html5Qrcode("qrReaderElement");
        const cameraConstraints = isIOS
            ? { facingMode: { ideal: "environment" } }
            : { facingMode: "environment" };
        await html5QrCodeInstance.start(
            cameraConstraints,
            { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
            onQRScanned,
            () => {}
        );
        scannerActive = true;
        setScannerStatus(typeof t === 'function' ? t('scannerPointQR') : 'Apunta al QR del punto de carga');
    } catch (error) {
        console.warn("Cámara no disponible:", error);
        showManualFallback(typeof t === 'function' ? t('cameraError') : 'No se pudo acceder a la cámara. Ingresa el código manualmente:');
    }
}
async function stopQRScanner() {
    scannerActive = false;
    if (html5QrCodeInstance) {
        try {
            await html5QrCodeInstance.stop();
            await html5QrCodeInstance.clear();
        } catch (_) {}
        html5QrCodeInstance = null;
    }
    const readerEl = document.getElementById("qrReaderElement");
    if (readerEl) readerEl.innerHTML = "";
}
async function onQRScanned(decodedText) {
    if (!scannerActive) return;
    scannerActive = false;
    setScannerStatus("QR detectado... verificando ✓", "#4ade80");
    await stopQRScanner();
    try {
        if (window.scannerMode === 'book') {
            await handleBookingScan(decodedText);
        } else if (window.scannerMode === 'checkout') {
            await handleCheckoutScan(decodedText);
        } else {
            await confirmCheckin(decodedText);
        }
    } catch (error) {
        setScannerStatus(error.message, "#ef4444");
        setTimeout(() => {
            scannerActive = false;
            startQRScanner();
        }, 2500);
    }
}
function showManualFallback(msg) {
    const readerEl = document.getElementById("qrReaderElement");
    if (readerEl) readerEl.innerHTML = "";
    const fallbackContainer = document.getElementById("scannerFallback");
    if (fallbackContainer) {
        fallbackContainer.classList.remove("hidden");
    }
    if (msg) setScannerStatus(msg);
}
function setScannerStatus(text, color) {
    const statusEl = document.getElementById("scannerStatusText");
    if (!statusEl) return;
    statusEl.textContent = text || "";
    statusEl.style.color = color || "";
}
async function submitManualCode() {
    const input = document.getElementById("manualCodeInput");
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (!code) {
        setScannerStatus(typeof t === 'function' ? t('enterCodeError') : 'Ingresa el código del QR', "#ef4444");
        return;
    }
    const btn = document.getElementById("manualSubmitBtn");
    if (btn) { btn.disabled = true; btn.textContent = "Verificando..."; }
    try {
        if (window.scannerMode === 'book') {
            await handleBookingScan(code);
        } else if (window.scannerMode === 'checkout') {
            await handleCheckoutScan(code);
        } else {
            await confirmCheckin(code);
        }
    } catch (error) {
        setScannerStatus(error.message, "#ef4444");
        if (btn) {
            btn.disabled = false;
            btn.textContent = window.scannerMode === 'book'
                ? (typeof t === 'function' ? t('findBayBtn') : 'Buscar bahía')
                : (window.scannerMode === 'checkout' ? 'Liberar bahía y salir' : (typeof t === 'function' ? t('confirmArrivalManual') : 'Confirmar'));
        }
    }
}
async function confirmCheckin(scannedCode) {
    const token = getToken();
    if (!token) throw new Error("Sesión expirada. Inicia sesión de nuevo.");
    const response = await fetch("/api/reservations/checkin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ scannedCode })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Error confirmando llegada");
    }
    closeCheckinScanner();
    if (data.pointsEarned) {
        const user = getUser();
        if (user) {
            user.points = (user.points || 0) + data.pointsEarned;
            localStorage.setItem("RideNow_user", JSON.stringify(user));
            const badge = document.getElementById("userPointsBadge");
            if (badge) badge.textContent = `${user.points} Pts`;
        }
    }
    showCheckinSuccess(data.message, data.reservation);
    return data;
}
function showCheckinSuccess(message, reservation) {
    const container = document.getElementById("qrContainer");
    if (!container) return;
    const now = new Date();
    const timeStr = now.toLocaleString(currentLanguage === 'en' ? 'en-US' : 'es-CO');
    const user = getUser();
    const userName = user ? user.name : (typeof t === 'function' ? t('student') : 'Estudiante');
    const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
    container.innerHTML = `
        <div class="checkin-success-card" style="border: 1px solid var(--border-focus); background: var(--surface); padding: 24px; border-radius: 12px;">
            <div class="checkin-checkmark" style="display:flex; justify-content:center; margin-bottom: 12px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--green-light); display: flex; align-items: center; justify-content: center; color: var(--green);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
            </div>
            <h3 style="color: var(--text); font-size: 20px; font-weight: 700; text-align: center; margin: 0 0 4px;">
                ${isEn ? 'Arrival Confirmed' : 'Llegada Confirmada'}
            </h3>
            <p style="font-weight: 600; font-size: 13px; margin: 0; color: var(--green); text-align: center; text-transform: uppercase; letter-spacing: 0.05em;">${isEn ? 'Charging Active' : 'Carga en Curso'}</p>
            <p class="checkin-msg" style="margin-top: 10px; text-align: center; font-size: 14px; color: var(--text-2);">${message}</p>
            <div class="checkin-details" style="background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; margin-top: 16px;">
                <div class="checkin-detail-row" style="display:flex; justify-content:space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                    <span style="color:var(--text-3); font-size: 13px;">${isEn ? 'Student / User' : 'Estudiante / Usuario'}</span>
                    <strong style="font-size: 13px; color:var(--text);">${userName}</strong>
                </div>
                <div class="checkin-detail-row" style="display:flex; justify-content:space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                    <span style="color:var(--text-3); font-size: 13px;">${isEn ? 'Timestamp' : 'Fecha y Hora'}</span>
                    <strong style="font-size: 13px; color:var(--text); font-family: var(--font-mono);">${timeStr}</strong>
                </div>
                <div class="checkin-detail-row" style="display:flex; justify-content:space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                    <span style="color:var(--text-3); font-size: 13px;">${isEn ? 'Reservation ID' : 'Código de Reserva'}</span>
                    <strong style="font-size: 13px; font-family: var(--font-mono); color:var(--text);">${reservation.code}</strong>
                </div>
                <div class="checkin-detail-row" style="display:flex; justify-content:space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                    <span style="color:var(--text-3); font-size: 13px;">${isEn ? 'Bay' : 'Bahía Asignada'}</span>
                    <strong style="font-size: 13px; font-family: var(--font-mono); color:var(--accent);">${reservation.bay}</strong>
                </div>
                <div class="checkin-detail-row" style="display:flex; justify-content:space-between; padding: 6px 0;">
                    <span style="color:var(--text-3); font-size: 13px;">${isEn ? 'Status' : 'Estado'}</span>
                    <strong style="font-size: 12px; color: var(--green); text-transform: uppercase;">${isEn ? 'Connected • Charging' : 'Conectado • Cargando'}</strong>
                </div>
            </div>
            <p class="checkin-hint" style="margin-top: 14px; font-size: 12px; color: var(--text-3); text-align: center;">
                ${isEn
                    ? 'Screen serves as verified check-in proof for laboratory or campus authorities.'
                    : 'Esta pantalla sirve como constancia digital de conexión en el laboratorio o campus.'}
            </p>
        </div>
    `;
    if (typeof speak === "function") {
        speak(typeof t === 'function'
            ? (currentLanguage === 'en' ? 'Arrival confirmed! Your vehicle can start charging.' : '¡Llegada confirmada! Tu vehículo puede comenzar a cargarse.')
            : '¡Llegada confirmada! Tu vehículo puede comenzar a cargarse.');
    }
    if (typeof loadBays === "function") {
        loadBays();
    }
}
async function handleBookingScan(scannedCode) {
    const code = scannedCode.toUpperCase().trim();
    let bayCode = code;
    if (code.startsWith('RIDENOW-BAY-')) {
        bayCode = code.replace('RIDENOW-BAY-', '');
    } else if (code.startsWith('ELECTRA-BAY-')) {
        bayCode = code.replace('ELECTRA-BAY-', '');
    } else if (code.includes('?BAHIA=')) {
        bayCode = code.split('?BAHIA=')[1].split('&')[0];
    }
    let bay = null;
    try {
        const res = await fetch('/api/bays');
        const allBays = await res.json();
        bay = allBays.find(b => b.code === bayCode);
        if (typeof bays !== 'undefined') bays = allBays;
    } catch (e) {
        throw new Error("No se pudo verificar el estado de la bahía. Revisa tu conexión.");
    }
    if (!bay) {
        throw new Error(`Código QR no reconocido: "${code}". Verifica el código del puerto.`);
    }
    const overlay = document.getElementById("checkinScannerOverlay");
    const card = overlay.querySelector(".scanner-card");
    const statusLabel = {
        available: typeof t === 'function' ? t('statusAvailable') : 'Disponible',
        reserved:  typeof t === 'function' ? t('statusReserved') : 'Reservada',
        occupied:  typeof t === 'function' ? t('statusOccupied') : 'Ocupada',
        offline:   typeof t === 'function' ? t('statusOffline') : 'Fuera de servicio'
    };
    const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
    card.innerHTML = `
        <div class="scanner-header">
            <h3>Detalles de la Bahía</h3>
            <button class="close-button" onclick="closeCheckinScanner()" aria-label="Cerrar">×</button>
        </div>
        <div style="text-align:center; padding: 14px 0 20px;">
            <div style="font-size: 28px; font-weight: 800; font-family: var(--font-mono); letter-spacing: 1px; color: var(--text);">${bay.code}</div>
            <div style="margin-top: 6px;">
                <span class="bay-status-pill" style="display:inline-block;">${statusLabel[bay.status] || bay.status}</span>
            </div>
        </div>
        <div style="background: var(--surface-2); border-radius: 8px; padding: 14px; margin-bottom: 20px; text-align: left; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span style="color: var(--text-3); font-size: 13px;">${isEn ? 'Port Code' : 'Código de Puerto'}</span>
                <strong style="font-size: 13px; font-family: var(--font-mono);">${bay.code}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span style="color: var(--text-3); font-size: 13px;">${isEn ? 'Vehicle Compatibility' : 'Tipo de Vehículo'}</span>
                <strong style="font-size: 13px;">${bay.vehicle_type}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                <span style="color: var(--text-3); font-size: 13px;">${isEn ? 'Location' : 'Ubicación'}</span>
                <strong style="font-size: 13px;">${bay.location || (isEn ? 'Main Hub' : 'Estación Principal')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                <span style="color: var(--text-3); font-size: 13px;">${isEn ? 'Status' : 'Estado'}</span>
                <strong style="font-size: 13px;">${statusLabel[bay.status]}</strong>
            </div>
        </div>
        ${bay.status === 'available' ? `
            <button class="primary-button" style="margin-bottom: 10px;" onclick="closeCheckinScanner(); openReservation(window._scannedBay);">
                ${isEn ? 'Reserve This Bay' : 'Reservar esta Bahía'}
            </button>
        ` : `
            <div style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text-2); border-radius: 8px; padding: 12px; text-align: center; font-size: 13px; margin-bottom: 12px;">
                ${isEn ? 'This bay is currently occupied or reserved.' : 'Esta bahía se encuentra ocupada o reservada en este momento.'}
            </div>
        `}
        <button class="link-button" style="width: 100%; text-align: center;" onclick="closeCheckinScanner()">${isEn ? 'Cancel' : 'Cancelar'}</button>
    `;
    window._scannedBay = bay;
}

async function handleCheckoutScan(scannedCode) {
    let cleanCode = scannedCode.trim().toUpperCase();
    if (cleanCode.startsWith('RIDENOW-BAY-')) {
        cleanCode = cleanCode.replace('RIDENOW-BAY-', '');
    } else if (cleanCode.startsWith('ELECTRA-BAY-')) {
        cleanCode = cleanCode.replace('ELECTRA-BAY-', '');
    } else if (cleanCode.includes('?BAHIA=')) {
        cleanCode = cleanCode.split('?BAHIA=')[1].split('&')[0];
    } else if (cleanCode.includes('BAHIA=')) {
        cleanCode = cleanCode.split('BAHIA=')[1].split('&')[0];
    }

    const reason = window._exitEarlyReason || "Batería suficiente";
    const details = window._exitEarlyDetails || "";
    const result = await checkoutReservation(cleanCode, reason, details);
    closeCheckinScanner();
    if (typeof closeExitEarlyModal === 'function') {
        closeExitEarlyModal();
    }
    showCheckoutSuccess(result.message || "Sesión finalizada. Bahía liberada correctamente.");
}

function showCheckoutSuccess(msg) {
    const container = document.getElementById("qrContainer");
    if (!container) return;
    const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
    container.innerHTML = `
        <div class="checkin-success-card" style="border: 1px solid var(--border); background: var(--surface); padding: 28px 24px; border-radius: 12px; text-align: center;">
            <div style="display:flex; justify-content:center; margin-bottom: 12px;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--green-light); display: flex; align-items: center; justify-content: center; color: var(--green);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
            </div>
            <h3 style="color: var(--text); font-size: 20px; font-weight: 700; margin: 0 0 6px;">
                ${isEn ? 'Session Completed' : 'Sesión de Carga Finalizada'}
            </h3>
            <p style="font-weight: 600; font-size: 13px; margin: 0; color: var(--green); text-transform: uppercase; letter-spacing: 0.05em;">
                ${isEn ? 'Bay Released Successfully' : 'Bahía Liberada con Éxito'}
            </p>
            <p class="checkin-msg" style="margin-top: 12px; color: var(--text-2); font-size: 14px;">${msg}</p>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
                <button class="primary-button" onclick="showPage('home')" style="width: auto; padding: 10px 24px;">
                    ${isEn ? 'Return to Home' : 'Volver al Inicio'}
                </button>
            </div>
        </div>
    `;
    if (typeof speak === "function") {
        speak(isEn ? 'Charging session ended. Thank you for using ELECTRA.' : 'Sesión de carga finalizada. Gracias por usar ELECTRA.');
    }
    if (typeof loadBays === "function") {
        loadBays();
    }
    const badge = document.getElementById("qrBadge");
    if (badge) badge.classList.add("hidden");
}

