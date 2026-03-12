/* ============================================
   PRELOADER MODULE
   ============================================ */

const PreloaderModule = (() => {
    let onComplete = null;

    function init(callback) {
        onComplete = callback;

        // Create floating particles
        createParticles();

        // Listen for click
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.addEventListener('click', handleClick, { once: true });
            // Also listen for any key
            document.addEventListener('keydown', handleClick, { once: true });
        }
    }

    function handleClick() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        // Remove other listener
        preloader.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleClick);

        // Fade out
        preloader.classList.add('fade-out');

        setTimeout(() => {
            preloader.style.display = 'none';
            if (onComplete) onComplete();
        }, 800);
    }

    function createParticles() {
        const container = document.getElementById('preloaderParticles');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'preloader-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 8 + 4}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            particle.style.width = `${Math.random() * 3 + 1}px`;
            particle.style.height = particle.style.width;
            particle.style.opacity = Math.random() * 0.6;
            container.appendChild(particle);
        }
    }

    return { init };
})();