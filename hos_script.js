/* ============================================================
   HOUSE OF SIX — Premium Hair Salon
   hos_script.js
   ============================================================ */

'use strict';

// Mark body as JS-ready immediately — this activates the
// scroll-reveal CSS (elements start hidden and fade in on scroll).
// If JS never runs, body stays without this class and everything
// is visible by default, so the page is never blank.
document.body.classList.add('js-ready');

/* ── 1. ELEMENT REFERENCES ──────────────────────────────────── */
const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobLinks   = document.querySelectorAll('.mob-link');
const bookForm   = document.getElementById('bookForm');
const bookSuccess = document.getElementById('bookSuccess');
const tabBtns    = document.querySelectorAll('.tab-btn');
const galItems   = document.querySelectorAll('.gal-item');
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lbImg');
const lbCap      = document.getElementById('lbCap');
const lbClose    = document.getElementById('lbClose');
const lbPrev     = document.getElementById('lbPrev');
const lbNext     = document.getElementById('lbNext');
const footerYear = document.getElementById('footerYear');


/* ── 2. COPYRIGHT YEAR ──────────────────────────────────────── */
if (footerYear) footerYear.textContent = new Date().getFullYear();


/* ── 3. STICKY NAVBAR ───────────────────────────────────────── */
/**
 * Adds `.scrolled` to navbar once page scrolls past the hero.
 * Transparent at top, dark glass after.
 */
function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


/* ── 4. HERO IMAGE PARALLAX + LOAD ─────────────────────────── */
const heroSection = document.querySelector('.hero');
const heroImg     = document.querySelector('.hero-img');

if (heroImg) {
  const triggerLoad = () => heroSection?.classList.add('loaded');
  heroImg.complete ? triggerLoad() : heroImg.addEventListener('load', triggerLoad);
}

// Subtle parallax on hero image
window.addEventListener('scroll', () => {
  if (!heroImg) return;
  const scrolled = window.scrollY;
  if (scrolled < window.innerHeight) {
    heroImg.style.transform = `scale(1) translateY(${scrolled * 0.18}px)`;
  }
}, { passive: true });


/* ── 5. HAMBURGER / MOBILE MENU ─────────────────────────────── */
function openMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
});

mobLinks.forEach(l => l.addEventListener('click', closeMenu));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeMenu(); closeLightbox(); }
});


/* ── 6. SCROLL REVEAL ───────────────────────────────────────── */
/**
 * IntersectionObserver-based scroll reveal.
 * Elements with class `.reveal` fade up into view once.
 */
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* ── 7. SMOOTH SCROLL WITH OFFSET ───────────────────────────── */
/**
 * Accounts for fixed navbar height when jumping to sections.
 */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight;
    const top    = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ── 8. PRICE TABS ──────────────────────────────────────────── */
/**
 * Simple tab switcher for the Prices section.
 * Activates matching panel and resets reveal animations.
 */
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active tab button
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show matching panel
    const target = btn.dataset.tab;
    document.querySelectorAll('.price-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const activePanel = document.getElementById(`tab-${target}`);
    if (activePanel) {
      activePanel.classList.add('active');

      // Re-trigger scroll reveal for newly visible rows
      activePanel.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('visible');
        setTimeout(() => revealObs.observe(el), 20);
      });
    }
  });
});


/* ── 9. BOOKING FORM ────────────────────────────────────────── */
/**
 * Handles form submission with basic field validation.
 * Shows success message (demo — no backend).
 */
if (bookForm) {
  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate required fields
    const required = bookForm.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = 'rgba(180,60,60,.7)';
        field.addEventListener('input', () => {
          field.style.borderColor = '';
        }, { once: true });
      }
    });

    if (!valid) return;

    // Simulate send
    const btn = bookForm.querySelector('.submit-btn span');
    btn.textContent = 'Sending…';
    bookForm.querySelector('.submit-btn').disabled = true;

    setTimeout(() => {
      bookForm.reset();
      btn.textContent = 'Confirm Booking';
      bookForm.querySelector('.submit-btn').disabled = false;
      bookSuccess.classList.add('visible');
      setTimeout(() => bookSuccess.classList.remove('visible'), 5500);
    }, 1000);
  });
}


/* ── 10. GALLERY LIGHTBOX ───────────────────────────────────── */
/**
 * Full-featured lightbox with prev/next nav,
 * keyboard support, and touch swipe.
 */
let currentIdx = 0;

// Build data array from gallery items
const galData = Array.from(galItems).map(item => ({
  src:     item.querySelector('img').src,
  alt:     item.querySelector('img').alt,
  caption: item.querySelector('.gal-caption span')?.textContent || '',
}));

function openLightbox(idx) {
  currentIdx = idx;
  updateLB();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function updateLB() {
  const d = galData[currentIdx];
  if (!d) return;
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src        = d.src;
    lbImg.alt        = d.alt;
    lbCap.textContent = d.caption;
    lbImg.style.opacity = '1';
  }, 220);
}

function prevLB() {
  currentIdx = (currentIdx - 1 + galData.length) % galData.length;
  updateLB();
}

function nextLB() {
  currentIdx = (currentIdx + 1) % galData.length;
  updateLB();
}

// Attach click to gallery items
galItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
  });
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', prevLB);
lbNext.addEventListener('click', nextLB);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  prevLB();
  if (e.key === 'ArrowRight') nextLB();
});

// Touch swipe
let touchX = 0;
lightbox.addEventListener('touchstart', (e) => {
  touchX = e.changedTouches[0].screenX;
}, { passive: true });
lightbox.addEventListener('touchend', (e) => {
  const delta = e.changedTouches[0].screenX - touchX;
  if (Math.abs(delta) > 50) { delta < 0 ? nextLB() : prevLB(); }
}, { passive: true });


/* ── 11. ACTIVE NAV LINK HIGHLIGHTING ───────────────────────── */
/**
 * Highlights the corresponding nav link as sections scroll into view.
 */
const allSections = document.querySelectorAll('section[id]');
const allNavLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

const secObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        allNavLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}`
            ? 'var(--gold-light)'
            : '';
        });
      }
    });
  },
  { threshold: 0.45 }
);

allSections.forEach(s => secObserver.observe(s));
