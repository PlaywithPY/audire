'use client';

import { SessionProvider } from 'next-auth/react';
import AdminAuthGuard from '@/components/AdminAuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </SessionProvider>
  );
}
