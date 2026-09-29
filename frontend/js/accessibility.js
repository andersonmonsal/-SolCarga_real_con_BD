let fontSize = Number(localStorage.getItem("RideNow_font_size")) || 100;
let voiceEnabled = localStorage.getItem("RideNow_voice") === "true";

function applyFontSize() {
    document.documentElement.style.setProperty("--font-scale", `${fontSize}%`);
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
        onBtn.style.border = enabled ? "2px solid var(--green)" : "1px solid var(--border)";
        offBtn.style.border = !enabled ? "2px solid var(--green)" : "1px solid var(--border)";
    }
    
    if (!enabled && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}

function speak(text, force = false) {
    if (!force && !voiceEnabled) return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === "es" ? "es-CO" : "en-US";
    utterance.rate = 0.95;

    window.speechSynthesis.speak(utterance);
}

function setupAccessibility() {
    // Cargar configuración guardada
    const savedTheme = localStorage.getItem("RideNow_theme") || "normal";
    applyTheme(savedTheme);
    applyFontSize();
    applyVoice(voiceEnabled);

    // Eventos de temas
    document.querySelectorAll("[data-theme]").forEach(button => {
        button.addEventListener("click", () => {
            applyTheme(button.dataset.theme);
            speak(currentLanguage === "es" ? "Modo de contraste actualizado" : "Contrast mode updated");
        });
    });

    // Eventos de tamaño de letra
    document.getElementById("fontIncrease").addEventListener("click", () => {
        fontSize = Math.min(140, fontSize + 10);
        applyFontSize();
        speak(currentLanguage === "es" ? "Tamaño de texto aumentado" : "Text size increased");
    });

    document.getElementById("fontDecrease").addEventListener("click", () => {
        fontSize = Math.max(80, fontSize - 10);
        applyFontSize();
    });

    document.getElementById("fontReset").addEventListener("click", () => {
        fontSize = 100;
        applyFontSize();
    });

    // Eventos de voz
    document.getElementById("voiceOnBtn").addEventListener("click", () => {
        applyVoice(true);
        speak(currentLanguage === "es" ? "Asistente de voz activado" : "Voice assistant enabled");
    });
    
    document.getElementById("voiceOffBtn").addEventListener("click", () => {
        applyVoice(false);
    });

    // Lector de interfaz manual (forzado)
    document.getElementById("readInterface").addEventListener("click", () => {
        const visibleSection = document.querySelector(".page-section:not(.hidden)");
        if(visibleSection) {
            speak(visibleSection.innerText, true);
        } else {
            speak("RideNow, Estación inteligente de carga", true);
        }
    });
}