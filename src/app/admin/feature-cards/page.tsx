import { redirect } from 'next/navigation';

// Feature Cards Editor — l'ancien outil "Feature cards (legacy)" (vieux style,
// modale d'édition) est retiré. Deux remplaçants, dans le même esprit que le
// reste de l'admin :
//   1. Édition inline directement dans l'éditeur de page  →  /admin/editor
//      (cliquer une card de la page d'accueil pour éditer image, cadrage,
//       titre, description, lien…)
//   2. L'outil dédié moderne "Cards visuelles"            →  /admin/feature-cards-management
//      (gestion en lot de toutes les cards, toutes pages, avec reset aux défauts)
//
// On redirige les anciens liens/marque-pages vers l'outil moderne pour ne rien
// casser. Aucune fonctionnalité n'est perdue.
export default function FeatureCardsLegacyRedirect() {
  redirect('/admin/feature-cards-management');
}
