/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
const scrollBar = document.getElementById('scrollBar');

function updateScrollBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollBar.style.width = progress + '%';
}

/* ============================================================
   NAVBAR SCROLL SHADOW + ACTIVE LINKS
   ============================================================ */
const navbar = document.getElementById('navbar');
const allSecs = document.querySelectorAll('[id]');
const navAs = document.querySelectorAll('.nav-links a[href^="#"]');

function updateNav() {
    const scrollY = window.scrollY;

    // Shadow on scroll
    navbar.classList.toggle('scrolled', scrollY > 10);

    // Active section highlight
    let cur = '';
    allSecs.forEach(s => {
        if (scrollY >= s.offsetTop - 90) cur = s.id;
    });

    navAs.forEach(a => {
        const isActive = a.getAttribute('href') === '#' + cur;
        a.classList.toggle('active', isActive);
        // Keep previous inline style approach but use class instead
        a.style.color = '';
        a.style.fontWeight = '';
    });
}

/* ============================================================
   SCROLL REVEAL — INTERSECTION OBSERVER
   ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const parent = el.parentElement;

        // Stagger siblings
        const sibs = Array.from(parent.querySelectorAll(':scope > .r'));
        const idx = sibs.indexOf(el);
        const delay = Math.min(idx, 5) * 80;

        setTimeout(() => el.classList.add('in'), delay);
        revealObserver.unobserve(el);
    });
}, { threshold: 0.06 });

document.querySelectorAll('.r').forEach(el => revealObserver.observe(el));

/* ============================================================
   TAB SWITCHING
   ============================================================ */
function switchTab(e, id) {
    // Update buttons
    document.querySelectorAll('.tb').forEach(b => b.classList.remove('on'));
    e.currentTarget.classList.add('on');

    // Hide all panels
    document.querySelectorAll('.tp').forEach(p => {
        p.classList.remove('on');
        p.style.animation = 'none';
    });

    // Show target panel with animation
    const panel = document.getElementById('tp-' + id);
    panel.classList.add('on');
    // Force reflow to re-trigger animation
    void panel.offsetWidth;
    panel.style.animation = '';

    // Animate child reveal elements inside the panel
    panel.querySelectorAll('.r').forEach((el, i) => {
        if (!el.classList.contains('in')) {
            el.style.transitionDelay = (i * 60) + 'ms';
            setTimeout(() => {
                el.classList.add('in');
                setTimeout(() => { el.style.transitionDelay = ''; }, 600);
            }, 20);
        }
    });
}

// Expose globally for onclick attributes in HTML
window.switchTab = switchTab;

/* ============================================================
   MOBILE MENU TOGGLE
   ============================================================ */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = menuToggle.querySelectorAll('span');
    const isOpen = navLinks.classList.contains('open');

    // Animate hamburger → ✕
    if (isOpen) {
        spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Close menu on nav link click
navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.querySelectorAll('span').forEach(s => {
            s.style.transform = '';
            s.style.opacity = '';
        });
    });
});

/* ============================================================
   UNIFIED SCROLL HANDLER (passive for performance)
   ============================================================ */
window.addEventListener('scroll', () => {
    updateScrollBar();
    updateNav();
}, { passive: true });

// Run once on load
updateScrollBar();
updateNav();

/* ============================================================
   STAT NUMBER COUNT-UP ANIMATION
   ============================================================ */
function animateCountUp(el, target, suffix, duration) {
    const start = performance.now();
    const isFloat = target % 1 !== 0;
    const startVal = 0;

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = startVal + (target - startVal) * eased;

        el.textContent = isFloat
            ? value.toFixed(2) + suffix
            : Math.floor(value) + suffix;

        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = (isFloat ? target.toFixed(2) : target) + suffix;
    }

    requestAnimationFrame(tick);
}

// Observe stat boxes for count-up
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const box = entry.target;
        const numEl = box.querySelector('.stat-n');
        if (!numEl || numEl.dataset.counted) return;

        numEl.dataset.counted = 'true';
        const raw = numEl.textContent.trim();
        const suffix = raw.replace(/[\d.]/g, '');  // e.g. "+"
        const num = parseFloat(raw);

        if (!isNaN(num)) animateCountUp(numEl, num, suffix, 1000);
        statObserver.unobserve(box);
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-box').forEach(b => statObserver.observe(b));

/* ============================================================
   SMOOTH HASH ANCHOR SCROLL (override default jump)
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});