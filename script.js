/* ============================================================
   JASPER NAUS — PORTFOLIO 2026
   script.js
   ============================================================ */


/* ----------------------------------------
   UTILITY
   ---------------------------------------- */
const $ = id => document.getElementById(id);
const isMobile = () => window.innerWidth <= 768;


/* ----------------------------------------
   IMAGE CYCLING
   ---------------------------------------- */
(() => {
  let pointerStartX = 0;
  let pointerMoved  = false;
  const SWIPE_THRESHOLD = 40;

  document.addEventListener('pointerdown', e => {
    if (!e.target.closest('.project')) return;
    pointerStartX = e.clientX;
    pointerMoved  = false;
  });

  document.addEventListener('pointermove', e => {
    if (Math.abs(e.clientX - pointerStartX) > 8) pointerMoved = true;
  });

  document.addEventListener('pointerup', e => {
    const project = e.target.closest('.project');
    if (!project) return;

    const images = parseImages(project);
    if (!images.length) return;

    const imgEl = project.querySelector('img');
    if (!imgEl) return;

    const diffX = e.clientX - pointerStartX;
    let index   = parseInt(project.dataset.currentIndex || '0', 10);

    if (pointerMoved && Math.abs(diffX) > SWIPE_THRESHOLD) {
      index = diffX < 0
        ? (index + 1) % images.length
        : (index - 1 + images.length) % images.length;
    } else if (!pointerMoved) {
      index = (index + 1) % images.length;
    }

    imgEl.src = images[index];
    project.dataset.currentIndex = index;
    updateDots(project, images.length, index);
  });

  // Trackpad horizontal swipe
  let lastWheelTime = 0;
  const WHEEL_THROTTLE  = 250;
  const WHEEL_THRESHOLD = 10;

  document.addEventListener('wheel', e => {
    const project = e.target.closest('.project');
    if (!project) return;
    if (Math.abs(e.deltaX) < WHEEL_THRESHOLD) return;
    const now = Date.now();
    if (now - lastWheelTime < WHEEL_THROTTLE) return;
    lastWheelTime = now;

    const images = parseImages(project);
    if (!images.length) return;
    const imgEl = project.querySelector('img');
    if (!imgEl) return;

    let index = parseInt(project.dataset.currentIndex || '0', 10);
    index = e.deltaX > 0
      ? (index + 1) % images.length
      : (index - 1 + images.length) % images.length;

    imgEl.src = images[index];
    project.dataset.currentIndex = index;
    updateDots(project, images.length, index);
  }, { passive: true });

  document.addEventListener('dragstart', e => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  function parseImages(project) {
    return (project.dataset.images || '').split(',').map(s => s.trim()).filter(Boolean);
  }

  function updateDots(project, total, active) {
    const track = project.querySelector('.dot-track');
    if (!track) return;
    track.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === active);
    });
  }

  // Build dot indicators
  document.querySelectorAll('.project').forEach(project => {
    const images = parseImages(project);
    if (images.length < 2) return;
    const track = document.createElement('div');
    track.className = 'dot-track';
    images.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      track.appendChild(dot);
    });
    project.appendChild(track);
  });
})();


/* ----------------------------------------
   INFINITE SCROLL — desktop dual columns
   ---------------------------------------- */
(() => {
  if (isMobile()) return;

  document.querySelectorAll('.column').forEach(column => {
    const originals     = Array.from(column.querySelectorAll('.project'));
    if (!originals.length) return;
    const projectHeight = column.clientHeight;
    const BUFFER        = 2;

    for (let b = BUFFER; b > 0; b--) {
      originals.slice().reverse().forEach(p => {
        column.insertBefore(p.cloneNode(true), column.firstChild);
      });
    }
    for (let b = 0; b < BUFFER; b++) {
      originals.forEach(p => column.appendChild(p.cloneNode(true)));
    }

    column.scrollTop = originals.length * BUFFER * projectHeight;

    column.addEventListener('scroll', () => {
      const st          = column.scrollTop;
      const total       = column.scrollHeight;
      const blockHeight = originals.length * projectHeight;
      if (st < blockHeight) {
        column.scrollTop = st + blockHeight;
      } else if (st > total - blockHeight - projectHeight) {
        column.scrollTop = st - blockHeight;
      }
    }, { passive: true });
  });
})();


/* ----------------------------------------
   MOBILE LAYOUT — interleave columns
   ---------------------------------------- */
(() => {
  if (!isMobile()) return;

  const colLeft  = $('columnLeft');
  const colRight = $('columnRight');
  const columns  = document.querySelector('.columns');
  if (!colLeft || !colRight || !columns) return;

  const leftProjects  = Array.from(colLeft.querySelectorAll('.project'));
  const rightProjects = Array.from(colRight.querySelectorAll('.project'));
  const max           = Math.max(leftProjects.length, rightProjects.length);

  colLeft.remove();
  colRight.remove();

  for (let i = 0; i < max; i++) {
    if (leftProjects[i])  columns.appendChild(leftProjects[i]);
    if (rightProjects[i]) columns.appendChild(rightProjects[i]);
  }
})();


/* ----------------------------------------
   INFO OVERLAY
   ---------------------------------------- */
(() => {
  const overlay     = $('aboutOverlay');
  const infoBtn     = $('aboutButton');
  const closeBtn    = $('closeAbout');
  const infoLink    = $('aboutLink');
  const cvLink      = $('cvLink');
  const infoContent = $('aboutContent');
  const cvContent   = $('cvContent');

  if (!overlay || !infoBtn || !closeBtn) return;

  function openOverlay() {
    overlay.classList.add('is-open');
    infoBtn.style.display = 'none';
  }

  function closeOverlay() {
    overlay.classList.remove('is-open');
    infoBtn.style.display = '';
    infoContent?.classList.remove('is-open');
    cvContent?.classList.remove('is-open');
  }

  function togglePanel(panel, other) {
    const isOpen = panel.classList.contains('is-open');
    other.classList.remove('is-open');
    panel.classList.toggle('is-open', !isOpen);
  }

  infoBtn.addEventListener('click', openOverlay);
  closeBtn.addEventListener('click', closeOverlay);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
  });

  infoLink?.addEventListener('click', () => togglePanel(infoContent, cvContent));
  cvLink?.addEventListener('click',   () => togglePanel(cvContent, infoContent));
})();


/* ----------------------------------------
   CUSTOM CURSOR — desktop only
   ---------------------------------------- */
(() => {
  if (isMobile()) return;

  const cursor = $('customCursor');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let posX   = 0, posY   = 0;
  const EASE = 0.35;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    posX += (mouseX - posX) * EASE;
    posY += (mouseY - posY) * EASE;
    cursor.style.left = `${posX}px`;
    cursor.style.top  = `${posY}px`;
    requestAnimationFrame(animate);
  }
  animate();

  const HOVER = '#aboutButton, #closeAbout, #aboutLink, #cvLink, #announcement, a, button';

  document.addEventListener('mouseover', e => {
    if (e.target.closest(HOVER)) cursor.style.setProperty('--scale', '1.8');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(HOVER)) cursor.style.setProperty('--scale', '1');
  });

  window.addEventListener('mousedown', () => {
    cursor.style.setProperty('--scale', '1.8');
    setTimeout(() => cursor.style.setProperty('--scale', '1'), 150);
  });
})();