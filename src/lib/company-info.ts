// src/lib/company-info.ts
// Sprint 4 — Données entreprise centralisées.
// Persisté via /api/admin/settings (table Setting), une clé par champ : company.<field>

export type CompanyInfo = {
  legalName: string;        // Raison sociale
  tradeName: string;        // Nom commercial
  address: string;          // Rue + numéro
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  bce: string;              // BCE / TVA
  inami: string;            // INAMI (audioprothésiste)
  manager: string;          // Responsable du traitement
  hostingProvider: string;  // Hébergeur
  hostingAddress: string;
};

export const COMPANY_DEFAULT: CompanyInfo = {
  legalName: '',
  tradeName: 'Audire',
  address: '',
  postalCode: '',
  city: '',
  country: 'Belgique',
  phone: '',
  email: '',
  bce: '',
  inami: '',
  manager: '',
  hostingProvider: 'Vercel Inc.',
  hostingAddress: '440 N Barranca Ave #4133, Covina, CA 91723, USA',
};

export const COMPANY_KEYS = Object.keys(COMPANY_DEFAULT) as (keyof CompanyInfo)[];

export const COMPANY_LABELS: Record<keyof CompanyInfo, string> = {
  legalName: 'Raison sociale',
  tradeName: 'Nom commercial',
  address: 'Adresse (rue + n°)',
  postalCode: 'Code postal',
  city: 'Ville',
  country: 'Pays',
  phone: 'Téléphone',
  email: 'Email de contact',
  bce: 'BCE / N° TVA',
  inami: 'INAMI',
  manager: 'Responsable du traitement',
  hostingProvider: 'Hébergeur',
  hostingAddress: 'Adresse hébergeur',
};

/** Charge les infos entreprise via l'API publique des settings. */
export async function fetchCompanyInfo(): Promise<CompanyInfo> {
  const result: any = { ...COMPANY_DEFAULT };
  await Promise.all(COMPANY_KEYS.map(async (k) => {
    try {
      const r = await fetch(`/api/admin/settings?key=company.${k}`);
      if (r.ok) {
        const data = await r.json();
        if (typeof data?.value === 'string' && data.value !== '') result[k] = data.value;
      }
    } catch {}
  }));
  return result;
}
