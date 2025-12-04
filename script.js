// CONFIGURACIÓN PRINCIPAL
// =======================

// FECHA DEL EVENTO PARA EL CONTADOR
// Formato: Año, Mes (0-11), Día, Hora, Minuto
// Ejemplo: 2026, 2, 15, 20, 0  -> 15 marzo 2026, 20:00 hs
const EVENT_DATE = new Date(2026, 0, 10, 21, 30, 0); // EDITA AQUÍ

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
  setupSmoothScroll();
  setupFadeInOnScroll();
  setupParallax();
  setupCountdown(EVENT_DATE);
  setupSparkles();
  setupGallerySlider();
  setupMusicPlayer();
});

// DESPLAZAMIENTO SUAVE
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// FADE IN CON INTERSECTION OBSERVER
function setupFadeInOnScroll() {
  const fadeElements = document.querySelectorAll(".fade-in");
  if (!("IntersectionObserver" in window)) {
    fadeElements.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  fadeElements.forEach((el) => observer.observe(el));
}

// PARALLAX SUAVE
function setupParallax() {
  const parallaxSections = document.querySelectorAll(".parallax");
  if (!parallaxSections.length) return;

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    parallaxSections.forEach((section) => {
      const speed = parseFloat(section.dataset.speed || "0.3");
      section.style.transform = `translateY(${scrollY * speed * -0.2}px)`;
    });
  });
}

// CONTADOR REGRESIVO
function setupCountdown(targetDate) {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      clearInterval(intervalId);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  const intervalId = setInterval(updateCountdown, 1000);
}

// ANIMACIÓN DE PARTÍCULAS / BRILLOS SUAVES
function setupSparkles() {
  const canvas = document.getElementById("sparkleCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height, dpr;
  let particles = [];
  const PARTICLE_COUNT = 36;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.6 + Math.random() * 1.2,
        alpha: 0.2 + Math.random() * 0.3,
        dx: (Math.random() - 0.5) * 0.15,
        dy: (Math.random() - 0.5) * 0.25,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p, index) => {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      const twinkle = 0.15 * Math.sin(Date.now() / 1200 + p.twinkleOffset);
      const alpha = Math.max(0, p.alpha + twinkle);

      const gradient = ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.radius * 6
      );
      gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
      gradient.addColorStop(
        0.5,
        `rgba(168,217,255,${alpha * 0.65})`
      );
      gradient.addColorStop(1, `rgba(212,175,55,0)`);

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.radius * 6, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });
}

// GALERÍA - CARRUSEL
function setupGallerySlider() {
  const slider = document.querySelector(".gallery-slider");
  if (!slider) return;

  const track = slider.querySelector(".gallery-track");
  const slides = Array.from(slider.querySelectorAll(".gallery-slide"));
  const prevBtn = slider.querySelector(".gallery-prev");
  const nextBtn = slider.querySelector(".gallery-next");
  const dots = Array.from(slider.querySelectorAll(".gallery-dot"));

  let currentIndex = 0;
  let autoplayId = null;
  const AUTOPLAY_DELAY = 4000;
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  function goToSlide(index) {
    const maxIndex = slides.length - 1;
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    const offset = -currentIndex * 100;
    track.style.transform = `translateX(${offset}%)`;

    slides.forEach((s, i) =>
      s.classList.toggle("is-active", i === currentIndex)
    );
    dots.forEach((d, i) =>
      d.classList.toggle("is-active", i === currentIndex)
    );
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    goToSlide(nextIndex);
  }

  function prevSlide() {
    const prevIndex =
      (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prevIndex);
  }

  function startAutoplay() {
    if (slider.dataset.autoplay !== "true") return;
    stopAutoplay();
    autoplayId = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayId) {
      clearInterval(autoplayId);
      autoplayId = null;
    }
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      startAutoplay();
    });
    nextBtn.addEventListener("click", () => {
      nextSlide();
      startAutoplay();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
      startAutoplay();
    });
  });

  // Gestos táctiles
  track.addEventListener("touchstart", (e) => {
    if (!e.touches || !e.touches.length) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = true;
    stopAutoplay();
  });

  track.addEventListener("touchmove", (e) => {
    if (!isDragging || !e.touches || !e.touches.length) return;
    currentX = e.touches[0].clientX;
  });

  track.addEventListener("touchend", () => {
    if (!isDragging) return;
    const diffX = currentX - startX;
    const threshold = 40;
    if (diffX > threshold) {
      prevSlide();
    } else if (diffX < -threshold) {
      nextSlide();
    }
    isDragging = false;
    startAutoplay();
  });

  goToSlide(0);
  startAutoplay();
}

// MÚSICA DE FONDO
function setupMusicPlayer() {
  const audio = document.getElementById("backgroundMusic");
  const toggleBtn = document.querySelector(".music-toggle");
  if (!audio || !toggleBtn) return;

  let isPlaying = false;

  function updateButton() {
    toggleBtn.classList.toggle("is-playing", isPlaying);
  }

  toggleBtn.addEventListener("click", () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      updateButton();
    } else {
      audio
        .play()
        .then(() => {
          isPlaying = true;
          updateButton();
        })
        .catch(() => {
          isPlaying = false;
          updateButton();
        });
    }
  });

  audio.addEventListener("ended", () => {
    isPlaying = false;
    updateButton();
  });
}