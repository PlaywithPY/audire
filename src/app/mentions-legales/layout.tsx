// src/app/mentions-legales/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales — Audire',
  description: 'Mentions légales du site Audire.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
