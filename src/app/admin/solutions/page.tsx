'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploadModal from '@/components/ImageUploadModal';
import AdminHeader from '@/components/AdminHeader';

type DeviceLink = {
  name: string;
  url: string;
  imageUrl?: string;
};

type Solution = {
  id: number;
  solutionKey: string;
  fullDesc: string;
  detailImage: string | null;
  detailEmoji: string;
  backgroundColor: string | null;
  pros: string[];
  cons: string[];
  deviceLinks: DeviceLink[];
  showDeviceLinks: boolean;
  accessoryLinks: DeviceLink[];
  showAccessoryLinks: boolean;
  updatedAt: string;
};

export default function SolutionsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'detail' | 'deviceLink' | 'accessoryLink'>('detail');
  const [uploadTargetIndex, setUploadTargetIndex] = useState<number>(-1);

  // Définitions des solutions par défaut
  const defaultSolutions = [
    {
      solutionKey: 'contour',
      fullDesc: "Grâce à son boîtier positionné derrière l'oreille, le contour d'oreille est facile à manipuler et à entretenir au quotidien. Il peut intégrer une batterie rechargeable et une connexion Bluetooth pour s'associer à votre téléphone, votre télévision ou d'autres accessoires. Disponible dans différentes teintes pour se fondre dans la couleur de vos cheveux ou de votre peau, il reste très discret malgré son placement externe.",
      detailEmoji: '🎧',
      pros: [
        "Convient à presque tous les degrés de perte auditive",
        "Facile à manipuler et à entretenir",
        "Batterie rechargeable disponible",
        "Connectivité Bluetooth (TV, téléphone…)",
        "Large choix de teintes discrètes"
      ],
      cons: [
        "Visible derrière l'oreille",
        "Peut parfois gêner le port de lunettes"
      ]
    },
    {
      solutionKey: 'intra',
      fullDesc: "Positionné directement dans le conduit auditif, l'intra-auriculaire capte les sons de façon naturelle grâce à sa proximité avec le tympan. Il est particulièrement adapté aux personnes qui portent des lunettes, car son placement ne génère aucune interférence avec les branches. Sa conception sur mesure garantit un ajustement précis et un confort de port élevé.",
      detailEmoji: '👁️',
      pros: [
        "Discrétion maximale",
        "Moulage personnalisé pour un confort optimal",
        "Son naturel grâce à la position dans l'oreille",
        "Pas de gêne avec les lunettes ou le casque"
      ],
      cons: [
        "Non adapté aux pertes sévères à profondes",
        "Manipulation plus délicate",
        "Entretien fréquent (cérumen)"
      ]
    },
    {
      solutionKey: 'intent',
      fullDesc: "Doté d'une puce de traitement performante et de quatre capteurs intégrés, l'Oticon Intent détecte en temps réel ce que vous faites et s'ajuste automatiquement pour vous offrir le son le plus clair possible dans chaque contexte. Sa connectivité Bluetooth vous permet de le coupler à votre smartphone ou à votre télévision. La batterie rechargeable tient toute la journée, et son boîtier est certifié résistant à l'eau et à la poussière (IP68).",
      detailEmoji: '⭐',
      pros: [
        "Adaptation automatique à chaque situation",
        "Capteurs de mouvement intégrés",
        "Son clair et naturel dans le bruit",
        "Connectivité Bluetooth complète",
        "Batterie rechargeable longue durée",
        "Résistant à l'eau et à la poussière (IP68)"
      ],
      cons: [
        "Tarif haut de gamme",
        "Nécessite un temps d'adaptation"
      ]
    }
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSolutions();
    }
  }, [status]);

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

  function addPro() {
    if (editingSolution) {
      setEditingSolution({
        ...editingSolution,
        pros: [...editingSolution.pros, '']
      });
    }
  }

  function removePro(index: number) {
    if (editingSolution) {
      setEditingSolution({
        ...editingSolution,
        pros: editingSolution.pros.filter((_, i) => i !== index)
      });
    }
  }

  function updatePro(index: number, value: string) {
    if (editingSolution) {
      const newPros = [...editingSolution.pros];
      newPros[index] = value;
      setEditingSolution({ ...editingSolution, pros: newPros });
    }
  }

  function addCon() {
    if (editingSolution) {
      setEditingSolution({
        ...editingSolution,
        cons: [...editingSolution.cons, '']
      });
    }
  }

  function removeCon(index: number) {
    if (editingSolution) {
      setEditingSolution({
        ...editingSolution,
        cons: editingSolution.cons.filter((_, i) => i !== index)
      });
    }
  }

  function updateCon(index: number, value: string) {
    if (editingSolution) {
      const newCons = [...editingSolution.cons];
      newCons[index] = value;
      setEditingSolution({ ...editingSolution, cons: newCons });
    }
  }

  // Gestion des liens vers appareils
  function addDeviceLink() {
    if (editingSolution) {
      setEditingSolution({
        ...editingSolution,
        deviceLinks: [...(editingSolution.deviceLinks || []), { name: '', url: '' }]
      });
    }
  }

  function removeDeviceLink(index: number) {
    if (editingSolution) {
      setEditingSolution({
        ...editingSolution,
        deviceLinks: editingSolution.deviceLinks.filter((_, i) => i !== index)
      });
    }
  }

  function updateDeviceLink(index: number, field: 'name' | 'url', value: string) {
    if (editingSolution) {
      const newLinks = [...editingSolution.deviceLinks];
      newLinks[index][field] = value;
      setEditingSolution({ ...editingSolution, deviceLinks: newLinks });
    }
  }

  // Gestion des liens vers accessoires
  function addAccessoryLink() {
    if (editingSolution) {
      setEditingSolution({
        ...editingSolution,
        accessoryLinks: [...(editingSolution.accessoryLinks || []), { name: '', url: '' }]
      });
    }
  }

  function removeAccessoryLink(index: number) {
    if (editingSolution) {
      setEditingSolution({
        ...editingSolution,
        accessoryLinks: editingSolution.accessoryLinks.filter((_, i) => i !== index)
      });
    }
  }

  function updateAccessoryLink(index: number, field: 'name' | 'url', value: string) {
    if (editingSolution) {
      const newLinks = [...editingSolution.accessoryLinks];
      newLinks[index][field] = value;
      setEditingSolution({ ...editingSolution, accessoryLinks: newLinks });
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-text-light">Chargement...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminHeader currentPage="solutions" title="📋 Gestion des Solutions Auditives" />

      <div className="container mx-auto px-6 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold mb-2">📝 Mode d'emploi</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Modifiez les descriptions complètes, avantages et inconvénients</li>
            <li>• Uploadez des images pour le panneau détaillé (ou laissez l'emoji)</li>
            <li>• Ces données s'affichent quand on clique sur une card de type d'appareil</li>
          </ul>
        </div>

        {/* Liste des solutions */}
        <div className="space-y-6">
          {defaultSolutions.map((def) => {
            const existing = solutions.find(s => s.solutionKey === def.solutionKey);
            const solutionTitles: Record<string, string> = {
              'contour': "Le contour d'oreille",
              'intra': "L'intra-auriculaire",
              'intent': "Oticon Intent"
            };

            return (
              <div key={def.solutionKey} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{solutionTitles[def.solutionKey]}</h3>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{def.solutionKey}</code>
                  </div>
                  <span className="text-4xl">{def.detailEmoji}</span>
                </div>

                {existing ? (
                  <div>
                    <div className="mb-4 text-sm text-gray-600">
                      <p className="line-clamp-3">{existing.fullDesc}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <strong className="text-green-600">✅ Avantages:</strong>
                        <ul className="list-disc list-inside">
                          {existing.pros.slice(0, 3).map((pro, i) => (
                            <li key={i} className="text-gray-600">{pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-orange-600">⚠️ Points d'attention:</strong>
                        <ul className="list-disc list-inside">
                          {existing.cons.slice(0, 3).map((con, i) => (
                            <li key={i} className="text-gray-600">{con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingSolution(existing)}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      ✏️ Modifier
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => createSolution(def)}
                    disabled={saving}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    ➕ Créer cette solution
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal d'upload d'image */}
      <ImageUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onImageSelected={(imageUrl) => {
          if (editingSolution) {
            if (uploadTarget === 'detail') {
              setEditingSolution({ ...editingSolution, detailImage: imageUrl });
            } else if (uploadTarget === 'deviceLink' && uploadTargetIndex >= 0) {
              const newLinks = [...editingSolution.deviceLinks];
              newLinks[uploadTargetIndex] = { ...newLinks[uploadTargetIndex], imageUrl };
              setEditingSolution({ ...editingSolution, deviceLinks: newLinks });
            } else if (uploadTarget === 'accessoryLink' && uploadTargetIndex >= 0) {
              const newLinks = [...editingSolution.accessoryLinks];
              newLinks[uploadTargetIndex] = { ...newLinks[uploadTargetIndex], imageUrl };
              setEditingSolution({ ...editingSolution, accessoryLinks: newLinks });
            }
          }
          setUploadModalOpen(false);
        }}
      />

      {/* Modal d'édition */}
      {editingSolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">✏️ Modifier la solution</h2>

            <div className="space-y-6">
              {/* Image */}
              <div>
                <label className="block font-semibold mb-2">Image du panneau détaillé</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingSolution.detailImage || ''}
                    onChange={(e) => setEditingSolution({ ...editingSolution, detailImage: e.target.value })}
                    className="flex-1 border border-gray-300 rounded px-4 py-2"
                    placeholder="/images/solution-detail.jpg"
                  />
                  <button
                    onClick={() => {
                      setUploadTarget('detail');
                      setUploadTargetIndex(-1);
                      setUploadModalOpen(true);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    📸
                  </button>
                  <button
                    onClick={() => setEditingSolution({ ...editingSolution, detailImage: null })}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide pour afficher l'emoji {editingSolution.detailEmoji}
                </p>
              </div>

              {/* Couleur de fond */}
              <div>
                <label className="block font-semibold mb-2">🎨 Couleur de fond de la section</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingSolution.backgroundColor || ''}
                    onChange={(e) => setEditingSolution({ ...editingSolution, backgroundColor: e.target.value })}
                    className="flex-1 border border-gray-300 rounded px-4 py-2"
                    placeholder="Ex: #f9fafb, rgb(249, 250, 251), transparent"
                  />
                  <input
                    type="color"
                    value={editingSolution.backgroundColor && editingSolution.backgroundColor.startsWith('#') ? editingSolution.backgroundColor : '#ffffff'}
                    onChange={(e) => setEditingSolution({ ...editingSolution, backgroundColor: e.target.value })}
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                    title="Sélecteur de couleur"
                  />
                  <button
                    onClick={() => setEditingSolution({ ...editingSolution, backgroundColor: null })}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    title="Réinitialiser"
                  >
                    ↺
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Laissez vide pour utiliser la couleur par défaut (blanc)
                </p>
              </div>

              {/* Description complète */}
              <div>
                <label className="block font-semibold mb-2">Description complète</label>
                <textarea
                  value={editingSolution.fullDesc}
                  onChange={(e) => setEditingSolution({ ...editingSolution, fullDesc: e.target.value })}
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  rows={5}
                />
              </div>

              {/* Avantages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold">✅ Avantages</label>
                  <button
                    onClick={addPro}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    ➕ Ajouter
                  </button>
                </div>
                <div className="space-y-2">
                  {editingSolution.pros.map((pro, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={pro}
                        onChange={(e) => updatePro(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-4 py-2"
                        placeholder="Avantage"
                      />
                      <button
                        onClick={() => removePro(index)}
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inconvénients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold">⚠️ Points d'attention</label>
                  <button
                    onClick={addCon}
                    className="text-sm bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                  >
                    ➕ Ajouter
                  </button>
                </div>
                <div className="space-y-2">
                  {editingSolution.cons.map((con, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={con}
                        onChange={(e) => updateCon(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-4 py-2"
                        placeholder="Point d'attention"
                      />
                      <button
                        onClick={() => removeCon(index)}
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                      >
                        ❌
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liens vers les appareils */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <label className="font-semibold">🔗 Liens vers les appareils de ce type</label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editingSolution.showDeviceLinks}
                        onChange={(e) => setEditingSolution({ ...editingSolution, showDeviceLinks: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-600">Afficher cette section</span>
                    </label>
                  </div>
                  <button
                    onClick={addDeviceLink}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    ➕ Ajouter un appareil
                  </button>
                </div>
                <div className="space-y-3">
                  {(editingSolution.deviceLinks || []).map((link, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => updateDeviceLink(index, 'name', e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-4 py-2"
                          placeholder="Nom de l'appareil"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateDeviceLink(index, 'url', e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-4 py-2"
                          placeholder="Lien vers l'appareil"
                        />
                        <button
                          onClick={() => removeDeviceLink(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        >
                          ❌
                        </button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={link.imageUrl || ''}
                          onChange={(e) => {
                            const newLinks = [...editingSolution.deviceLinks];
                            newLinks[index] = { ...newLinks[index], imageUrl: e.target.value };
                            setEditingSolution({ ...editingSolution, deviceLinks: newLinks });
                          }}
                          className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm"
                          placeholder="URL de l'image (optionnel)"
                        />
                        <button
                          onClick={() => {
                            setUploadTarget('deviceLink');
                            setUploadTargetIndex(index);
                            setUploadModalOpen(true);
                          }}
                          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                          title="Uploader une image"
                        >
                          📸
                        </button>
                        {link.imageUrl && (
                          <button
                            onClick={() => {
                              const newLinks = [...editingSolution.deviceLinks];
                              newLinks[index] = { ...newLinks[index], imageUrl: undefined };
                              setEditingSolution({ ...editingSolution, deviceLinks: newLinks });
                            }}
                            className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600"
                            title="Retirer l'image"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      {link.imageUrl && (
                        <div className="mt-2">
                          <img src={link.imageUrl} alt={link.name} className="h-16 w-16 object-cover rounded border" />
                        </div>
                      )}
                    </div>
                  ))}
                  {(!editingSolution.deviceLinks || editingSolution.deviceLinks.length === 0) && (
                    <p className="text-sm text-gray-500 italic">Aucun lien vers un appareil pour le moment</p>
                  )}
                </div>
              </div>

              {/* Liens vers les accessoires */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <label className="font-semibold">🎧 Accessoires disponibles</label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={editingSolution.showAccessoryLinks}
                        onChange={(e) => setEditingSolution({ ...editingSolution, showAccessoryLinks: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-gray-600">Afficher cette section</span>
                    </label>
                  </div>
                  <button
                    onClick={addAccessoryLink}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    ➕ Ajouter un accessoire
                  </button>
                </div>
                <div className="space-y-3">
                  {(editingSolution.accessoryLinks || []).map((link, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={link.name}
                          onChange={(e) => updateAccessoryLink(index, 'name', e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-4 py-2"
                          placeholder="Nom de l'accessoire"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateAccessoryLink(index, 'url', e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-4 py-2"
                          placeholder="Lien vers l'accessoire"
                        />
                        <button
                          onClick={() => removeAccessoryLink(index)}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        >
                          ❌
                        </button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={link.imageUrl || ''}
                          onChange={(e) => {
                            const newLinks = [...editingSolution.accessoryLinks];
                            newLinks[index] = { ...newLinks[index], imageUrl: e.target.value };
                            setEditingSolution({ ...editingSolution, accessoryLinks: newLinks });
                          }}
                          className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm"
                          placeholder="URL de l'image (optionnel)"
                        />
                        <button
                          onClick={() => {
                            setUploadTarget('accessoryLink');
                            setUploadTargetIndex(index);
                            setUploadModalOpen(true);
                          }}
                          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                          title="Uploader une image"
                        >
                          📸
                        </button>
                        {link.imageUrl && (
                          <button
                            onClick={() => {
                              const newLinks = [...editingSolution.accessoryLinks];
                              newLinks[index] = { ...newLinks[index], imageUrl: undefined };
                              setEditingSolution({ ...editingSolution, accessoryLinks: newLinks });
                            }}
                            className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600"
                            title="Retirer l'image"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      {link.imageUrl && (
                        <div className="mt-2">
                          <img src={link.imageUrl} alt={link.name} className="h-16 w-16 object-cover rounded border" />
                        </div>
                      )}
                    </div>
                  ))}
                  {(!editingSolution.accessoryLinks || editingSolution.accessoryLinks.length === 0) && (
                    <p className="text-sm text-gray-500 italic">Aucun lien vers un accessoire pour le moment</p>
                  )}
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => saveSolution(editingSolution)}
                  disabled={saving}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark disabled:opacity-50"
                >
                  {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                <button
                  onClick={() => setEditingSolution(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
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
