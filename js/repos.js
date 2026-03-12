/* ============================================
   REPOS MODULE
   Fetches and displays GitHub repositories
   ============================================ */

const ReposModule = (() => {

    // ===== CONFIGURATION =====
    const GITHUB_USERNAME = 'loyslow-dev';
    const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`;
    const MAX_REPOS = 12; // Max repos to show
    // ==========================

    // Language colors (GitHub style)
    const LANG_COLORS = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        Java: '#b07219',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Shell: '#89e051',
        Dockerfile: '#384d54',
        Vue: '#41b883',
        Go: '#00ADD8',
        Rust: '#dea584',
        C: '#555555',
        'C++': '#f34b7d',
        'C#': '#178600',
        PHP: '#4F5D95',
        Ruby: '#701516',
        Kotlin: '#A97BFF',
        Swift: '#F05138',
        Dart: '#00B4AB',
        null: '#8b8b8b',
    };

    async function init() {
        const grid = document.getElementById('repos-grid');
        if (!grid) return;

        // Show skeletons
        grid.innerHTML = Array(6).fill(0).map(() => createSkeleton()).join('');

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('GitHub API error');
            const repos = await response.json();

            grid.innerHTML = repos
                .slice(0, MAX_REPOS)
                .map(repo => createRepoCard(repo))
                .join('');

        } catch (error) {
            console.error('ReposModule: Failed to load repos', error);
            grid.innerHTML = `
                <div class="bento-card" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; color: var(--accent-primary);"></i>
                    <p>Не удалось загрузить репозитории</p>
                </div>
            `;
        }
    }

    function createRepoCard(repo) {
        const langColor = LANG_COLORS[repo.language] || LANG_COLORS[null];
        const description = repo.description || 'Нет описания';
        const stars = repo.stargazers_count || 0;
        const forks = repo.forks_count || 0;

        return `
            <div class="bento-card repo-card" data-tilt>
                <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-link" title="Открыть на GitHub">
                    <i class="fas fa-arrow-up-right-from-square"></i>
                </a>
                <div class="repo-header">
                    <div class="repo-icon">
                        <i class="fas fa-code-branch"></i>
                    </div>
                    <div>
                        <div class="repo-title">${repo.name}</div>
                        <span class="repo-visibility">${repo.private ? 'Private' : 'Public'}</span>
                    </div>
                </div>
                <p class="repo-description">${escapeHtml(description)}</p>
                <div class="repo-meta">
                    ${repo.language ? `
                        <div class="repo-meta-item">
                            <span class="repo-language-dot" style="background: ${langColor}"></span>
                            <span>${repo.language}</span>
                        </div>
                    ` : ''}
                    ${stars > 0 ? `
                        <div class="repo-meta-item">
                            <i class="fas fa-star" style="color: #f59e0b;"></i>
                            <span>${stars}</span>
                        </div>
                    ` : ''}
                    ${forks > 0 ? `
                        <div class="repo-meta-item">
                            <i class="fas fa-code-fork"></i>
                            <span>${forks}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function createSkeleton() {
        return `
            <div class="bento-card repo-skeleton">
                <div class="repo-skeleton-line"></div>
                <div class="repo-skeleton-line"></div>
                <div class="repo-skeleton-line"></div>
                <div class="repo-skeleton-line"></div>
            </div>
        `;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init };
})();