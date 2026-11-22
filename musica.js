(() => {
  const STORAGE_TIME_KEY = 'jeremy_music_time';
  const STORAGE_PLAYING_KEY = 'jeremy_music_playing';
  const STORAGE_PAUSED_KEY = 'jeremy_music_paused';

  function getAudioElement() {
    let audio = document.getElementById('bgMusic');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'bgMusic';
      audio.src = 'Mananitas.mp3';
      audio.preload = 'auto';
      document.body.appendChild(audio);
    }
    audio.loop = true;
    return audio;
  }

  const bgMusic = getAudioElement();

  function isManuallyPaused() {
    return localStorage.getItem(STORAGE_PAUSED_KEY) === '1';
  }

  function syncAudioUi() {
    const audioToggle = document.getElementById('audioToggle');
    const audioState = document.getElementById('audioState');
    if (!audioToggle || !audioState) return;

    if (!bgMusic.paused) {
      audioToggle.textContent = '❚❚';
      audioState.textContent = 'En bucle';
    } else {
      audioToggle.textContent = '▶';
      audioState.textContent = isManuallyPaused() ? 'Pausado' : 'Listo';
    }
  }

  function playSong() {
    localStorage.setItem(STORAGE_PLAYING_KEY, '1');
    localStorage.setItem(STORAGE_PAUSED_KEY, '0');
    bgMusic.volume = 1.0;
    bgMusic.play().then(syncAudioUi).catch(syncAudioUi);
  }

  function pauseSong() {
    localStorage.setItem(STORAGE_PLAYING_KEY, '0');
    localStorage.setItem(STORAGE_PAUSED_KEY, '1');
    bgMusic.pause();
    syncAudioUi();
  }

  function toggleAudio() {
    if (bgMusic.paused) {
      playSong();
    } else {
      pauseSong();
    }
  }

  function saveProgress() {
    if (!isNaN(bgMusic.currentTime)) {
      localStorage.setItem(STORAGE_TIME_KEY, String(bgMusic.currentTime));
    }
    localStorage.setItem(STORAGE_PLAYING_KEY, bgMusic.paused ? '0' : '1');
  }

  window.playSong = playSong;
  window.pauseSong = pauseSong;
  window.toggleAudio = toggleAudio;

  setInterval(() => {
    if (!bgMusic.paused) {
      localStorage.setItem(STORAGE_TIME_KEY, String(bgMusic.currentTime));
    }
  }, 250);

  window.addEventListener('beforeunload', saveProgress);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveProgress();
  });

  window.addEventListener('DOMContentLoaded', () => {
    const savedTime = parseFloat(localStorage.getItem(STORAGE_TIME_KEY) || '0');
    const wasPlaying = localStorage.getItem(STORAGE_PLAYING_KEY) === '1';
    const pausedManual = isManuallyPaused();

    const applySavedTime = () => {
      if (!isNaN(savedTime) && savedTime > 0) {
        if (bgMusic.duration && savedTime < bgMusic.duration) {
          bgMusic.currentTime = savedTime;
        } else if (!bgMusic.duration) {
          bgMusic.currentTime = savedTime;
        }
      }
    };

    if (bgMusic.readyState >= 1) {
      applySavedTime();
    } else {
      bgMusic.addEventListener('loadedmetadata', applySavedTime, { once: true });
    }

    if (wasPlaying && !pausedManual) {
      const introScreen = document.getElementById('intro-screen');
      if (introScreen) introScreen.classList.add('hide');
      if (typeof window.startMessiCameos === 'function') {
        window.startMessiCameos();
      }

      bgMusic.volume = 1.0;
      bgMusic.play().then(syncAudioUi).catch(() => {
        const resumeOnInteraction = () => {
          if (!isManuallyPaused()) {
            bgMusic.play().then(syncAudioUi).catch(() => {});
          }
          document.removeEventListener('pointerdown', resumeOnInteraction);
          document.removeEventListener('keydown', resumeOnInteraction);
        };
        document.addEventListener('pointerdown', resumeOnInteraction, { once: true });
        document.addEventListener('keydown', resumeOnInteraction, { once: true });
        syncAudioUi();
      });
    } else {
      syncAudioUi();
    }
  });
})();