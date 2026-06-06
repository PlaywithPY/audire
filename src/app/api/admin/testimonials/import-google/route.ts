import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

interface GoogleReview {
  author_name: string;
  text: string;
  rating: number;
  time: number;
}

interface PlacesApiResponse {
  result?: {
    reviews?: GoogleReview[];
  };
  status: string;
  error_message?: string;
}

export async function POST() {
  const { error } = await requireAuth();
  if (error) return error;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: 'GOOGLE_PLACES_API_KEY et GOOGLE_PLACE_ID doivent être configurés dans les variables d\'environnement.' },
      { status: 503 }
    );
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=fr&key=${apiKey}`;

  let data: PlacesApiResponse;
  try {
    const res = await fetch(url);
    data = await res.json();
  } catch {
    return NextResponse.json({ error: 'Impossible de contacter l\'API Google Places.' }, { status: 502 });
  }

  if (data.status !== 'OK') {
    return NextResponse.json(
      { error: `Google Places API : ${data.status}${data.error_message ? ' — ' + data.error_message : ''}` },
      { status: 502 }
    );
  }

  const reviews = data.result?.reviews ?? [];
  if (reviews.length === 0) {
    return NextResponse.json({ imported: 0, skipped: 0, message: 'Aucun avis trouvé sur cette fiche Google.' });
  }

  // Récupérer les noms déjà en base pour éviter les doublons
  const existing = await prisma.testimonial.findMany({ select: { name: true, text: true } });
  const existingKeys = new Set(existing.map((t) => `${t.name}||${t.text}`));

  const toImport = reviews.filter(
    (r) => r.text?.trim() && !existingKeys.has(`${r.author_name}||${r.text}`)
  );

  if (toImport.length === 0) {
    return NextResponse.json({ imported: 0, skipped: reviews.length, message: 'Tous les avis sont déjà importés.' });
  }

  await prisma.testimonial.createMany({
    data: toImport.map((r) => ({
      name: r.author_name,
      text: r.text.trim(),
      rating: r.rating,
      isVisible: false, // à valider manuellement avant publication
      isFeatured: false,
    })),
  });

  revalidatePath('/');

  return NextResponse.json({
    imported: toImport.length,
    skipped: reviews.length - toImport.length,
    message: `${toImport.length} avis importé(s), ${reviews.length - toImport.length} ignoré(s) (déjà présents ou sans texte).`,
  });
}
