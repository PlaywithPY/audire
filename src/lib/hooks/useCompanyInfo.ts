'use client';

// Sprint Lot 2 — Hook React pour les infos entreprise
// Mince wrapper autour de fetchCompanyInfo(). Charge les settings au mount,
// retourne un objet CompanyInfo avec les défauts pendant le chargement.

import { useState, useEffect } from 'react';
import { fetchCompanyInfo, COMPANY_DEFAULT, type CompanyInfo } from '@/lib/company-info';

export function useCompanyInfo(): CompanyInfo {
  const [info, setInfo] = useState<CompanyInfo>(COMPANY_DEFAULT);

  useEffect(() => {
    let cancelled = false;
    fetchCompanyInfo()
      .then((data) => { if (!cancelled) setInfo(data); })
      .catch((e) => console.error('useCompanyInfo:', e));
    return () => { cancelled = true; };
  }, []);

  return info;
}

/** Construit l'adresse postale formatée multi-lignes (HTML) */
export function formatAddressHtml(c: CompanyInfo): string {
  const parts: string[] = [];
  if (c.address) parts.push(c.address);
  const cityLine = `${c.postalCode || ''} ${c.city || ''}`.trim();
  if (cityLine) parts.push(cityLine);
  if (c.country) parts.push(c.country);
  return parts.join('<br/>');
}

/** Construit l'adresse postale en une seule ligne (texte brut) */
export function formatAddressLine(c: CompanyInfo): string {
  const parts: string[] = [];
  if (c.address) parts.push(c.address);
  const cityLine = `${c.postalCode || ''} ${c.city || ''}`.trim();
  if (cityLine) parts.push(cityLine);
  return parts.join(', ');
}

/** Lien tel: à partir d'un numéro français/belge */
export function formatPhoneHref(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  if (cleaned.startsWith('+')) return `tel:${cleaned}`;
  if (cleaned.startsWith('00')) return `tel:+${cleaned.slice(2)}`;
  if (cleaned.startsWith('0')) return `tel:+32${cleaned.slice(1)}`;
  return `tel:${cleaned}`;
}
