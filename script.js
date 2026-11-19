const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktopLayout = window.matchMedia("(min-width: 901px)");

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");

menuButton.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navigation.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return;
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
});

const revealItems = [...document.querySelectorAll("[data-reveal]")];

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  document.documentElement.classList.add("motion-ready");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -8%",
  });

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 65}ms`);
    revealObserver.observe(item);
  });
}

const projectRunway = document.querySelector(".project-runway");
const projectViewport = document.querySelector(".project-track-viewport");
const projectTrack = document.querySelector(".project-list");
const progressBar = document.querySelector(".scroll-progress span");
const parallaxItems = [...document.querySelectorAll("[data-parallax]")];

function railCanRun() {
  return desktopLayout.matches && !reducedMotion.matches;
}

function updateProjectRail() {
  if (!railCanRun() || !projectRunway || !projectTrack || !projectViewport) return;

  const distance = Math.max(0, projectTrack.scrollWidth - projectViewport.clientWidth);
  const travel = Math.max(1, projectRunway.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, -projectRunway.getBoundingClientRect().top / travel));
  projectTrack.style.transform = `translate3d(${-distance * progress}px, 0, 0)`;
}

function measureProjectRail() {
  if (!railCanRun() || !projectRunway || !projectTrack || !projectViewport) {
    document.documentElement.classList.remove("horizontal-rail-ready");
    if (projectRunway) projectRunway.style.height = "";
    if (projectTrack) projectTrack.style.transform = "";
    return;
  }

  document.documentElement.classList.add("horizontal-rail-ready");

  const distance = Math.max(0, projectTrack.scrollWidth - projectViewport.clientWidth);
  projectRunway.style.height = `${window.innerHeight + distance}px`;
  updateProjectRail();
}

let effectsQueued = false;

function updateScrollEffects() {
  updateProjectRail();

  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) {
    const progress = documentHeight > 0 ? window.scrollY / documentHeight : 0;
    progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  }

  if (reducedMotion.matches) return;

  parallaxItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.bottom < -60 || rect.top > window.innerHeight + 60) return;

    const centerOffset =
      (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    const strength = Number(item.dataset.parallax) || 10;
    item.style.setProperty("--parallax-y", `${(-centerOffset * strength).toFixed(2)}px`);
  });
}

function queueScrollEffects() {
  if (effectsQueued) return;

  effectsQueued = true;
  window.requestAnimationFrame(() => {
    updateScrollEffects();
    effectsQueued = false;
  });
}

window.addEventListener("scroll", queueScrollEffects, { passive: true });
window.addEventListener("resize", () => {
  measureProjectRail();
  queueScrollEffects();
});
window.addEventListener("load", measureProjectRail, { once: true });

if (document.fonts?.ready) {
  document.fonts.ready.then(measureProjectRail);
}

reducedMotion.addEventListener?.("change", () => {
  measureProjectRail();
  queueScrollEffects();
});

desktopLayout.addEventListener?.("change", () => {
  measureProjectRail();
  queueScrollEffects();
});

measureProjectRail();
queueScrollEffects();
