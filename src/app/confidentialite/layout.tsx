// src/app/condifentialite/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Audire',
  description: 'Politique de confidentialité du site Audire',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
