'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';

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

export default function TestimonialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showNewTestimonialForm, setShowNewTestimonialForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    text: '',
    rating: 5,
    location: '',
    isVisible: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchTestimonials();
      setLoading(false);
    }
  }, [status, router]);

  async function fetchTestimonials() {
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  }

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

  async function importFromGoogle() {
    setImporting(true);
    try {
      const res = await fetch('/api/admin/testimonials/import-google', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(`❌ ${data.error}`);
      } else {
        alert(`✅ ${data.message}`);
        fetchTestimonials();
      }
    } catch {
      alert('❌ Erreur lors de la connexion à Google Places.');
    } finally {
      setImporting(false);
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
      <AdminHeader currentPage="testimonials" title="⭐ Avis clients" />

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">⭐ Avis clients</h2>
            <div className="flex gap-2">
              <button
                onClick={importFromGoogle}
                disabled={importing}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
                title="Importe les avis depuis votre fiche Google Maps (nécessite GOOGLE_PLACES_API_KEY et GOOGLE_PLACE_ID)"
              >
                {importing ? '⏳ Import...' : '🔄 Importer depuis Google'}
              </button>
              <button
                onClick={() => setShowNewTestimonialForm(!showNewTestimonialForm)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                + Nouvel avis
              </button>
            </div>
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
      </div>
    </div>
  );
}
