let carSpotsData = [];
async function loadCarSpots() {
    try {
        const response = await fetch("/api/car-spots");
        if (!response.ok) return;
        const data = await response.json();
        carSpotsData = data.spots || [];
        renderCarSpots(data);
    } catch (err) {
        console.error("Error cargando parqueaderos:", err);
    }
}
function renderCarSpots(data) {
    const container = document.getElementById("carSpotsContainer");
    if (!container) return;
    const { spots = [], zones = {}, summary = {} } = data;
    const freeCount = summary.free ?? spots.filter(s => s.status === "free").length;
    const total = summary.total ?? spots.length;
    const counter = document.getElementById("carSpotsCount");
    if (counter) {
        counter.textContent = `${freeCount} / ${total}`;
        counter.className = freeCount === 0 ? "car-spots-badge full" : "car-spots-badge";
    }
    const zoneNames = Object.keys(zones);
    container.innerHTML = zoneNames.map(zoneName => {
        const zoneSpots = zones[zoneName];
        const zoneFree = zoneSpots.filter(s => s.status === "free").length;
        return `
        <div class="car-zone" role="region" aria-label="Zona de parqueadero ${zoneName}">
            <div class="car-zone-header">
                <h3 class="car-zone-title">
                    <span class="car-zone-icon">🚗</span> ${zoneName}
                </h3>
                <span class="car-zone-badge ${zoneFree === 0 ? 'full' : ''}">
                    ${zoneFree} libre${zoneFree !== 1 ? 's' : ''}
                </span>
            </div>
            <div class="car-spots-grid">
                ${zoneSpots.map(spot => renderCarSpot(spot)).join("")}
            </div>
        </div>
        `;
    }).join("");
}
function renderCarSpot(spot) {
    const statusLabel = {
        free:        "🟢 Libre",
        occupied:    "🔴 Ocupado",
        maintenance: "🔧 Mantenimiento"
    }[spot.status] || "⚪ Desconocido";
    const statusClass = {
        free:        "spot-free",
        occupied:    "spot-occupied",
        maintenance: "spot-maintenance"
    }[spot.status] || "";
    const sensorIcon = spot.sensor_active ? "📡" : "📵";
    const lastUpdate = spot.last_updated
        ? new Date(spot.last_updated).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
        : "--:--";
    return `
    <div class="car-spot ${statusClass}" 
         id="car-spot-${spot.id}"
         role="status" 
         aria-label="Parqueadero ${spot.code}: ${statusLabel}">
        <div class="car-spot-code">${spot.code}</div>
        <div class="car-spot-visual">
            <svg class="car-icon" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="5" y="12" width="50" height="14" rx="4" fill="currentColor" opacity="0.3"/>
                <rect x="10" y="6" width="35" height="14" rx="3" fill="currentColor" opacity="0.6"/>
                <circle cx="16" cy="26" r="4" fill="currentColor"/>
                <circle cx="44" cy="26" r="4" fill="currentColor"/>
                <rect x="14" y="8" width="14" height="8" rx="2" fill="currentColor" opacity="0.9"/>
                <rect x="30" y="8" width="12" height="8" rx="2" fill="currentColor" opacity="0.9"/>
            </svg>
        </div>
        <div class="car-spot-status">${statusLabel}</div>
        <div class="car-spot-sensor">
            <span title="Sensor ID: ${spot.sensor_id || 'N/A'}">${sensorIcon}</span>
            <span class="car-spot-time">Actualizado: ${lastUpdate}</span>
        </div>
    </div>
    `;
}
function updateCarSpotById(spotId, code, zone, status) {
    carSpotsData = carSpotsData.map(s => s.id === spotId ? { ...s, status, last_updated: new Date().toISOString() } : s);
    const freeCount = carSpotsData.filter(s => s.status === "free").length;
    const zones = {};
    carSpotsData.forEach(spot => {
        if (!zones[spot.zone]) zones[spot.zone] = [];
        zones[spot.zone].push(spot);
    });
    renderCarSpots({
        spots: carSpotsData,
        zones,
        summary: { total: carSpotsData.length, free: freeCount, occupied: carSpotsData.filter(s => s.status === "occupied").length }
    });
    setTimeout(() => {
        const el = document.getElementById(`car-spot-${spotId}`);
        if (el) {
            el.classList.add("spot-pulse");
            setTimeout(() => el.classList.remove("spot-pulse"), 1500);
        }
    }, 50);
}
function initCarSpotsSocket(socket) {
    socket.on("carSpotUpdated", ({ spotId, code, zone, status }) => {
        updateCarSpotById(spotId, code, zone, status);
    });
}
