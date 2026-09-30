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
        } else {
            await confirmCheckin(code);
        }
    } catch (error) {
        setScannerStatus(error.message, "#ef4444");
        if (btn) {
            btn.disabled = false;
            btn.textContent = window.scannerMode === 'book'
                ? (typeof t === 'function' ? t('findBayBtn') : 'Buscar bahía')
                : (typeof t === 'function' ? t('confirmArrivalManual') : 'Confirmar');
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
        <div class="checkin-success-card" style="border: 2px dashed var(--green); background: var(--green-light);">
            <div class="checkin-checkmark">
                <svg viewBox="0 0 52 52" class="checkmark-svg">
                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark-path" fill="none" d="M14 27l7 7 17-17"/>
                </svg>
            </div>
            <h3 style="color: var(--text); font-size: 24px; text-align: center; margin-bottom: 5px;">
                ${isEn ? 'ARRIVAL CONFIRMED!' : '¡EVIDENCIA DE LLEGADA!'}
            </h3>
            <p style="font-weight: bold; font-size: 18px; margin: 0; color: var(--green); text-align: center;">${isEn ? 'Confirmed ✓' : 'Confirmado ✓'}</p>
            <p class="checkin-msg" style="margin-top: 10px;">${message}</p>
            <div class="checkin-details" style="background: white; border: 1px solid var(--border); margin-top: 15px;">
                <div class="checkin-detail-row">
                    <span>👤 ${isEn ? 'Student' : 'Estudiante'}</span>
                    <strong>${userName}</strong>
                </div>
                <div class="checkin-detail-row">
                    <span>🕒 ${isEn ? 'Date & Time' : 'Fecha y Hora'}</span>
                    <strong>${timeStr}</strong>
                </div>
                <div class="checkin-detail-row">
                    <span>🏷️ ${isEn ? 'Reservation' : 'Reserva'}</span>
                    <strong>${reservation.code}</strong>
                </div>
                <div class="checkin-detail-row">
                    <span>⚡ ${isEn ? 'Bay' : 'Bahía'}</span>
                    <strong>${reservation.bay}</strong>
                </div>
                <div class="checkin-detail-row">
                    <span>🔋 ${isEn ? 'Status' : 'Estado'}</span>
                    <strong class="status-charging">${isEn ? 'Charging ⚡' : 'Cargando ⚡'}</strong>
                </div>
            </div>
            <p class="checkin-hint" style="margin-top: 15px; font-weight: bold; color: var(--text);">
                ${isEn
                    ? 'Show this screen to the professor as evidence of your arrival at the charging point.'
                    : 'Muestra esta pantalla al profesor como evidencia de tu llegada al punto de carga.'}
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
        throw new Error(`QR no reconocido. Código extraído: "${bayCode}". Código original escaneado: "${code}" no existe en el sistema.`);
    }
    const overlay = document.getElementById("checkinScannerOverlay");
    const card = overlay.querySelector(".scanner-card");
    const statusColor = { available: '#16a34a', reserved: '#d97706', occupied: '#dc2626', offline: '#6b7280' };
    const statusLabel = {
        available: typeof t === 'function' ? `🟢 ${t('statusAvailable')}` : '🟢 Disponible',
        reserved:  typeof t === 'function' ? `🟡 ${t('statusReserved')}` : '🟡 Reservada',
        occupied:  typeof t === 'function' ? `🔴 ${t('statusOccupied')}` : '🔴 Ocupada',
        offline:   typeof t === 'function' ? `⚪ ${t('statusOffline')}` : '⚪ Fuera de servicio'
    };
    const vehicleIcon = bay.vehicle_type === 'Bicicleta' ? '🚲' : '🛴';
    const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
    card.innerHTML = `
        <div class="scanner-header">
            <h3>Información de la bahía</h3>
            <button class="close-button" onclick="closeCheckinScanner()">×</button>
        </div>
        <div style="text-align:center; padding: 10px 0 20px;">
            <div style="font-size: 56px; margin-bottom: 8px;">${vehicleIcon}</div>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 2px;">${bay.code}</div>
            <div style="margin-top: 8px; font-size: 15px; font-weight: 600; color: ${statusColor[bay.status] || '#6b7280'};">
                ${statusLabel[bay.status] || bay.status}
            </div>
        </div>
        <div style="background: var(--background, #f8fafc); border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: left;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border, #e5e7eb);">
                <span style="color: var(--muted, #6b7280); font-size: 14px;">⚡ ${isEn ? 'Bay' : 'Bahía'}</span>
                <strong>${bay.code}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border, #e5e7eb);">
                <span style="color: var(--muted, #6b7280); font-size: 14px;">${vehicleIcon} ${isEn ? 'Vehicle type' : 'Tipo de vehículo'}</span>
                <strong>${bay.vehicle_type}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border, #e5e7eb);">
                <span style="color: var(--muted, #6b7280); font-size: 14px;">📍 ${isEn ? 'Location' : 'Ubicación'}</span>
                <strong>${bay.location || (isEn ? 'Charging zone' : 'Zona de carga')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="color: var(--muted, #6b7280); font-size: 14px;">🔋 ${isEn ? 'Status' : 'Estado'}</span>
                <strong style="color: ${statusColor[bay.status]};">${statusLabel[bay.status]}</strong>
            </div>
        </div>
        ${bay.status === 'available' ? `
            <button class="primary-button" style="margin-bottom: 10px;" onclick="closeCheckinScanner(); openReservation(window._scannedBay);">
                ⚡ ${isEn ? 'Reserve this bay' : 'Reservar esta bahía'}
            </button>
        ` : `
            <div style="background: #fee2e2; color: #dc2626; border-radius: 10px; padding: 14px; text-align: center; font-weight: 600; margin-bottom: 10px;">
                ${isEn ? 'This bay is not available right now.' : 'Esta bahía no está disponible en este momento.'}<br>
                <span style="font-size: 13px; font-weight: 400;">${isEn ? 'Try a nearby bay.' : 'Intenta con otra bahía cercana.'}</span>
            </div>
        `}
        <button class="link-button" style="width: 100%; text-align: center;" onclick="closeCheckinScanner()">${isEn ? 'Cancel' : 'Cancelar'}</button>
    `;
    window._scannedBay = bay;
}
