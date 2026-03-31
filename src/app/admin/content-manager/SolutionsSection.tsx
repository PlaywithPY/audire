'use client';

import { useEffect, useState } from 'react';
import ImageUploadModal from '@/components/ImageUploadModal';

type Solution = {
  id: number;
  solutionKey: string;
  fullDesc: string;
  detailImage: string | null;
  detailEmoji: string;
  pros: string[];
  cons: string[];
  updatedAt: string;
};

const defaultSolutions = [
  {
    solutionKey: 'contour',
    title: "Le contour d'oreille",
    fullDesc: "Grâce à son boîtier positionné derrière l'oreille, le contour d'oreille est facile à manipuler et à entretenir au quotidien.",
    detailEmoji: '🎧',
    pros: [
      "Convient à presque tous les degrés de perte auditive",
      "Facile à manipuler et à entretenir",
    ],
    cons: [
      "Visible derrière l'oreille",
      "Peut parfois gêner le port de lunettes"
    ]
  },
  {
    solutionKey: 'intra',
    title: "L'intra-auriculaire",
    fullDesc: "Positionné directement dans le conduit auditif, l'intra-auriculaire capte les sons de façon naturelle.",
    detailEmoji: '👁️',
    pros: [
      "Discrétion maximale",
      "Moulage personnalisé pour un confort optimal",
    ],
    cons: [
      "Non adapté aux pertes sévères à profondes",
      "Manipulation plus délicate"
    ]
  },
  {
    solutionKey: 'intent',
    title: "Oticon Intent",
    fullDesc: "Doté d'une puce de traitement performante et de quatre capteurs intégrés.",
    detailEmoji: '⭐',
    pros: [
      "Adaptation automatique à chaque situation",
      "Son clair et naturel dans le bruit",
    ],
    cons: [
      "Tarif haut de gamme",
      "Nécessite un temps d'adaptation"
    ]
  }
];

export default function SolutionsSection() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchSolutions();
  }, []);

  async function fetchSolutions() {
    try {
      const res = await fetch('/api/admin/solutions');
      if (!res.ok) {
        setSolutions([]);
        return;
      }
      const data = await res.json();
      setSolutions(data);
    } catch (error) {
      console.error('Error fetching solutions:', error);
      setSolutions([]);
    } finally {
      setLoading(false);
    }
  }

  async function saveSolution(solution: Solution) {
    setSaving(true);
    try {
      await fetch('/api/admin/solutions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solution),
      });
      await fetchSolutions();
      setEditingSolution(null);
    } catch (error) {
      console.error('Error saving solution:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function createSolution(defaultData: any) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultData),
      });
      if (res.ok) {
        await fetchSolutions();
      }
    } catch (error) {
      console.error('Error creating solution:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Chargement des solutions...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📋 Gestion des Solutions Auditives</h2>

      <div className="space-y-4">
        {defaultSolutions.map((def) => {
          const existing = solutions.find(s => s.solutionKey === def.solutionKey);

          return (
            <div key={def.solutionKey} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{def.title}</h3>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{def.solutionKey}</code>
                </div>
                <span className="text-4xl">{def.detailEmoji}</span>
              </div>

              {existing ? (
                <div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{existing.fullDesc}</p>
                  <button
                    onClick={() => setEditingSolution(existing)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    ✏️ Modifier
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => createSolution(def)}
                  disabled={saving}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  ➕ Créer cette solution
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onImageSelected={(imageUrl) => {
          if (editingSolution) {
            setEditingSolution({ ...editingSolution, detailImage: imageUrl });
          }
          setUploadModalOpen(false);
        }}
      />

      {/* Edit Modal */}
      {editingSolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">✏️ Modifier la solution</h2>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-sm">Description complète</label>
                <textarea
                  value={editingSolution.fullDesc}
                  onChange={(e) => setEditingSolution({ ...editingSolution, fullDesc: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={4}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-sm">Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingSolution.detailImage || ''}
                    onChange={(e) => setEditingSolution({ ...editingSolution, detailImage: e.target.value })}
                    className="flex-1 border rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                  >
                    📸
                  </button>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => saveSolution(editingSolution)}
                  disabled={saving}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded font-semibold"
                >
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                <button
                  onClick={() => setEditingSolution(null)}
                  className="flex-1 bg-gray-200 px-4 py-2 rounded"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
