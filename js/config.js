/**
 * ========================================
 * CONFIGURATION CENTRALISÉE DU SITE AUDIRE
 * ========================================
 *
 * Ce fichier contient TOUTES les informations modifiables du site.
 * Pour modifier une information (téléphone, email, horaires, etc.),
 * modifiez uniquement ce fichier.
 *
 * Les modifications seront automatiquement appliquées sur toutes les pages.
 */

window.AUDIRE_CONFIG = {
  // ===== INFORMATIONS DE CONTACT =====
  contact: {
    phone: {
      display: "04 233 61 25",        // Format d'affichage
      href: "+3242336125"              // Format pour le lien tel:
    },
    email: "centre.audire@gmail.com",
    address: {
      street: "30, rue Grand-Vinâve",
      postalCode: "4101",
      city: "Jemeppe-sur-Meuse",
      region: "Province de Liège",
      country: "Belgique"
    }
  },

  // ===== HORAIRES D'OUVERTURE =====
  hours: {
    monday: "13h00 – 18h00",
    tuesdayToSaturday: "09h30 – 18h00",
    sunday: "Fermé",
    note: "Sur rendez-vous uniquement"
  },

  // ===== INFORMATIONS D'ENTREPRISE =====
  business: {
    name: "Audire - Centre auditif",
    shortName: "Audire",
    slogan: "Mieux entendre, simplement.",
    description: "Centre auditif indépendant à Jemeppe-sur-Meuse. Test auditif gratuit, accompagnement humain, solutions Oticon & Bernafon, réglages et suivi personnalisé.",
    website: "https://playwithpy.github.io/audire",

    // Prix indicatifs
    pricing: {
      min: "1 200 €",
      max: "3 500 €",
      refund: "840 €"  // Remboursement INAMI + mutuelle par oreille
    },

    // Marques partenaires
    brands: ["Oticon", "Bernafon"]
  },

  // ===== SEO =====
  seo: {
    themeColor: "#D4A373",
    language: "fr-BE"
  },

  // Rétrocompatibilité avec l'ancien format
  phoneDisplay: "04 233 61 25",
  phoneHref: "+3242336125",
  email: "centre.audire@gmail.com",
  baseUrl: "https://playwithpy.github.io/audire"
};
