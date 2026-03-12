/* ============================================
   EASTER EGGS MODULE
   Now uses toast notifications (bottom-center)
   ============================================ */

const EasterEggsModule = (() => {

    // Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
    const KONAMI = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;
    let secretTyped = '';

    function init() {
        // Ensure toast container exists
        ensureToastContainer();

        // Konami code
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.code === KONAMI[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === KONAMI.length) {
                    activateKonami();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });

        // Secret words
        document.addEventListener('keypress', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            secretTyped += e.key.toLowerCase();
            if (secretTyped.length > 30) {
                secretTyped = secretTyped.slice(-30);
            }

            if (secretTyped.endsWith('matrix')) {
                activateMatrix();
                secretTyped = '';
            }

            if (secretTyped.endsWith('party')) {
                activatePartyMode();
                secretTyped = '';
            }

            if (secretTyped.endsWith('hello')) {
                showToast('👋', 'Привет!', 'Рад, что ты здесь!', 3000);
                secretTyped = '';
            }
        });

        // Console message
        console.log(
            '%c🕹️ Psst... try typing "matrix", "party", "hello" or the Konami Code!',
            'color: #a855f7; font-size: 14px; font-weight: bold;'
        );

        // Cursor trail (desktop only)
        initCursorGlow();

        // Footer year
        const footerYear = document.querySelector('.footer-year');
        if (footerYear) {
            footerYear.textContent = `© ${new Date().getFullYear()}`;
        }
    }

    // ===== TOAST NOTIFICATION SYSTEM =====
    function ensureToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
    }

    function showToast(icon, title, subtitle, duration = 4000, accent = false) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast${accent ? ' toast-accent' : ''}`;

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <div class="toast-text">
                <span class="toast-title">${title}</span>
                ${subtitle ? `<span class="toast-subtitle">${subtitle}</span>` : ''}
            </div>
            <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 400);
        }, duration);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 400);
        });

        return toast;
    }

    // ===== EASTER EGG: Konami Code =====
    function activateKonami() {
        showToast('🎮', 'Konami Code Activated!', 'Ты — настоящий гик 🤓', 5000, true);
        createConfetti();
    }

    // ===== EASTER EGG: Matrix =====
    function activateMatrix() {
        showToast('💊', 'Matrix Mode', 'Добро пожаловать в реальность...', 4000, true);
        document.body.style.transition = 'filter 1s ease';
        document.body.style.filter = 'hue-rotate(90deg) brightness(0.85)';
        setTimeout(() => {
            document.body.style.filter = '';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 1000);
        }, 5000);
    }

    // ===== EASTER EGG: Party Mode =====
    function activatePartyMode() {
        showToast('🎉', 'Party Mode!', 'Дискотека на 3 секунды!', 3500, true);
        document.body.style.transition = 'filter 0.15s ease';
        let hue = 0;
        const interval = setInterval(() => {
            hue += 30;
            document.body.style.filter = `hue-rotate(${hue}deg) saturate(1.5)`;
            if (hue >= 720) {
                clearInterval(interval);
                document.body.style.filter = '';
                document.body.style.transition = '';
            }
        }, 80);
    }

    // ===== Confetti =====
    function createConfetti() {
        const colors = ['#7c3aed', '#a855f7', '#c084fc', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#ec4899'];

        // Inject animation if not exists
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    0% { 
                        transform: translateY(-10vh) rotate(0deg) scale(1); 
                        opacity: 1; 
                    }
                    70% { opacity: 1; }
                    100% { 
                        transform: translateY(100vh) rotate(var(--rot, 720deg)) scale(0.5); 
                        opacity: 0; 
                    }
                }
            `;
            document.head.appendChild(style);
        }

        for (let i = 0; i < 80; i++) {
            const confetti = document.createElement('div');
            const size = Math.random() * 8 + 4;
            const rotation = Math.random() * 1080 - 360;
            confetti.style.cssText = `
                position: fixed;
                top: -20px;
                left: ${Math.random() * 100}vw;
                width: ${size}px;
                height: ${size * (Math.random() * 0.6 + 0.6)}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                z-index: 100002;
                pointer-events: none;
                --rot: ${rotation}deg;
                animation: confettiFall ${Math.random() * 2 + 2}s ease-in forwards;
                animation-delay: ${Math.random() * 0.8}s;
                opacity: 0;
            `;
            // Small delay to start visible
            requestAnimationFrame(() => confetti.style.opacity = '1');
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    // ===== Cursor Glow (desktop) =====
    function initCursorGlow() {
        if (!window.matchMedia('(hover: hover)').matches) return;

        const glow = document.createElement('div');
        glow.style.cssText = `
            position: fixed;
            width: 250px;
            height: 250px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(124, 58, 237, 0.05), transparent 60%);
            pointer-events: none;
            z-index: 9998;
            transform: translate(-50%, -50%);
            transition: left 0.1s linear, top 0.1s linear;
            will-change: left, top;
        `;
        document.body.appendChild(glow);

        let mouseX = -300, mouseY = -300;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            glow.style.left = mouseX + 'px';
            glow.style.top = mouseY + 'px';
        });

        document.addEventListener('mouseleave', () => {
            glow.style.left = '-300px';
            glow.style.top = '-300px';
        });
    }

    // Public API — expose showToast for other modules
    return { init, showToast };
})();