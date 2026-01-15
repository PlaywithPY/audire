// ====== CONFIG ======
// Note: Le téléphone, email et autres infos de contact sont maintenant gérés
// via /content/contact.json et chargés par content-loader.js
// Cette config n'est plus utilisée pour les contenus
const AUDIRE = {
  baseUrl: "https://audire.be" // <-- remplace quand le domaine est prêt
};

// ====== Helpers ======
function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

// ====== Year ======
document.addEventListener("DOMContentLoaded", () => {
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
