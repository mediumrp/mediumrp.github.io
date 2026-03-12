/* ============================================
   MUSIC PLAYER MODULE
   Full-featured player with cover art,
   custom metadata, and visualizer
   ============================================ */

const PlayerModule = (() => {

    // ===== CONFIGURE YOUR SONGS HERE =====
    // Each song can have:
    //   file:   path to mp3 (required)
    //   title:  track title (optional — auto-parsed from filename if empty)
    //   artist: artist name (optional — auto-parsed from filename if empty)
    //   cover:  path to cover image (optional — checks songs/filename.png/.jpg auto)
    //
    // Filename format for auto-parsing: "Artist - Title.mp3"

    const SONGS = [
        {
            file: 'songs/song1.mp3',
            title: 'КРАСНАЯ ПЛЕСЕНЬ x CYBERPUNK 2077',           // Leave empty to auto-parse from filename
            artist: 'ГИМН КИБЕРПАНКОВ',          // Leave empty to auto-parse from filename
            cover: 'no-cover.jpg'            // Leave empty — will try songs/song1.png then songs/song1.jpg
        },
        {
            file: 'songs/song2.mp3',
            title: 'Stranger Things Main Theme',
            artist: 'L`Orchestra Cinematique, Michael Stein, Kyle Dixon',
            cover: 'songs/song2.png'    // Explicit cover path
        },
        {
            file: 'songs/song3.mp3',
            title: '',
            artist: '',
            cover: ''
        },
        // ===== ADD MORE SONGS =====
        // {
        //     file: 'songs/mysong.mp3',
        //     title: 'My Song Name',
        //     artist: 'Artist Name',
        //     cover: 'songs/mysong.jpg'
        // },
    ];
    // ======================================

    let audioContext = null;
    let analyser = null;
    let source = null;
    let audio = null;
    let playlist = [];       // shuffled array of song objects with resolved metadata
    let currentIndex = 0;
    let isPlaying = false;
    let isPlayerOpen = false;
    let visualizerAnimId = null;
    let miniVisAnimId = null;

    // DOM cache
    const els = {};

    function cacheDom() {
        els.toggleBtn = document.getElementById('player-toggle-btn');
        els.expandHint = document.getElementById('player-expand-hint');
        els.miniPlayer = document.getElementById('player-mini');
        els.fullPlayer = document.getElementById('player-full');
        els.closeBtn = document.getElementById('player-close-btn');
        els.playBtn = document.getElementById('player-play');
        els.playIcon = document.getElementById('player-play-icon');
        els.prevBtn = document.getElementById('player-prev');
        els.nextBtn = document.getElementById('player-next');
        els.trackName = document.getElementById('player-track-name');
        els.trackArtist = document.getElementById('player-track-artist');
        els.seekBar = document.getElementById('player-seek');
        els.currentTime = document.getElementById('player-current-time');
        els.duration = document.getElementById('player-duration');
        els.volumeSlider = document.getElementById('player-volume');
        els.volumeIcon = document.getElementById('player-volume-icon');
        els.visualizerCanvas = document.getElementById('player-visualizer');
        els.miniVisualizer = document.getElementById('mini-visualizer');
        els.playlistContainer = document.getElementById('player-playlist');
        els.coverContainer = document.getElementById('player-cover-container');
        els.coverPlaceholder = document.getElementById('player-cover-placeholder');
    }

    function init() {
        cacheDom();

        if (SONGS.length === 0) {
            if (els.miniPlayer) els.miniPlayer.style.display = 'none';
            return;
        }

        // Build playlist with resolved metadata
        const resolved = SONGS.map(song => resolveSongMeta(song));

        // Shuffle
        playlist = shuffleArray([...resolved]);

        // Create audio
        audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.volume = 0.5;

        bindEvents();
        buildPlaylistUI();
        createMiniVisBars();
        loadTrack(0);
    }

    // ===== Resolve metadata from config or filename =====
    function resolveSongMeta(song) {
        const filename = song.file.split('/').pop().replace(/\.mp3$/i, '');
        const parts = filename.split(' - ');

        let title = song.title;
        let artist = song.artist;
        let cover = song.cover;

        // Auto-parse from filename: "Artist - Title"
        if (!title || !artist) {
            if (parts.length >= 2) {
                if (!artist) artist = parts[0].trim();
                if (!title) title = parts.slice(1).join(' - ').trim();
            } else {
                if (!title) title = filename;
                if (!artist) artist = 'Unknown';
            }
        }

        // Auto-detect cover: try filename.png then filename.jpg
        if (!cover) {
            const basePath = song.file.replace(/\.mp3$/i, '');
            cover = basePath; // Will try .png and .jpg in loadCover
        }

        return {
            file: song.file,
            title,
            artist,
            cover,
            coverResolved: !!song.cover // true if explicitly set
        };
    }

    function startPlayback() {
        if (!audio || SONGS.length === 0) return;
        play();
    }

    function initAudioContext() {
        if (audioContext) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source = audioContext.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    function bindEvents() {
        els.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });

        els.expandHint.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFullPlayer();
        });

        els.closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeFullPlayer();
        });

        els.playBtn.addEventListener('click', togglePlay);
        els.prevBtn.addEventListener('click', prevTrack);
        els.nextBtn.addEventListener('click', nextTrack);

        // Seek
        els.seekBar.addEventListener('input', () => {
            if (audio.duration) {
                audio.currentTime = (els.seekBar.value / 100) * audio.duration;
            }
        });

        // Volume
        els.volumeSlider.addEventListener('input', () => {
            const vol = els.volumeSlider.value / 100;
            audio.volume = vol;
            updateVolumeIcon(vol);
        });

        els.volumeIcon.addEventListener('click', () => {
            if (audio.volume > 0) {
                audio.dataset.prevVol = audio.volume;
                audio.volume = 0;
                els.volumeSlider.value = 0;
            } else {
                audio.volume = parseFloat(audio.dataset.prevVol) || 0.5;
                els.volumeSlider.value = audio.volume * 100;
            }
            updateVolumeIcon(audio.volume);
        });

        audio.addEventListener('timeupdate', updateTimeline);
        audio.addEventListener('loadedmetadata', () => {
            els.duration.textContent = formatTime(audio.duration);
        });
        audio.addEventListener('ended', nextTrack);

        // Close player when clicking outside
        document.addEventListener('click', (e) => {
            if (isPlayerOpen &&
                !els.fullPlayer.contains(e.target) &&
                !els.miniPlayer.contains(e.target)) {
                closeFullPlayer();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't interfere with typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.code === 'Space' && isPlayerOpen) {
                e.preventDefault();
                togglePlay();
            }
        });
    }

    function loadTrack(index) {
        currentIndex = index;
        const song = playlist[index];
        audio.src = song.file;

        els.trackName.textContent = song.title;
        els.trackArtist.textContent = song.artist;

        loadCover(song);
        updatePlaylistUI();

        els.seekBar.value = 0;
        els.currentTime.textContent = '0:00';
        els.duration.textContent = '0:00';
    }

    // ===== Cover art loading =====
    function loadCover(song) {
        const container = els.coverContainer;
        if (!container) return;

        // Remove old cover
        const oldImg = container.querySelector('.player-cover');
        if (oldImg) oldImg.remove();

        const placeholder = els.coverPlaceholder;

        if (song.coverResolved) {
            // Explicitly set cover path
            showCoverImage(song.cover, container, placeholder);
        } else {
            // Try auto-detect: .png first, then .jpg
            const basePath = song.cover;
            tryLoadImage(basePath + '.png')
                .then(src => showCoverImage(src, container, placeholder))
                .catch(() => {
                    return tryLoadImage(basePath + '.jpg');
                })
                .then(src => {
                    if (src) showCoverImage(src, container, placeholder);
                })
                .catch(() => {
                    // No cover found — show placeholder
                    if (placeholder) placeholder.style.display = 'flex';
                });
        }
    }

    function tryLoadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => reject();
            img.src = src;
        });
    }

    function showCoverImage(src, container, placeholder) {
        if (!src || !container) return;

        // Hide placeholder
        if (placeholder) placeholder.style.display = 'none';

        // Check if already showing this image
        const existing = container.querySelector('.player-cover');
        if (existing && existing.src.endsWith(src)) return;
        if (existing) existing.remove();

        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Cover';
        img.className = 'player-cover';
        if (isPlaying) img.classList.add('spinning');

        img.onerror = () => {
            img.remove();
            if (placeholder) placeholder.style.display = 'flex';
        };

        container.appendChild(img);
    }

    // ===== Playback controls =====
    function play() {
        initAudioContext();
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        audio.play().then(() => {
            isPlaying = true;
            updatePlayState();
            startVisualizer();
            startMiniVisualizer();
        }).catch(err => {
            console.warn('PlayerModule: Autoplay blocked', err);
        });
    }

    function pause() {
        audio.pause();
        isPlaying = false;
        updatePlayState();
    }

    function togglePlay() {
        if (isPlaying) pause();
        else play();
    }

    function nextTrack() {
        const next = (currentIndex + 1) % playlist.length;
        loadTrack(next);
        if (isPlaying) play();
    }

    function prevTrack() {
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        const prev = (currentIndex - 1 + playlist.length) % playlist.length;
        loadTrack(prev);
        if (isPlaying) play();
    }

    function updatePlayState() {
        els.playIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        els.toggleBtn.innerHTML = isPlaying
            ? '<i class="fas fa-pause"></i>'
            : '<i class="fas fa-music"></i>';

        if (isPlaying) {
            els.toggleBtn.classList.add('playing');
            els.miniPlayer.classList.add('show-vis');
        } else {
            els.toggleBtn.classList.remove('playing');
            els.miniPlayer.classList.remove('show-vis');
        }

        // Cover spinning
        const cover = els.coverContainer?.querySelector('.player-cover');
        if (cover) {
            if (isPlaying) cover.classList.add('spinning');
            else cover.classList.remove('spinning');
        }
    }

    function updateTimeline() {
        if (!audio.duration) return;
        const progress = (audio.currentTime / audio.duration) * 100;
        els.seekBar.value = progress;
        els.currentTime.textContent = formatTime(audio.currentTime);
    }

    function updateVolumeIcon(vol) {
        if (vol === 0) els.volumeIcon.className = 'fas fa-volume-mute';
        else if (vol < 0.5) els.volumeIcon.className = 'fas fa-volume-low';
        else els.volumeIcon.className = 'fas fa-volume-up';
    }

    function toggleFullPlayer() {
        if (isPlayerOpen) closeFullPlayer();
        else openFullPlayer();
    }

    function openFullPlayer() {
        isPlayerOpen = true;
        els.fullPlayer.classList.add('open');
    }

    function closeFullPlayer() {
        isPlayerOpen = false;
        els.fullPlayer.classList.remove('open');
    }

    // ===== Visualizer =====
    function startVisualizer() {
        if (!analyser || !els.visualizerCanvas) return;
        if (visualizerAnimId) cancelAnimationFrame(visualizerAnimId);

        const canvas = els.visualizerCanvas;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            visualizerAnimId = requestAnimationFrame(draw);
            if (!isPlaying) return;

            analyser.getByteFrequencyData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barCount = 64;
            const barWidth = canvas.width / barCount;
            const step = Math.floor(bufferLength / barCount);

            for (let i = 0; i < barCount; i++) {
                const value = dataArray[i * step] || 0;
                const barHeight = (value / 255) * canvas.height * 0.9;
                const hue = 260 + (i / barCount) * 40;
                const lightness = 35 + (value / 255) * 35;

                // Main bar
                ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
                const x = i * barWidth;
                const radius = Math.min(barWidth / 2 - 0.5, 3);
                roundedRect(ctx, x + 0.5, canvas.height - barHeight, barWidth - 1, barHeight, radius);

                // Subtle reflection
                ctx.globalAlpha = 0.08;
                ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
                ctx.fillRect(x + 0.5, canvas.height, barWidth - 1, barHeight * 0.2);
                ctx.globalAlpha = 1;
            }
        }

        draw();
    }

    function roundedRect(ctx, x, y, w, h, r) {
        if (h < r * 2) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }

    function createMiniVisBars() {
        const container = els.miniVisualizer;
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.className = 'mini-vis-bar';
            bar.style.height = '4px';
            container.appendChild(bar);
        }
    }

    function startMiniVisualizer() {
        if (!analyser) return;
        if (miniVisAnimId) cancelAnimationFrame(miniVisAnimId);

        const bars = els.miniVisualizer?.querySelectorAll('.mini-vis-bar');
        if (!bars || bars.length === 0) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function update() {
            miniVisAnimId = requestAnimationFrame(update);
            if (!isPlaying) return;

            analyser.getByteFrequencyData(dataArray);
            const step = Math.floor(dataArray.length / bars.length);
            bars.forEach((bar, i) => {
                const value = dataArray[i * step] || 0;
                const height = Math.max(3, (value / 255) * 20);
                bar.style.height = `${height}px`;
            });
        }

        update();
    }

    // ===== Playlist UI =====
    function buildPlaylistUI() {
        if (!els.playlistContainer) return;

        els.playlistContainer.innerHTML = playlist.map((song, i) => {
            const coverThumb = getCoverThumbHtml(song);
            return `
                <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
                    ${coverThumb}
                    <span class="playlist-num">${i + 1}</span>
                    <div class="playlist-info">
                        <span class="playlist-title">${escapeHtml(song.title)}</span>
                        <span class="playlist-artist">${escapeHtml(song.artist)}</span>
                    </div>
                    <div class="playlist-playing-icon">
                        <div class="playlist-playing-bar"></div>
                        <div class="playlist-playing-bar"></div>
                        <div class="playlist-playing-bar"></div>
                    </div>
                </div>
            `;
        }).join('');

        // Bind clicks
        els.playlistContainer.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                loadTrack(index);
                play();
            });
        });

        // Try to load mini covers
        playlist.forEach((song, i) => {
            loadMiniCover(song, i);
        });
    }

    function getCoverThumbHtml(song) {
        return `<div class="playlist-cover-mini-placeholder"><i class="fas fa-music"></i></div>`;
    }

    function loadMiniCover(song, index) {
        const item = els.playlistContainer?.querySelectorAll('.playlist-item')[index];
        if (!item) return;

        const placeholder = item.querySelector('.playlist-cover-mini-placeholder');

        function showMini(src) {
            if (!placeholder) return;
            const img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.className = 'playlist-cover-mini';
            img.onload = () => {
                placeholder.replaceWith(img);
            };
        }

        if (song.coverResolved && song.cover) {
            showMini(song.cover);
        } else {
            const basePath = song.cover;
            tryLoadImage(basePath + '.png')
                .then(src => showMini(src))
                .catch(() => tryLoadImage(basePath + '.jpg'))
                .then(src => { if (src) showMini(src); })
                .catch(() => { /* keep placeholder */ });
        }
    }

    function updatePlaylistUI() {
        if (!els.playlistContainer) return;
        els.playlistContainer.querySelectorAll('.playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === currentIndex);
        });

        // Scroll active into view
        const active = els.playlistContainer.querySelector('.playlist-item.active');
        if (active) {
            active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // ===== Helpers =====
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { init, startPlayback };
})();