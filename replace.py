import re

with open('frontend/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace bottom nav emojis with SVGs
html = html.replace('<div class="nav-icon" aria-hidden="true">🏠</div>', '<div class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg></div>')
html = html.replace('<div class="nav-icon" aria-hidden="true">▣</div>', '<div class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M7 7h1v1H7zM16 7h1v1h-1zM7 16h1v1H7zM16 16h1v1h-1z"></path></svg></div>')
html = html.replace('<div class="nav-icon" aria-hidden="true">📍</div>', '<div class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>')
html = html.replace('<div class="nav-icon" aria-hidden="true">💬</div>', '<div class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>')

# Simplify Hero card
hero_old = """<div class="hero" style="margin-bottom: 25px;">
                    <div>
                        <h2 style="margin:0; font-size: 24px; font-weight: 800;">Energía <span style="color:#86efac;">100% solar</span></h2>
                        <p style="opacity: 0.88; margin-top:6px; font-size:13px; font-weight:500;">Sostenibilidad en movimiento</p>
                    </div>
                    <div class="hero-sun" style="color: #fff;">
                        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                        </svg>
                    </div>
                </div>"""

hero_new = """<div class="hero">
                    <div>
                        <h2>Energía <span>100% renovable</span></h2>
                        <p>Sostenibilidad en movimiento</p>
                    </div>
                    <div class="hero-sun">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/></svg>
                    </div>
                </div>"""
html = html.replace(hero_old, hero_new)

# Simplify Solar card
solar_old = """<div class="solar-points-card" role="region" aria-label="Puntos por energía solar" style="margin-top: 28px; background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%); border: 2px solid #f5c842; border-radius: 18px; padding: 20px 18px 18px 18px; box-shadow: 0 4px 18px rgba(245,200,66,0.13); position: relative; overflow: hidden;">
                    <div style="position:absolute; top:-18px; right:-18px; font-size: 72px; opacity: 0.10; pointer-events:none; user-select:none;">☀️</div>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 13px; font-weight: 700; color: #b07d00; background: #fff3cc; border-radius: 20px; padding: 2px 10px; border: 1px solid #f5c842; letter-spacing: 0.5px;">03</span>
                        <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #7a5200; display: flex; align-items: center; gap: 6px;">Puntos por energía solar ☀️</h3>
                    </div>
                    <ul style="margin: 0; padding-left: 18px; color: #6b4800; font-size: 14px; line-height: 1.8;">
                        <li>Ganas puntos al cargar</li>
                        <li>Convertibles en beneficios universitarios</li>
                    </ul>
                </div>"""

solar_new = """<div class="solar-points-card" role="region" aria-label="Puntos por energía solar">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                        <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: var(--text);">Puntos acumulados</h3>
                        <span style="font-size: 12px; font-weight: 700; color: var(--yellow); background: var(--yellow-light); border-radius: 20px; padding: 2px 8px; border: 1px solid var(--yellow-border);">3 Pts</span>
                    </div>
                    <p style="margin: 0; color: var(--muted); font-size: 12px; line-height: 1.5;">Ganas puntos al cargar y cuidas el medio ambiente.</p>
                </div>"""
html = html.replace(solar_old, solar_new)

# Simplify Admin Icon ⚡
html = html.replace('<div class="admin-logo">⚡</div>', '<div class="admin-logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>')

# Auth logo replacements to simple lightning
logo_old = """<div class="brand-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg></div>"""
logo_new = """<div class="brand-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>"""
html = html.replace(logo_old, logo_new)

with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
