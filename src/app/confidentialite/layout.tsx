// src/app/condifentialite/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales — Audire',
  description: 'Politique de confidentialité — Audire',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
