'use client';

import { useState } from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative bg-bg p-6 rounded-2xl transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Effet de bordure animée au hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Contenu */}
      <div className="relative z-10">
        <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110">
          <span className="text-5xl">{icon}</span>
        </div>
        <h3 className="text-xl font-bold mb-2 transition-colors duration-300 group-hover:text-primary">
          {title}
        </h3>
        <p className="text-text-light transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Point décoratif qui apparaît au hover */}
      <div
        className={`absolute top-4 right-4 w-2 h-2 rounded-full bg-primary transition-all duration-300 ${
          isHovered ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      />
    </div>
  );
}
