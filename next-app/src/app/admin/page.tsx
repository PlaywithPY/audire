'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type ThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
};

type OpeningHour = {
  id: number;
  dayOfWeek: number;
  isOpen: boolean;
  morningOpen: string | null;
  morningClose: string | null;
  afternoonOpen: string | null;
  afternoonClose: string | null;
};

type ContentBlock = {
  id: number;
  pageKey: string;
  blockKey: string;
  blockType: string;
  content: string;
  metadata: string | null;
  order: number;
  isVisible: boolean;
  updatedAt: string;
};

type Testimonial = {
  id: number;
  name: string;
  text: string;
  rating: number;
  location: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const blockTypes = [
  { value: 'title', label: '📝 Titre', icon: 'H1' },
  { value: 'text', label: '📄 Texte', icon: 'T' },
  { value: 'html', label: '🔧 HTML', icon: '</>' },
  { value: 'image', label: '🖼️ Image', icon: '🖼️' },
  { value: 'button', label: '🔘 Bouton', icon: 'BTN' },
];

const pages = [
  { key: 'home', label: '🏠 Accueil' },
  { key: 'contact', label: '📞 Contact' },
  { key: 'faq', label: '❓ FAQ' },
  { key: 'solutions-auditives', label: '👂 Solutions auditives' },
  { key: 'test-auditif-gratuit', label: '🔊 Test auditif gratuit' },
  { key: 'notre-accompagnement', label: '🤝 Notre accompagnement' },
  { key: 'remboursements', label: '💶 Remboursements' },
  { key: 'partenaires-pharmaciens', label: '💊 Partenaires pharmaciens' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'settings' | 'content' | 'testimonials'>('settings');
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#42a4ff',
    primaryLight: '#5ab3ff',
    primaryDark: '#2d87e6',
    secondary: '#EBF5FF',
  });
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [phones, setPhones] = useState({
    phone_fixe: '+32 4 123 45 67',
    phone_mobile: '+32 476 12 34 56',
    email: 'centre.audire@gmail.com',
    address: 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
  });
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedPage, setSelectedPage] = useState('home');
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [showNewBlockForm, setShowNewBlockForm] = useState(false);
  const [newBlock, setNewBlock] = useState({
    pageKey: 'home',
    blockKey: '',
    blockType: 'text',
    content: '',
    order: 0,
    isVisible: true,
  });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showNewTestimonialForm, setShowNewTestimonialForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    text: '',
    rating: 5,
    location: '',
    isVisible: true,
    isFeatured: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [colorsRes, hoursRes, settingsRes] = await Promise.all([
        fetch('/api/admin/colors'),
        fetch('/api/admin/hours'),
        fetch('/api/admin/settings'),
      ]);

      const colorsData = await colorsRes.json();
      const hoursData = await hoursRes.json();
      const settingsData = await settingsRes.json();

      setColors(colorsData);
      setHours(hoursData);
      setPhones({
        phone_fixe: settingsData.phone_fixe || '+32 4 123 45 67',
        phone_mobile: settingsData.phone_mobile || '+32 476 12 34 56',
        email: settingsData.email || 'centre.audire@gmail.com',
        address: settingsData.address || 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBlocks() {
    try {
      const res = await fetch(`/api/admin/blocks?pageKey=${selectedPage}`);
      const data = await res.json();
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  }

  useEffect(() => {
    if (activeTab === 'content') {
      fetchBlocks();
    }
  }, [selectedPage, activeTab]);

  async function saveBlock(block: ContentBlock) {
    setSaving(true);
    try {
      await fetch('/api/admin/blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block),
      });
      alert('✅ Bloc sauvegardé !');
      setEditingBlock(null);
      fetchBlocks();
    } catch (error) {
      console.error('Error saving block:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function createBlock() {
    if (!newBlock.blockKey) {
      alert('⚠️ Le blockKey est obligatoire !');
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/admin/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBlock, pageKey: selectedPage }),
      });
      alert('✅ Bloc créé !');
      setShowNewBlockForm(false);
      setNewBlock({
        pageKey: selectedPage,
        blockKey: '',
        blockType: 'text',
        content: '',
        order: 0,
        isVisible: true,
      });
      fetchBlocks();
    } catch (error) {
      console.error('Error creating block:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function deleteBlock(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bloc ?')) return;

    try {
      await fetch(`/api/admin/blocks?id=${id}`, {
        method: 'DELETE',
      });
      alert('✅ Bloc supprimé !');
      fetchBlocks();
    } catch (error) {
      console.error('Error deleting block:', error);
      alert('❌ Erreur lors de la suppression');
    }
  }

  // Fonctions pour gérer les avis clients
  async function fetchTestimonials() {
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  }

  useEffect(() => {
    if (activeTab === 'testimonials') {
      fetchTestimonials();
    }
  }, [activeTab]);

  async function createTestimonial() {
    if (!newTestimonial.name || !newTestimonial.text) {
      alert('⚠️ Le nom et le texte sont obligatoires !');
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTestimonial),
      });
      alert('✅ Avis créé !');
      setShowNewTestimonialForm(false);
      setNewTestimonial({
        name: '',
        text: '',
        rating: 5,
        location: '',
        isVisible: true,
        isFeatured: false,
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error creating testimonial:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function saveTestimonial(testimonial: Testimonial) {
    setSaving(true);
    try {
      await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonial),
      });
      alert('✅ Avis sauvegardé !');
      setEditingTestimonial(null);
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTestimonial(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      await fetch(`/api/admin/testimonials?id=${id}`, {
        method: 'DELETE',
      });
      alert('✅ Avis supprimé !');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('❌ Erreur lors de la suppression');
    }
  }

  async function saveColors() {
    setSaving(true);
    try {
      await fetch('/api/admin/colors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colors),
      });
      alert('✅ Couleurs sauvegardées !');
    } catch (error) {
      console.error('Error saving colors:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function saveHours(dayOfWeek: number) {
    const hour = hours.find((h) => h.dayOfWeek === dayOfWeek);
    if (!hour) return;

    try {
      await fetch('/api/admin/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hour),
      });
      alert('✅ Horaires sauvegardés !');
    } catch (error) {
      console.error('Error saving hours:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  }

  async function saveAllHours() {
    setSaving(true);
    try {
      // Sauvegarder tous les jours en parallèle
      await Promise.all(
        hours.map((hour) =>
          fetch('/api/admin/hours', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hour),
          })
        )
      );
      alert('✅ Tous les horaires ont été sauvegardés !');
    } catch (error) {
      console.error('Error saving all hours:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  function updateHour(dayOfWeek: number, field: keyof OpeningHour, value: any) {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek
          ? { ...h, [field]: value }
          : h
      )
    );
  }

  async function saveSetting(key: 'phone_fixe' | 'phone_mobile' | 'email' | 'address') {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: phones[key] }),
      });
      alert('✅ Sauvegardé !');
    } catch (error) {
      console.error('Error saving setting:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🛠️ Dashboard Admin - Audire</h1>
          <Link
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            ← Retour au site
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'settings'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ Paramètres (Couleurs, Horaires, Téléphones)
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'content'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🖊️ Éditeur de contenu (WYSIWYG)
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'testimonials'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              ⭐ Avis clients
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'settings' && (
          <>
            {/* Couleurs du thème */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🎨 Couleurs du thème</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Couleur primaire</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.primary}
                  onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Couleur primaire claire</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.primaryLight}
                  onChange={(e) => setColors({ ...colors, primaryLight: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primaryLight}
                  onChange={(e) => setColors({ ...colors, primaryLight: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Couleur primaire foncée</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.primaryDark}
                  onChange={(e) => setColors({ ...colors, primaryDark: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.primaryDark}
                  onChange={(e) => setColors({ ...colors, primaryDark: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Couleur secondaire</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveColors}
            disabled={saving}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder les couleurs'}
          </button>
        </section>

        {/* Coordonnées */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">📍 Coordonnées du centre</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone fixe</label>
              <input
                type="tel"
                value={phones.phone_fixe}
                onChange={(e) => setPhones({ ...phones, phone_fixe: e.target.value })}
                placeholder="+32 4 123 45 67"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => saveSetting('phone_fixe')}
                disabled={saving}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50 text-sm"
              >
                💾 Sauvegarder
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone mobile (GSM)</label>
              <input
                type="tel"
                value={phones.phone_mobile}
                onChange={(e) => setPhones({ ...phones, phone_mobile: e.target.value })}
                placeholder="+32 476 12 34 56"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => saveSetting('phone_mobile')}
                disabled={saving}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50 text-sm"
              >
                💾 Sauvegarder
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={phones.email}
                onChange={(e) => setPhones({ ...phones, email: e.target.value })}
                placeholder="centre.audire@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => saveSetting('email')}
                disabled={saving}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50 text-sm"
              >
                💾 Sauvegarder
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Adresse physique</label>
              <textarea
                value={phones.address}
                onChange={(e) => setPhones({ ...phones, address: e.target.value })}
                placeholder="Rue de la Station, 4&#10;4101 Jemeppe-sur-Meuse"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <button
                onClick={() => saveSetting('address')}
                disabled={saving}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition disabled:opacity-50 text-sm"
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        </section>

        {/* Horaires d'ouverture */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">🕐 Horaires d'ouverture</h2>
            <button
              onClick={saveAllHours}
              disabled={saving}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : '💾 Sauvegarder tous les horaires'}
            </button>
          </div>
          <div className="space-y-4">
            {hours.map((hour) => (
              <div key={hour.dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{daysOfWeek[hour.dayOfWeek]}</h3>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hour.isOpen}
                      onChange={(e) => updateHour(hour.dayOfWeek, 'isOpen', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span>{hour.isOpen ? 'Ouvert' : 'Fermé'}</span>
                  </label>
                </div>

                {hour.isOpen && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">Matin</p>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!hour.morningOpen}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateHour(hour.dayOfWeek, 'morningOpen', null);
                                updateHour(hour.dayOfWeek, 'morningClose', null);
                              } else {
                                updateHour(hour.dayOfWeek, 'morningOpen', '09:00');
                                updateHour(hour.dayOfWeek, 'morningClose', '12:00');
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-600">Fermé</span>
                        </label>
                      </div>
                      {hour.morningOpen && (
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={hour.morningOpen}
                            onChange={(e) => updateHour(hour.dayOfWeek, 'morningOpen', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                          <span className="self-center">-</span>
                          <input
                            type="time"
                            value={hour.morningClose || '12:00'}
                            onChange={(e) => updateHour(hour.dayOfWeek, 'morningClose', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      )}
                      {!hour.morningOpen && (
                        <p className="text-sm text-gray-500 italic">Fermé le matin</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">Après-midi</p>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!hour.afternoonOpen}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateHour(hour.dayOfWeek, 'afternoonOpen', null);
                                updateHour(hour.dayOfWeek, 'afternoonClose', null);
                              } else {
                                updateHour(hour.dayOfWeek, 'afternoonOpen', '13:00');
                                updateHour(hour.dayOfWeek, 'afternoonClose', '17:00');
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-600">Fermé</span>
                        </label>
                      </div>
                      {hour.afternoonOpen && (
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={hour.afternoonOpen}
                            onChange={(e) => updateHour(hour.dayOfWeek, 'afternoonOpen', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                          <span className="self-center">-</span>
                          <input
                            type="time"
                            value={hour.afternoonClose || '17:00'}
                            onChange={(e) => updateHour(hour.dayOfWeek, 'afternoonClose', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded"
                          />
                        </div>
                      )}
                      {!hour.afternoonOpen && (
                        <p className="text-sm text-gray-500 italic">Fermé l'après-midi</p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => saveHours(hour.dayOfWeek)}
                  className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition text-sm"
                >
                  💾 Sauvegarder
                </button>
              </div>
            ))}
          </div>
        </section>
          </>
        )}

        {/* Onglet Contenu */}
        {activeTab === 'content' && (
          <>
            {/* Sélecteur de page */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">📄 Sélectionnez une page</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {pages.map((page) => (
                  <button
                    key={page.key}
                    onClick={() => setSelectedPage(page.key)}
                    className={`px-4 py-3 rounded font-semibold transition ${
                      selectedPage === page.key
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {page.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Import automatique */}
            {blocks.length === 0 && (
              <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-lg mb-2">📥 Importer le contenu existant</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Le WYSIWYG est vide ? Cliquez ci-dessous pour importer automatiquement le contenu actuel des pages (titres, textes principaux, etc.)
                </p>
                <button
                  onClick={async () => {
                    if (!confirm('Importer le contenu existant des pages dans le WYSIWYG ?')) return;
                    setSaving(true);
                    try {
                      const res = await fetch('/api/admin/import-content', { method: 'POST' });
                      const data = await res.json();
                      alert(`✅ Importation terminée !\n\n• ${data.created} blocs créés\n• ${data.updated} blocs mis à jour\n• ${data.errors} erreurs`);
                      fetchBlocks();
                    } catch (error) {
                      console.error('Error importing content:', error);
                      alert('❌ Erreur lors de l\'importation');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition disabled:opacity-50 font-semibold"
                >
                  {saving ? 'Importation...' : '📥 Importer le contenu maintenant'}
                </button>
              </section>
            )}

            {/* Liste des blocs */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  🧱 Blocs - {pages.find((p) => p.key === selectedPage)?.label}
                </h2>
                <button
                  onClick={() => setShowNewBlockForm(!showNewBlockForm)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  + Nouveau bloc
                </button>
              </div>

              {/* Formulaire nouveau bloc */}
              {showNewBlockForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold mb-3">Créer un nouveau bloc</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Identifiant (blockKey)</label>
                      <input
                        type="text"
                        value={newBlock.blockKey}
                        onChange={(e) => setNewBlock({ ...newBlock, blockKey: e.target.value })}
                        placeholder="ex: hero-title"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Type de bloc</label>
                      <select
                        value={newBlock.blockType}
                        onChange={(e) => setNewBlock({ ...newBlock, blockType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        {blockTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Contenu</label>
                      <textarea
                        value={newBlock.content}
                        onChange={(e) => setNewBlock({ ...newBlock, content: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={createBlock}
                      disabled={saving}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      ✅ Créer
                    </button>
                    <button
                      onClick={() => setShowNewBlockForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des blocs */}
              {blocks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun bloc sur cette page. Créez-en un !
                </p>
              ) : (
                <div className="space-y-4">
                  {blocks.map((block) => (
                    <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                      {editingBlock?.id === block.id ? (
                        // Mode édition
                        <div>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Type</label>
                              <select
                                value={editingBlock.blockType}
                                onChange={(e) =>
                                  setEditingBlock({ ...editingBlock, blockType: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              >
                                {blockTypes.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editingBlock.isVisible}
                                  onChange={(e) =>
                                    setEditingBlock({ ...editingBlock, isVisible: e.target.checked })
                                  }
                                  className="w-5 h-5"
                                />
                                <span>Visible</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Contenu</label>
                            <textarea
                              value={editingBlock.content}
                              onChange={(e) =>
                                setEditingBlock({ ...editingBlock, content: e.target.value })
                              }
                              rows={5}
                              className="w-full px-3 py-2 border border-gray-300 rounded font-mono"
                            />
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => saveBlock(editingBlock)}
                              disabled={saving}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                              💾 Sauvegarder
                            </button>
                            <button
                              onClick={() => setEditingBlock(null)}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Mode affichage
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-lg">
                                {blockTypes.find((t) => t.value === block.blockType)?.icon}{' '}
                                {block.blockKey}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Type: {blockTypes.find((t) => t.value === block.blockType)?.label} •
                                {block.isVisible ? ' Visible' : ' Masqué'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingBlock(block)}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                ✏️ Modifier
                              </button>
                              <button
                                onClick={() => deleteBlock(block.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {block.content.length > 200
                                ? block.content.substring(0, 200) + '...'
                                : block.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Onglet Avis clients */}
        {activeTab === 'testimonials' && (
          <>
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">⭐ Avis clients</h2>
                <button
                  onClick={() => setShowNewTestimonialForm(!showNewTestimonialForm)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  + Nouvel avis
                </button>
              </div>

              {/* Formulaire nouvel avis */}
              {showNewTestimonialForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold mb-3">Créer un nouvel avis</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nom du client</label>
                      <input
                        type="text"
                        value={newTestimonial.name}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                        placeholder="ex: Marie D."
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Ville (optionnel)</label>
                      <input
                        type="text"
                        value={newTestimonial.location}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, location: e.target.value })}
                        placeholder="ex: Liège"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2">Texte de l'avis</label>
                      <textarea
                        value={newTestimonial.text}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                        rows={3}
                        placeholder="L'avis du client..."
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Note</label>
                      <select
                        value={newTestimonial.rating}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {'⭐'.repeat(rating)} ({rating}/5)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newTestimonial.isVisible}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, isVisible: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span>Visible</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newTestimonial.isFeatured}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, isFeatured: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span>⭐ Mettre en avant</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={createTestimonial}
                      disabled={saving}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      ✅ Créer
                    </button>
                    <button
                      onClick={() => setShowNewTestimonialForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des avis */}
              {testimonials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun avis pour le moment. Créez-en un !
                </p>
              ) : (
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                      {editingTestimonial?.id === testimonial.id ? (
                        // Mode édition
                        <div>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Nom</label>
                              <input
                                type="text"
                                value={editingTestimonial.name}
                                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Ville</label>
                              <input
                                type="text"
                                value={editingTestimonial.location || ''}
                                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2">Texte</label>
                            <textarea
                              value={editingTestimonial.text}
                              onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Note</label>
                              <select
                                value={editingTestimonial.rating}
                                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              >
                                {[5, 4, 3, 2, 1].map((rating) => (
                                  <option key={rating} value={rating}>
                                    {'⭐'.repeat(rating)} ({rating}/5)
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editingTestimonial.isVisible}
                                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, isVisible: e.target.checked })}
                                  className="w-5 h-5"
                                />
                                <span>Visible</span>
                              </label>
                            </div>
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={editingTestimonial.isFeatured}
                                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, isFeatured: e.target.checked })}
                                  className="w-5 h-5"
                                />
                                <span>En avant</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveTestimonial(editingTestimonial)}
                              disabled={saving}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                              💾 Sauvegarder
                            </button>
                            <button
                              onClick={() => setEditingTestimonial(null)}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Mode affichage
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-lg">
                                {testimonial.name}
                                {testimonial.location && <span className="text-sm text-gray-500 ml-2">({testimonial.location})</span>}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {'⭐'.repeat(testimonial.rating)} •
                                {testimonial.isVisible ? ' Visible' : ' Masqué'}
                                {testimonial.isFeatured && ' • ⭐ En avant'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingTestimonial(testimonial)}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                ✏️ Modifier
                              </button>
                              <button
                                onClick={() => deleteTestimonial(testimonial.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="text-sm italic">"{testimonial.text}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
