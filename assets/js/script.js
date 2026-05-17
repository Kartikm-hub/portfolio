const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const revealElements = document.querySelectorAll("[data-reveal]");
const scrollTopButton = document.querySelector(".scroll-top");
const sections = document.querySelectorAll("main section[id]");
const toast = document.querySelector(".toast");
const placeholderLinks = document.querySelectorAll("[data-placeholder-link]");

// Mobile navigation toggle.
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    });
  });
}

// Sticky header and scroll-to-top visibility.
const updateScrollUI = () => {
  const scrolled = window.scrollY > 24;
  header?.classList.toggle("scrolled", scrolled);
  scrollTopButton?.classList.toggle("visible", window.scrollY > 500);
};

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("load", updateScrollUI);

scrollTopButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Scroll reveal animation using IntersectionObserver.
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -40px 0px"
  }
);

revealElements.forEach((element) => revealObserver.observe(element));

// Fallback: ensure content is visible if reveal animations do not trigger.
window.setTimeout(() => {
  revealElements.forEach((element) => element.classList.add("revealed"));
}, 1200);

// Highlight the active navigation item based on the visible section.
const navMap = new Map(
  [...navLinks].map((link) => [link.getAttribute("href")?.replace("#", ""), link])
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => link.classList.remove("active"));
      navMap.get(entry.target.id)?.classList.add("active");
    });
  },
  {
    threshold: 0.45
  }
);

sections.forEach((section) => sectionObserver.observe(section));

// Simple toast helper for placeholder actions and form feedback.
let toastTimer;

function showToast(message) {
  if (!toast) {
    return;
  }

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

placeholderLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showToast("Project links can be updated with your live demos and repositories.");
  });
});

// Ambient particle field for subtle futuristic motion.
const canvas = document.getElementById("particle-canvas");
const context = canvas?.getContext("2d");

if (canvas && context) {
  const particles = [];
  const maxParticles = window.innerWidth < 768 ? 36 : 64;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    const speedScale = window.innerWidth < 768 ? 0.22 : 0.35;

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.2 + 0.8,
      speedX: (Math.random() - 0.5) * speedScale,
      speedY: (Math.random() - 0.5) * speedScale,
      alpha: Math.random() * 0.5 + 0.2
    };
  }

  function fillParticles() {
    particles.length = 0;
    for (let index = 0; index < maxParticles; index += 1) {
      particles.push(createParticle());
    }
  }

  function drawParticles() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle, index) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < 0 || particle.x > canvas.width) {
        particle.speedX *= -1;
      }

      if (particle.y < 0 || particle.y > canvas.height) {
        particle.speedY *= -1;
      }

      context.beginPath();
      context.fillStyle = `rgba(120, 220, 255, ${particle.alpha})`;
      context.shadowBlur = 14;
      context.shadowColor = "rgba(124, 108, 255, 0.5)";
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();

      for (let compareIndex = index + 1; compareIndex < particles.length; compareIndex += 1) {
        const other = particles[compareIndex];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 120) {
          continue;
        }

        context.beginPath();
        context.strokeStyle = `rgba(124, 108, 255, ${0.16 - distance / 750})`;
        context.lineWidth = 1;
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    });

    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  fillParticles();
  drawParticles();

  window.addEventListener("resize", () => {
    resizeCanvas();
    fillParticles();
  });
}
