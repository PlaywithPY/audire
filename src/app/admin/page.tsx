'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VisualPageBuilder from '@/components/VisualPageBuilder';
import WYSIWYGEditor from '@/components/WYSIWYGEditor';
import ImagePicker from '@/components/ImagePicker';
import AdminHeader from '@/components/AdminHeader';
import BlockSelector from '@/components/BlockSelector';

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

type CardImage = {
  id: number;
  cardKey: string;
  imageUrl: string;
  fallbackEmoji: string;
  updatedAt: string;
};

type Centre = {
  id: number;
  name: string;
  slug: string;
  phoneFixe: string;
  phoneMobile: string | null;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  isActive: boolean;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
};

const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const blockTypes = [
  { value: 'title', label: '📝 Titre', icon: 'H1' },
  { value: 'text', label: '📄 Texte', icon: 'T' },
  { value: 'card', label: '🎴 Card', icon: '🎴' },
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
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protection: rediriger vers login si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  const [activeTab, setActiveTab] = useState<'settings' | 'content' | 'testimonials' | 'centres'>('content');
  const [colors, setColors] = useState<ThemeColors>({
    primary: '#42a4ff',
    primaryLight: '#5ab3ff',
    primaryDark: '#2d87e6',
    secondary: '#EBF5FF',
  });
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [selectedCentreId, setSelectedCentreId] = useState<number | null>(null);
  const [centre, setCentre] = useState({
    phoneFixe: '+32 4 123 45 67',
    phoneMobile: '+32 476 12 34 56',
    email: 'centre.audire@gmail.com',
    address: 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
    postalCode: '4101',
    city: 'Jemeppe-sur-Meuse',
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
  const [cardImages, setCardImages] = useState<CardImage[]>([]);
  const [editingCardImage, setEditingCardImage] = useState<CardImage | null>(null);
  const [showNewCardImageForm, setShowNewCardImageForm] = useState(false);
  const [newCardImage, setNewCardImage] = useState({
    cardKey: '',
    imageUrl: '',
    fallbackEmoji: '📷',
  });
  const [editingCentre, setEditingCentre] = useState<Centre | null>(null);
  const [showNewCentreForm, setShowNewCentreForm] = useState(false);
  const [newCentre, setNewCentre] = useState({
    name: '',
    slug: '',
    phoneFixe: '',
    phoneMobile: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    isDefault: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{ name: string; url: string }[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'split' | 'wysiwyg'>('wysiwyg');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerCallback, setImagePickerCallback] = useState<((url: string) => void) | null>(null);
  const [showBlockSelector, setShowBlockSelector] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [colorsRes, centresRes] = await Promise.all([
        fetch('/api/admin/colors'),
        fetch('/api/admin/centres'),
      ]);

      const colorsData = await colorsRes.json();
      const centresData = await centresRes.json();

      setColors(colorsData);
      setCentres(centresData);

      // Sélectionner le centre par défaut au démarrage
      const defaultCentre = centresData.find((c: Centre) => c.isDefault);
      if (defaultCentre) {
        setSelectedCentreId(defaultCentre.id);
        await loadCentreData(defaultCentre.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCentreData(centreId: number) {
    try {
      const centreRes = await fetch(`/api/admin/centres?id=${centreId}`);
      const centreData = await centreRes.json();

      setCentre({
        phoneFixe: centreData.phoneFixe || '+32 4 123 45 67',
        phoneMobile: centreData.phoneMobile || '+32 476 12 34 56',
        email: centreData.email || 'centre.audire@gmail.com',
        address: centreData.address || 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
        postalCode: centreData.postalCode || '4101',
        city: centreData.city || 'Jemeppe-sur-Meuse',
      });

      // Charger les horaires du centre sélectionné
      // TODO: Adapter l'API pour supporter la sélection par centre
      const hoursRes = await fetch('/api/admin/hours');
      const hoursData = await hoursRes.json();
      setHours(hoursData);
    } catch (error) {
      console.error('Error loading centre data:', error);
    }
  }

  useEffect(() => {
    if (selectedCentreId) {
      loadCentreData(selectedCentreId);
    }
  }, [selectedCentreId]);

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
      fetchUploadedImages();
    }
  }, [selectedPage, activeTab]);

  async function fetchUploadedImages() {
    try {
      const res = await fetch('/api/admin/upload');
      const data = await res.json();
      setUploadedImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }

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

  // Fonctions pour gérer les centres
  async function createCentre() {
    if (!newCentre.name || !newCentre.slug || !newCentre.phoneFixe || !newCentre.email || !newCentre.address || !newCentre.postalCode || !newCentre.city) {
      alert('⚠️ Tous les champs obligatoires doivent être remplis !');
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/admin/centres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCentre),
      });
      alert('✅ Centre créé !');
      setShowNewCentreForm(false);
      setNewCentre({
        name: '',
        slug: '',
        phoneFixe: '',
        phoneMobile: '',
        email: '',
        address: '',
        postalCode: '',
        city: '',
        isDefault: false,
      });
      fetchData();
    } catch (error) {
      console.error('Error creating centre:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function saveCentre(centre: Centre) {
    setSaving(true);
    try {
      await fetch('/api/admin/centres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(centre),
      });
      alert('✅ Centre sauvegardé !');
      setEditingCentre(null);
      fetchData();
    } catch (error) {
      console.error('Error saving centre:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCentre(id: number, isDefault: boolean) {
    if (isDefault) {
      alert('❌ Impossible de supprimer le centre par défaut !');
      return;
    }

    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce centre ? Cette action est irréversible.')) return;

    try {
      await fetch(`/api/admin/centres?id=${id}`, {
        method: 'DELETE',
      });
      alert('✅ Centre supprimé !');
      fetchData();
    } catch (error) {
      console.error('Error deleting centre:', error);
      alert('❌ Erreur lors de la suppression');
    }
  }

  // Fonctions pour gérer les images de cards
  async function fetchCardImages() {
    try {
      const res = await fetch('/api/admin/card-images');
      const data = await res.json();
      setCardImages(data);
    } catch (error) {
      console.error('Error fetching card images:', error);
    }
  }


  async function createCardImage() {
    if (!newCardImage.cardKey || !newCardImage.imageUrl) {
      alert('⚠️ Le cardKey et l\'URL de l\'image sont obligatoires !');
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/admin/card-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCardImage),
      });
      alert('✅ Image créée !');
      setShowNewCardImageForm(false);
      setNewCardImage({
        cardKey: '',
        imageUrl: '',
        fallbackEmoji: '📷',
      });
      fetchCardImages();
    } catch (error) {
      console.error('Error creating card image:', error);
      alert('❌ Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  async function saveCardImage(cardImage: CardImage) {
    setSaving(true);
    try {
      await fetch('/api/admin/card-images', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardImage),
      });
      alert('✅ Image sauvegardée !');
      setEditingCardImage(null);
      fetchCardImages();
    } catch (error) {
      console.error('Error saving card image:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCardImage(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    try {
      await fetch(`/api/admin/card-images?id=${id}`, {
        method: 'DELETE',
      });
      alert('✅ Image supprimée !');
      fetchCardImages();
    } catch (error) {
      console.error('Error deleting card image:', error);
      alert('❌ Erreur lors de la suppression');
    }
  }

  async function syncMissingData() {
    if (!confirm('Synchroniser les données manquantes ?\n\nCela ajoutera uniquement ce qui manque (cards, témoignages, etc.) sans modifier les données existantes.')) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/sync-missing-data', {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        let message = '✅ Synchronisation terminée !\n\n';
        message += `📸 Images de cards :\n`;
        message += `  • ${data.results.cardImages.created} créées\n`;
        message += `  • ${data.results.cardImages.skipped} déjà existantes\n\n`;

        if (data.results.testimonials.created > 0) {
          message += `⭐ Témoignages : ${data.results.testimonials.created} créés\n`;
        }

        if (data.results.centres.created > 0) {
          message += `📍 Centres : ${data.results.centres.created} créés\n`;
        }

        if (data.results.errors.length > 0) {
          message += `\n⚠️ ${data.results.errors.length} erreurs :\n`;
          message += data.results.errors.slice(0, 3).join('\n');
        }

        alert(message);
        fetchCardImages();
      } else {
        alert('❌ Erreur : ' + data.error);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      alert('❌ Erreur lors de la synchronisation');
    } finally {
      setSaving(false);
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

  async function saveCentre() {
    if (!selectedCentreId) {
      alert('⚠️ Aucun centre sélectionné');
      return;
    }

    setSaving(true);
    try {
      await fetch('/api/admin/centres', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedCentreId,
          ...centre,
        }),
      });
      alert('✅ Centre sauvegardé !');
      // Recharger la liste des centres
      const res = await fetch('/api/admin/centres');
      const data = await res.json();
      setCentres(data);
    } catch (error) {
      console.error('Error saving centre:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  // Afficher le chargement pendant la vérification de session
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

  // Si non authentifié, ne rien afficher (redirection en cours)
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentPage="dashboard" title="🛠️ Dashboard Admin - Audire" />

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
            <button
              onClick={() => setActiveTab('centres')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'centres'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📍 Centres
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">📍 Coordonnées du centre</h2>
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold">Centre :</label>
              <select
                value={selectedCentreId || ''}
                onChange={(e) => setSelectedCentreId(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded bg-white"
              >
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isDefault && '⭐'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone fixe</label>
              <input
                type="tel"
                value={centre.phoneFixe}
                onChange={(e) => setCentre({ ...centre, phoneFixe: e.target.value })}
                placeholder="+32 4 123 45 67"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Téléphone mobile (GSM)</label>
              <input
                type="tel"
                value={centre.phoneMobile}
                onChange={(e) => setCentre({ ...centre, phoneMobile: e.target.value })}
                placeholder="+32 476 12 34 56"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={centre.email}
                onChange={(e) => setCentre({ ...centre, email: e.target.value })}
                placeholder="centre.audire@gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Adresse</label>
              <textarea
                value={centre.address}
                onChange={(e) => setCentre({ ...centre, address: e.target.value })}
                placeholder="Rue de la Station, 4"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Code postal</label>
              <input
                type="text"
                value={centre.postalCode}
                onChange={(e) => setCentre({ ...centre, postalCode: e.target.value })}
                placeholder="4101"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Ville</label>
              <input
                type="text"
                value={centre.city}
                onChange={(e) => setCentre({ ...centre, city: e.target.value })}
                placeholder="Jemeppe-sur-Meuse"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <button
            onClick={saveCentre}
            disabled={saving}
            className="mt-6 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
          >
            {saving ? 'Sauvegarde...' : '💾 Sauvegarder les coordonnées'}
          </button>
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
            <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">📥 Importer/Mettre à jour le contenu</h3>
                  <p className="text-sm text-gray-700">
                    Importe automatiquement tout le contenu des pages (titres, textes, cards, etc.)
                    <br />
                    ⚠️ Cette action crée les blocs manquants et met à jour les existants.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm('Importer/Mettre à jour le contenu ?\n\n• Crée les blocs manquants\n• Met à jour les blocs existants\n• N\'écrase PAS vos modifications')) return;
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
                  className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition disabled:opacity-50 font-semibold whitespace-nowrap"
                >
                  {saving ? 'Importation...' : '📥 Importer maintenant'}
                </button>
              </div>
            </section>

            {/* Gestionnaire d'images */}
            <section className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🖼️ Médiathèque - Vos images</h2>
                <label className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition cursor-pointer">
                  📤 Uploader une image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const formData = new FormData();
                      formData.append('file', file);

                      setSaving(true);
                      try {
                        const res = await fetch('/api/admin/upload', {
                          method: 'POST',
                          body: formData,
                        });
                        const data = await res.json();

                        if (data.success) {
                          alert('✅ Image uploadée !');
                          fetchUploadedImages();
                        } else {
                          alert('❌ Erreur: ' + data.error);
                        }
                      } catch (error) {
                        console.error('Upload error:', error);
                        alert('❌ Erreur lors de l\'upload');
                      } finally {
                        setSaving(false);
                        // Reset input
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                💡 Uploadez vos images ici, puis copiez l'URL pour les utiliser dans vos blocs HTML ou texte.
              </p>

              {uploadedImages.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 mb-2">Aucune image uploadée</p>
                  <p className="text-sm text-gray-500">Cliquez sur "Uploader une image" pour commencer</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((image) => (
                    <div key={image.name} className="border border-gray-200 rounded-lg p-3 hover:border-blue-400 transition">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <p className="text-xs text-gray-600 truncate mb-2" title={image.name}>
                        {image.name}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(image.url);
                            alert('✅ URL copiée : ' + image.url);
                          }}
                          className="flex-1 bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                          title="Copier l'URL"
                        >
                          📋 Copier URL
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Supprimer cette image ?')) return;

                            try {
                              await fetch(`/api/admin/upload?url=${encodeURIComponent(image.url)}`, {
                                method: 'DELETE',
                              });
                              alert('✅ Image supprimée !');
                              fetchUploadedImages();
                            } catch (error) {
                              console.error('Delete error:', error);
                              alert('❌ Erreur lors de la suppression');
                            }
                          }}
                          className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Liste des blocs */}
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  🧱 Blocs - {pages.find((p) => p.key === selectedPage)?.label}
                </h2>
                <div className="flex gap-3">
                  {/* View mode selector */}
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      📋 Liste
                    </button>
                    <button
                      onClick={() => setViewMode('split')}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        viewMode === 'split'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      ⚡ Split
                    </button>
                    <button
                      onClick={() => setViewMode('wysiwyg')}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        viewMode === 'wysiwyg'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      🎨 WYSIWYG
                    </button>
                  </div>
                  <button
                    onClick={() => setShowNewBlockForm(!showNewBlockForm)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                  >
                    + Nouveau bloc
                  </button>
                </div>
              </div>

              {/* Formulaire nouveau bloc */}
              {showNewBlockForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold">Créer un nouveau bloc</h3>
                    <button
                      onClick={() => setShowBlockSelector(true)}
                      className="bg-blue-500 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-600 transition"
                    >
                      📋 Copier depuis un bloc existant
                    </button>
                  </div>
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
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Ou cliquez sur "Copier depuis un bloc existant" pour copier un bloc
                      </p>
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

              {/* Liste des blocs avec Drag & Drop */}
              {editingBlock ? (
                /* Mode édition d'un bloc spécifique */
                <div key={editingBlock.id} className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50/50">
                  <h3 className="text-lg font-bold mb-4 text-blue-900">✏️ Édition du bloc</h3>
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
                      {editingBlock.blockType === 'card' ? (
                        /* Formulaire spécifique pour les cards */
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2">Titre de la card</label>
                            <input
                              type="text"
                              value={editingBlock.content}
                              onChange={(e) =>
                                setEditingBlock({ ...editingBlock, content: e.target.value })
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                              placeholder="Ex: Test auditif gratuit"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">
                              Icône / Image
                              <span className="text-xs font-normal text-gray-500 ml-2">
                                (Choisissez l'un ou l'autre)
                              </span>
                            </label>

                            {/* Option 1: Emoji */}
                            <div className="mb-3">
                              <label className="block text-xs text-gray-600 mb-1">Option 1: Emoji</label>
                              <input
                                type="text"
                                value={editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}').icon || '' : ''}
                                onChange={(e) => {
                                  const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata) : {};
                                  meta.icon = e.target.value;
                                  setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-3xl"
                                placeholder="👂"
                              />
                            </div>

                            {/* Option 2: Upload d'image */}
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Option 2: Image</label>
                              <div className="flex gap-2 mb-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImagePickerCallback(() => (url: string) => {
                                      const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata) : {};
                                      meta.imageUrl = url;
                                      setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                    });
                                    setShowImagePicker(true);
                                  }}
                                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                  🖼️ Choisir depuis la médiathèque
                                </button>
                                <label className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer text-center">
                                  📤 Upload une image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;

                                      const formData = new FormData();
                                      formData.append('file', file);

                                      setSaving(true);
                                      try {
                                        const res = await fetch('/api/admin/upload', {
                                          method: 'POST',
                                          body: formData,
                                        });
                                        const data = await res.json();

                                        if (data.success) {
                                          const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata) : {};
                                          meta.imageUrl = data.url;
                                          setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                          alert('✅ Image uploadée !');
                                        } else {
                                          alert('❌ Erreur: ' + data.error);
                                        }
                                      } catch (error) {
                                        console.error('Upload error:', error);
                                        alert('❌ Erreur lors de l\'upload');
                                      } finally {
                                        setSaving(false);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4"
                                >
                                {editingBlock.metadata && JSON.parse(editingBlock.metadata || '{}').imageUrl && (
                                  <div className="mt-3 flex items-center gap-3">
                                    <img
                                      src={JSON.parse(editingBlock.metadata).imageUrl}
                                      alt="Preview"
                                      className="w-16 h-16 object-cover rounded border"
                                    />
                                    <button
                                      onClick={() => {
                                        const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata) : {};
                                        delete meta.imageUrl;
                                        setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                      }}
                                      className="text-red-600 text-sm hover:underline"
                                    >
                                      🗑️ Supprimer l'image
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Description</label>
                            <textarea
                              value={editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}').description || '' : ''}
                              onChange={(e) => {
                                const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata) : {};
                                meta.description = e.target.value;
                                setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                              }}
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                              placeholder="Ex: Un test complet et sans engagement..."
                            />
                          </div>
                        </div>
                      ) : editingBlock.blockType === 'image' ? (
                        /* Formulaire spécifique pour les images */
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold mb-2">Image</label>
                            <div className="flex gap-2 mb-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setImagePickerCallback(() => (url: string) => {
                                    const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}') : {};
                                    meta.imageUrl = url;
                                    setEditingBlock({
                                      ...editingBlock,
                                      content: url,
                                      metadata: JSON.stringify(meta)
                                    });
                                  });
                                  setShowImagePicker(true);
                                }}
                                className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                              >
                                🖼️ Choisir depuis la médiathèque
                              </button>
                              <label className="flex-1 bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors cursor-pointer text-center">
                                📤 Uploader une nouvelle image
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    const formData = new FormData();
                                    formData.append('file', file);

                                    setSaving(true);
                                    try {
                                      const res = await fetch('/api/admin/upload', {
                                        method: 'POST',
                                        body: formData,
                                      });
                                      const data = await res.json();

                                      if (data.success) {
                                        const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}') : {};
                                        meta.imageUrl = data.url;
                                        setEditingBlock({
                                          ...editingBlock,
                                          content: data.url,
                                          metadata: JSON.stringify(meta)
                                        });
                                        alert('✅ Image uploadée !');
                                      } else {
                                        alert('❌ Erreur: ' + data.error);
                                      }
                                    } catch (error) {
                                      console.error('Upload error:', error);
                                      alert('❌ Erreur lors de l\'upload');
                                    } finally {
                                      setSaving(false);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* Preview de l'image */}
                            {(editingBlock.content || (editingBlock.metadata && JSON.parse(editingBlock.metadata || '{}').imageUrl)) && (
                              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                                <img
                                  src={(editingBlock.metadata && JSON.parse(editingBlock.metadata || '{}').imageUrl) || editingBlock.content}
                                  alt="Preview"
                                  className="max-w-full h-auto rounded-lg shadow-md"
                                />
                                <button
                                  onClick={() => {
                                    setEditingBlock({
                                      ...editingBlock,
                                      content: '',
                                      metadata: JSON.stringify({})
                                    });
                                  }}
                                  className="mt-3 text-red-600 text-sm font-medium hover:underline"
                                >
                                  🗑️ Supprimer l'image
                                </button>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">Texte alternatif (alt)</label>
                            <input
                              type="text"
                              value={editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}').alt || '' : ''}
                              onChange={(e) => {
                                const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}') : {};
                                meta.alt = e.target.value;
                                setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                              placeholder="Description de l'image pour l'accessibilité"
                            />
                          </div>

                          {/* Position et Taille */}
                          <div className="border-t-2 border-gray-200 pt-4 mt-4">
                            <h4 className="font-semibold text-lg mb-4">📐 Position et Taille</h4>

                            {/* Type de positionnement */}
                            <div className="mb-4">
                              <label className="block text-sm font-semibold mb-2">Type de positionnement</label>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={!editingBlock.metadata || !JSON.parse(editingBlock.metadata || '{}').position?.type}
                                    onChange={() => {
                                      const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}') : {};
                                      delete meta.position;
                                      setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span>Normal (dans le flux)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    checked={!!(editingBlock.metadata && JSON.parse(editingBlock.metadata || '{}').position?.type === 'absolute')}
                                    onChange={() => {
                                      const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}') : {};
                                      meta.position = {
                                        type: 'absolute',
                                        x: '50%',
                                        y: '50%',
                                        zIndex: 1
                                      };
                                      setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span>Absolu (positionné librement)</span>
                                </label>
                              </div>
                            </div>

                            {/* Contrôles de position absolue */}
                            {editingBlock.metadata && JSON.parse(editingBlock.metadata || '{}').position?.type === 'absolute' && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                                <p className="text-sm text-blue-700 mb-3">
                                  💡 L'image sera positionnée librement sur la page. Utilisez des valeurs en px, %, rem, etc.
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-sm font-semibold mb-2">Position X (left)</label>
                                    <input
                                      type="text"
                                      value={JSON.parse(editingBlock.metadata || '{}').position?.x || '0'}
                                      onChange={(e) => {
                                        const meta = JSON.parse(editingBlock.metadata || '{}');
                                        meta.position = { ...meta.position, x: e.target.value };
                                        setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded"
                                      placeholder="ex: 100px, 50%"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold mb-2">Position Y (top)</label>
                                    <input
                                      type="text"
                                      value={JSON.parse(editingBlock.metadata || '{}').position?.y || '0'}
                                      onChange={(e) => {
                                        const meta = JSON.parse(editingBlock.metadata || '{}');
                                        meta.position = { ...meta.position, y: e.target.value };
                                        setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded"
                                      placeholder="ex: 200px, 10%"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold mb-2">Z-Index</label>
                                    <input
                                      type="number"
                                      value={JSON.parse(editingBlock.metadata || '{}').position?.zIndex || 1}
                                      onChange={(e) => {
                                        const meta = JSON.parse(editingBlock.metadata || '{}');
                                        meta.position = { ...meta.position, zIndex: parseInt(e.target.value) };
                                        setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded"
                                      placeholder="1"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Contrôles de taille */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="block text-sm font-semibold mb-2">Largeur</label>
                                <input
                                  type="text"
                                  value={editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}').size?.width || 'auto' : 'auto'}
                                  onChange={(e) => {
                                    const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}') : {};
                                    if (!meta.size) meta.size = {};
                                    meta.size.width = e.target.value;
                                    setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                  placeholder="ex: 300px, 50%, auto"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold mb-2">Hauteur</label>
                                <input
                                  type="text"
                                  value={editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}').size?.height || 'auto' : 'auto'}
                                  onChange={(e) => {
                                    const meta = editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}') : {};
                                    if (!meta.size) meta.size = {};
                                    meta.size.height = e.target.value;
                                    setEditingBlock({ ...editingBlock, metadata: JSON.stringify(meta) });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded"
                                  placeholder="ex: 200px, 30vh, auto"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Formulaire standard pour les autres types */
                        <>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold">Contenu</label>
                            <div className="text-xs text-gray-500 space-x-2">
                              <span>Format: Texte simple</span>
                              {editingBlock.blockType === 'button' && (
                                <span className="text-blue-600">• Format bouton: Texte|/lien</span>
                              )}
                            </div>
                          </div>
                          <textarea
                            value={editingBlock.content}
                            onChange={(e) =>
                              setEditingBlock({ ...editingBlock, content: e.target.value })
                            }
                            rows={editingBlock.blockType === 'text' ? 8 : 4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg font-sans text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={
                              editingBlock.blockType === 'button'
                                ? 'Exemple: Prendre rendez-vous|/contact'
                                : editingBlock.blockType === 'title'
                                ? 'Titre de la section...'
                                : 'Contenu du bloc...'
                            }
                          />
                        </>
                      )}
                      {editingBlock.content && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-2 font-semibold">📋 Aperçu :</p>
                          <div className="prose prose-sm max-w-none">
                            {editingBlock.blockType === 'title' ? (
                              <h2 className="text-2xl font-bold text-gray-800">{editingBlock.content}</h2>
                            ) : editingBlock.blockType === 'button' ? (
                              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                                {editingBlock.content.split('|')[0] || editingBlock.content}
                              </button>
                            ) : editingBlock.blockType === 'card' ? (
                              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="mb-4">
                                  {editingBlock.metadata && JSON.parse(editingBlock.metadata || '{}').imageUrl ? (
                                    <img
                                      src={JSON.parse(editingBlock.metadata).imageUrl}
                                      alt={editingBlock.content}
                                      className="w-16 h-16 object-contain"
                                    />
                                  ) : (
                                    <span className="text-4xl">
                                      {editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}').icon || '📷' : '📷'}
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-bold text-lg mb-2">{editingBlock.content}</h3>
                                <p className="text-gray-600 text-sm">
                                  {editingBlock.metadata ? JSON.parse(editingBlock.metadata || '{}').description || '' : ''}
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-700 whitespace-pre-wrap">{editingBlock.content}</p>
                            )}
                          </div>
                        </div>
                      )}
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
                </div>
              ) : (
                /* Mode affichage selon le viewMode */
                <>
                  {viewMode === 'wysiwyg' ? (
                    <WYSIWYGEditor
                      blocks={blocks}
                      onReorder={async (reorderedBlocks) => {
                        setBlocks(reorderedBlocks);
                        try {
                          await Promise.all(
                            reorderedBlocks.map((block) =>
                              fetch('/api/admin/blocks', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: block.id, order: block.order }),
                              })
                            )
                          );
                        } catch (error) {
                          console.error('Error saving order:', error);
                          alert('❌ Erreur lors de la sauvegarde de l\'ordre');
                        }
                      }}
                      onEdit={(block) => setEditingBlock(block)}
                      onDelete={deleteBlock}
                      onToggleVisibility={async (blockId) => {
                        const block = blocks.find((b) => b.id === blockId);
                        if (block) {
                          await fetch('/api/admin/blocks', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: blockId, isVisible: !block.isVisible }),
                          });
                          fetchBlocks();
                        }
                      }}
                    />
                  ) : (
                    <VisualPageBuilder
                      blocks={blocks}
                      onReorder={async (reorderedBlocks) => {
                        setBlocks(reorderedBlocks);
                        try {
                          await Promise.all(
                            reorderedBlocks.map((block) =>
                              fetch('/api/admin/blocks', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: block.id, order: block.order }),
                              })
                            )
                          );
                        } catch (error) {
                          console.error('Error saving order:', error);
                          alert('❌ Erreur lors de la sauvegarde de l\'ordre');
                        }
                      }}
                      onEdit={(block) => setEditingBlock(block)}
                      onDelete={deleteBlock}
                      onToggleVisibility={async (blockId) => {
                        const block = blocks.find((b) => b.id === blockId);
                        if (block) {
                          await fetch('/api/admin/blocks', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: blockId, isVisible: !block.isVisible }),
                          });
                          fetchBlocks();
                        }
                      }}
                    />
                  )}
                </>
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

        {activeTab === 'centres' && (
          <>
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📍 Gestion des centres</h2>
                <button
                  onClick={() => setShowNewCentreForm(!showNewCentreForm)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  + Nouveau centre
                </button>
              </div>

              {/* Formulaire nouveau centre */}
              {showNewCentreForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold mb-3">Créer un nouveau centre</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Nom du centre *</label>
                      <input
                        type="text"
                        value={newCentre.name}
                        onChange={(e) => setNewCentre({ ...newCentre, name: e.target.value })}
                        placeholder="ex: Centre Audire Liège"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Slug (URL) *</label>
                      <input
                        type="text"
                        value={newCentre.slug}
                        onChange={(e) => setNewCentre({ ...newCentre, slug: e.target.value })}
                        placeholder="ex: liege"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Téléphone fixe *</label>
                      <input
                        type="tel"
                        value={newCentre.phoneFixe}
                        onChange={(e) => setNewCentre({ ...newCentre, phoneFixe: e.target.value })}
                        placeholder="+32 4 123 45 67"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Téléphone mobile</label>
                      <input
                        type="tel"
                        value={newCentre.phoneMobile}
                        onChange={(e) => setNewCentre({ ...newCentre, phoneMobile: e.target.value })}
                        placeholder="+32 476 12 34 56"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Email *</label>
                      <input
                        type="email"
                        value={newCentre.email}
                        onChange={(e) => setNewCentre({ ...newCentre, email: e.target.value })}
                        placeholder="centre@audire.be"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Adresse *</label>
                      <textarea
                        value={newCentre.address}
                        onChange={(e) => setNewCentre({ ...newCentre, address: e.target.value })}
                        placeholder="Rue de la Station, 4"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Code postal *</label>
                      <input
                        type="text"
                        value={newCentre.postalCode}
                        onChange={(e) => setNewCentre({ ...newCentre, postalCode: e.target.value })}
                        placeholder="4101"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Ville *</label>
                      <input
                        type="text"
                        value={newCentre.city}
                        onChange={(e) => setNewCentre({ ...newCentre, city: e.target.value })}
                        placeholder="Jemeppe-sur-Meuse"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center gap-4 md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newCentre.isDefault}
                          onChange={(e) => setNewCentre({ ...newCentre, isDefault: e.target.checked })}
                          className="w-5 h-5"
                        />
                        <span>⭐ Définir comme centre par défaut</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={createCentre}
                      disabled={saving}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      ✅ Créer
                    </button>
                    <button
                      onClick={() => setShowNewCentreForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des centres */}
              {centres.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Aucun centre pour le moment. Créez-en un !
                </p>
              ) : (
                <div className="space-y-4">
                  {centres.map((centre) => (
                    <div key={centre.id} className="border border-gray-200 rounded-lg p-4">
                      {editingCentre?.id === centre.id ? (
                        // Mode édition
                        <div>
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Nom du centre</label>
                              <input
                                type="text"
                                value={editingCentre.name}
                                onChange={(e) => setEditingCentre({ ...editingCentre, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Slug (URL)</label>
                              <input
                                type="text"
                                value={editingCentre.slug}
                                onChange={(e) => setEditingCentre({ ...editingCentre, slug: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Téléphone fixe</label>
                              <input
                                type="tel"
                                value={editingCentre.phoneFixe}
                                onChange={(e) => setEditingCentre({ ...editingCentre, phoneFixe: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Téléphone mobile</label>
                              <input
                                type="tel"
                                value={editingCentre.phoneMobile || ''}
                                onChange={(e) => setEditingCentre({ ...editingCentre, phoneMobile: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Email</label>
                              <input
                                type="email"
                                value={editingCentre.email}
                                onChange={(e) => setEditingCentre({ ...editingCentre, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Adresse</label>
                              <textarea
                                value={editingCentre.address}
                                onChange={(e) => setEditingCentre({ ...editingCentre, address: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Code postal</label>
                              <input
                                type="text"
                                value={editingCentre.postalCode}
                                onChange={(e) => setEditingCentre({ ...editingCentre, postalCode: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Ville</label>
                              <input
                                type="text"
                                value={editingCentre.city}
                                onChange={(e) => setEditingCentre({ ...editingCentre, city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mb-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingCentre.isActive}
                                onChange={(e) => setEditingCentre({ ...editingCentre, isActive: e.target.checked })}
                                className="w-5 h-5"
                              />
                              <span>Actif</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editingCentre.isDefault}
                                onChange={(e) => setEditingCentre({ ...editingCentre, isDefault: e.target.checked })}
                                className="w-5 h-5"
                              />
                              <span>⭐ Centre par défaut</span>
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveCentre(editingCentre)}
                              disabled={saving}
                              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                              💾 Sauvegarder
                            </button>
                            <button
                              onClick={() => setEditingCentre(null)}
                              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Mode affichage
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg mb-1">
                                {centre.name} {centre.isDefault && '⭐'}
                              </h3>
                              <p className="text-sm text-gray-600">Slug: {centre.slug}</p>
                              <p className="text-sm">
                                <span className={`inline-block px-2 py-1 rounded text-xs ${centre.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {centre.isActive ? '✅ Actif' : '❌ Inactif'}
                                </span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingCentre(centre)}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                              >
                                ✏️ Modifier
                              </button>
                              <button
                                onClick={() => deleteCentre(centre.id, centre.isDefault)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                disabled={centre.isDefault}
                                title={centre.isDefault ? 'Impossible de supprimer le centre par défaut' : 'Supprimer'}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded border border-gray-200 grid md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <strong>📞 Fixe:</strong> {centre.phoneFixe}
                            </div>
                            {centre.phoneMobile && (
                              <div>
                                <strong>📱 Mobile:</strong> {centre.phoneMobile}
                              </div>
                            )}
                            <div>
                              <strong>📧 Email:</strong> {centre.email}
                            </div>
                            <div>
                              <strong>📍 Adresse:</strong> {centre.address}, {centre.postalCode} {centre.city}
                            </div>
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

      {/* Image Picker Modal */}
      <ImagePicker
        isOpen={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onSelect={(url) => {
          if (imagePickerCallback) {
            imagePickerCallback(url);
            setImagePickerCallback(null);
          }
        }}
      />

      {/* Block Selector Modal */}
      <BlockSelector
        isOpen={showBlockSelector}
        onClose={() => setShowBlockSelector(false)}
        currentPageKey={selectedPage}
        onSelect={(block) => {
          // Copier les données du bloc sélectionné dans le formulaire
          setNewBlock({
            ...newBlock,
            blockKey: block.blockKey + '-copy',
            blockType: block.blockType,
            content: block.content,
            order: blocks.length,
          });
          setShowBlockSelector(false);
        }}
      />
    </div>
  );
}
