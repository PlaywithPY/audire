'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

type HearingAid = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  range: string | null;
  type: string | null;
  shortDesc: string | null;
  fullDesc: string | null;
  mainImage: string | null;
  gallery: string | null;
  features: string | null;
  technicalSpecs: string | null;
  price: string | null;
  isHighlight: boolean;
  isVisible: boolean;
  order: number;
  seoTitle: string | null;
  seoDescription: string | null;
  heroGradientFrom: string | null;
  heroGradientTo: string | null;
  heroImage: string | null;
  heroDescription: string | null;
  advantages: string | null;
  section1Title: string | null;
  section1Description: string | null;
  section1MediaUrl: string | null;
  section1MediaType: string | null;
  section2Title: string | null;
  section2Description: string | null;
  section2Image: string | null;
  highlightBox1Title: string | null;
  highlightBox1Description: string | null;
  highlightBox1Image: string | null;
  section3Title: string | null;
  section3Description: string | null;
  section3Image: string | null;
  section4Title: string | null;
  section4Description: string | null;
  section4MediaUrl: string | null;
  section4MediaType: string | null;
  highlightBox2Images: string | null;
  highlightBox2Title: string | null;
  productFAQs: string | null;
};

// Fonction pour générer un slug à partir du nom
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .trim()
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-'); // Éviter les tirets multiples
}

export default function AppareilsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [hearingAids, setHearingAids] = useState<HearingAid[]>([]);
  const [selectedAidId, setSelectedAidId] = useState<number | null>(null);

  const [showNewAidForm, setShowNewAidForm] = useState(false);
  const [newAid, setNewAid] = useState({
    name: '',
    brand: '',
    range: 'Premium',
    type: 'Contour d\'oreille',
    price: '',
    isVisible: true,
    isHighlight: false,
    order: 0,
  });

  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    infosBase: true,
    hero: false,
    advantages: false,
    sections: false,
    highlights: false,
    faqs: false,
    seo: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchHearingAids();
    }
  }, [status, router]);

  async function fetchHearingAids() {
    try {
      const res = await fetch('/api/admin/hearing-aids');
      const data = await res.json();
      setHearingAids(data);

      // Sélectionner le premier appareil par défaut
      if (data.length > 0 && !selectedAidId) {
        const highlightAid = data.find((a: HearingAid) => a.isHighlight) || data[0];
        setSelectedAidId(highlightAid.id);
      }
    } catch (error) {
      console.error('Error fetching hearing aids:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createHearingAid() {
    if (!newAid.name || !newAid.brand) {
      alert('⚠️ Le nom et la marque sont obligatoires !');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/hearing-aids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAid),
      });

      if (!res.ok) {
        const error = await res.json();
        alert('❌ ' + error.error);
        return;
      }

      const createdAid = await res.json();
      alert('✅ Appareil créé !');
      setShowNewAidForm(false);
      setNewAid({
        name: '',
        brand: '',
        range: 'Premium',
        type: 'Contour d\'oreille',
        price: '',
        isVisible: true,
        isHighlight: false,
        order: 0,
      });
      fetchHearingAids();
      setSelectedAidId(createdAid.id);
    } catch (error) {
      console.error('Error creating hearing aid:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function updateHearingAid(aid: HearingAid) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/hearing-aids', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aid),
      });

      if (!res.ok) {
        const error = await res.json();
        alert('❌ ' + error.error);
        return;
      }

      alert('✅ Appareil sauvegardé !');
      fetchHearingAids();
    } catch (error) {
      console.error('Error updating hearing aid:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function deleteHearingAid(id: number) {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet appareil ? Cette action est irréversible.')) return;

    try {
      await fetch(`/api/admin/hearing-aids?id=${id}`, {
        method: 'DELETE',
      });
      alert('✅ Appareil supprimé !');
      if (selectedAidId === id) {
        setSelectedAidId(null);
      }
      fetchHearingAids();
    } catch (error) {
      console.error('Error deleting hearing aid:', error);
      alert('❌ Erreur lors de la suppression');
    }
  }

  function updateField(field: keyof HearingAid, value: any) {
    if (!selectedAid) return;
    const updatedAid = { ...selectedAid, [field]: value };
    setHearingAids(hearingAids.map((a) => (a.id === selectedAid.id ? updatedAid : a)));
  }

  function toggleSection(section: string) {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  const selectedAid = hearingAids.find((a) => a.id === selectedAidId);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="appareils" title="🦻 Gestion des appareils auditifs" />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Section: Sélecteur d'appareil */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🦻 Sélectionner un appareil</h2>
            <button
              onClick={() => setShowNewAidForm(!showNewAidForm)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              + Nouvel appareil
            </button>
          </div>

          {/* Formulaire nouvel appareil */}
          {showNewAidForm && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-3">Créer un nouvel appareil</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom de l'appareil *</label>
                  <input
                    type="text"
                    value={newAid.name}
                    onChange={(e) => setNewAid({ ...newAid, name: e.target.value })}
                    placeholder="ex: Oticon Real"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                  {newAid.name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Slug auto: <span className="font-mono">{generateSlug(newAid.name)}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Marque *</label>
                  <select
                    value={newAid.brand}
                    onChange={(e) => setNewAid({ ...newAid, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="Oticon">Oticon</option>
                    <option value="Phonak">Phonak</option>
                    <option value="Bernafon">Bernafon</option>
                    <option value="Signia">Signia</option>
                    <option value="Widex">Widex</option>
                    <option value="Starkey">Starkey</option>
                    <option value="ReSound">ReSound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Gamme</label>
                  <select
                    value={newAid.range || ''}
                    onChange={(e) => setNewAid({ ...newAid, range: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">-- Non définie --</option>
                    <option value="Premium">Premium</option>
                    <option value="Confort">Confort</option>
                    <option value="Essentiel">Essentiel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Type</label>
                  <select
                    value={newAid.type || ''}
                    onChange={(e) => setNewAid({ ...newAid, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">-- Non défini --</option>
                    <option value="Contour d'oreille">Contour d'oreille</option>
                    <option value="Intra-auriculaire">Intra-auriculaire</option>
                    <option value="Intra-auriculaire sur mesure">Intra-auriculaire sur mesure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Prix</label>
                  <input
                    type="text"
                    value={newAid.price}
                    onChange={(e) => setNewAid({ ...newAid, price: e.target.value })}
                    placeholder="ex: 2800€ - 3500€"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAid.isVisible}
                      onChange={(e) => setNewAid({ ...newAid, isVisible: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>👁️ Visible sur le site</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newAid.isHighlight}
                      onChange={(e) => setNewAid({ ...newAid, isHighlight: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>⭐ Mis en avant</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={createHearingAid}
                  disabled={saving}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  ✅ Créer
                </button>
                <button
                  onClick={() => setShowNewAidForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des appareils */}
          {hearingAids.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun appareil pour le moment. Créez-en un !
            </p>
          ) : (
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {hearingAids.map((aid) => (
                <div
                  key={aid.id}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition flex justify-between items-center ${
                    selectedAidId === aid.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedAidId(aid.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-bold">
                      {aid.name} {aid.isHighlight && '⭐'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {aid.brand} {aid.range && `• ${aid.range}`} {aid.type && `• ${aid.type}`}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${aid.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {aid.isVisible ? '👁️ Visible' : '🚫 Caché'}
                      </span>
                      <span className="text-xs text-gray-500">Ordre: {aid.order}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHearingAid(aid.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section: Édition de l'appareil sélectionné */}
        {selectedAid && (
          <>
            {/* Informations de base */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection('infosBase')}>
                <h2 className="text-2xl font-bold">📝 Informations de base - {selectedAid.name}</h2>
                <span className="text-2xl">{openSections.infosBase ? '▼' : '▶'}</span>
              </div>

              {openSections.infosBase && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nom de l'appareil *</label>
                      <input
                        type="text"
                        value={selectedAid.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Marque *</label>
                      <select
                        value={selectedAid.brand}
                        onChange={(e) => updateField('brand', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="Oticon">Oticon</option>
                        <option value="Phonak">Phonak</option>
                        <option value="Bernafon">Bernafon</option>
                        <option value="Signia">Signia</option>
                        <option value="Widex">Widex</option>
                        <option value="Starkey">Starkey</option>
                        <option value="ReSound">ReSound</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Gamme</label>
                      <select
                        value={selectedAid.range || ''}
                        onChange={(e) => updateField('range', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="">-- Non définie --</option>
                        <option value="Premium">Premium</option>
                        <option value="Confort">Confort</option>
                        <option value="Essentiel">Essentiel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Type</label>
                      <select
                        value={selectedAid.type || ''}
                        onChange={(e) => updateField('type', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="">-- Non défini --</option>
                        <option value="Contour d'oreille">Contour d'oreille</option>
                        <option value="Intra-auriculaire">Intra-auriculaire</option>
                        <option value="Intra-auriculaire sur mesure">Intra-auriculaire sur mesure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Prix</label>
                      <input
                        type="text"
                        value={selectedAid.price || ''}
                        onChange={(e) => updateField('price', e.target.value || null)}
                        placeholder="ex: 2800€ - 3500€"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Ordre d'affichage</label>
                      <input
                        type="number"
                        value={selectedAid.order}
                        onChange={(e) => updateField('order', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Description courte</label>
                      <textarea
                        value={selectedAid.shortDesc || ''}
                        onChange={(e) => updateField('shortDesc', e.target.value || null)}
                        rows={2}
                        placeholder="Description courte pour la liste des appareils"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Description complète</label>
                      <textarea
                        value={selectedAid.fullDesc || ''}
                        onChange={(e) => updateField('fullDesc', e.target.value || null)}
                        rows={4}
                        placeholder="Description détaillée pour la page produit"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Image principale (URL)</label>
                      <input
                        type="text"
                        value={selectedAid.mainImage || ''}
                        onChange={(e) => updateField('mainImage', e.target.value || null)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAid.isVisible}
                          onChange={(e) => updateField('isVisible', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <span>👁️ Visible sur le site</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedAid.isHighlight}
                          onChange={(e) => updateField('isHighlight', e.target.checked)}
                          className="w-5 h-5"
                        />
                        <span>⭐ Mis en avant</span>
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => updateHearingAid(selectedAid)}
                    disabled={saving}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                </>
              )}
            </section>

            {/* Section Hero */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection('hero')}>
                <h2 className="text-2xl font-bold">🎨 Section Hero</h2>
                <span className="text-2xl">{openSections.hero ? '▼' : '▶'}</span>
              </div>

              {openSections.hero && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Gradient - Couleur de départ</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedAid.heroGradientFrom || '#42a4ff'}
                          onChange={(e) => updateField('heroGradientFrom', e.target.value)}
                          className="w-16 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedAid.heroGradientFrom || '#42a4ff'}
                          onChange={(e) => updateField('heroGradientFrom', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Gradient - Couleur de fin</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={selectedAid.heroGradientTo || '#5ab3ff'}
                          onChange={(e) => updateField('heroGradientTo', e.target.value)}
                          className="w-16 h-10 border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={selectedAid.heroGradientTo || '#5ab3ff'}
                          onChange={(e) => updateField('heroGradientTo', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Image Hero (URL)</label>
                      <input
                        type="text"
                        value={selectedAid.heroImage || ''}
                        onChange={(e) => updateField('heroImage', e.target.value || null)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Description Hero</label>
                      <textarea
                        value={selectedAid.heroDescription || ''}
                        onChange={(e) => updateField('heroDescription', e.target.value || null)}
                        rows={3}
                        placeholder="Texte principal affiché dans le hero"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => updateHearingAid(selectedAid)}
                    disabled={saving}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                </>
              )}
            </section>

            {/* Sections de contenu */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection('sections')}>
                <h2 className="text-2xl font-bold">📄 Sections de contenu (1-4)</h2>
                <span className="text-2xl">{openSections.sections ? '▼' : '▶'}</span>
              </div>

              {openSections.sections && (
                <>
                  {/* Section 1 */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold mb-3">Section 1 - Vidéo/Image + Texte</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Titre</label>
                        <input
                          type="text"
                          value={selectedAid.section1Title || ''}
                          onChange={(e) => updateField('section1Title', e.target.value || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Type de média</label>
                        <select
                          value={selectedAid.section1MediaType || 'image'}
                          onChange={(e) => updateField('section1MediaType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="image">Image</option>
                          <option value="video">Vidéo</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                          value={selectedAid.section1Description || ''}
                          onChange={(e) => updateField('section1Description', e.target.value || null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">URL du média</label>
                        <input
                          type="text"
                          value={selectedAid.section1MediaUrl || ''}
                          onChange={(e) => updateField('section1MediaUrl', e.target.value || null)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold mb-3">Section 2 - Image à gauche + Texte à droite</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Titre</label>
                        <input
                          type="text"
                          value={selectedAid.section2Title || ''}
                          onChange={(e) => updateField('section2Title', e.target.value || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Image (URL)</label>
                        <input
                          type="text"
                          value={selectedAid.section2Image || ''}
                          onChange={(e) => updateField('section2Image', e.target.value || null)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                          value={selectedAid.section2Description || ''}
                          onChange={(e) => updateField('section2Description', e.target.value || null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold mb-3">Section 3 - Image à droite + Texte à gauche</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Titre</label>
                        <input
                          type="text"
                          value={selectedAid.section3Title || ''}
                          onChange={(e) => updateField('section3Title', e.target.value || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Image (URL)</label>
                        <input
                          type="text"
                          value={selectedAid.section3Image || ''}
                          onChange={(e) => updateField('section3Image', e.target.value || null)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                          value={selectedAid.section3Description || ''}
                          onChange={(e) => updateField('section3Description', e.target.value || null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4 */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold mb-3">Section 4 - Vidéo/Image à gauche + Texte à droite</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Titre</label>
                        <input
                          type="text"
                          value={selectedAid.section4Title || ''}
                          onChange={(e) => updateField('section4Title', e.target.value || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Type de média</label>
                        <select
                          value={selectedAid.section4MediaType || 'video'}
                          onChange={(e) => updateField('section4MediaType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        >
                          <option value="image">Image</option>
                          <option value="video">Vidéo</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                          value={selectedAid.section4Description || ''}
                          onChange={(e) => updateField('section4Description', e.target.value || null)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">URL du média</label>
                        <input
                          type="text"
                          value={selectedAid.section4MediaUrl || ''}
                          onChange={(e) => updateField('section4MediaUrl', e.target.value || null)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => updateHearingAid(selectedAid)}
                    disabled={saving}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                </>
              )}
            </section>

            {/* Encadrés Highlight */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection('highlights')}>
                <h2 className="text-2xl font-bold">✨ Encadrés Highlight</h2>
                <span className="text-2xl">{openSections.highlights ? '▼' : '▶'}</span>
              </div>

              {openSections.highlights && (
                <>
                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold mb-3">Encadré Highlight 1</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Titre</label>
                        <input
                          type="text"
                          value={selectedAid.highlightBox1Title || ''}
                          onChange={(e) => updateField('highlightBox1Title', e.target.value || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Image (URL)</label>
                        <input
                          type="text"
                          value={selectedAid.highlightBox1Image || ''}
                          onChange={(e) => updateField('highlightBox1Image', e.target.value || null)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Description</label>
                        <textarea
                          value={selectedAid.highlightBox1Description || ''}
                          onChange={(e) => updateField('highlightBox1Description', e.target.value || null)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 mb-4">
                    <h3 className="font-bold mb-3">Encadré Highlight 2</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Titre</label>
                        <input
                          type="text"
                          value={selectedAid.highlightBox2Title || ''}
                          onChange={(e) => updateField('highlightBox2Title', e.target.value || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Images (JSON array)</label>
                        <textarea
                          value={selectedAid.highlightBox2Images || ''}
                          onChange={(e) => updateField('highlightBox2Images', e.target.value || null)}
                          rows={2}
                          placeholder='["https://...", "https://..."]'
                          className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => updateHearingAid(selectedAid)}
                    disabled={saving}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                </>
              )}
            </section>

            {/* SEO */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection('seo')}>
                <h2 className="text-2xl font-bold">🔍 SEO</h2>
                <span className="text-2xl">{openSections.seo ? '▼' : '▶'}</span>
              </div>

              {openSections.seo && (
                <>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Titre SEO</label>
                      <input
                        type="text"
                        value={selectedAid.seoTitle || ''}
                        onChange={(e) => updateField('seoTitle', e.target.value || null)}
                        placeholder="Titre pour les moteurs de recherche"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Description SEO</label>
                      <textarea
                        value={selectedAid.seoDescription || ''}
                        onChange={(e) => updateField('seoDescription', e.target.value || null)}
                        rows={3}
                        placeholder="Description pour les moteurs de recherche"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => updateHearingAid(selectedAid)}
                    disabled={saving}
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
