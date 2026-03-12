/* ============================================
   BIO MODULE
   Loads data from GitHub API
   ============================================ */

const BioModule = (() => {
    // ===== CONFIGURATION =====
    const GITHUB_USERNAME = 'loyslow-dev';
    const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;

    // Social links - EDIT THESE
    const SOCIAL_LINKS = {
        telegram: 'https://t.me/loyslow',       // ← Edit your Telegram
        discord: 'https://discord.gg/YOUR_SERVER' // ← Edit your Discord
    };
    // ==========================

    async function init() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('GitHub API error');
            const data = await response.json();

            populateBio(data);
        } catch (error) {
            console.error('BioModule: Failed to load GitHub data', error);
            setFallbackData();
        }
    }

    function populateBio(data) {
        // Avatar
        const avatar = document.getElementById('bio-avatar');
        if (avatar) avatar.src = data.avatar_url || '';

        // Name
        const name = document.getElementById('bio-name');
        if (name) name.textContent = data.name || data.login || GITHUB_USERNAME;

        // Username
        const username = document.getElementById('bio-username');
        if (username) username.textContent = `@${data.login}`;

        // Stats with count animation
        animateNumber('stat-repos', data.public_repos || 0);
        animateNumber('stat-followers', data.followers || 0);
        animateNumber('stat-following', data.following || 0);

        // Social links
        const tgLink = document.getElementById('social-telegram');
        if (tgLink) tgLink.href = SOCIAL_LINKS.telegram;

        const dcLink = document.getElementById('social-discord');
        if (dcLink) dcLink.href = SOCIAL_LINKS.discord;
    }

    function setFallbackData() {
        const avatar = document.getElementById('bio-avatar');
        if (avatar) avatar.src = `https://github.com/${GITHUB_USERNAME}.png`;

        const name = document.getElementById('bio-name');
        if (name) name.textContent = GITHUB_USERNAME;

        const username = document.getElementById('bio-username');
        if (username) username.textContent = `@${GITHUB_USERNAME}`;

        const tgLink = document.getElementById('social-telegram');
        if (tgLink) tgLink.href = SOCIAL_LINKS.telegram;

        const dcLink = document.getElementById('social-discord');
        if (dcLink) dcLink.href = SOCIAL_LINKS.discord;
    }

    function animateNumber(elementId, target) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const duration = 1500;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = target;
            }
        }

        requestAnimationFrame(update);
    }

    return { init };
})();