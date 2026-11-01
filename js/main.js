document.addEventListener('DOMContentLoaded', () => {

  const corkBoard = document.getElementById('cork-board');
  const cardsContainer = document.getElementById('cards-container');

  function renderCorkTexture() {
    if (!corkBoard) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ba8852';
    ctx.fillRect(0, 0, 320, 320);

    const shades = ['#7c461d', '#572e10', '#d89f66', '#9c6434', '#e2b582', '#45220c'];
    for (let i = 0; i < 4500; i++) {
      const x = Math.random() * 320, y = Math.random() * 320, r = Math.random() * 2 + 0.3;
      ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
      ctx.globalAlpha = Math.random() * 0.45 + 0.1;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 320, y = Math.random() * 320, w = Math.random() * 14 + 4, h = Math.random() * 6 + 2;
      ctx.fillStyle = Math.random() > 0.4 ? '#4a250a' : '#f0c896';
      ctx.globalAlpha = Math.random() * 0.35 + 0.15;
      ctx.beginPath(); ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
    }

    const patternUrl = canvas.toDataURL();
    const vignette = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.35) 100%)';
    corkBoard.style.backgroundImage = `${vignette}, url(${patternUrl})`;
    corkBoard.style.backgroundRepeat = 'repeat';
  }

  renderCorkTexture();

  // Выключатель гирлянды
  const garlandToggle = document.getElementById('garland-toggle');
  if (garlandToggle && corkBoard) {
    garlandToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      corkBoard.classList.toggle('garland-on');
    });
  }

  // Копирование почты
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailIcon = document.getElementById('email-icon');
  const emailText = document.getElementById('email-text');

  if (copyEmailBtn && emailText) {
    let copyTimeout = null;
    copyEmailBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const email = copyEmailBtn.getAttribute('data-email') || 'kozik.dv@dvfu.ru';
      navigator.clipboard.writeText(email).then(() => {
        if (copyTimeout) clearTimeout(copyTimeout);
        if (emailIcon) emailIcon.textContent = '✅';
        emailText.textContent = 'Скопировано!';
        emailText.classList.add('text-emerald-700');
        copyTimeout = setTimeout(() => {
          if (emailIcon) emailIcon.textContent = '✉️';
          emailText.textContent = email;
          emailText.classList.remove('text-emerald-700');
        }, 2000);
      });
    });
  }

  // ================= МУЗЫКАЛЬНЫЙ ПЛЕЕР-ВИДЖЕТ =================
  const trackBtns = Array.from(document.querySelectorAll('.playlist-track'));
  const playerTitle = document.getElementById('player-title');
  const playerArtist = document.getElementById('player-artist');
  const playerCurrTime = document.getElementById('player-curr-time');
  const playerDurTime = document.getElementById('player-dur-time');
  const playerProgress = document.getElementById('player-progress');
  const playerCover = document.getElementById('player-cover');
  const playerToggle = document.getElementById('player-toggle');
  const playerPrev = document.getElementById('player-prev');
  const playerNext = document.getElementById('player-next');
  const playerStatusText = document.getElementById('player-status-text');
  const playerStatusDot = document.getElementById('player-status-dot');

  let currentTrackIndex = 0;
  let isPlaying = true;

  function setPlayingState(playing) {
    isPlaying = playing;
    if (playerToggle) playerToggle.textContent = isPlaying ? '⏸' : '▶';
    if (playerStatusText) playerStatusText.textContent = isPlaying ? 'сейчас играет...' : 'на паузе';
    if (playerStatusDot) playerStatusDot.classList.toggle('animate-pulse', isPlaying);
  }

  function selectTrack(index) {
    if (!trackBtns.length) return;
    currentTrackIndex = (index + trackBtns.length) % trackBtns.length;
    const btn = trackBtns[currentTrackIndex];

    trackBtns.forEach((b, idx) => {
      const isSelected = idx === currentTrackIndex;
      b.classList.toggle('is-active', isSelected);
      const ind = b.querySelector('.track-indicator');
      if (ind) ind.textContent = isSelected ? '▸' : '';
    });

    if (playerTitle) playerTitle.textContent = btn.dataset.title;
    if (playerArtist) playerArtist.textContent = btn.dataset.artist;
    if (playerCurrTime) playerCurrTime.textContent = btn.dataset.curr;
    if (playerDurTime) playerDurTime.textContent = btn.dataset.dur;
    if (playerProgress) playerProgress.style.width = btn.dataset.prog;

    if (playerCover && btn.dataset.cover) {
      playerCover.src = btn.dataset.cover;
    }

    setPlayingState(true);
  }

  trackBtns.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectTrack(idx);
    });
  });

  if (playerToggle) {
    playerToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setPlayingState(!isPlaying);
    });
  }

  if (playerPrev) {
    playerPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      selectTrack(currentTrackIndex - 1);
    });
  }

  if (playerNext) {
    playerNext.addEventListener('click', (e) => {
      e.stopPropagation();
      selectTrack(currentTrackIndex + 1);
    });
  }

  // ================= ОТКРЫТИЕ И ЗАКРЫТИЕ КАРТОЧЕК =================
  const boardCards = document.querySelectorAll('.board-card');

  function updateContainerZIndex() {
    const hasAnyOpen = Array.from(boardCards).some(c => c.classList.contains('is-open'));
    if (cardsContainer) {
      cardsContainer.classList.toggle('has-open-card', hasAnyOpen);
    }
  }

  boardCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (currentSticker || e.target.closest('a, button, .placed-sticker, .music-paper-widget')) return;

      e.stopPropagation();
      const wasOpen = card.classList.contains('is-open');

      boardCards.forEach(c => {
        c.classList.remove('is-open', 'force-closed');
      });

      if (!wasOpen) {
        card.classList.add('is-open');
      } else {
        card.classList.add('force-closed');
      }
      updateContainerZIndex();
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('force-closed');
      updateContainerZIndex();
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.board-card')) {
      boardCards.forEach(c => c.classList.remove('is-open', 'force-closed'));
      updateContainerZIndex();
    }
  });

  // ================= ЛОГИКА СТИКЕРОВ И LOCALSTORAGE =================
  const stickerLayer = document.getElementById('sticker-layer');
  const stickerBtns = document.querySelectorAll('.sticker-btn');
  const pointerBtn = document.getElementById('pointer-btn');
  const clearBtn = document.getElementById('clear-stickers-btn');
  const ghostSticker = document.getElementById('ghost-sticker');
  const stickerCountEl = document.getElementById('sticker-count');

  let currentSticker = null;
  let stickerCount = 0;

  function updateCount(delta) {
    stickerCount = Math.max(0, stickerCount + delta);
    if (stickerCountEl) stickerCountEl.textContent = stickerCount;
  }

  function saveStickersToStorage() {
    if (!stickerLayer) return;
    const stickers = [];
    stickerLayer.querySelectorAll('.placed-sticker').forEach(el => {
      stickers.push({
        emoji: el.dataset.emoji,
        x: el.style.left,
        y: el.style.top,
        rot: el.dataset.rot
      });
    });
    localStorage.setItem('cork_stickers', JSON.stringify(stickers));
  }

  function loadStickersFromStorage() {
    if (!stickerLayer) return;
    const saved = localStorage.getItem('cork_stickers');
    if (!saved) return;
    try {
      const stickers = JSON.parse(saved);
      stickers.forEach(s => {
        createStickerElement(s.emoji, s.x, s.y, s.rot, false);
      });
    } catch (e) {
      console.error('Ошибка загрузки стикеров', e);
    }
  }

  function createStickerElement(emoji, xPercent, yPercent, rot, save = true) {
    const stickerEl = document.createElement('div');
    stickerEl.className = 'placed-sticker text-3xl sm:text-4xl sticker-pop';
    stickerEl.textContent = emoji;
    stickerEl.dataset.emoji = emoji;
    stickerEl.style.left = xPercent;
    stickerEl.style.top = yPercent;
    stickerEl.setAttribute('role', 'button');
    
    const randomRot = rot || (Math.random() * 32 - 16).toFixed(1);
    stickerEl.dataset.rot = randomRot;
    stickerEl.style.transform = `translate(-50%, -50%) rotate(${randomRot}deg)`;
    stickerEl.title = 'Кликни, чтобы отлепить';

    stickerEl.addEventListener('click', (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      if (stickerEl.dataset.removing === 'true') return;
      stickerEl.dataset.removing = 'true';
      stickerEl.style.pointerEvents = 'none';
      stickerEl.classList.add('removing');
      setTimeout(() => {
        stickerEl.remove();
        updateCount(-1);
        saveStickersToStorage();
      }, 160);
    });

    stickerLayer.appendChild(stickerEl);
    updateCount(1);
    if (save) saveStickersToStorage();
  }

  loadStickersFromStorage();

  function setMode(sticker) {
    currentSticker = sticker;
    stickerBtns.forEach(b => b.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-100'));
    if (sticker) {
      const activeBtn = document.querySelector(`.sticker-btn[data-sticker="${sticker}"]`);
      if (activeBtn) activeBtn.classList.add('ring-2', 'ring-amber-500', 'bg-amber-100');
      if (pointerBtn) {
        pointerBtn.classList.remove('bg-amber-500', 'text-white');
        pointerBtn.classList.add('bg-white', 'text-stone-700');
      }
      if (ghostSticker) ghostSticker.textContent = sticker;
      if (corkBoard) corkBoard.style.cursor = 'crosshair';
    } else {
      if (pointerBtn) {
        pointerBtn.classList.remove('bg-white', 'text-stone-700');
        pointerBtn.classList.add('bg-amber-500', 'text-white');
      }
      if (ghostSticker) ghostSticker.classList.add('hidden');
      if (corkBoard) corkBoard.style.cursor = 'default';
    }
  }

  stickerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sticker = btn.getAttribute('data-sticker');
      setMode(currentSticker === sticker ? null : sticker);
    });
  });

  if (pointerBtn) {
    pointerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setMode(null);
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMode(null);
  });

  if (corkBoard) {
    corkBoard.addEventListener('mousemove', (e) => {
      if (!currentSticker || !ghostSticker) {
        if (ghostSticker) ghostSticker.classList.add('hidden');
        return;
      }
      ghostSticker.classList.remove('hidden');
      ghostSticker.style.left = `${e.clientX + 12}px`;
      ghostSticker.style.top = `${e.clientY + 12}px`;
    });

    corkBoard.addEventListener('mouseleave', () => {
      if (ghostSticker) ghostSticker.classList.add('hidden');
    });

    corkBoard.addEventListener('click', (e) => {
      if (!currentSticker) return;
      if (e.target.closest('.placed-sticker')) return;
      if (e.target.closest('.board-card, .hover-note, .paper-badge, footer')) return;

      const rect = corkBoard.getBoundingClientRect();
      const xPercent = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1) + '%';
      const yPercent = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1) + '%';

      createStickerElement(currentSticker, xPercent, yPercent, null, true);
    });
  }

  if (clearBtn && stickerLayer) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const stickers = stickerLayer.querySelectorAll('.placed-sticker');
      stickers.forEach(s => {
        s.classList.add('removing');
        setTimeout(() => s.remove(), 160);
      });
      updateCount(-stickerCount);
      localStorage.removeItem('cork_stickers');
    });
  }
});