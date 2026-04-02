'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';

interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  order: number;
  isVisible: boolean;
  faqCount: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    imageUrl: '',
    description: '',
    order: 0,
    isVisible: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        alert('Erreur lors du chargement des catégories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Erreur lors du chargement des catégories');
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl || '',
      description: category.description || '',
      order: category.order,
      isVisible: category.isVisible,
    });
    setIsCreating(false);
  }

  function handleCreate() {
    setIsCreating(true);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      imageUrl: '',
      description: '',
      order: categories.length,
      isVisible: true,
    });
  }

  function handleCancel() {
    setEditingCategory(null);
    setIsCreating(false);
    setFormData({
      name: '',
      slug: '',
      imageUrl: '',
      description: '',
      order: 0,
      isVisible: true,
    });
  }

  // Générer automatiquement le slug à partir du nom
  function handleNameChange(name: string) {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
        .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
        .replace(/^-+|-+$/g, ''), // Retirer les tirets au début et à la fin
    });
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.slug.trim()) {
      alert('Le nom et le slug sont obligatoires');
      return;
    }

    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory
        ? { id: editingCategory.id, ...formData }
        : formData;

      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert(editingCategory ? 'Catégorie mise à jour' : 'Catégorie créée');
        handleCancel();
        loadCategories();
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Erreur lors de la sauvegarde');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette catégorie ? Les FAQs associées ne seront pas supprimées.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Catégorie supprimée');
        loadCategories();
      } else {
        const error = await res.json();
        alert(`Erreur: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Erreur lors de la suppression');
    }
  }

  async function toggleVisibility(category: Category) {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category.id,
          name: category.name,
          slug: category.slug,
          imageUrl: category.imageUrl,
          description: category.description,
          order: category.order,
          isVisible: !category.isVisible,
        }),
      });

      if (res.ok) {
        loadCategories();
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
      <AdminHeader currentPage="categories" />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gestion des Catégories FAQ</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            ➕ Nouvelle Catégorie
          </button>
        </div>

        {/* Formulaire de création/édition */}
        {(isCreating || editingCategory) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nom de la catégorie *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Remboursements"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: remboursements"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  URL de l'image
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemple.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description courte
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Description de la catégorie..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Ordre d'affichage
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

        {/* Liste des catégories */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Aucune catégorie pour le moment</p>
              </div>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                    !category.isVisible ? 'opacity-50' : ''
                  }`}
                >
                  {/* Image de la catégorie */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl text-gray-400">📁</div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        Ordre: {category.order}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {category.faqCount} FAQ{category.faqCount !== 1 ? 's' : ''}
                      </span>
                      {!category.isVisible && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Masquée
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Slug:</span> {category.slug}
                    </p>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 w-full"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        onClick={() => toggleVisibility(category)}
                        className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-200 w-full"
                      >
                        {category.isVisible ? '👁️ Masquer' : '👁️ Afficher'}
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 w-full"
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
