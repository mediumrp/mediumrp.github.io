document.addEventListener("DOMContentLoaded", () => {
    initSpaceBackground(); // Запускаем фон
    
    // Пытаемся загрузить данные
    loadBio();
    renderTechStack();
    loadRepos();
    renderProjects();
    
    // Плеер
    try {
        initMusicPlayer();
    } catch(e) { console.log("Player init failed:", e); }
});

/* --- 0. Space Background Generator --- */
function initSpaceBackground() {
    const canvas = document.getElementById('space-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height, stars = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        createStars();
    }

    function createStars() {
        stars = [];
        const count = Math.floor((width * height) / 3000); // Плотность звезд
        for(let i=0; i<count; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random(),
                dir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Рисуем звезды
        stars.forEach(star => {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();

            // Движение
            star.y -= star.speed;
            star.opacity += 0.005 * star.dir;

            // Мерцание
            if(star.opacity > 1 || star.opacity < 0.2) star.dir *= -1;

            // Сброс позиции
            if(star.y < 0) {
                star.y = height;
                star.x = Math.random() * width;
            }
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}

/* --- 1. BIO Section --- */
async function loadBio() {
    const bioCard = document.getElementById('bio-card');
    
    // Проверка, загрузился ли конфиг
    if (typeof CONFIG === 'undefined') {
        bioCard.innerHTML = `<p style="color:red">Error: config.js is broken!</p>`;
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}`);
        
        if (response.status === 404) {
             throw new Error("User not found");
        }
        if (!response.ok) {
             throw new Error("GitHub API Error");
        }

        const data = await response.json();

        bioCard.innerHTML = `
            <img src="${data.avatar_url}" alt="Ava" class="avatar">
            <div class="bio-name">${data.name || data.login}</div>
            <div class="bio-loc"><i class="fa-solid fa-location-dot"></i> Russia <span class="flag">🇷🇺</span></div>
            <div class="socials">
                <a href="${CONFIG.socials.telegram}" target="_blank"><i class="fa-brands fa-telegram"></i></a>
                <a href="${CONFIG.socials.discord}" target="_blank"><i class="fa-brands fa-discord"></i></a>
                <a href="${data.html_url}" target="_blank"><i class="fa-brands fa-github"></i></a>
            </div>
            <div class="about-text">${CONFIG.aboutMe}</div>
        `;
    } catch (error) {
        console.error(error);
        bioCard.innerHTML = `
            <div style="text-align:center; color: #ff5555;">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom:10px;"></i>
                <p>GitHub Error: ${error.message}</p>
                <p style="font-size:0.8rem; color:#888;">Check username in config.js</p>
            </div>
        `;
    }
}

/* --- 2. Tech Stack --- */
function renderTechStack() {
    const track = document.getElementById('tech-track');
    const techs = CONFIG.technologies;
    // Дублируем для плавности
    let fillTechs = [...techs, ...techs, ...techs, ...techs]; 

    track.innerHTML = '';
    fillTechs.forEach(tech => {
        let el;
        if(CONFIG.useIcons) {
            // Используем FontAwesome
            el = document.createElement('i');
            el.className = `${tech} tech-icon-font`;
        } else {
            // Используем SVG файлы
            el = document.createElement('img');
            el.src = `assets/technologies/${tech}.svg`;
            el.className = 'tech-icon';
            el.alt = tech;
            el.onerror = () => { el.style.display = 'none'; };
        }
        track.appendChild(el);
    });
}

/* --- 3. Repositories --- */
async function loadRepos() {
    const list = document.getElementById('repos-list');
    try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=6`);
        if(!response.ok) throw new Error("Repo fetch failed");
        const repos = await response.json();

        list.innerHTML = '';
        if(repos.length === 0) list.innerHTML = '<p>No public repos found.</p>';

        repos.forEach(repo => {
            const div = document.createElement('a');
            div.href = repo.html_url;
            div.target = "_blank";
            div.className = 'repo-item';
            div.innerHTML = `
                <span class="repo-name">${repo.name}</span>
                <span class="repo-desc">${repo.description || "No description provided."}</span>
                <div class="repo-meta">
                    <span><i class="fa-solid fa-star" style="color:gold"></i> ${repo.stargazers_count}</span>
                    <span><i class="fa-solid fa-code-branch"></i> ${repo.forks_count}</span>
                    <span>${repo.language || 'Code'}</span>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (e) {
        list.innerHTML = `<p style="color:#aaa">Не удалось загрузить репозитории. <br> Проверь подключение или CORS.</p>`;
    }
}

/* --- 4. Projects --- */
function renderProjects() {
    const grid = document.getElementById('projects-grid');
    CONFIG.projects.forEach(proj => {
        const item = document.createElement('a');
        item.href = proj.link;
        item.target = "_blank";
        item.className = 'project-item';
        item.innerHTML = `
            <div class="project-top">
                <img src="${proj.logoUrl}" class="project-img" alt="logo">
                <div>
                    <div style="font-weight:700; font-size:1.1rem">${proj.name}</div>
                    <span class="project-role">${proj.role}</span>
                </div>
            </div>
            <div class="project-desc">${proj.description}</div>
        `;
        grid.appendChild(item);
    });
}

/* --- 5. Music Player (Fixed & Robust) --- */
function initMusicPlayer() {
    // 1. Проверка наличия песен в конфиге
    if (!CONFIG.playlist || CONFIG.playlist.length === 0) {
        console.warn("Music Player: Playlist is empty in config.js");
        document.getElementById('music-player').style.display = 'none'; // Скрываем плеер
        return;
    }

    const player = document.getElementById('music-player');
    const audio = new Audio();
    audio.volume = 0.5; // Громкость 50% по умолчанию

    let index = 0;
    let isPlaying = false;
    let ctx, analyser, canvas, canvasCtx, animationId;

    // Elements
    const els = {
        play: document.getElementById('play-btn'),
        miniPlay: document.getElementById('mini-play-btn'),
        prev: document.getElementById('prev-btn'),
        next: document.getElementById('next-btn'),
        title: document.getElementById('track-name'),
        artist: document.getElementById('track-artist'),
        toggle: document.getElementById('toggle-player'),
        slider: document.getElementById('seek-slider'),
        time: document.getElementById('current-time'),
        dur: document.getElementById('duration')
    };

    // --- Core Functions ---

    function loadTrack(i) {
        const track = CONFIG.playlist[i];
        if(!track) return;
        
        // Важно: путь к файлу. Убедись, что папка называется songs (маленькими буквами)
        const src = `songs/${track.filename}`;
        
        console.log(`Music Player: Loading track "${track.title}" from ${src}`);
        audio.src = src;
        
        els.title.innerText = track.title;
        els.artist.innerText = track.artist;
        els.slider.value = 0;
        
        // Обработка ошибки загрузки файла
        audio.onerror = () => {
            console.error(`Music Player Error: Could not load file: ${src}. Check filename and folder!`);
            els.title.innerText = "Error Loading";
            els.artist.innerText = "Check Console (F12)";
        };
    }

    function playMusic() {
        // Пытаемся запустить
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Успех
                isPlaying = true;
                updateIcons(true);
                if(!ctx) setupVisualizer();
            })
            .catch(error => {
                // Блокировка браузера
                console.log("Autoplay prevented by browser. Waiting for user interaction...");
                isPlaying = false;
                updateIcons(false);
                
                // Ждем любого клика по сайту, чтобы запустить музыку
                document.addEventListener('click', unlockAudio, { once: true });
            });
        }
    }

    function pauseMusic() {
        audio.pause();
        isPlaying = false;
        updateIcons(false);
    }

    function unlockAudio() {
        console.log("User interacted. Starting music...");
        playMusic();
    }

    function togglePlay() {
        if (isPlaying) pauseMusic();
        else playMusic();
    }

    function updateIcons(isPlay) {
        const icon = isPlay ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
        els.play.innerHTML = icon;
        els.miniPlay.innerHTML = icon;
    }

    // --- Event Listeners ---

    els.play.onclick = togglePlay;
    els.miniPlay.onclick = (e) => { e.stopPropagation(); togglePlay(); };
    
    els.next.onclick = () => {
        index = (index + 1) % CONFIG.playlist.length;
        loadTrack(index);
        playMusic();
    };
    
    els.prev.onclick = () => {
        index = (index - 1 + CONFIG.playlist.length) % CONFIG.playlist.length;
        loadTrack(index);
        playMusic();
    };

    audio.onended = () => els.next.onclick();

    // Timeline Update
    audio.ontimeupdate = () => {
        if(audio.duration) {
            const pct = (audio.currentTime / audio.duration) * 100;
            els.slider.value = pct;
            els.time.innerText = fmtTime(audio.currentTime);
            els.dur.innerText = fmtTime(audio.duration);
        }
    };

    els.slider.oninput = () => {
        const time = (els.slider.value / 100) * audio.duration;
        audio.currentTime = time;
    };

    // Toggle Player View
    const playerContainer = document.getElementById('music-player');
    
    // Клик на кнопку сворачивания
    els.toggle.onclick = (e) => {
        e.stopPropagation();
        playerContainer.classList.add('collapsed');
        els.toggle.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    };

    // Клик на сам плеер (если свернут) -> развернуть
    playerContainer.onclick = (e) => {
        if(playerContainer.classList.contains('collapsed')) {
            playerContainer.classList.remove('collapsed');
            els.toggle.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
        }
    };

    // --- Helpers ---

    function fmtTime(s) {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0'+sec : sec}`;
    }

    // --- Visualizer ---
    function setupVisualizer() {
        try {
            if (!window.AudioContext && !window.webkitAudioContext) return;
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            const src = ctx.createMediaElementSource(audio);
            analyser = ctx.createAnalyser();
            src.connect(analyser);
            analyser.connect(ctx.destination);
            analyser.fftSize = 64;
            
            canvas = document.getElementById('visualizer');
            canvasCtx = canvas.getContext('2d');
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            function draw() {
                animationId = requestAnimationFrame(draw);
                // Экономим ресурсы, если плеер свернут
                if(playerContainer.classList.contains('collapsed')) return;

                analyser.getByteFrequencyData(dataArray);
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight, x = 0;
                
                for(let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i] / 2;
                    canvasCtx.fillStyle = `rgb(${barHeight + 100}, 80, 220)`;
                    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            }
            draw();
        } catch(e) {
            console.warn("Visualizer failed to init (CORS policy mostly):", e);
        }
    }

    // --- Start ---
    // Случайный трек при загрузке
    index = Math.floor(Math.random() * CONFIG.playlist.length);
    loadTrack(index);
    
    // Пытаемся запустить (скорее всего заблокируется, но сработает document.click fallback)
    playMusic();
}