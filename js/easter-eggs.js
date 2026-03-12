/* ============================================
   EASTER EGGS MODULE
   ============================================ */

const EasterEggsModule = (() => {

    // Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
                    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
                    'KeyB', 'KeyA'];
    let konamiIndex = 0;

    // Matrix rain secret
    let secretTyped = '';

    function init() {
        // Konami code listener
        document.addEventListener('keydown', (e) => {
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

        // Secret word: type "matrix" anywhere
        document.addEventListener('keypress', (e) => {
            secretTyped += e.key.toLowerCase();
            if (secretTyped.length > 20) {
                secretTyped = secretTyped.slice(-20);
            }

            if (secretTyped.includes('matrix')) {
                activateMatrix();
                secretTyped = '';
            }

            if (secretTyped.includes('party')) {
                activatePartyMode();
                secretTyped = '';
            }
        });

        // Close overlay
        const closeBtn = document.getElementById('easter-egg-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('easter-egg-overlay')?.classList.add('hidden');
            });
        }

        // Console message
        console.log(
            '%c🕹️ Psst... try typing "matrix" or "party" or the Konami Code!',
            'color: #a855f7; font-size: 14px; font-weight: bold;'
        );

        // Cursor trail
        initCursorTrail();

        // Footer year
        const footerYear = document.querySelector('.footer-year');
        if (footerYear) {
            footerYear.textContent = `© ${new Date().getFullYear()}`;
        }
    }

    function activateKonami() {
        const overlay = document.getElementById('easter-egg-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            // Add confetti
            createConfetti();
        }
    }

    function activateMatrix() {
        document.body.style.transition = 'filter 1s';
        document.body.style.filter = 'hue-rotate(90deg) brightness(0.8)';
        setTimeout(() => {
            document.body.style.filter = '';
        }, 5000);
    }

    function activatePartyMode() {
        document.body.style.transition = 'filter 0.3s';
        let hue = 0;
        const interval = setInterval(() => {
            hue += 20;
            document.body.style.filter = `hue-rotate(${hue}deg)`;
            if (hue >= 720) {
                clearInterval(interval);
                document.body.style.filter = '';
            }
        }, 100);
    }

    function createConfetti() {
        const colors = ['#7c3aed', '#a855f7', '#c084fc', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                top: -10px;
                left: ${Math.random() * 100}vw;
                width: ${Math.random() * 8 + 4}px;
                height: ${Math.random() * 8 + 4}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                z-index: 100001;
                pointer-events: none;
                animation: confettiFall ${Math.random() * 2 + 2}s linear forwards;
                animation-delay: ${Math.random() * 0.5}s;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }

        // Add confetti animation dynamically
        if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
                @keyframes confettiFall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(${Math.random() * 720}deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function initCursorTrail() {
        // Subtle glow on cursor (only desktop)
        if (window.matchMedia('(hover: hover)').matches) {
            const trail = document.createElement('div');
            trail.style.cssText = `
                position: fixed;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(124, 58, 237, 0.06), transparent 60%);
                pointer-events: none;
                z-index: 9998;
                transform: translate(-50%, -50%);
                transition: left 0.15s ease, top 0.15s ease;
            `;
            document.body.appendChild(trail);

            document.addEventListener('mousemove', (e) => {
                trail.style.left = e.clientX + 'px';
                trail.style.top = e.clientY + 'px';
            });
        }
    }

    return { init };
})();