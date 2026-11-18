/* ==========================================================================
   ELECTRA — ACCESIBILIDAD Y LECTOR DE PANTALLA INTELIGENTE (AUDIO)
   Síntesis de voz multilingüe (ES / EN) optimizada con segmentación natural,
   detección de mejores voces locales, control de contraste, escalado fluido
   y botón interactivo con estado de reproducción y detención en un clic.
   ========================================================================== */

let fontSize = Number(localStorage.getItem("RideNow_font_size")) || 100;
let voiceEnabled = localStorage.getItem("RideNow_voice") === "true";
let isReadingScreen = false;
let availableVoices = [];

function loadVoices() {
    if ("speechSynthesis" in window) {
        availableVoices = window.speechSynthesis.getVoices() || [];
    }
}
if ("speechSynthesis" in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

function getBestVoice(targetLang) {
    if (!availableVoices.length && "speechSynthesis" in window) {
        availableVoices = window.speechSynthesis.getVoices() || [];
    }
    if (!availableVoices.length) return null;

    const isEn = targetLang.toLowerCase().startsWith("en");
    if (isEn) {
        const enVoice = availableVoices.find(v => v.lang.toLowerCase() === "en-us" || v.lang.toLowerCase() === "en-gb");
        if (enVoice) return enVoice;
        const enPrefix = availableVoices.find(v => v.lang.toLowerCase().startsWith("en"));
        if (enPrefix) return enPrefix;
    } else {
        const esVoice = availableVoices.find(v => v.lang.toLowerCase() === "es-co" || v.lang.toLowerCase() === "es-es" || v.lang.toLowerCase() === "es-us");
        if (esVoice) return esVoice;
        const esPrefix = availableVoices.find(v => v.lang.toLowerCase().startsWith("es"));
        if (esPrefix) return esPrefix;
    }
    return availableVoices[0] || null;
}

function applyFontSize() {
    document.documentElement.style.setProperty("--font-scale", `${fontSize}%`);
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem("RideNow_font_size", fontSize);
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem("RideNow_theme", theme);
}

function applyVoice(enabled) {
    voiceEnabled = enabled;
    localStorage.setItem("RideNow_voice", enabled);
    const onBtn = document.getElementById("voiceOnBtn");
    const offBtn = document.getElementById("voiceOffBtn");
    if (onBtn && offBtn) {
        onBtn.style.border = enabled ? "2px solid var(--accent, #10b981)" : "1px solid var(--border)";
        onBtn.style.background = enabled ? "var(--accent-light, #ecfdf5)" : "transparent";
        offBtn.style.border = !enabled ? "2px solid var(--accent, #10b981)" : "1px solid var(--border)";
        offBtn.style.background = !enabled ? "var(--accent-light, #ecfdf5)" : "transparent";
    }
    if (!enabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setScreenReaderButtonState(false);
    }
}

function cleanSpokenText(text) {
    return String(text || "")
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, " ")
        .replace(/[•→←✓⚠️❌✅📷🗓️🕒🏷️⚡🚪🚲🛴💬📍🚶‍♂️🖨️🗑️]/g, " ")
        .replace(/--:--:--|--°C|--%|-- km\/h/g, " ")
        .replace(/(\r\n|\n|\r)/gm, ". ")
        .replace(/\s+/g, " ")
        .trim();
}

function speak(text, force = false, onEndCallback = null) {
    if (!force && !voiceEnabled) return;
    if (!("speechSynthesis" in window)) {
        console.warn("SpeechSynthesis no soportado en este navegador.");
        return;
    }

    try {
        window.speechSynthesis.cancel();

        const clean = cleanSpokenText(text);
        if (!clean) {
            setScreenReaderButtonState(false);
            if (onEndCallback) onEndCallback();
            return;
        }

        const isEn = typeof currentLanguage !== "undefined" && currentLanguage === "en";
        const targetLang = isEn ? "en-US" : "es-CO";
        const voice = getBestVoice(targetLang);

        // Segmentar en oraciones para evitar el corte por inactividad de SpeechSynthesis en Windows/Chromium
        const rawParts = clean.match(/[^.!?]+[.!?]+|\S+/g) || [clean];
        const chunks = [];
        let currentChunk = "";
        for (const part of rawParts) {
            if ((currentChunk + " " + part).length < 160) {
                currentChunk = currentChunk ? currentChunk + " " + part : part;
            } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = part;
            }
        }
        if (currentChunk) chunks.push(currentChunk);

        let chunkIndex = 0;
        function playNextChunk() {
            if (chunkIndex >= chunks.length) {
                setScreenReaderButtonState(false);
                if (onEndCallback) onEndCallback();
                return;
            }

            const currentText = chunks[chunkIndex++];
            const utterance = new SpeechSynthesisUtterance(currentText);
            utterance.lang = targetLang;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            if (voice) utterance.voice = voice;

            utterance.onend = () => {
                playNextChunk();
            };

            utterance.onerror = (e) => {
                console.warn("SpeechSynthesis error:", e);
                setScreenReaderButtonState(false);
                if (onEndCallback) onEndCallback();
            };

            window.speechSynthesis.speak(utterance);
        }

        playNextChunk();
    } catch (err) {
        console.warn("Error en speak():", err);
        setScreenReaderButtonState(false);
    }
}

function setScreenReaderButtonState(reading) {
    isReadingScreen = reading;
    const btn = document.getElementById("readInterface");
    if (!btn) return;

    if (reading) {
        btn.textContent = (typeof t === "function") ? t("readingScreenNow") : "⏹️ Detener lectura en voz alta";
        btn.classList.add("reading-active");
    } else {
        btn.textContent = (typeof t === "function") ? t("readScreen") : "🔊 Leer pantalla actual (Audio)";
        btn.classList.remove("reading-active");
    }
}

function readCurrentScreenAloud() {
    if (!("speechSynthesis" in window)) {
        alert(currentLanguage === "en" ? "Text-to-speech is not supported on this browser." : "La síntesis de voz no está soportada en este navegador.");
        return;
    }

    // Si ya está leyendo, el clic detiene la voz inmediatamente
    if (isReadingScreen || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setScreenReaderButtonState(false);
        return;
    }

    setScreenReaderButtonState(true);

    const isEn = typeof currentLanguage !== "undefined" && currentLanguage === "en";
    let sectionTitle = "";
    let contentToRead = "";

    // 1. ¿Está abierto el Panel de Perfil?
    const profilePanel = document.getElementById("profilePanel");
    if (profilePanel && !profilePanel.classList.contains("hidden")) {
        sectionTitle = isEn ? "User Profile" : "Perfil de usuario";
        const clone = profilePanel.cloneNode(true);
        clone.querySelectorAll("svg, button, script, style").forEach(el => el.remove());
        contentToRead = clone.innerText;
    }
    // 2. ¿Está abierta la vista Admin?
    else {
        const adminView = document.getElementById("adminView");
        if (adminView && !adminView.classList.contains("hidden")) {
            sectionTitle = isEn ? "ELECTRA Administrator Panel" : "Panel de Administrador ELECTRA";
            const clone = adminView.cloneNode(true);
            clone.querySelectorAll("svg, script, style").forEach(el => el.remove());
            contentToRead = clone.innerText;
        }
        // 3. Vista principal de la App
        else {
            const visibleSection = document.querySelector(".page-section:not(.hidden)");
            if (visibleSection) {
                const heading = visibleSection.querySelector("h1, h2");
                if (heading) sectionTitle = heading.innerText;
                const clone = visibleSection.cloneNode(true);
                clone.querySelectorAll("svg, iframe, script, style, .skip-link").forEach(el => el.remove());
                contentToRead = clone.innerText;
            } else {
                const authView = document.querySelector(".auth-view:not(.hidden), .view:not(.hidden)");
                if (authView) {
                    const heading = authView.querySelector("h1, h2");
                    if (heading) sectionTitle = heading.innerText;
                    const clone = authView.cloneNode(true);
                    clone.querySelectorAll("svg, script, style").forEach(el => el.remove());
                    contentToRead = clone.innerText;
                }
            }
        }
    }

    const intro = isEn
        ? `ELECTRA Smart Solar Station. Active screen: ${sectionTitle || "Main interface"}. `
        : `Estación solar inteligente ELECTRA. Pantalla activa: ${sectionTitle || "Interfaz principal"}. `;

    const fullMessage = intro + (contentToRead || "");
    speak(fullMessage, true, () => {
        setScreenReaderButtonState(false);
    });
}

function setupAccessibility() {
    const savedTheme = localStorage.getItem("RideNow_theme") || "normal";
    applyTheme(savedTheme);
    applyFontSize();
    applyVoice(voiceEnabled);

    document.querySelectorAll("[data-theme]").forEach(button => {
        button.addEventListener("click", () => {
            applyTheme(button.dataset.theme);
            speak(typeof t === "function" ? t("contrastUpdated") : "Modo de contraste actualizado");
        });
    });

    const incBtn = document.getElementById("fontIncrease");
    if (incBtn) {
        incBtn.addEventListener("click", () => {
            fontSize = Math.min(135, fontSize + 8);
            applyFontSize();
            speak(typeof t === "function" ? t("textIncreased") : "Tamaño de texto aumentado");
        });
    }

    const decBtn = document.getElementById("fontDecrease");
    if (decBtn) {
        decBtn.addEventListener("click", () => {
            fontSize = Math.max(85, fontSize - 8);
            applyFontSize();
            speak(typeof t === "function" ? t("textDecreased") : "Tamaño de texto reducido");
        });
    }

    const resBtn = document.getElementById("fontReset");
    if (resBtn) {
        resBtn.addEventListener("click", () => {
            fontSize = 100;
            applyFontSize();
            speak(typeof t === "function" ? t("textReset") : "Tamaño normal restaurado");
        });
    }

    const vOnBtn = document.getElementById("voiceOnBtn");
    if (vOnBtn) {
        vOnBtn.addEventListener("click", () => {
            applyVoice(true);
            speak(typeof t === "function" ? t("voiceEnabledMsg") : "Asistente de voz activado");
        });
    }

    const vOffBtn = document.getElementById("voiceOffBtn");
    if (vOffBtn) {
        vOffBtn.addEventListener("click", () => {
            applyVoice(false);
        });
    }

    const readBtn = document.getElementById("readInterface");
    if (readBtn) {
        readBtn.addEventListener("click", readCurrentScreenAloud);
    }
}
