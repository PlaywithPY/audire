'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type OpeningHour = {
  id: number;
  centreId: number;
  dayOfWeek: number;
  isOpen: boolean;
  morningOpen: string | null;
  morningClose: string | null;
  afternoonOpen: string | null;
  afternoonClose: string | null;
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
  openingHours: OpeningHour[];
};

type CentreContextType = {
  currentCentre: Centre | null;
  allCentres: Centre[];
  setCentre: (slug: string) => void;
  loading: boolean;
};

const CentreContext = createContext<CentreContextType | undefined>(undefined);

export function CentreProvider({ children }: { children: ReactNode }) {
  const [currentCentre, setCurrentCentre] = useState<Centre | null>(null);
  const [allCentres, setAllCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCentres() {
      try {
        // Charger tous les centres
        const res = await fetch('/api/centres');
        const centres: Centre[] = await res.json();
        setAllCentres(centres);

        // Vérifier si un centre est stocké en localStorage
        const storedSlug = localStorage.getItem('selectedCentre');

        let selectedCentre: Centre | undefined;

        if (storedSlug) {
          // Essayer de trouver le centre stocké
          selectedCentre = centres.find((c) => c.slug === storedSlug);
        }

        // Si pas de centre stocké ou centre introuvable, prendre le centre par défaut
        if (!selectedCentre) {
          selectedCentre = centres.find((c) => c.isDefault);
        }

        // Si toujours pas de centre, prendre le premier
        if (!selectedCentre && centres.length > 0) {
          selectedCentre = centres[0];
        }

        if (selectedCentre) {
          setCurrentCentre(selectedCentre);
          localStorage.setItem('selectedCentre', selectedCentre.slug);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des centres:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCentres();
  }, []);

  const setCentre = (slug: string) => {
    const centre = allCentres.find((c) => c.slug === slug);
    if (centre) {
      setCurrentCentre(centre);
      localStorage.setItem('selectedCentre', slug);
      // Recharger la page pour appliquer les changements partout
      window.location.reload();
    }
  };

  return (
    <CentreContext.Provider value={{ currentCentre, allCentres, setCentre, loading }}>
      {children}
    </CentreContext.Provider>
  );
}

export function useCentre() {
  const context = useContext(CentreContext);
  if (context === undefined) {
    throw new Error('useCentre must be used within a CentreProvider');
  }
  return context;
}
