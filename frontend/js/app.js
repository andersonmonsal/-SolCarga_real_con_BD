let bays = [];
let currentScreen = "home";
let selectedVehicleType = "Patineta"; // default
const socket = io();

document.addEventListener("DOMContentLoaded", () => {
    setupAccessibility();
    translatePage();
    setupNavigation();
    setupAuth();
    setupAI();
    loadSavedTheme();
    setupPasswordStrength();



    if (getToken()) {
        showApp();
    } else {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('bahia')) {
            sessionStorage.setItem('pendingBay', urlParams.get('bahia'));
        }
        showLogin();
    }
});

function setupAuth() {
    document.getElementById("loginForm").addEventListener("submit", async event => {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        
        // Find which role is active in UI
        const activeBtn = document.querySelector(".role-btn.active");
        const requestedRole = activeBtn && activeBtn.textContent.toLowerCase().includes('admin') ? 'admin' : 'user';

        try {
            await login(email, password, requestedRole);
            showApp();
        } catch (error) {
            if (error.needsVerification) {
                showVerifyEmail(email);
            } else {
                document.getElementById("loginMessage").textContent = error.message;
            }
        }
    });

    document.getElementById("registerForm").addEventListener("submit", async event => {
        event.preventDefault();
        
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("registerConfirmPassword").value;
        
        if (password !== confirmPassword) {
            document.getElementById("registerMessage").textContent = t("passwordsNoMatch");
            return;
        }

        if (password.length < 8) {
            document.getElementById("registerMessage").textContent = t("passwordMinLength");
            return;
        }

        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/\\~`"]/;
        if (!specialCharRegex.test(password)) {
            document.getElementById("registerMessage").textContent = t("passwordNeedSpecial");
            return;
        }

        try {
            await register(
                document.getElementById("registerName").value,
                document.getElementById("registerLastName").value,
                document.getElementById("registerEmail").value,
                password,
                document.getElementById("vehicleType").value
            );
            // Login directly
            showApp();
        } catch (error) {
            document.getElementById("registerMessage").textContent = error.message;
        }
    });
    
    // Verify Email Form
    const verifyForm = document.getElementById("verifyEmailForm");
    if (verifyForm) {
        verifyForm.addEventListener("submit", async event => {
            event.preventDefault();
            const code = document.getElementById("verifyCode").value;
            const email = document.getElementById("verifyEmailAddress").value;
            try {
                const res = await verifyEmail(email, code);
                alert(res.message);
                showLogin();
            } catch (error) {
                document.getElementById("verifyMessage").textContent = error.message;
            }
        });
    }

    // Forgot Password Form
    const forgotForm = document.getElementById("forgotPasswordForm");
    if (forgotForm) {
        forgotForm.addEventListener("submit", async event => {
            event.preventDefault();
            const email = document.getElementById("forgotEmail").value;
            try {
                const res = await forgotPassword(email);
                alert(res.message);
                showResetPassword();
            } catch (error) {
                document.getElementById("forgotMessage").textContent = error.message;
            }
        });
    }

    // Reset Password Form
    const resetForm = document.getElementById("resetPasswordForm");
    if (resetForm) {
        resetForm.addEventListener("submit", async event => {
            event.preventDefault();
            const token = document.getElementById("resetToken").value;
            const newPassword = document.getElementById("newPassword").value;
            try {
                const res = await resetPassword(token, newPassword);
                alert(res.message);
                showLogin();
            } catch (error) {
                document.getElementById("resetMessage").textContent = error.message;
            }
        });
    }

    document.getElementById("showRegister").onclick = () => {
        document.getElementById("loginView").classList.add("hidden");
        document.getElementById("registerView").classList.remove("hidden");
    };

    document.getElementById("showLogin").onclick = () => {
        document.getElementById("loginView").classList.remove("hidden");
        document.getElementById("registerView").classList.add("hidden");
    };

    document.getElementById("logoutButton").onclick = () => {
        if (typeof stopGeoWatch === 'function') stopGeoWatch();
        clearSession();
        showLogin();
    };
}

function showLogin() {
    document.querySelectorAll(".auth-view").forEach(v => v.classList.add("hidden"));
    document.getElementById("loginView").classList.remove("hidden");
    document.getElementById("appView").classList.add("hidden");
    const adminView = document.getElementById("adminView");
    if (adminView) adminView.classList.add("hidden");
}

function showVerifyEmail(email) {
    document.querySelectorAll(".auth-view").forEach(v => v.classList.add("hidden"));
    document.getElementById("verifyEmailView").classList.remove("hidden");
    document.getElementById("verifyEmailAddress").value = email;
}

window.showForgotPassword = function() {
    document.querySelectorAll(".auth-view").forEach(v => v.classList.add("hidden"));
    document.getElementById("forgotPasswordView").classList.remove("hidden");
}

window.showResetPassword = function() {
    document.querySelectorAll(".auth-view").forEach(v => v.classList.add("hidden"));
    document.getElementById("resetPasswordView").classList.remove("hidden");
}

function showApp() {
    document.getElementById("loginView").classList.add("hidden");
    document.getElementById("registerView").classList.add("hidden");

    const user = getUser();

    // Redirect admin to admin panel
    if (user && user.role === "admin") {
        document.getElementById("appView").classList.add("hidden");
        document.getElementById("adminView").classList.remove("hidden");
        document.getElementById("adminUserName").textContent = user.name;
        initAdminPanel();
        return;
    }

    document.getElementById("adminView").classList.add("hidden");
    document.getElementById("appView").classList.remove("hidden");

    if (user) {
        document.getElementById("welcomeUser").textContent = `RideNow`;
        document.getElementById("greetingText").textContent = `${t("greeting")}, ${user.name} 👋`;
    }

    loadBays().then(() => {
        const urlParams = new URLSearchParams(window.location.search);
        let pendingBay = urlParams.get('bahia') || sessionStorage.getItem('pendingBay');
        
        if (pendingBay && user && user.role !== 'admin') {
            sessionStorage.removeItem('pendingBay');
            const bay = bays.find(b => b.code === pendingBay);
            if (bay && bay.status === 'available') {
                openReservation(bay);
            } else {
                // If it's not available, check if the user actually holds this reservation to auto-checkin
                getMyReservation().then(myRes => {
                    if (myRes && myRes.bay === pendingBay && myRes.status === 'active') {
                        confirmCheckin(pendingBay).then(() => {
                            showPage("qr"); // Will show the check-in success inside the QR screen
                        }).catch(e => alert(e.message));
                    } else {
                        const msg = t("bayNotAvailable").replace("{bay}", pendingBay);
                        alert(msg);
                    }
                });
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    });
    loadReservation();
    loadStation();

    // Start GPS proximity detection
    if (typeof startGeoWatch === 'function') startGeoWatch();
}

function setupNavigation() {
    document.querySelectorAll(".nav-button").forEach(button => {
        button.addEventListener("click", () => showPage(button.dataset.page));
    });

    document.getElementById("backHome").onclick = () => showPage("home");
    document.getElementById("languageButton").onclick = toggleLanguage;
    document.getElementById("accessibilityButton").onclick = () => document.getElementById("accessibilityModal").classList.remove("hidden");
    document.getElementById("closeAccessibility").onclick = () => document.getElementById("accessibilityModal").classList.add("hidden");

    // Theme toggle
    const themeBtn = document.getElementById("themeToggleButton");
    if (themeBtn) {
        themeBtn.onclick = toggleTheme;
    }
}

// ============================================
// LOGIN ROLE SELECTOR
// ============================================

window.selectLoginRole = function(role) {
    const buttons = document.querySelectorAll(".role-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    // Find the correct button and activate it by data-i18n key
    const activeBtn = Array.from(buttons).find(b => b.dataset.i18n === (role === 'user' ? 'roleUser' : 'roleAdmin'));
    if (activeBtn) activeBtn.classList.add("active");

    const subtitle = document.getElementById("loginSubtitle");
    const switchRegisterBtn = document.querySelector("#loginView .link-button"); // The "Create an account" button

    if (role === 'admin') {
        if (subtitle) subtitle.textContent = t("loginSubtitleAdmin");
        document.querySelectorAll(".professional-card").forEach(el => el.style.borderTopColor = "var(--red)");
        document.querySelectorAll(".brand-icon").forEach(el => {
            el.style.color = "var(--red)";
            el.style.background = "#fee2e2";
        });
        
        // Admins cannot register from the public portal
        if (switchRegisterBtn) switchRegisterBtn.style.display = "none";
        
        // Force back to login view if they were on register view
        if (currentScreen === "register") {
            document.getElementById("registerView").classList.add("hidden");
            document.getElementById("loginView").classList.remove("hidden");
            currentScreen = "login";
        }
    } else {
        if (subtitle) subtitle.textContent = t("loginSubtitle");
        document.querySelectorAll(".professional-card").forEach(el => el.style.borderTopColor = "var(--green)");
        document.querySelectorAll(".brand-icon").forEach(el => {
            el.style.color = "var(--green)";
            el.style.background = "var(--green-light)";
        });
        
        // Normal users can register
        if (switchRegisterBtn) switchRegisterBtn.style.display = "block";
    }
}

function showPage(page) {
    currentScreen = page;
    document.querySelectorAll(".page-section").forEach(section => section.classList.add("hidden"));
    
    const section = document.getElementById(`${page}Section`);
    if (section) {
        section.classList.remove("hidden");
        // Anunciar cambio de pantalla
        const titles = {
            home:        currentLanguage === "es" ? "Pantalla de inicio" : "Home screen",
            location:    currentLanguage === "es" ? "Ubicación de la estación" : "Station location",
            qr:          currentLanguage === "es" ? "Tu reserva y código QR" : "Your reservation and QR code",
            ai:          currentLanguage === "es" ? "Asistente RideBot" : "RideBot Assistant",
            reservation: currentLanguage === "es" ? "Confirmar reserva" : "Confirm reservation"
        };
        speak(titles[page] || "");

        // Set aria-current on nav buttons
        document.querySelectorAll(".nav-button").forEach(btn => {
            btn.setAttribute("aria-current", btn.dataset.page === page ? "page" : "false");
        });
    }

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    if (page === "qr")   loadReservation();
    if (page === "home") loadBays();
}

async function loadBays() {
    try {
        const response = await fetch("/api/bays");
        bays = await response.json();
        if (currentScreen === "home") renderBays();
    } catch (error) {
        console.error(error);
    }
}

function renderBays() {
    const grid = document.getElementById("baysGrid");
    grid.innerHTML = "";
    
    const available = bays.filter(bay => bay.status === "available").length;
    document.getElementById("availableCount").textContent = `${available} / ${bays.length}`;

    bays.forEach(bay => {
        const button = document.createElement("button");
        button.className = `bay-card ${bay.status}`;
        button.disabled = bay.status !== "available";
        button.setAttribute("aria-label", `Puerto ${bay.code}. ${bay.status}`);
        button.setAttribute("role", "listitem");

        const statusLabel = translateStatus(bay.status);

        button.innerHTML = `
            <div class="bay-card-top">
                <span class="bay-code">${bay.code}</span>
                <span class="bay-status-pill">${statusLabel}</span>
            </div>
            <div class="bay-icon-wrap" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div class="bay-card-info">
                <span class="bay-connector">Universal</span>
                <span class="bay-type">Conector estándar</span>
            </div>
        `;
        if (bay.status === "available") button.onclick = () => openReservation(bay);
        grid.appendChild(button);
    });
}

function translateStatus(status) {
    const map = {
        available: "statusAvailable",
        occupied:  "statusOccupied",
        reserved:  "statusReserved",
        offline:   "statusOffline"
    };
    return t(map[status] || status);
}

function openReservation(bay) {
    selectedBay = bay;
    selectedDuration = "1 h";
    selectedVehicleType = "Patineta"; // reset to default
    const bayLabel = t("bayLabel");
    const universalLabel = t("universalConnector");
    document.getElementById("selectedBay").innerHTML = `
        <div class="selected-bay">
            <strong>${bayLabel} ${bay.code}</strong>
            <span>⚡ ${bayLabel} ${universalLabel}</span>
        </div>
    `;
    // Reset vehicle selector UI
    document.querySelectorAll('.vehicle-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vehicle === 'Patineta');
    });
    renderOptions();
    showPage("reservation");
}

window.selectVehicle = function(type) {
    selectedVehicleType = type;
    document.querySelectorAll('.vehicle-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vehicle === type);
    });
};

function renderOptions() {
    // Chips removed, inputs handle this now natively
}

document.getElementById("confirmReservation").onclick = async () => {
    try {
        const timeInput = document.getElementById("arrivalInput").value;
        const departureInput = document.getElementById("departureInput").value;
        if (!timeInput || !departureInput) {
            throw new Error(t("selectTimes"));
        }
        
        const [arrHours] = timeInput.split(":");
        const arrInt = parseInt(arrHours, 10);
        
        const [depHours] = departureInput.split(":");
        const depInt = parseInt(depHours, 10);
        
        if (arrInt < 5 || arrInt >= 22 || depInt < 5 || depInt >= 22) {
            throw new Error(t("operatingHours"));
        }

        if (timeInput >= departureInput) {
            throw new Error(t("departureAfterArrival"));
        }

        selectedArrival = timeInput;
        selectedDuration = departureInput;
        const data = await createReservation(selectedVehicleType);
        
        // Show beautiful confirmation modal
        showReservationConfirmModal(data.reservation);
        speak(t("reservationConfirmedMsg"));
    } catch (error) {
        showErrorModal(error.message);
        speak(error.message);
    }
};

async function loadReservation() {
    const reservation = await getMyReservation();
    if (!reservation) {
        document.getElementById("qrContainer").innerHTML = `
            <div class="empty-state">
                <div style="font-size:30px; margin-bottom:10px">▣</div>
                <h3>${t("noReservation")}</h3>
                <p>${t("noReservationDesc")}</p>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:15px;">
                    <button class="primary-button" onclick="showPage('home')" style="width: auto; padding: 10px 20px;">${t("viewMap")}</button>
                    <button class="link-button" onclick="openCheckinScanner('book')" style="margin: 0; padding: 10px; border: 1px solid var(--border); border-radius: 8px;">${t("scanAtStation")}</button>
                </div>
            </div>
        `;
        document.getElementById("qrBadge").classList.add("hidden");
        return;
    }
    document.getElementById("qrBadge").classList.remove("hidden");
    renderReservation(reservation, reservation.qr);
}

function renderReservation(reservation, qr) {
    const isActive = reservation.status === "active";
    const isCheckedIn = reservation.status === "checked_in";

    // Build status badge
    let statusBadge = "";
    if (isCheckedIn) {
        statusBadge = `<div class="checkin-badge">${t("charging")}</div>`;
    }

    // Build check-in button (only show if active, not yet checked in)
    const checkinBtn = isActive ? `
        <button id="checkinBtn" class="checkin-button" onclick="openCheckinScanner()" style="margin-top: 18px;">
            ${t("confirmArrival")}
        </button>
        <p class="checkin-hint-small">${t("confirmArrivalHint")}</p>
    ` : "";

    document.getElementById("qrContainer").innerHTML = `
        <div class="qr-card">
            <h3>${t("reservationConfirmed")}</h3>
            ${statusBadge}
            <img src="${qr}" alt="${t("myQR")} ${reservation.code}">
            <strong>${reservation.code}</strong>
            <div class="reservation-details">
                <p><span>${t("bay")}</span><strong>${reservation.bay}</strong></p>
                <p><span>${t("vehicle")}</span><strong>${reservation.vehicle_type}</strong></p>
                <p><span>${t("arrival")}</span><strong>${reservation.arrival}</strong></p>
                <p><span>${t("duration")}</span><strong>${reservation.duration}</strong></p>
            </div>
            ${checkinBtn}
            ${isActive ? `<button id="cancelReservation" class="danger-button" style="margin-top:12px">${t("cancelReservation")}</button>` : ""}
        </div>
    `;

    if (isActive) {
        document.getElementById("cancelReservation").onclick = () => {
            showCancelModal(reservation.id);
        };
    }
}

async function loadStation() {
    try {
        const response = await fetch("/api/station");
        const station = await response.json();
        if (response.ok) {
            document.getElementById("stationName").textContent = station.name;
            document.getElementById("stationAddress").textContent = station.address;
            document.getElementById("stationHours").textContent = station.opening_hours;
        }
    } catch (error) {
        console.error("Error cargando estación", error);
    }
}

function setupAI() {
    document.getElementById("aiForm").addEventListener("submit", async event => {
        event.preventDefault();
        const input = document.getElementById("aiInput");
        const message = input.value.trim();
        if (!message || isTyping) return;

        addAIMessage(message, "user");
        input.value = "";
        input.disabled = true;

        showTypingIndicator();

        try {
            const answer = await askRideBot(message);
            removeTypingIndicator();
            // answer is null in support mode (admin will reply live)
            if (answer !== null) {
                addAIMessage(answer, "bot");
                speak(answer);
            }
        } catch (error) {
            removeTypingIndicator();
            addAIMessage(error.message, "bot");
            speak(error.message);
        } finally {
            input.disabled = false;
            input.focus();
        }
    });
}

window.sendChip = async function(message) {
    const input = document.getElementById("aiInput");
    if (input) input.value = message;
    document.getElementById("aiForm").dispatchEvent(new Event("submit"));
};

socket.on("bayUpdated", async () => {
    await loadBays();
    // Also refresh QR section if visible and user has a reservation
    if (currentScreen === "qr") {
        await loadReservation();
    }
});

// ============================================
// THEME TOGGLE (Modo oscuro / claro)
// ============================================

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "normal" : "dark";
    body.setAttribute("data-theme", newTheme);
    localStorage.setItem("RideNow_theme", newTheme);

    const btn = document.getElementById("themeToggleButton");
    if (btn) {
        btn.textContent = newTheme === "dark" ? "☀️" : "🌙";
        btn.title = newTheme === "dark" ? t("themeLight") : t("themeDark");
    }
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem("RideNow_theme") || "normal";
    document.body.setAttribute("data-theme", savedTheme);

    const btn = document.getElementById("themeToggleButton");
    if (btn) {
        btn.textContent = savedTheme === "dark" ? "☀️" : "🌙";
        btn.title = savedTheme === "dark" ? t("themeLight") : t("themeDark");
    }
}

// ============================================
// PASSWORD STRENGTH INDICATOR
// ============================================

function setupPasswordStrength() {
    const passwordInput = document.getElementById("registerPassword");
    if (!passwordInput) return;

    passwordInput.addEventListener("input", () => {
        const val = passwordInput.value;
        const bars = document.querySelectorAll(".strength-bar");
        const hint = document.getElementById("passwordHint");
        if (!bars.length) return;

        let strength = 0;
        if (val.length >= 8) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/\\~`"]/.test(val)) strength++;
        if (/[A-Z]/.test(val) && /[0-9]/.test(val)) strength++;

        const colors = ["#dc2626", "#f59e0b", "#16a34a"];
        const labels = [t("pwWeak"), t("pwMedium"), t("pwStrong")];

        bars.forEach((bar, i) => {
            bar.style.background = i < strength ? colors[strength - 1] : "var(--border)";
        });

        if (val.length > 0 && hint) {
            const hasLength = val.length >= 8;
            const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:',.<>?\/\\~`"]/.test(val);
            let msg = "";
            if (!hasLength) msg += t("pwMinLength");
            if (!hasSpecial) msg += t("pwNeedSpecial");
            if (hasLength && hasSpecial) msg = t("pwValid") + labels[strength - 1];
            hint.textContent = msg;
            hint.style.color = (hasLength && hasSpecial) ? "#16a34a" : "#dc2626";
        } else if (hint) {
            hint.textContent = t("passwordHint");
            hint.style.color = "var(--muted)";
        }
    });
}

// ============================================
// CHIP i18n HANDLER
// ============================================

/**
 * Sends the chat chip message in the current language.
 * Each chip button has data-chip-es and data-chip-en attributes.
 */
window.sendChipI18n = function(btn) {
    const msg = currentLanguage === "en"
        ? (btn.dataset.chipEn || btn.dataset.chipEs || btn.textContent)
        : (btn.dataset.chipEs || btn.textContent);
    sendChip(msg);
};

// ============================================
// LANGUAGE CHANGED — refresh dynamic content
// ============================================

document.addEventListener("languageChanged", () => {
    // Re-render bays (status labels)
    renderBays();
    // Re-render greeting
    const user = getUser();
    if (user) {
        document.getElementById("greetingText").textContent = `${t("greeting")}, ${user.name} 👋`;
    }
    // If QR section is visible, re-render reservation card
    if (currentScreen === "qr") loadReservation();
});

// ============================================
// MODAL HELPERS — Confirmation & Cancel
// ============================================

function showReservationConfirmModal(reservation) {
    const modal = document.getElementById("reservationModal");
    if (!modal) { showPage("qr"); return; }

    document.getElementById("modalTitle").textContent = "¡Reserva confirmada! 🎉";
    document.getElementById("modalDesc").textContent = "Tu bahía ha sido reservada. Muestra el QR al llegar.";
    document.getElementById("modalDetails").innerHTML = `
        <div class="rn-modal-row"><span>🏷️ Código</span><strong>${reservation.code}</strong></div>
        <div class="rn-modal-row"><span>⚡ Bahía</span><strong>${reservation.bay}</strong></div>
        <div class="rn-modal-row"><span>🚲 Vehículo</span><strong>${reservation.vehicle_type || selectedVehicleType}</strong></div>
        <div class="rn-modal-row"><span>⏰ Llegada</span><strong>${reservation.arrival}</strong></div>
    `;
    const primaryBtn = document.getElementById("modalPrimaryBtn");
    if (primaryBtn) {
        primaryBtn.textContent = "Ver mi QR ▸";
        primaryBtn.onclick = () => { closeReservationModal(); showPage("qr"); loadReservation(); };
    }
    modal.classList.remove("hidden");
    modal.querySelector(".rn-modal-card").focus();
    // Trigger confetti-like animation
    triggerModalSuccess();
}

function showErrorModal(message) {
    const modal = document.getElementById("reservationModal");
    if (!modal) { alert(message); return; }

    const iconEl = document.getElementById("modalIconEl");
    if (iconEl) { iconEl.textContent = "✕"; iconEl.className = "rn-modal-icon danger"; }
    document.getElementById("modalTitle").textContent = "Error";
    document.getElementById("modalDesc").textContent = message;
    document.getElementById("modalDetails").innerHTML = "";
    const primaryBtn = document.getElementById("modalPrimaryBtn");
    if (primaryBtn) { primaryBtn.textContent = "Entendido"; primaryBtn.onclick = closeReservationModal; }
    modal.classList.remove("hidden");
}

function closeReservationModal() {
    const modal = document.getElementById("reservationModal");
    if (modal) modal.classList.add("hidden");
    // Restore icon to success
    const iconEl = document.getElementById("modalIconEl");
    if (iconEl) { iconEl.textContent = "✓"; iconEl.className = "rn-modal-icon success"; }
}

function showCancelModal(reservationId) {
    const modal = document.getElementById("cancelModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    const confirmBtn = document.getElementById("cancelConfirmBtn");
    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            confirmBtn.disabled = true;
            confirmBtn.textContent = "Cancelando...";
            try {
                await cancelMyReservation(reservationId);
                closeCancelModal();
                await loadBays();
                await loadReservation();
                speak(t("reservationCancelledMsg"));

                // Show success notification
                showCancelSuccessToast();
            } catch (error) {
                closeCancelModal();
                showErrorModal(error.message);
                speak(error.message);
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = "Sí, cancelar";
            }
        };
    }
}

function closeCancelModal() {
    const modal = document.getElementById("cancelModal");
    if (modal) modal.classList.add("hidden");
}

function showCancelSuccessToast() {
    const toast = document.createElement("div");
    toast.className = "rn-toast success";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.innerHTML = `✅ Reserva cancelada. La bahía está libre.`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 400); }, 3500);
}

function triggerModalSuccess() {
    // Add pulse animation on modal icon
    const icon = document.getElementById("modalIconEl");
    if (icon) {
        icon.classList.add("icon-pop");
        setTimeout(() => icon.classList.remove("icon-pop"), 600);
    }
}

// Close modals on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeReservationModal();
        closeCancelModal();
    }
});

