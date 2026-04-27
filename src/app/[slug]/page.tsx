'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DynamicBlockRenderer from '@/components/DynamicBlockRenderer';
import Link from 'next/link';

export default function CustomPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';
  const [hasBlocks, setHasBlocks] = useState<boolean | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/admin/blocks?pageKey=${slug}`)
      .then((r) => r.json())
      .then((blocks) => {
        const visible = Array.isArray(blocks) ? blocks.filter((b: any) => b.isVisible && b.blockKey !== '__page-label__') : [];
        setHasBlocks(visible.length > 0);
      })
      .catch(() => setHasBlocks(false));
  }, [slug]);

  if (hasBlocks === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
      </main>
    );
  }

  if (hasBlocks === false) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-6xl">📄</div>
        <h1 className="text-2xl font-bold text-gray-800">Page vide</h1>
        <p className="text-gray-500 max-w-md">
          Cette page n&apos;a pas encore de contenu. Ajoutez des blocs depuis l&apos;éditeur visuel.
        </p>
        <Link href="/" className="mt-4 inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-all">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <DynamicBlockRenderer pageKey={slug} />
    </main>
  );
}
