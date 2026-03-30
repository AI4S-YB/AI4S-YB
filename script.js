/* ============================================
   AI4S-YB Landing Page — Script
   ============================================ */

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

const navbar = document.getElementById("navbar");

function onScroll() {
  const y = window.scrollY;
  if (y > 60) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const yearEl = document.getElementById("current-year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const canvas = document.getElementById("particle-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let w;
  let h;
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
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
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

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
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

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -10) particle.x = w + 10;
      if (particle.x > w + 10) particle.x = -10;
      if (particle.y < -10) particle.y = h + 10;
      if (particle.y > h + 10) particle.y = -10;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 204, ${particle.opacity})`;
      ctx.fill();
    });

    animationId = requestAnimationFrame(draw);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isVisible = false;
      cancelAnimationFrame(animationId);
    } else {
      isVisible = true;
      draw();
    }
  });

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

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
