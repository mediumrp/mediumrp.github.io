/* ============================================
   TECH MARQUEE MODULE
   Configurable tech stack with auto-scrolling
   ============================================ */

const TechModule = (() => {

    // ===== CONFIGURE YOUR TECHNOLOGIES HERE =====
    const TECHNOLOGIES = [
        { icon: 'devicon-html5-plain',       name: 'HTML5' },
        { icon: 'devicon-css3-plain',        name: 'CSS3' },
        { icon: 'devicon-javascript-plain',  name: 'JavaScript' },
        { icon: 'devicon-typescript-plain',  name: 'TypeScript' },
        { icon: 'devicon-python-plain',      name: 'Python' },
        { icon: 'devicon-java-plain',        name: 'Java' },
        { icon: 'devicon-react-original',    name: 'React' },
        { icon: 'devicon-nodejs-plain',      name: 'Node.js' },
        { icon: 'devicon-git-plain',         name: 'Git' },
        { icon: 'devicon-docker-plain',      name: 'Docker' },
        { icon: 'devicon-ubuntu-plain',      name: 'Ubuntu' },
        { icon: 'devicon-linux-plain',       name: 'Linux' },
        { icon: 'devicon-mongodb-plain',     name: 'MongoDB' },
        { icon: 'devicon-postgresql-plain',  name: 'PostgreSQL' },
        { icon: 'devicon-nginx-original',    name: 'Nginx' },
        { icon: 'devicon-redis-plain',       name: 'Redis' },
        { icon: 'devicon-bash-plain',        name: 'Bash' },
        { icon: 'devicon-vscode-plain',      name: 'VS Code' },
    ];
    // =============================================

    function init() {
        const marquee = document.getElementById('tech-marquee');
        if (!marquee) return;

        // Create items (duplicated for seamless loop)
        const html = buildItems() + buildItems();
        marquee.innerHTML = html;

        // Adjust animation speed based on item count
        const totalWidth = TECHNOLOGIES.length * 100; // approx px per item
        const speed = totalWidth / 50; // seconds
        marquee.style.animationDuration = `${speed}s`;
    }

    function buildItems() {
        return TECHNOLOGIES.map(tech => `
            <div class="tech-item" title="${tech.name}">
                <i class="${tech.icon}"></i>
                <span>${tech.name}</span>
            </div>
        `).join('');
    }

    return { init };
})();