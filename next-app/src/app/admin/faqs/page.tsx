'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
  isVisible: boolean;
  category: string | null;
}

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0,
    isVisible: true,
    category: '',
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  async function loadFAQs() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/faqs');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      } else {
        alert('Erreur lors du chargement des FAQs');
      }
    } catch (error) {
      console.error('Error loading FAQs:', error);
      alert('Erreur lors du chargement des FAQs');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(faq: FAQ) {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      isVisible: faq.isVisible,
      category: faq.category || '',
    });
    setIsCreating(false);
  }

  function handleCreate() {
    setIsCreating(true);
    setEditingFAQ(null);
    setFormData({
      question: '',
      answer: '',
      order: faqs.length,
      isVisible: true,
      category: '',
    });
  }

  function handleCancel() {
    setEditingFAQ(null);
    setIsCreating(false);
    setFormData({
      question: '',
      answer: '',
      order: 0,
      isVisible: true,
      category: '',
    });
  }

  async function handleSave() {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Question et réponse sont obligatoires');
      return;
    }

    try {
      const method = editingFAQ ? 'PUT' : 'POST';
      const body = editingFAQ
        ? { id: editingFAQ.id, ...formData }
        : formData;

      const res = await fetch('/api/admin/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert(editingFAQ ? 'FAQ mise à jour' : 'FAQ créée');
        handleCancel();
        loadFAQs();
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette FAQ ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/faqs?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('FAQ supprimée');
        loadFAQs();
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert('Erreur lors de la suppression');
    }
  }

  async function toggleVisibility(faq: FAQ) {
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          isVisible: !faq.isVisible,
          category: faq.category,
        }),
      });

      if (res.ok) {
        loadFAQs();
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Erreur lors de la mise à jour');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des FAQs</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Nouvelle FAQ
          </button>
        </div>

        {/* Formulaire de création/édition */}
        {(isCreating || editingFAQ) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingFAQ ? 'Modifier la FAQ' : 'Nouvelle FAQ'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Quelle est votre question ?"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Réponse *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="La réponse..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Ordre
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Catégorie (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="remboursements, tests..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Visible
                  </label>
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    className="w-6 h-6 mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  💾 Enregistrer
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des FAQs */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Aucune FAQ pour le moment</p>
              </div>
            ) : (
              faqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`bg-white rounded-lg shadow p-6 ${
                    !faq.isVisible ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          Ordre: {faq.order}
                        </span>
                        {faq.category && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {faq.category}
                          </span>
                        )}
                        {!faq.isVisible && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Masquée
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => toggleVisibility(faq)}
                        className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-200"
                      >
                        {faq.isVisible ? '👁️ Masquer' : '👁️ Afficher'}
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
