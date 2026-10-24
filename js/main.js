document.addEventListener('DOMContentLoaded', () => {

  function applyCorkTexture() {
    const corkBoard = document.getElementById('cork-board');
    if (!corkBoard) return;

    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ba8753';
    ctx.fillRect(0, 0, 300, 300);

    const shades = ['#7c461d', '#572e10', '#d89f66', '#9c6434', '#e2b582', '#45220c'];
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 300;
      const y = Math.random() * 300;
      const r = Math.random() * 2 + 0.3;
      ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
      ctx.globalAlpha = Math.random() * 0.45 + 0.1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 300;
      const y = Math.random() * 300;
      const w = Math.random() * 12 + 4;
      const h = Math.random() * 6 + 2;
      ctx.fillStyle = Math.random() > 0.4 ? '#4a250a' : '#f0c896';
      ctx.globalAlpha = Math.random() * 0.35 + 0.15;
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const patternUrl = canvas.toDataURL();
    corkBoard.style.backgroundImage = `
      radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0.35) 100%),
      url(${patternUrl})
    `;
    corkBoard.style.backgroundRepeat = 'repeat';
  }

  applyCorkTexture();

  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const themeIcon = document.getElementById('theme-icon');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      if (themeLabel) themeLabel.textContent = isDark ? 'Ночь' : 'День';
      if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
    });
  }

  const corkBoard = document.getElementById('cork-board');
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

  function spawnSticker(emoji, xPercent, yPercent) {
    if (!stickerLayer) return;

    const randomRot = (Math.random() * 32 - 16).toFixed(1);

    const stickerEl = document.createElement('div');
    stickerEl.className = 'placed-sticker text-3xl sm:text-4xl sticker-pop';
    stickerEl.textContent = emoji;
    stickerEl.style.left = `${xPercent}%`;
    stickerEl.style.top = `${yPercent}%`;
    stickerEl.style.transform = `translate(-50%, -50%) rotate(${randomRot}deg)`;
    stickerEl.title = 'Кликни, чтобы отлепить';

    stickerEl.addEventListener('click', (ev) => {
      ev.stopPropagation(); 
      stickerEl.classList.add('removing');
      setTimeout(() => {
        stickerEl.remove();
        updateCount(-1);
      }, 160);
    });

    stickerLayer.appendChild(stickerEl);
    updateCount(1);
  }

  function setMode(sticker) {
    currentSticker = sticker;

    stickerBtns.forEach(b => {
      b.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-100', 'dark:bg-amber-900/60');
    });

    if (sticker) {
      const activeBtn = document.querySelector(`.sticker-btn[data-sticker="${sticker}"]`);
      if (activeBtn) {
        activeBtn.classList.add('ring-2', 'ring-amber-500', 'bg-amber-100', 'dark:bg-amber-900/60');
      }

      if (pointerBtn) {
        pointerBtn.classList.remove('bg-amber-500', 'text-white');
        pointerBtn.classList.add('bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
      }

      if (ghostSticker) ghostSticker.textContent = sticker;
      if (corkBoard) corkBoard.style.cursor = 'crosshair';
    } else {
      if (pointerBtn) {
        pointerBtn.classList.remove('bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        pointerBtn.classList.add('bg-amber-500', 'text-white');
      }
      if (ghostSticker) ghostSticker.classList.add('hidden');
      if (corkBoard) corkBoard.style.cursor = 'default';
    }
  }

  stickerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sticker = btn.getAttribute('data-sticker');
      if (currentSticker === sticker) {
        setMode(null);
      } else {
        setMode(sticker);
      }
    });
  });

  if (pointerBtn) {
    pointerBtn.addEventListener('click', () => setMode(null));
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
      if (e.target.classList.contains('placed-sticker')) return;

      const rect = corkBoard.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      spawnSticker(currentSticker, xPercent.toFixed(1), yPercent.toFixed(1));
    });
  }

  if (clearBtn && stickerLayer) {
    clearBtn.addEventListener('click', () => {
      const stickers = stickerLayer.querySelectorAll('.placed-sticker');
      stickers.forEach(s => {
        s.classList.add('removing');
        setTimeout(() => s.remove(), 160);
      });
      updateCount(-stickerCount);
    });
  }
});