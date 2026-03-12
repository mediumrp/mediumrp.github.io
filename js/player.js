/* ============================================
   MUSIC PLAYER MODULE
   Full-featured player with visualizer
   ============================================ */

const PlayerModule = (() => {

    // ===== CONFIGURATION =====
    // List your song files here (from /songs/ folder)
    const SONG_FILES = [
        'songs/song1.mp3',
        'songs/song2.mp3',
        'songs/song3.mp3',
        // Add more songs here
    ];
    // ==========================

    let audioContext = null;
    let analyser = null;
    let source = null;
    let audio = null;
    let playlist = [];
    let currentIndex = 0;
    let isPlaying = false;
    let isPlayerOpen = false;
    let visualizerAnimId = null;
    let miniVisAnimId = null;

    // DOM Elements
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
    }

    function init() {
        cacheDom();

        if (SONG_FILES.length === 0) {
            els.miniPlayer.style.display = 'none';
            return;
        }

        // Shuffle playlist
        playlist = shuffleArray([...SONG_FILES]);

        // Create audio element
        audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.volume = 0.5;

        bindEvents();
        buildPlaylistUI();
        createMiniVisBars();

        // Load first track
        loadTrack(0);
    }

    function startPlayback() {
        if (!audio || SONG_FILES.length === 0) return;
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
        els.toggleBtn.addEventListener('click', togglePlay);
        els.expandHint.addEventListener('click', toggleFullPlayer);
        els.closeBtn.addEventListener('click', toggleFullPlayer);
        els.playBtn.addEventListener('click', togglePlay);
        els.prevBtn.addEventListener('click', prevTrack);
        els.nextBtn.addEventListener('click', nextTrack);

        els.seekBar.addEventListener('input', () => {
            if (audio.duration) {
                audio.currentTime = (els.seekBar.value / 100) * audio.duration;
            }
        });

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

        // Close player on outside click
        document.addEventListener('click', (e) => {
            if (isPlayerOpen &&
                !els.fullPlayer.contains(e.target) &&
                !els.miniPlayer.contains(e.target)) {
                toggleFullPlayer();
            }
        });
    }

    function loadTrack(index) {
        currentIndex = index;
        const src = playlist[index];
        audio.src = src;

        // Parse filename for display
        const filename = src.split('/').pop().replace('.mp3', '');
        const parts = filename.split(' - ');
        if (parts.length >= 2) {
            els.trackArtist.textContent = parts[0].trim();
            els.trackName.textContent = parts.slice(1).join(' - ').trim();
        } else {
            els.trackArtist.textContent = '—';
            els.trackName.textContent = filename;
        }

        // Try to read ID3 tags (basic approach)
        updatePlaylistUI();
        els.seekBar.value = 0;
        els.currentTime.textContent = '0:00';
        els.duration.textContent = '0:00';
    }

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
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }

    function nextTrack() {
        const next = (currentIndex + 1) % playlist.length;
        loadTrack(next);
        if (isPlaying) play();
    }

    function prevTrack() {
        // If more than 3 seconds in, restart current track
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
    }

    function updateTimeline() {
        if (!audio.duration) return;
        const progress = (audio.currentTime / audio.duration) * 100;
        els.seekBar.value = progress;
        els.currentTime.textContent = formatTime(audio.currentTime);
    }

    function updateVolumeIcon(vol) {
        if (vol === 0) {
            els.volumeIcon.className = 'fas fa-volume-mute';
        } else if (vol < 0.5) {
            els.volumeIcon.className = 'fas fa-volume-low';
        } else {
            els.volumeIcon.className = 'fas fa-volume-up';
        }
    }

    function toggleFullPlayer() {
        isPlayerOpen = !isPlayerOpen;
        els.fullPlayer.classList.toggle('open', isPlayerOpen);
    }

    // ===== Visualizer =====
    function startVisualizer() {
        if (!analyser || !els.visualizerCanvas) return;

        const canvas = els.visualizerCanvas;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            visualizerAnimId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;
                const hue = 260 + (i / bufferLength) * 40;
                const lightness = 40 + (dataArray[i] / 255) * 30;

                ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                // Reflection
                ctx.globalAlpha = 0.1;
                ctx.fillRect(x, canvas.height, barWidth - 1, barHeight * 0.3);
                ctx.globalAlpha = 1;

                x += barWidth;
            }
        }

        draw();
    }

    function createMiniVisBars() {
        const container = els.miniVisualizer;
        if (!container) return;

        for (let i = 0; i < 5; i++) {
            const bar = document.createElement('div');
            bar.className = 'mini-vis-bar';
            bar.style.height = '4px';
            container.appendChild(bar);
        }
    }

    function startMiniVisualizer() {
        if (!analyser) return;

        const bars = els.miniVisualizer?.querySelectorAll('.mini-vis-bar');
        if (!bars || bars.length === 0) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function update() {
            miniVisAnimId = requestAnimationFrame(update);
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

        els.playlistContainer.innerHTML = playlist.map((src, i) => {
            const filename = src.split('/').pop().replace('.mp3', '');
            return `
                <div class="playlist-item ${i === currentIndex ? 'active' : ''}" data-index="${i}">
                    <span class="playlist-num">${i + 1}</span>
                    <span class="playlist-title">${filename}</span>
                    <div class="playlist-playing-icon">
                        <div class="playlist-playing-bar"></div>
                        <div class="playlist-playing-bar"></div>
                        <div class="playlist-playing-bar"></div>
                    </div>
                </div>
            `;
        }).join('');

        els.playlistContainer.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                loadTrack(index);
                play();
            });
        });
    }

    function updatePlaylistUI() {
        if (!els.playlistContainer) return;

        els.playlistContainer.querySelectorAll('.playlist-item').forEach((item, i) => {
            item.classList.toggle('active', i === currentIndex);
        });
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

    return { init, startPlayback };
})();