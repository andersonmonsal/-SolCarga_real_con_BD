// ============================================
// RideNow — GPS Proximity Detection
// Station: Universidad de Medellín
// Coords: 6.223030, -75.611117
// ============================================

const STATION_LAT  = 6.231435;
const STATION_LNG  = -75.612030;
const PROXIMITY_RADIUS_M = 300; // meters

let geoWatchId = null;
let proximityBannerVisible = false;
let lastProximityState = null; // 'near' | 'far' | null

/**
 * Haversine formula — distance between two lat/lng points in meters.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Start watching GPS position. Called once after login.
 */
function startGeoWatch() {
    if (!navigator.geolocation) return;

    // Only start if not already watching
    if (geoWatchId !== null) return;

    geoWatchId = navigator.geolocation.watchPosition(
        onPositionUpdate,
        onPositionError,
        {
            enableHighAccuracy: true,
            maximumAge: 15000,
            timeout: 30000
        }
    );
}

/**
 * Stop watching GPS (called on logout).
 */
function stopGeoWatch() {
    if (geoWatchId !== null) {
        navigator.geolocation.clearWatch(geoWatchId);
        geoWatchId = null;
    }
    hideProximityBanner();
}

function onPositionUpdate(position) {
    const { latitude, longitude } = position.coords;
    const dist = haversineDistance(latitude, longitude, STATION_LAT, STATION_LNG);

    if (dist <= PROXIMITY_RADIUS_M) {
        if (lastProximityState !== 'near') {
            lastProximityState = 'near';
            showProximityBanner(Math.round(dist));
        } else {
            // Update distance in banner
            updateProximityBannerDistance(Math.round(dist));
        }
    } else {
        if (lastProximityState === 'near') {
            lastProximityState = 'far';
            hideProximityBanner();
        }
    }
}

function onPositionError(err) {
    // Silently ignore; GPS not available or denied
    console.warn('[GEO] GPS error:', err.message);
}

// ============================================
// PROXIMITY BANNER UI
// ============================================

function createProximityBanner() {
    if (document.getElementById('proximityBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'proximityBanner';
    banner.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        z-index: 999;
        background: linear-gradient(135deg, #16a34a 0%, #059669 100%);
        color: white;
        border-radius: 18px;
        padding: 14px 20px;
        width: calc(100% - 32px);
        max-width: 420px;
        box-shadow: 0 8px 30px rgba(22,163,74,0.4);
        display: flex;
        align-items: center;
        gap: 14px;
        opacity: 0;
        transition: opacity 0.35s ease, transform 0.35s ease;
        cursor: pointer;
        user-select: none;
    `;

    banner.innerHTML = `
        <div style="font-size: 32px; flex-shrink:0;">📍</div>
        <div style="flex:1; min-width:0;">
            <div id="proximityBannerTitle" style="font-weight: 700; font-size: 15px; line-height:1.3;"></div>
            <div id="proximityBannerSub" style="font-size: 13px; opacity:0.9; margin-top:3px;"></div>
        </div>
        <button id="proximityBannerClose" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            font-size: 18px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display:flex; align-items:center; justify-content:center;
            flex-shrink:0;
        " aria-label="Close">✕</button>
    `;

    document.body.appendChild(banner);

    // Clicking the banner (not close) goes to home to show bays
    banner.addEventListener('click', (e) => {
        if (e.target.id === 'proximityBannerClose') {
            hideProximityBanner(true); // manual dismiss — don't re-show until next session
            return;
        }
        if (typeof showPage === 'function') showPage('home');
    });

    return banner;
}

function showProximityBanner(distMeters) {
    if (proximityBannerVisible) return;

    const banner = createProximityBanner();
    if (!banner) return;

    updateProximityBannerText(distMeters);

    proximityBannerVisible = true;
    requestAnimationFrame(() => {
        banner.style.opacity = '1';
        banner.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Auto-hide after 8 seconds
    clearTimeout(banner._autoHideTimer);
    banner._autoHideTimer = setTimeout(() => hideProximityBanner(), 8000);
}

function updateProximityBannerDistance(distMeters) {
    updateProximityBannerText(distMeters);
}

function updateProximityBannerText(distMeters) {
    const titleEl = document.getElementById('proximityBannerTitle');
    const subEl   = document.getElementById('proximityBannerSub');
    if (!titleEl || !subEl) return;

    const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';
    const distLabel = distMeters < 50
        ? (isEn ? 'You are here!' : '¡Estás aquí!')
        : (isEn ? `${distMeters} m away` : `A ${distMeters} m`);

    titleEl.textContent = isEn
        ? '📡 RideNow Station nearby!'
        : '📡 ¡Estación RideNow cercana!';

    subEl.textContent = isEn
        ? `${distLabel} — Tap to reserve or check in`
        : `${distLabel} — Toca para reservar o confirmar llegada`;
}

function hideProximityBanner(permanent = false) {
    const banner = document.getElementById('proximityBanner');
    if (banner) {
        clearTimeout(banner._autoHideTimer);
        banner.style.opacity = '0';
        banner.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => {
            if (banner.parentNode) banner.parentNode.removeChild(banner);
        }, 350);
    }
    proximityBannerVisible = false;
    if (permanent) lastProximityState = 'far'; // prevent re-show in same session
}

// ============================================
// LOCATION SECTION — live distance display
// ============================================

/**
 * Show/update the user's live distance in the Location section.
 */
function updateLocationSectionGPS(distMeters) {
    const el = document.getElementById('gpsDistanceInfo');
    if (!el) return;
    const isEn = typeof currentLanguage !== 'undefined' && currentLanguage === 'en';

    if (distMeters <= PROXIMITY_RADIUS_M) {
        el.innerHTML = `<span style="color:#16a34a; font-weight:700;">
            ✅ ${isEn ? 'You are at the station!' : '¡Estás en la estación!'}
        </span>`;
    } else {
        const km = (distMeters / 1000).toFixed(1);
        el.innerHTML = `<span style="color:var(--muted); font-size:14px;">
            📡 ${isEn ? `${km} km from the station` : `A ${km} km de la estación`}
        </span>`;
    }
}

// Re-translate banner text when language changes
document.addEventListener('languageChanged', () => {
    if (proximityBannerVisible) {
        // Refresh text in current banner
        const titleEl = document.getElementById('proximityBannerTitle');
        const subEl   = document.getElementById('proximityBannerSub');
        if (titleEl && subEl) updateProximityBannerText(null);
    }
});
