import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDistance } from '@/lib/geolocation';

// GET - Trouver le centre le plus proche
// Paramètres: ?lat=XX&lon=XX ou ?postalCode=XXXX
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const postalCode = searchParams.get('postalCode');

    // Récupérer tous les centres actifs avec leurs coordonnées
    const centres = await prisma.centre.findMany({
      where: { isActive: true },
      include: {
        openingHours: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });

    if (centres.length === 0) {
      return NextResponse.json({ error: 'Aucun centre disponible' }, { status: 404 });
    }

    let nearestCentre = null;

    // Recherche par coordonnées GPS (méthode préférée)
    if (lat && lon) {
      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);

      if (isNaN(userLat) || isNaN(userLon)) {
        return NextResponse.json({ error: 'Coordonnées invalides' }, { status: 400 });
      }

      let minDistance = Infinity;

      for (const centre of centres) {
        if (centre.latitude !== null && centre.longitude !== null) {
          const distance = calculateDistance(userLat, userLon, centre.latitude, centre.longitude);
          if (distance < minDistance) {
            minDistance = distance;
            nearestCentre = centre;
          }
        }
      }
    }
    // Recherche par code postal (fallback)
    else if (postalCode) {
      const userPostalCode = parseInt(postalCode);

      if (isNaN(userPostalCode)) {
        return NextResponse.json({ error: 'Code postal invalide' }, { status: 400 });
      }

      let minDiff = Infinity;

      // Trouver le centre avec le code postal le plus proche numériquement
      for (const centre of centres) {
        const centrePostalCode = parseInt(centre.postalCode);
        if (!isNaN(centrePostalCode)) {
          const diff = Math.abs(userPostalCode - centrePostalCode);
          if (diff < minDiff) {
            minDiff = diff;
            nearestCentre = centre;
          }
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Veuillez fournir des coordonnées (lat/lon) ou un code postal' },
        { status: 400 }
      );
    }

    if (!nearestCentre) {
      // Si aucun centre trouvé, retourner le centre par défaut
      nearestCentre = centres.find((c) => c.isDefault) || centres[0];
    }

    return NextResponse.json(nearestCentre);
  } catch (error) {
    console.error('Erreur lors de la recherche du centre le plus proche:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
