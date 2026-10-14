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
        year: 'numeric', month: 'short', day: 'numeric'
    }) : 'Reciente';

    const pointsLevel = getPointsLevel(user.points || 0);

    container.innerHTML = `
        <!-- Close Button -->
        <button class="profile-close-btn" onclick="closeProfilePanel()" aria-label="Cerrar perfil">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                ${user.role === 'admin' ? 'Administrador' : 'Usuario'}
            </div>
        </div>

        <!-- Points Section -->
        <div class="profile-points-section">
            <div class="profile-points-header">
                <div class="profile-points-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div>
                    <div class="profile-points-value">${user.points || 0}</div>
                    <div class="profile-points-label">Puntos de energía solar</div>
                </div>
            </div>
            <div class="profile-points-bar-wrap">
                <div class="profile-points-bar" style="width: ${Math.min((user.points || 0) / pointsLevel.next * 100, 100)}%"></div>
            </div>
            <div class="profile-points-level">
                <span class="profile-level-badge">${pointsLevel.name}</span>
                <span class="profile-level-next">${pointsLevel.next - (user.points || 0)} pts para nivel ${pointsLevel.nextName}</span>
            </div>
            <div class="profile-points-info">
                <div class="profile-points-info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2"/></svg>
                    <span>+3 puntos por cada sesión de carga completada</span>
                </div>
                <div class="profile-points-info-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    <span>Consumo 100% compensado con microred fotovoltaica</span>
                </div>
            </div>
        </div>

        <!-- User Info Section -->
        <div class="profile-info-section">
            <h3 class="profile-section-title">Información de cuenta</h3>
            <div class="profile-info-row">
                <span class="profile-info-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                </span>
                <span class="profile-info-label">Vehículo</span>
                <span class="profile-info-value">${user.vehicle_type || 'No especificado'}</span>
            </div>
            <div class="profile-info-row">
                <span class="profile-info-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </span>
                <span class="profile-info-label">Miembro desde</span>
                <span class="profile-info-value">${memberSince}</span>
            </div>
            <div class="profile-info-row">
                <span class="profile-info-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-1.5 6.1L7 20.5a2.12 2.12 0 0 1-3-3L14.4 7.1"/><circle cx="17.5" cy="6.5" r="3.5"/></svg>
                </span>
                <span class="profile-info-label">Rol del sistema</span>
                <span class="profile-info-value">${user.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
            </div>
        </div>

        <!-- Actions Section -->
        <div class="profile-actions-section">
            <button class="profile-action-btn profile-action-logout" onclick="profileLogout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
            </button>
            <button class="profile-action-btn profile-action-delete" onclick="profileDeleteAccount()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Eliminar cuenta
            </button>
        </div>

        <!-- Version -->
        <p class="profile-version">ELECTRA Enterprise Platform • v1.0.4</p>
    `;

    // Animate elements in
    animateProfileItems();

    // Update the header avatar too
    updateHeaderAvatar(user);
}

// ─── Points Level System ───────────────────────────────────
function getPointsLevel(points) {
    if (points >= 100) return { name: 'Nivel 4 — Élite Solar', next: 150, nextName: 'Máximo' };
    if (points >= 50)  return { name: 'Nivel 3 — Avanzado', next: 100, nextName: 'Élite Solar' };
    if (points >= 25)  return { name: 'Nivel 2 — Frecuente', next: 50,  nextName: 'Avanzado' };
    if (points >= 10)  return { name: 'Nivel 1 — Inicial', next: 25,  nextName: 'Frecuente' };
    return { name: 'Nivel Base', next: 10, nextName: 'Inicial' };
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
        'Eliminar cuenta',
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es permanente y no se puede deshacer. Todos tus datos, reservas y puntos acumulados se perderán.'
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
            showProfileToast('Cuenta eliminada exitosamente', 'success');
            setTimeout(() => {
                clearSession();
                closeProfilePanel();
                showLogin();
            }, 1500);
        } else {
            const data = await res.json();
            showProfileToast(data.error || 'Error eliminando la cuenta', 'error');
        }
    } catch (error) {
        showProfileToast('Error de conexión con el servidor', 'error');
    } finally {
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                <div class="profile-confirm-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="profile-confirm-actions">
                    <button class="profile-confirm-cancel">Cancelar</button>
                    <button class="profile-confirm-delete">Confirmar eliminación</button>
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
