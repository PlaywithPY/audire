'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type HearingLossCategory = {
  id: number;
  name: string;
  slug: string;
  minDb: number | null;
  maxDb: number | null;
  description: string | null;
  order: number;
};

type DeviceType = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  order: number;
};

type Product = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  model: string | null;
  shortDescription: string;
  fullDescription: string | null;
  price: number | null;
  priceRange: string | null;
  imageUrl: string | null;
  imagePosition: string;
  imageAlt: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  order: number;
  showBrand: boolean;
  showPrice: boolean;
  showShortDescription: boolean;
  showFullDescription: boolean;
  showImage: boolean;
  showFeatures: boolean;
  showProsCons: boolean;
  showDeviceType: boolean;
  showHearingLossLevel: boolean;
  hearingLossCategoryId: number | null;
  hearingLossCategory: HearingLossCategory | null;
  deviceTypeId: number | null;
  deviceType: DeviceType | null;
  features: string | null;
  pros: string | null;
  cons: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<HearingLossCategory[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    slug: '',
    brand: 'Oticon',
    model: '',
    shortDescription: '',
    fullDescription: '',
    price: '',
    priceRange: '',
    imageUrl: '',
    imagePosition: 'center center',
    imageAlt: '',
    isVisible: true,
    isFeatured: false,
    order: 0,
    showBrand: true,
    showPrice: true,
    showShortDescription: true,
    showFullDescription: true,
    showImage: true,
    showFeatures: true,
    showProsCons: true,
    showDeviceType: true,
    showHearingLossLevel: true,
    hearingLossCategoryId: '',
    deviceTypeId: '',
    features: '{}',
    pros: '[]',
    cons: '[]',
    metaTitle: '',
    metaDescription: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [productsRes, categoriesRes, deviceTypesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/hearing-loss-categories'),
        fetch('/api/admin/device-types'),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const deviceTypesData = await deviceTypesRes.json();

      setProducts(productsData);
      setCategories(categoriesData);
      setDeviceTypes(deviceTypesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createProduct() {
    if (!newProduct.name || !newProduct.slug) {
      alert('⚠️ Le nom et le slug sont obligatoires !');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Produit créé !');
        setShowNewProductForm(false);
        resetNewProduct();
        fetchData();
      } else {
        alert('❌ Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function saveProduct(product: Product) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Produit sauvegardé !');
        setEditingProduct(null);
        fetchData();
      } else {
        alert('❌ Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE',
      });
      alert('✅ Produit supprimé !');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('❌ Erreur lors de la suppression');
    }
  }

  function resetNewProduct() {
    setNewProduct({
      name: '',
      slug: '',
      brand: 'Oticon',
      model: '',
      shortDescription: '',
      fullDescription: '',
      price: '',
      priceRange: '',
      imageUrl: '',
      imagePosition: 'center center',
      imageAlt: '',
      isVisible: true,
      isFeatured: false,
      order: 0,
      showBrand: true,
      showPrice: true,
      showShortDescription: true,
      showFullDescription: true,
      showImage: true,
      showFeatures: true,
      showProsCons: true,
      showDeviceType: true,
      showHearingLossLevel: true,
      hearingLossCategoryId: '',
      deviceTypeId: '',
      features: '{}',
      pros: '[]',
      cons: '[]',
      metaTitle: '',
      metaDescription: '',
    });
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Admin
            </Link>
            <h1 className="text-2xl font-bold">📦 Gestion des Produits</h1>
          </div>
          <Link
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Retour au site
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600">{products.length}</div>
            <div className="text-gray-600 mt-1">Produits totaux</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-green-600">
              {products.filter(p => p.isVisible).length}
            </div>
            <div className="text-gray-600 mt-1">Produits visibles</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-purple-600">{categories.length}</div>
            <div className="text-gray-600 mt-1">Catégories</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-orange-600">{deviceTypes.length}</div>
            <div className="text-gray-600 mt-1">Types d'appareils</div>
          </div>
        </div>

        {/* Bouton Nouveau Produit */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Produits</h2>
            <button
              onClick={() => setShowNewProductForm(!showNewProductForm)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              + Nouveau produit
            </button>
          </div>

          {/* Formulaire nouveau produit */}
          {showNewProductForm && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-bold mb-4">Créer un nouveau produit</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Nom du produit *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewProduct({
                        ...newProduct,
                        name,
                        slug: generateSlug(name),
                      });
                    }}
                    placeholder="Ex: Phonak Virto R Infinio"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Slug (URL) *</label>
                  <input
                    type="text"
                    value={newProduct.slug}
                    onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })}
                    placeholder="Ex: phonak-virto-r-infinio"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Marque</label>
                  <select
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="Oticon">Oticon</option>
                    <option value="Bernafon">Bernafon</option>
                    <option value="Phonak">Phonak</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Modèle</label>
                  <input
                    type="text"
                    value={newProduct.model}
                    onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                    placeholder="Ex: Virto R"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Type d'appareil</label>
                  <select
                    value={newProduct.deviceTypeId}
                    onChange={(e) => setNewProduct({ ...newProduct, deviceTypeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">-- Sélectionner --</option>
                    {deviceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Catégorie de perte auditive</label>
                  <select
                    value={newProduct.hearingLossCategoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, hearingLossCategoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">-- Sélectionner --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                        {cat.minDb && cat.maxDb && ` (${cat.minDb}-${cat.maxDb} dB)`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Description courte *</label>
                  <textarea
                    value={newProduct.shortDescription}
                    onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                    rows={2}
                    placeholder="Description courte pour les listes"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Prix (€)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="2500"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Fourchette de prix</label>
                  <input
                    type="text"
                    value={newProduct.priceRange}
                    onChange={(e) => setNewProduct({ ...newProduct, priceRange: e.target.value })}
                    placeholder="Ex: 1500€ - 2500€"
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">URL de l'image</label>
                  <input
                    type="text"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newProduct.isVisible}
                      onChange={(e) => setNewProduct({ ...newProduct, isVisible: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>Visible sur le site</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newProduct.isFeatured}
                      onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span>⭐ Produit mis en avant</span>
                  </label>
                </div>

                {/* Section Contrôles de visibilité */}
                <div className="md:col-span-2 mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-bold mb-3 text-blue-900">🔧 Contrôles de visibilité des informations</h4>
                  <p className="text-sm text-blue-700 mb-4">Choisissez quelles informations afficher sur le site pour ce produit</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.showBrand}
                        onChange={(e) => setNewProduct({ ...newProduct, showBrand: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Marque</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.showPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, showPrice: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Prix</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.showImage}
                        onChange={(e) => setNewProduct({ ...newProduct, showImage: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Image</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.showShortDescription}
                        onChange={(e) => setNewProduct({ ...newProduct, showShortDescription: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Description courte</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.showFullDescription}
                        onChange={(e) => setNewProduct({ ...newProduct, showFullDescription: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Description complète</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.showFeatures}
                        onChange={(e) => setNewProduct({ ...newProduct, showFeatures: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Caractéristiques</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.showProsCons}
                        onChange={(e) => setNewProduct({ ...newProduct, showProsCons: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Avantages/Inconvénients</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.showDeviceType}
                        onChange={(e) => setNewProduct({ ...newProduct, showDeviceType: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Type d'appareil</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.showHearingLossLevel}
                        onChange={(e) => setNewProduct({ ...newProduct, showHearingLossLevel: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Niveau de perte auditive</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={createProduct}
                  disabled={saving}
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {saving ? 'Création...' : '✅ Créer le produit'}
                </button>
                <button
                  onClick={() => {
                    setShowNewProductForm(false);
                    resetNewProduct();
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des produits */}
          <div className="mt-6">
            {products.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucun produit pour le moment. Créez-en un !
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Image</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Nom</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Marque</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Prix</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Statut</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.imageAlt || product.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                              📷
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-xs text-gray-500">/{product.slug}</div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{product.brand}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {product.deviceType?.name || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {product.price ? `${product.price}€` : product.priceRange || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <div className="flex flex-col gap-1 items-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                product.isVisible
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {product.isVisible ? '✓ Visible' : '✗ Masqué'}
                            </span>
                            {product.isFeatured && (
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <div className="flex gap-2 justify-center">
                            <Link
                              href={`/products/${product.slug}`}
                              target="_blank"
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              👁️ Voir
                            </Link>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Modal d'édition */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-6">Modifier le produit</h3>
                <div className="grid md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Nom *</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Slug *</label>
                    <input
                      type="text"
                      value={editingProduct.slug}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, slug: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Marque</label>
                    <select
                      value={editingProduct.brand}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, brand: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="Oticon">Oticon</option>
                      <option value="Bernafon">Bernafon</option>
                      <option value="Phonak">Phonak</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Modèle</label>
                    <input
                      type="text"
                      value={editingProduct.model || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, model: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Type d'appareil</label>
                    <select
                      value={editingProduct.deviceTypeId || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          deviceTypeId: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">-- Sélectionner --</option>
                      {deviceTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Catégorie de perte auditive
                    </label>
                    <select
                      value={editingProduct.hearingLossCategoryId || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          hearingLossCategoryId: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">-- Sélectionner --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                          {cat.minDb && cat.maxDb && ` (${cat.minDb}-${cat.maxDb} dB)`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Description courte</label>
                    <textarea
                      value={editingProduct.shortDescription}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          shortDescription: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Description complète</label>
                    <textarea
                      value={editingProduct.fullDescription || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          fullDescription: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Prix (€)</label>
                    <input
                      type="number"
                      value={editingProduct.price || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Fourchette de prix</label>
                    <input
                      type="text"
                      value={editingProduct.priceRange || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, priceRange: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">URL de l'image</label>
                    <input
                      type="text"
                      value={editingProduct.imageUrl || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingProduct.isVisible}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            isVisible: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span>Visible sur le site</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingProduct.isFeatured}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            isFeatured: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span>⭐ Produit mis en avant</span>
                    </label>
                  </div>

                  {/* Section Contrôles de visibilité */}
                  <div className="md:col-span-2 mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-bold mb-3 text-blue-900">🔧 Contrôles de visibilité des informations</h4>
                    <p className="text-sm text-blue-700 mb-4">Choisissez quelles informations afficher sur le site pour ce produit</p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.showBrand}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              showBrand: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Marque</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.showPrice}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              showPrice: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Prix</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.showImage}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              showImage: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Image</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.showShortDescription}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              showShortDescription: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Description courte</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.showFullDescription}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              showFullDescription: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Description complète</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.showFeatures}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              showFeatures: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Caractéristiques</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.showProsCons}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              showProsCons: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Avantages/Inconvénients</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.showDeviceType}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              showDeviceType: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Type d'appareil</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingProduct.showHearingLossLevel}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              showHearingLossLevel: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Niveau de perte auditive</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => saveProduct(editingProduct)}
                    disabled={saving}
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                  </button>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
