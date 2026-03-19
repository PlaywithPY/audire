'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CardImage = {
  id: number;
  cardKey: string;
  imageUrl: string;
  fallbackEmoji: string;
  imagePosition: string;
  href: string | null;
  title: string | null;
  description: string | null;
  imageAlt: string | null;
  updatedAt: string;
};

const CARD_KEYS = [
  { key: 'hearing-test', label: 'Test auditif gratuit', defaultHref: '/test-auditif-gratuit' },
  { key: 'human-support', label: 'Accompagnement humain', defaultHref: '/notre-accompagnement' },
  { key: 'personalized-follow-up', label: 'Suivi personnalisé', defaultHref: '/notre-accompagnement' },
  { key: 'quality-solutions', label: 'Solutions de qualité', defaultHref: '/solutions-auditives' },
  { key: 'independent-center', label: 'Centre indépendant', defaultHref: '/notre-accompagnement' },
  { key: 'price-transparency', label: 'Transparence des prix', defaultHref: '/remboursements' },
];

export default function FeatureCardsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cardImages, setCardImages] = useState<CardImage[]>([]);
  const [editingCard, setEditingCard] = useState<CardImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCardImages();
    }
  }, [status]);

  async function fetchCardImages() {
    try {
      const res = await fetch('/api/admin/card-images');
      if (!res.ok) {
        console.error('API error:', res.status);
        setCardImages([]);
        setApiError(true);
        return;
      }
      const data = await res.json();
      // Vérifier que data est bien un tableau
      if (Array.isArray(data)) {
        setCardImages(data);
        setApiError(false);
      } else {
        console.error('API did not return an array:', data);
        setCardImages([]);
        setApiError(true);
      }
    } catch (error) {
      console.error('Error fetching card images:', error);
      setCardImages([]);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  }

  async function saveCard(card: CardImage) {
    setSaving(true);
    try {
      await fetch('/api/admin/card-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
      });
      alert('✅ Card sauvegardée !');
      setEditingCard(null);
      fetchCardImages();
    } catch (error) {
      console.error('Error saving card:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function createCard(cardKey: string) {
    const defaultCard = CARD_KEYS.find(c => c.key === cardKey);
    if (!defaultCard) return;

    setSaving(true);
    try {
      await fetch('/api/admin/card-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardKey,
          imageUrl: `/images/${cardKey}.jpg`,
          fallbackEmoji: '📷',
          imagePosition: 'center 35%',
          href: defaultCard.defaultHref,
          title: defaultCard.label,
          description: '',
          imageAlt: defaultCard.label,
        }),
      });
      alert('✅ Card créée !');
      fetchCardImages();
    } catch (error) {
      console.error('Error creating card:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎴 Gestion des Feature Cards</h1>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              ← Admin principal
            </Link>
            <Link
              href="/"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Retour au site
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Erreur API - Migration requise */}
        {apiError && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold mb-3 text-red-800">⚠️ Migration SQL requise</h2>
            <p className="text-sm text-red-700 mb-4">
              L'API retourne une erreur. Vous devez probablement exécuter la migration SQL sur votre base de données Neon.
            </p>
            <div className="bg-white rounded p-4 mb-3">
              <p className="text-xs font-semibold mb-2">Exécutez ce SQL sur Neon :</p>
              <code className="text-xs block whitespace-pre bg-gray-100 p-3 rounded overflow-x-auto">
{`ALTER TABLE "CardImage"
ADD COLUMN IF NOT EXISTS "imagePosition" TEXT NOT NULL DEFAULT 'center center',
ADD COLUMN IF NOT EXISTS "href" TEXT,
ADD COLUMN IF NOT EXISTS "title" TEXT,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "imageAlt" TEXT;`}
              </code>
            </div>
            <p className="text-xs text-red-600">
              Après avoir exécuté la migration, rafraîchissez cette page.
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-3">📝 Instructions</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Image Position</strong> : Contrôle la position de l'image dans la card (ex: "center 35%" pour centrer horizontalement et décentrer vers le bas)</li>
            <li>• <strong>Valeurs courantes</strong> : "center center" (centré), "center 30%" (vers le haut), "center 70%" (vers le bas)</li>
            <li>• <strong>Lien (href)</strong> : Page vers laquelle la card redirige quand on clique dessus</li>
            <li>• Assurez-vous d'avoir uploadé les images dans <code className="bg-white px-2 py-1 rounded">/public/images/</code></li>
          </ul>
        </div>

        {/* Liste des cards disponibles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Cards disponibles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CARD_KEYS.map((cardDef) => {
              const existing = cardImages.find(c => c.cardKey === cardDef.key);

              return (
                <div key={cardDef.key} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">{cardDef.label}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Key: <code className="bg-gray-100 px-2 py-1 rounded">{cardDef.key}</code>
                  </p>

                  {existing ? (
                    <>
                      <div className="mb-3 relative h-32 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={existing.imageUrl}
                          alt={existing.imageAlt || cardDef.label}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: existing.imagePosition }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        <p>Position: <strong>{existing.imagePosition}</strong></p>
                        <p>Lien: <strong>{existing.href || 'Aucun'}</strong></p>
                      </div>
                      <button
                        onClick={() => setEditingCard(existing)}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        ✏️ Modifier
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => createCard(cardDef.key)}
                      disabled={saving}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      ➕ Créer cette card
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Formulaire d'édition */}
        {editingCard && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">✏️ Édition de la card</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Colonne gauche - Formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Card Key</label>
                  <input
                    type="text"
                    value={editingCard.cardKey}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Titre</label>
                  <input
                    type="text"
                    value={editingCard.title || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Test auditif gratuit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={editingCard.description || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Un test complet et sans engagement..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">URL de l'image</label>
                  <input
                    type="text"
                    value={editingCard.imageUrl}
                    onChange={(e) => setEditingCard({ ...editingCard, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="/images/hearing-test.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Texte alternatif (alt)</label>
                  <input
                    type="text"
                    value={editingCard.imageAlt || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, imageAlt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="Test auditif avec casque professionnel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Position de l'image (object-position)
                    <span className="text-xs font-normal text-gray-500 ml-2">
                      Important pour cadrer le visage
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editingCard.imagePosition}
                    onChange={(e) => setEditingCard({ ...editingCard, imagePosition: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="center 35%"
                  />
                  <div className="mt-2 text-xs text-gray-600">
                    <p><strong>Exemples :</strong></p>
                    <ul className="list-disc list-inside ml-2">
                      <li><code>center center</code> - Image centrée</li>
                      <li><code>center 30%</code> - Décentré vers le haut (voir plus de la partie haute)</li>
                      <li><code>center 35%</code> - Légèrement vers le haut (recommandé pour les visages)</li>
                      <li><code>center 70%</code> - Décentré vers le bas</li>
                      <li><code>left center</code> - Aligné à gauche</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Lien (href)</label>
                  <input
                    type="text"
                    value={editingCard.href || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, href: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    placeholder="/test-auditif-gratuit"
                  />
                </div>
              </div>

              {/* Colonne droite - Prévisualisation */}
              <div>
                <h3 className="font-semibold mb-3">📋 Prévisualisation</h3>
                <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                  {/* Card Preview */}
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
                      <img
                        src={editingCard.imageUrl}
                        alt={editingCard.imageAlt || 'Preview'}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: editingCard.imagePosition }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">
                        {editingCard.title || 'Titre de la card'}
                      </h3>
                      <p className="text-gray-600">
                        {editingCard.description || 'Description de la card'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-600 space-y-1">
                    <p><strong>Lien :</strong> {editingCard.href || 'Aucun'}</p>
                    <p><strong>Position :</strong> {editingCard.imagePosition}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => saveCard(editingCard)}
                disabled={saving}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
              >
                {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
              </button>
              <button
                onClick={() => setEditingCard(null)}
                className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
