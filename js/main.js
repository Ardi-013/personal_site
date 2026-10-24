console.log('Site initialized');document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const themeIcon = document.getElementById('theme-icon');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
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

  function setMode(sticker) {
    currentSticker = sticker;

    stickerBtns.forEach(b => {
      b.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-100', 'dark:bg-amber-900/60');
    });

    if (sticker) {
      if (pointerBtn) {
        pointerBtn.classList.remove('bg-amber-500', 'text-white');
        pointerBtn.classList.add('bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
      }

      const activeBtn = document.querySelector(`.sticker-btn[data-sticker="${sticker}"]`);
      if (activeBtn) {
        activeBtn.classList.add('ring-2', 'ring-amber-500', 'bg-amber-100', 'dark:bg-amber-900/60');
      }

      if (ghostSticker) ghostSticker.textContent = sticker;
      if (corkBoard) corkBoard.style.cursor = 'crosshair';
    } else {
      if (pointerBtn) {
        pointerBtn.classList.remove('bg-white', 'dark:bg-stone-800', 'text-stone-700', 'dark:text-stone-300');
        pointerBtn.classList.add('bg-amber-500', 'text-white');
      }
      if (ghostSticker) ghostSticker.style.display = 'none';
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

  if (corkBoard && ghostSticker) {
    corkBoard.addEventListener('mousemove', (e) => {
      if (!currentSticker) {
        ghostSticker.style.display = 'none';
        return;
      }
      ghostSticker.style.display = 'block';
      ghostSticker.style.left = `${e.clientX + 10}px`;
      ghostSticker.style.top = `${e.clientY + 10}px`;
    });

    corkBoard.addEventListener('mouseleave', () => {
      ghostSticker.style.display = 'none';
    });

    corkBoard.addEventListener('click', (e) => {
      if (!currentSticker) return;
      if (e.target.classList.contains('placed-sticker')) return;

      const rect = corkBoard.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      const randomRot = (Math.random() * 32 - 16).toFixed(1);

      const stickerEl = document.createElement('div');
      stickerEl.className = 'placed-sticker text-3xl sticker-pop';
      stickerEl.textContent = currentSticker;
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
        }, 180);
      });

      stickerLayer.appendChild(stickerEl);
      updateCount(1);
    });
  }

  if (clearBtn && stickerLayer) {
    clearBtn.addEventListener('click', () => {
      const stickers = stickerLayer.querySelectorAll('.placed-sticker');
      stickers.forEach(s => {
        s.classList.add('removing');
        setTimeout(() => s.remove(), 180);
      });
      updateCount(-stickerCount);
    });
  }
});