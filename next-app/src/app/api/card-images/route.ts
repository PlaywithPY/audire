import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET public - Récupérer toutes les images de cards pour le site public
export async function GET() {
  try {
    const cardImages = await prisma.cardImage.findMany({
      orderBy: { cardKey: 'asc' },
    });
    return NextResponse.json(cardImages);
  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
