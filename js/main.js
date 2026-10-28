document.addEventListener('DOMContentLoaded', () => {

  const corkBoard = document.getElementById('cork-board');

  // Отрисовываем текстуру пробки один раз — фон статичен
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
      const x = Math.random() * 320;
      const y = Math.random() * 320;
      const r = Math.random() * 2 + 0.3;
      ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
      ctx.globalAlpha = Math.random() * 0.45 + 0.1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * 320;
      const y = Math.random() * 320;
      const w = Math.random() * 14 + 4;
      const h = Math.random() * 6 + 2;
      ctx.fillStyle = Math.random() > 0.4 ? '#4a250a' : '#f0c896';
      ctx.globalAlpha = Math.random() * 0.35 + 0.15;
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const patternUrl = canvas.toDataURL();
    const vignette = 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.35) 100%)';

    corkBoard.style.backgroundImage = `${vignette}, url(${patternUrl})`;
    corkBoard.style.backgroundRepeat = 'repeat';
  }

  renderCorkTexture();

  // Выключатель гирлянды (только лампочки)
  const garlandToggle = document.getElementById('garland-toggle');
  if (garlandToggle && corkBoard) {
    garlandToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      corkBoard.classList.toggle('garland-on');
    });
  }

  // Копирование корпоративной почты по клику на кнопку в футере
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailIcon = document.getElementById('email-icon');
  const emailText = document.getElementById('email-text');
  const emailCopyHint = document.getElementById('email-copy-hint');

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
        if (emailCopyHint) emailCopyHint.classList.add('hidden');

        copyTimeout = setTimeout(() => {
          if (emailIcon) emailIcon.textContent = '✉️';
          emailText.textContent = email;
          emailText.classList.remove('text-emerald-700');
          if (emailCopyHint) emailCopyHint.classList.remove('hidden');
        }, 2000);
      });
    });
  }

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
      b.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-100');
    });

    if (sticker) {
      const activeBtn = document.querySelector(`.sticker-btn[data-sticker="${sticker}"]`);
      if (activeBtn) {
        activeBtn.classList.add('ring-2', 'ring-amber-500', 'bg-amber-100');
      }

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
      if (currentSticker === sticker) {
        setMode(null);
      } else {
        setMode(sticker);
      }
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
      if (e.target.classList.contains('placed-sticker')) return;

      // Запрещаем клеить стикеры на карточки, выезжающие бумажки, бейджи в шапке и футер
      if (e.target.closest('.board-card, .hover-note, .paper-badge, footer')) return;

      const rect = corkBoard.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

      spawnSticker(currentSticker, xPercent.toFixed(1), yPercent.toFixed(1));
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
    });
  }
});