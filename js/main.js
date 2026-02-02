// ====== CONFIG ======
// Configuration chargée depuis config.js (window.AUDIRE_CONFIG)
const AUDIRE = window.AUDIRE_CONFIG || {
  baseUrl: "https://audire.be"
};

// ====== Helpers ======
function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

// ====== ANIMATIONS AU SCROLL ======
class ScrollAnimations {
  constructor() {
    this.elements = [];
    this.init();
  }

  init() {
    // Créer l'observer pour les animations au scroll
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Une fois animé, on peut arrêter d'observer
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Observer tous les éléments avec la classe animate-on-scroll
    this.observeElements();
  }

  observeElements() {
    const elements = $all('.animate-on-scroll');
    elements.forEach(el => {
      this.observer.observe(el);
    });
  }

  // Méthode pour ajouter de nouveaux éléments dynamiquement
  addElement(element) {
    this.observer.observe(element);
  }
}

// ====== HEADER SCROLL EFFECT ======
class HeaderScroll {
  constructor() {
    this.header = $('header');
    if (!this.header) return;

    this.lastScroll = 0;
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
  }

  onScroll() {
    const currentScroll = window.pageYOffset;

    // Ajouter une classe quand on scroll
    if (currentScroll > 100) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }

    this.lastScroll = currentScroll;
  }
}

// ====== SMOOTH SCROLL FOR ANCHOR LINKS ======
function initSmoothScroll() {
  $all('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = $(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ====== MAIN INITIALIZATION ======
document.addEventListener("DOMContentLoaded", () => {
  // Initialiser les animations au scroll
  const scrollAnimations = new ScrollAnimations();

  // Initialiser l'effet de scroll du header
  const headerScroll = new HeaderScroll();

  // Initialiser le smooth scroll
  initSmoothScroll();

  // Year
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();

  // Note: Tel/Email/Contact info updates are now handled by content-loader.js
  // which loads data from /content/contact.json

  // Mobile menu
  const menuBtn = $("#menuBtn");
  const mobileNav = $("#mobileNav");
  if (menuBtn && mobileNav){
    menuBtn.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("show");
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
    $all("a", mobileNav).forEach(a => a.addEventListener("click", () => {
      mobileNav.classList.remove("show");
      menuBtn.setAttribute("aria-expanded", "false");
    }));
  }

  // Modal
  const overlay = $("#modalOverlay");
  const closeBtn = $("#closeModalBtn");
  const cancelBtn = $("#cancelBtn");
  const openBtns = $all("[data-open-modal]");

  function openModal(){
    if (!overlay) return;
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#prenom")?.focus(), 50);
  }
  function closeModal(){
    if (!overlay) return;
    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openBtns.forEach(b => b.addEventListener("click", openModal));
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);
  overlay?.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay?.getAttribute("aria-hidden") === "false") closeModal();
  });

  // Call buttons (optional)
  $all("[data-call]").forEach(b => b.addEventListener("click", () => {
    window.location.href = `tel:${AUDIRE.phoneHref}`;
  }));

  // Demo RDV form
  const rdvForm = $("#rdvForm");
  const note = $("#formNote");
  rdvForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(rdvForm).entries());
    console.log("RDV (demo):", data);

    if (note) note.textContent = "Demande enregistrée (démo). Branchez le formulaire sur votre système (email/CRM).";
    rdvForm.reset();
    setTimeout(() => { note && (note.textContent = "Démo : ce formulaire n’envoie rien. Branchez-le sur votre email/CRM (ou un endpoint)."); }, 4500);
    // close modal
    overlay && setTimeout(() => {
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, 900);
  });
});
