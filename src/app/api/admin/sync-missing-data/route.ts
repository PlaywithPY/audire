import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// Données de base pour les CardImages
const defaultCardImages = [
  // Page d'accueil - Features
  { cardKey: 'hero-features-test', imageUrl: '', fallbackEmoji: '👂' },
  { cardKey: 'hero-features-accompagnement', imageUrl: '', fallbackEmoji: '💬' },
  { cardKey: 'hero-features-suivi', imageUrl: '', fallbackEmoji: '🔧' },
  { cardKey: 'hero-features-qualite', imageUrl: '', fallbackEmoji: '🏆' },
  { cardKey: 'hero-features-independant', imageUrl: '', fallbackEmoji: '🎯' },
  { cardKey: 'hero-features-transparence', imageUrl: '', fallbackEmoji: '💰' },

  // Notre accompagnement - Étapes
  { cardKey: 'approach-step-contact', imageUrl: '', fallbackEmoji: '📞' },
  { cardKey: 'approach-step-test', imageUrl: '', fallbackEmoji: '👂' },
  { cardKey: 'approach-step-conseil', imageUrl: '', fallbackEmoji: '💬' },
  { cardKey: 'approach-step-essai', imageUrl: '', fallbackEmoji: '🎧' },
  { cardKey: 'approach-step-reglages', imageUrl: '', fallbackEmoji: '🔧' },
  { cardKey: 'approach-step-suivi', imageUrl: '', fallbackEmoji: '📅' },

  // Notre accompagnement - Valeurs
  { cardKey: 'approach-independance', imageUrl: '', fallbackEmoji: '🎯' },
  { cardKey: 'approach-transparence', imageUrl: '', fallbackEmoji: '💎' },
  { cardKey: 'approach-disponibilite', imageUrl: '', fallbackEmoji: '📞' },
  { cardKey: 'approach-proximite', imageUrl: '', fallbackEmoji: '🤝' },
];

export async function POST() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const results = {
      cardImages: { created: 0, skipped: 0 },
      testimonials: { created: 0, skipped: 0 },
      centres: { created: 0, skipped: 0 },
      errors: [] as string[],
    };

    // Synchroniser les CardImages
    for (const cardData of defaultCardImages) {
      try {
        const existing = await prisma.cardImage.findUnique({
          where: {
            pageKey_cardKey: {
              pageKey: (cardData as any).pageKey || 'home',
              cardKey: cardData.cardKey,
            }
          },
        });

        if (!existing) {
          await prisma.cardImage.create({
            data: cardData,
          });
          results.cardImages.created++;
        } else {
          results.cardImages.skipped++;
        }
      } catch (err: any) {
        results.errors.push(`CardImage ${cardData.cardKey}: ${err.message}`);
      }
    }

    // Vérifier les centres (au cas où)
    const centreCount = await prisma.centre.count();
    if (centreCount === 0) {
      try {
        // Centre par défaut: Audire Jemeppe
        const centreJemeppe = await prisma.centre.create({
          data: {
            name: 'Audire Jemeppe',
            slug: 'jemeppe',
            phoneFixe: '+32 4 234 56 78',
            phoneMobile: '+32 476 12 34 56',
            email: 'jemeppe@audire.be',
            address: 'Rue de la Station, 4\n4101 Jemeppe-sur-Meuse',
            postalCode: '4101',
            city: 'Jemeppe-sur-Meuse',
            isActive: true,
            isDefault: true,
            latitude: 50.6197,
            longitude: 5.4981,
          },
        });

        // Horaires pour le centre
        const hours = [
          { dayOfWeek: 0, isOpen: false },
          { dayOfWeek: 1, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
          { dayOfWeek: 2, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
          { dayOfWeek: 3, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
          { dayOfWeek: 4, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
          { dayOfWeek: 5, isOpen: true, morningOpen: '09:00', morningClose: '12:00', afternoonOpen: '13:00', afternoonClose: '17:00' },
          { dayOfWeek: 6, isOpen: true, morningOpen: '09:00', morningClose: '12:30', afternoonOpen: null, afternoonClose: null },
        ];

        for (const hour of hours) {
          await prisma.openingHours.create({
            data: {
              centreId: centreJemeppe.id,
              ...hour,
            },
          });
        }

        results.centres.created++;
      } catch (err: any) {
        results.errors.push(`Centre: ${err.message}`);
      }
    }

    // Vérifier les témoignages (au cas où)
    const testimonialCount = await prisma.testimonial.count();
    if (testimonialCount === 0) {
      const defaultTestimonials = [
        {
          name: 'Marie D.',
          text: 'Excellent accueil et professionnalisme. On prend vraiment le temps d\'expliquer et de répondre aux questions. Je recommande vivement !',
          rating: 5,
          location: 'Liège',
          isVisible: true,
          isFeatured: true,
        },
        {
          name: 'Jean-Pierre L.',
          text: 'Très satisfait de mon appareil auditif. Le suivi est impeccable, toujours disponible pour les réglages.',
          rating: 5,
          location: 'Seraing',
          isVisible: true,
          isFeatured: true,
        },
        {
          name: 'Sophie M.',
          text: 'Merci pour la patience et les explications claires. Enfin un centre qui écoute vraiment !',
          rating: 5,
          location: 'Herstal',
          isVisible: true,
          isFeatured: false,
        },
      ];

      for (const testimonial of defaultTestimonials) {
        try {
          await prisma.testimonial.create({
            data: testimonial,
          });
          results.testimonials.created++;
        } catch (err: any) {
          results.errors.push(`Testimonial: ${err.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Synchronisation terminée',
      results,
    });
  } catch (error: any) {
    console.error('Error syncing missing data:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation', details: error.message },
      { status: 500 }
    );
  }
}
