/* ============================================================
   PROFILE PANEL — Interactive user profile with photo, points,
   delete account, and smooth animations.
   ============================================================ */

let profilePanelOpen = false;

// ─── Open / Close ──────────────────────────────────────────
function toggleProfilePanel() {
    const panel = document.getElementById('profilePanel');
    const backdrop = document.getElementById('profileBackdrop');
    if (!panel || !backdrop) return;
    profilePanelOpen = !profilePanelOpen;
    if (profilePanelOpen) {
        panel.classList.remove('hidden');
        backdrop.classList.remove('hidden');
        requestAnimationFrame(() => {
            panel.classList.add('profile-panel-open');
            backdrop.classList.add('profile-backdrop-visible');
        });
        loadProfileData();
    } else {
        closeProfilePanel();
    }
}

function closeProfilePanel() {
    const panel = document.getElementById('profilePanel');
    const backdrop = document.getElementById('profileBackdrop');
    if (!panel || !backdrop) return;
    profilePanelOpen = false;
    panel.classList.remove('profile-panel-open');
    backdrop.classList.remove('profile-backdrop-visible');
    setTimeout(() => {
        panel.classList.add('hidden');
        backdrop.classList.add('hidden');
    }, 350);
}

// ─── Load Profile Data from API ────────────────────────────
async function loadProfileData() {
    try {
        const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error('Error cargando perfil');
        const user = await res.json();

        // Update local storage with fresh data
        localStorage.setItem('RideNow_user', JSON.stringify(user));

        renderProfilePanel(user);
    } catch (err) {
        console.error('Error loading profile:', err);
        // Fallback: use local data
        const user = getUser();
        if (user) renderProfilePanel(user);
    }
}

// ─── Render Profile Panel Content ──────────────────────────
function renderProfilePanel(user) {
    const container = document.getElementById('profileContent');
    if (!container) return;

    const initials = getInitials(user.name, user.last_name);
    const photo = user.profile_photo;
    const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : 'Hace poco';

    const pointsLevel = getPointsLevel(user.points || 0);

    container.innerHTML = `
        <!-- Close Button -->
        <button class="profile-close-btn" onclick="closeProfilePanel()" aria-label="Cerrar perfil">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <!-- Profile Header -->
        <div class="profile-header-section">
            <div class="profile-avatar-wrap" onclick="triggerPhotoUpload()">
                ${photo
                    ? `<img src="${photo}" alt="Foto de perfil" class="profile-avatar-img" />`
                    : `<div class="profile-avatar-initials">${initials}</div>`
                }
                <div class="profile-avatar-overlay">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>Cambiar</span>
                </div>
            </div>
            <input type="file" id="profilePhotoInput" accept="image/*" style="display:none" onchange="handlePhotoUpload(event)">
            <h2 class="profile-name">${user.name} ${user.last_name || ''}</h2>
            <p class="profile-email">${user.email}</p>
            <div class="profile-role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">
                ${user.role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
            </div>
        </div>

        <!-- Points Section -->
        <div class="profile-points-section">
            <div class="profile-points-header">
                <div class="profile-points-icon">⚡</div>
                <div>
                    <div class="profile-points-value">${user.points || 0}</div>
                    <div class="profile-points-label">Puntos acumulados</div>
                </div>
            </div>
            <div class="profile-points-bar-wrap">
                <div class="profile-points-bar" style="width: ${Math.min((user.points || 0) / pointsLevel.next * 100, 100)}%"></div>
            </div>
            <div class="profile-points-level">
                <span class="profile-level-badge">${pointsLevel.emoji} ${pointsLevel.name}</span>
                <span class="profile-level-next">${pointsLevel.next - (user.points || 0)} pts para ${pointsLevel.nextName}</span>
            </div>
            <div class="profile-points-info">
                <div class="profile-points-info-item">
                    <span>🔋</span>
                    <span>+3 pts por cada carga completada</span>
                </div>
                <div class="profile-points-info-item">
                    <span>☀️</span>
                    <span>Cuidas el planeta con energía solar</span>
                </div>
            </div>
        </div>

        <!-- User Info Section -->
        <div class="profile-info-section">
            <h3 class="profile-section-title">Información</h3>
            <div class="profile-info-row">
                <span class="profile-info-icon">🚗</span>
                <span class="profile-info-label">Vehículo</span>
                <span class="profile-info-value">${user.vehicle_type || 'No definido'}</span>
            </div>
            <div class="profile-info-row">
                <span class="profile-info-icon">📅</span>
                <span class="profile-info-label">Miembro desde</span>
                <span class="profile-info-value">${memberSince}</span>
            </div>
            <div class="profile-info-row">
                <span class="profile-info-icon">🔑</span>
                <span class="profile-info-label">Rol</span>
                <span class="profile-info-value">${user.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
            </div>
        </div>

        <!-- Actions Section -->
        <div class="profile-actions-section">
            <button class="profile-action-btn profile-action-logout" onclick="profileLogout()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
            </button>
            <button class="profile-action-btn profile-action-delete" onclick="profileDeleteAccount()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Eliminar cuenta
            </button>
        </div>

        <!-- Version -->
        <p class="profile-version">ELECTRA v1.0 — Energía solar inteligente ☀️</p>
    `;

    // Animate elements in
    animateProfileItems();

    // Update the header avatar too
    updateHeaderAvatar(user);
}

// ─── Points Level System ───────────────────────────────────
function getPointsLevel(points) {
    if (points >= 100) return { name: 'Leyenda Solar', emoji: '🌟', next: 150, nextName: 'Máximo' };
    if (points >= 50)  return { name: 'Eco Champion', emoji: '🏆', next: 100, nextName: 'Leyenda Solar' };
    if (points >= 25)  return { name: 'Cargador Pro', emoji: '⚡', next: 50,  nextName: 'Eco Champion' };
    if (points >= 10)  return { name: 'Explorador', emoji: '🌱', next: 25,  nextName: 'Cargador Pro' };
    return { name: 'Novato', emoji: '🌿', next: 10, nextName: 'Explorador' };
}

// ─── Initials ──────────────────────────────────────────────
function getInitials(name, lastName) {
    const first = (name || '').charAt(0).toUpperCase();
    const last = (lastName || '').charAt(0).toUpperCase();
    return first + last || first || '?';
}

// ─── Update header avatar ──────────────────────────────────
function updateHeaderAvatar(user) {
    const avatarBtn = document.getElementById('profileAvatarBtn');
    if (!avatarBtn) return;
    const photo = user.profile_photo;
    const initials = getInitials(user.name, user.last_name);
    if (photo) {
        avatarBtn.innerHTML = `<img src="${photo}" alt="Perfil" class="header-avatar-img" />`;
    } else {
        avatarBtn.innerHTML = `<span class="header-avatar-initials">${initials}</span>`;
    }
}

// ─── Trigger Photo Upload ──────────────────────────────────
function triggerPhotoUpload() {
    const input = document.getElementById('profilePhotoInput');
    if (input) input.click();
}

// ─── Handle Photo Upload ───────────────────────────────────
async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
        showProfileToast('❌ Solo se permiten imágenes', 'error');
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showProfileToast('❌ La imagen debe ser menor a 2MB', 'error');
        return;
    }

    // Show loading
    const avatarWrap = document.querySelector('.profile-avatar-wrap');
    if (avatarWrap) avatarWrap.classList.add('uploading');

    try {
        const base64 = await fileToBase64(file);

        const res = await fetch('/api/auth/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ profile_photo: base64 })
        });

        if (!res.ok) throw new Error('Error subiendo foto');

        const data = await res.json();
        localStorage.setItem('RideNow_user', JSON.stringify(data.user));

        // Update avatar immediately
        renderProfilePanel(data.user);
        updateHeaderAvatar(data.user);

        showProfileToast('✅ Foto actualizada', 'success');
    } catch (err) {
        console.error(err);
        showProfileToast('❌ Error subiendo la foto', 'error');
    } finally {
        if (avatarWrap) avatarWrap.classList.remove('uploading');
    }
}

// ─── File to Base64 ────────────────────────────────────────
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        // Create a canvas to resize the image
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 256;
                let w = img.width, h = img.height;
                if (w > h) { h = h * maxSize / w; w = maxSize; }
                else { w = w * maxSize / h; h = maxSize; }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/webp', 0.8));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ─── Logout ────────────────────────────────────────────────
function profileLogout() {
    closeProfilePanel();
    setTimeout(() => {
        if (typeof stopGeoWatch === 'function') stopGeoWatch();
        clearSession();
        showLogin();
    }, 400);
}

// ─── Delete Account ────────────────────────────────────────
async function profileDeleteAccount() {
    // Show custom confirm dialog
    const confirmed = await showProfileConfirm(
        '⚠️ Eliminar cuenta',
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es permanente y no se puede deshacer. Todos tus datos, reservas y puntos se perderán.'
    );
    if (!confirmed) return;

    const deleteBtn = document.querySelector('.profile-action-delete');
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = `<span class="profile-spinner"></span> Eliminando...`;
    }

    try {
        const res = await fetch('/api/auth/me', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (res.ok) {
            showProfileToast('✅ Cuenta eliminada exitosamente', 'success');
            setTimeout(() => {
                clearSession();
                closeProfilePanel();
                showLogin();
            }, 1500);
        } else {
            const data = await res.json();
            showProfileToast(`❌ ${data.error || 'Error eliminando la cuenta'}`, 'error');
        }
    } catch (error) {
        showProfileToast('❌ Error de conexión', 'error');
    } finally {
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Eliminar cuenta`;
        }
    }
}

// ─── Custom Confirm Dialog ─────────────────────────────────
function showProfileConfirm(title, message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'profile-confirm-overlay';
        overlay.innerHTML = `
            <div class="profile-confirm-card">
                <div class="profile-confirm-icon">⚠️</div>
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="profile-confirm-actions">
                    <button class="profile-confirm-cancel">Cancelar</button>
                    <button class="profile-confirm-delete">Sí, eliminar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('visible'));

        overlay.querySelector('.profile-confirm-cancel').onclick = () => {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 300);
            resolve(false);
        };
        overlay.querySelector('.profile-confirm-delete').onclick = () => {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 300);
            resolve(true);
        };
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('visible');
                setTimeout(() => overlay.remove(), 300);
                resolve(false);
            }
        });
    });
}

// ─── Toast Notification ────────────────────────────────────
function showProfileToast(message, type = 'success') {
    const existing = document.querySelector('.profile-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `profile-toast profile-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ─── Animate profile items cascade ─────────────────────────
function animateProfileItems() {
    const items = document.querySelectorAll('.profile-header-section, .profile-points-section, .profile-info-section, .profile-actions-section');
    items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        setTimeout(() => {
            item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + i * 80);
    });
}

// ─── Initialize profile avatar on app load ─────────────────
function initProfileAvatar() {
    const user = getUser();
    if (user) {
        updateHeaderAvatar(user);
    }
}
