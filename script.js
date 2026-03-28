/* ============================================
   AI4S-YB Landing Page — Script
   ============================================ */

// ---- Intersection Observer for reveal animations ----
const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
);
revealItems.forEach((item) => revealObserver.observe(item));

// ---- Navbar scroll effect ----
const navbar = document.getElementById("navbar");
let lastScroll = 0;

function onScroll() {
  const y = window.scrollY;
  if (y > 60) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
  lastScroll = y;
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ---- Year in footer ----
const yearEl = document.getElementById("current-year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// ---- Particle Canvas ----
const canvas = document.getElementById("particle-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let w, h;
  let particles = [];
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 140;
  let animationId;
  let isVisible = true;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.15,
      });
    }
  }

  function draw() {
    if (!isVisible) return;
    ctx.clearRect(0, 0, w, h);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 229, 204, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      if (p.y > h + 10) p.y = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 204, ${p.opacity})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  }

  // Pause when tab is not visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isVisible = false;
      cancelAnimationFrame(animationId);
    } else {
      isVisible = true;
      draw();
    }
  });

  // Check prefers-reduced-motion
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!motionQuery.matches) {
    resize();
    createParticles();
    draw();
    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });
  }
}

// ---- Smooth anchor scroll for nav links ----
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
