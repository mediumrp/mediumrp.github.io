/* ============================================
   BACKGROUND MODULE
   Handles: video/gif/Stranger Things fallback
   ============================================ */

const BackgroundModule = (() => {
    const video = document.getElementById('bg-video');
    const gif = document.getElementById('bg-gif');
    const canvas = document.getElementById('bg-stranger-things');
    const ctx = canvas ? canvas.getContext('2d') : null;

    let animationId = null;
    let particles = [];
    let lightnings = [];
    let time = 0;

    function init() {
        // Try video first
        tryVideo()
            .then(found => {
                if (!found) return tryGif();
                return true;
            })
            .then(found => {
                if (!found) initStrangerThings();
            });
    }

    function tryVideo() {
        return new Promise(resolve => {
            video.src = 'background.mp4';
            video.oncanplay = () => {
                video.classList.add('active');
                video.play();
                resolve(true);
            };
            video.onerror = () => resolve(false);

            // Timeout fallback
            setTimeout(() => {
                if (!video.classList.contains('active')) resolve(false);
            }, 2000);
        });
    }

    function tryGif() {
        return new Promise(resolve => {
            gif.src = 'background.gif';
            gif.onload = () => {
                gif.classList.add('active');
                resolve(true);
            };
            gif.onerror = () => resolve(false);

            setTimeout(() => {
                if (!gif.classList.contains('active')) resolve(false);
            }, 2000);
        });
    }

    // ===== Stranger Things Animated Background =====
    function initStrangerThings() {
        canvas.classList.add('active');
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        for (let i = 0; i < 80; i++) {
            particles.push(createParticle());
        }

        animate();
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * (canvas?.width || 1920),
            y: Math.random() * (canvas?.height || 1080),
            size: Math.random() * 3 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: -Math.random() * 0.8 - 0.2,
            opacity: Math.random() * 0.5 + 0.1,
            flickerSpeed: Math.random() * 0.02 + 0.005,
            flickerPhase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.7 ? '#cc1100' : '#441100'
        };
    }

    function animate() {
        if (!ctx) return;
        time += 0.01;

        // Dark background with slight red tint
        ctx.fillStyle = 'rgba(5, 2, 3, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw atmospheric fog
        drawFog();

        // Draw particles (floating embers/spores)
        particles.forEach(p => {
            p.x += p.speedX + Math.sin(time + p.flickerPhase) * 0.3;
            p.y += p.speedY;

            // Flicker
            const flicker = Math.sin(time * 10 * p.flickerSpeed + p.flickerPhase);
            const alpha = p.opacity * (0.5 + flicker * 0.5);

            // Reset if out of bounds
            if (p.y < -10) {
                p.y = canvas.height + 10;
                p.x = Math.random() * canvas.width;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Glow
            if (p.size > 1.5) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                grd.addColorStop(0, `rgba(204, 17, 0, ${alpha * 0.3})`);
                grd.addColorStop(1, 'rgba(204, 17, 0, 0)');
                ctx.fillStyle = grd;
                ctx.fill();
            }
        });

        // Random lightning
        if (Math.random() < 0.003) {
            createLightning();
        }

        drawLightnings();

        // Vignette
        drawVignette();

        animationId = requestAnimationFrame(animate);
    }

    function drawFog() {
        const fogLayers = 3;
        for (let i = 0; i < fogLayers; i++) {
            const y = canvas.height * (0.5 + i * 0.15) + Math.sin(time * 0.5 + i) * 30;
            const grd = ctx.createLinearGradient(0, y - 100, 0, y + 100);
            grd.addColorStop(0, 'rgba(30, 5, 5, 0)');
            grd.addColorStop(0.5, `rgba(50, 8, 8, ${0.03 + Math.sin(time + i) * 0.015})`);
            grd.addColorStop(1, 'rgba(30, 5, 5, 0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, y - 100, canvas.width, 200);
        }

        // Bottom red glow
        const bottomGrd = ctx.createLinearGradient(0, canvas.height - 200, 0, canvas.height);
        bottomGrd.addColorStop(0, 'rgba(204, 17, 0, 0)');
        bottomGrd.addColorStop(1, `rgba(204, 17, 0, ${0.05 + Math.sin(time * 0.8) * 0.03})`);
        ctx.fillStyle = bottomGrd;
        ctx.fillRect(0, canvas.height - 200, canvas.width, 200);
    }

    function createLightning() {
        const x = Math.random() * canvas.width;
        const segments = [];
        let currentX = x;
        let currentY = 0;

        for (let i = 0; i < 8; i++) {
            const nextX = currentX + (Math.random() - 0.5) * 80;
            const nextY = currentY + canvas.height / 8;
            segments.push({ x1: currentX, y1: currentY, x2: nextX, y2: nextY });
            currentX = nextX;
            currentY = nextY;
        }

        lightnings.push({ segments, life: 1, maxLife: 1 });
    }

    function drawLightnings() {
        lightnings = lightnings.filter(l => l.life > 0);
        lightnings.forEach(l => {
            l.life -= 0.05;
            const alpha = l.life * 0.3;

            ctx.strokeStyle = `rgba(204, 50, 50, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.shadowColor = 'rgba(204, 17, 0, 0.5)';
            ctx.shadowBlur = 20;

            ctx.beginPath();
            l.segments.forEach((s, i) => {
                if (i === 0) ctx.moveTo(s.x1, s.y1);
                ctx.lineTo(s.x2, s.y2);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
    }

    function drawVignette() {
        const grd = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
            canvas.width / 2, canvas.height / 2, canvas.width * 0.8
        );
        grd.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grd.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function destroy() {
        if (animationId) cancelAnimationFrame(animationId);
    }

    return { init, destroy };
})();