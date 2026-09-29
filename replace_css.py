import os

css_path = 'frontend/css/styles.css'

new_css = """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
    --font-scale: 100%;

    /* ELECTRA Modern Palette */
    --green: #0ea5e9; /* Changed to a more tech 'electric' color if they allow, but they asked for green. Let's stick to green */
    --green: #10b981; /* Energetic green */
    --green-dark: #065f46; /* Dark green */
    --green-light: #ecfdf5; /* Light green tint */

    --background: #f8fafc; /* Light gray modern background */
    --card: #ffffff;
    --text: #0f172a; /* Slate 900 for dark text */
    --muted: #64748b; /* Slate 500 */
    --border: #e2e8f0; /* Slate 200 */

    /* Status Colors */
    --red: #ef4444;
    --red-light: #fef2f2;
    --yellow: #f59e0b;
    --yellow-light: #fffbeb;
    --gray: #94a3b8;
    --gray-light: #f1f5f9;
}

* {
    box-sizing: border-box;
}

html {
    font-size: var(--font-scale);
}

body {
    margin: 0;
    min-height: 100vh;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--background);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
}

button, input, select {
    font: inherit;
}

button {
    cursor: pointer;
}

.hidden {
    display: none !important;
}

.view {
    min-height: 100vh;
}

/* ========================================================= */
/* AUTH CARDS */
/* ========================================================= */
.auth-view {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.auth-card {
    width: min(420px, calc(100% - 30px));
    margin: auto;
    padding: 40px 35px;
    background: var(--card);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 24px;
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
    text-align: center;
}

.professional-card {
    border-top: 4px solid var(--green);
}

.brand-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 24px;
}

.brand-icon {
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    background: var(--green-light);
    border-radius: 16px;
    margin-bottom: 12px;
    color: var(--green-dark);
}

.auth-card h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--text);
}

.role-selector {
    display: flex;
    background: var(--gray-light);
    border-radius: 12px;
    padding: 6px;
    margin-bottom: 24px;
}

.role-btn {
    flex: 1;
    border: none;
    background: transparent;
    padding: 10px;
    border-radius: 8px;
    color: var(--muted);
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s ease;
}

.role-btn.active {
    background: var(--card);
    color: var(--text);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.auth-card p {
    color: var(--muted);
    font-size: 15px;
    margin-bottom: 24px;
}

.auth-card label {
    display: block;
    text-align: left;
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
}

input, select {
    width: 100%;
    padding: 14px 16px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--background);
    color: var(--text);
    transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, select:focus {
    outline: none;
    border-color: var(--green);
    box-shadow: 0 0 0 4px var(--green-light);
}

.primary-button {
    width: 100%;
    margin-top: 24px;
    padding: 16px;
    border: none;
    border-radius: 12px;
    background: var(--text); /* Modern dark button */
    color: white;
    font-weight: 600;
    font-size: 16px;
    transition: transform 0.2s, background 0.2s;
}

.primary-button:hover {
    transform: translateY(-2px);
    background: #000;
}

.primary-button:active {
    transform: translateY(0);
}

.link-button {
    margin-top: 20px;
    border: none;
    background: transparent;
    color: var(--muted);
    font-weight: 600;
    font-size: 14px;
    transition: color 0.2s;
}
.link-button:hover {
    color: var(--text);
}

/* ========================================================= */
/* HEADER & TOPBAR */
/* ========================================================= */
.topbar {
    height: 72px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--card);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 10;
}

.header-brand {
    display: flex;
    flex-direction: column;
}

.header-brand strong {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--text);
}

.header-brand .header-subtitle {
    font-size: 11px;
    color: var(--green);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.topbar small {
    display: none;
}

.top-actions {
    display: flex;
    gap: 8px;
}
.top-actions button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--background);
    color: var(--text);
    display: grid;
    place-items: center;
    transition: all 0.2s;
}
.top-actions button:hover {
    background: var(--border);
}

/* ========================================================= */
/* MAIN CONTENT */
/* ========================================================= */
main {
    padding: 24px 24px 100px 24px;
    max-width: 800px;
    margin: 0 auto;
}

#greetingText {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
}

/* HERO SECTION (ENERGY) */
.hero {
    background: linear-gradient(135deg, var(--green-dark) 0%, #047857 100%);
    border-radius: 20px;
    padding: 24px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 10px 25px -5px rgba(6, 95, 70, 0.4);
    position: relative;
    overflow: hidden;
}

.hero::after {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 150px;
    height: 150px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
}

.hero h2 {
    font-size: 24px;
    font-weight: 700;
}
.hero h2 span {
    color: var(--green-light);
}

.hero p {
    font-size: 14px;
    opacity: 0.9;
    font-weight: 500;
}

.hero-sun {
    font-size: 48px;
    z-index: 1;
}

/* ========================================================= */
/* BAY CARDS */
/* ========================================================= */
.section-title {
    margin: 32px 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.section-title h2 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
}
.section-title p {
    font-size: 13px;
    color: var(--muted);
    margin: 4px 0 0 0;
}
.section-title strong {
    background: var(--card);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
}

.bays-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
}

.bay-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.bay-card:disabled {
    cursor: not-allowed;
    opacity: 0.8;
}

.bay-card.available:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(16, 185, 129, 0.3);
    border-color: var(--green);
}

.bay-card strong {
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
}

.bay-card .bay-icon {
    font-size: 28px;
    margin: 16px 0 8px;
}

.bay-card span:nth-of-type(2) { /* "Universal" text */
    font-size: 13px;
    color: var(--muted);
    font-weight: 500;
}

.bay-card small {
    margin-top: 12px;
    font-weight: 700;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 20px;
    display: inline-block;
}

/* Bay Status Colors */
.bay-card.available small {
    background: var(--green-light);
    color: var(--green-dark);
}
.bay-card.available {
    border-bottom: 4px solid var(--green);
}

.bay-card.occupied small {
    background: var(--red-light);
    color: var(--red);
}
.bay-card.occupied {
    border-bottom: 4px solid var(--red);
}

.bay-card.reserved small {
    background: var(--yellow-light);
    color: var(--yellow);
}
.bay-card.reserved {
    border-bottom: 4px solid var(--yellow);
}

.bay-card.offline small {
    background: var(--gray-light);
    color: var(--gray);
}
.bay-card.offline {
    border-bottom: 4px solid var(--gray);
}


/* ========================================================= */
/* BOTTOM NAV */
/* ========================================================= */
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--card);
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-around;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    z-index: 100;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
}

.nav-button {
    background: transparent;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    color: var(--muted);
    font-weight: 600;
    font-size: 12px;
    transition: all 0.2s;
    padding: 8px;
    border-radius: 12px;
}

.nav-button .icon {
    font-size: 22px;
    transition: transform 0.2s;
}

.nav-button.active {
    color: var(--green);
}
.nav-button.active .icon {
    transform: translateY(-2px);
}
.nav-button:hover {
    background: var(--gray-light);
}

/* ========================================================= */
/* QR SCANNER & MAP */
/* ========================================================= */
#qr-reader {
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
    border: none !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
#qr-reader__dashboard_section_csr button {
    background: var(--text) !important;
    color: white !important;
    border-radius: 8px !important;
    border: none !important;
    padding: 8px 16px !important;
}

.map-container {
    width: 100%;
    height: 250px;
    border-radius: 16px;
    background: #e2e8f0;
    display: grid;
    place-items: center;
    color: var(--muted);
    font-weight: 600;
    margin-top: 16px;
}

/* RESPONSIVE DESKTOP */
@media (min-width: 768px) {
    .bays-grid {
        grid-template-columns: repeat(4, 1fr);
    }
    .bottom-nav {
        display: none; /* Hide bottom nav on desktop if you want, or just leave it. Assuming we keep it */
    }
    main {
        padding-top: 40px;
    }
}
"""

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(new_css)
print("CSS updated successfully")
