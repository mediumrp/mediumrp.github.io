/* ============================================
   APP MODULE — Main entry point
   Orchestrates all modules
   ============================================ */

(function App() {
    'use strict';

    // Initialize preloader first
    PreloaderModule.init(() => {
        // User clicked — we can now autoplay audio & show content
        showContent();
        PlayerModule.startPlayback();
    });

    // Initialize background immediately
    BackgroundModule.init();

    // Initialize all content modules (data starts loading)
    BioModule.init();
    TechModule.init();
    ReposModule.init();
    ProjectsModule.init();
    PlayerModule.init();
    EasterEggsModule.init();

    function showContent() {
        const main = document.getElementById('main-content');
        if (main) {
            main.classList.remove('hidden');
        }

        // Intersection Observer for fade-in animations
        setupScrollAnimations();
    }

    function setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Don't unobserve — only animate once
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.fade-in-up').forEach(el => {
            observer.observe(el);
        });
    }

})();