'use client';

import { useState } from 'react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  order: number;
  faqs: FAQ[];
}

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (categoryId: number | null) => void;
}

export default function CategoryGrid({ categories, onSelectCategory }: CategoryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleCategoryClick = (categoryId: number) => {
    const newSelection = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newSelection);
    onSelectCategory(newSelection);
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold text-center mb-8">Catégories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`group flex flex-col items-center p-4 rounded-xl transition-all ${
              selectedCategory === category.id
                ? 'bg-primary text-white shadow-xl scale-105'
                : 'bg-white hover:bg-gray-50 hover:shadow-lg'
            }`}
          >
            {/* Image */}
            <div className={`w-24 h-24 mb-3 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110 ${
              selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">📁</span>
              )}
            </div>

            {/* Nom */}
            <h3 className={`text-sm font-semibold text-center ${
              selectedCategory === category.id ? 'text-white' : 'text-gray-800'
            }`}>
              {category.name}
            </h3>

            {/* Nombre de FAQs */}
            <p className={`text-xs mt-1 ${
              selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
            }`}>
              {category.faqs.length} question{category.faqs.length !== 1 ? 's' : ''}
            </p>
          </button>
        ))}
      </div>

      {/* Bouton pour tout afficher */}
      {selectedCategory !== null && (
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setSelectedCategory(null);
              onSelectCategory(null);
            }}
            className="text-primary hover:text-primary-dark font-semibold underline"
          >
            Afficher toutes les questions
          </button>
        </div>
      )}
    </div>
  );
}
