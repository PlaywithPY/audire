// src/app/admin/feature-cards-management/page.tsx
// Page d'entrée — affiche le client de gestion des Feature Cards.
// Calqué sur /admin/faq-management.

import FeatureCardsManagementClient from './FeatureCardsManagementClient';

export const dynamic = 'force-dynamic';

export default function FeatureCardsManagementPage() {
  return <FeatureCardsManagementClient />;
}
