import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/hearing-aids - Liste TOUS les appareils auditifs (y compris non visibles)
export async function GET() {
  try {
    const hearingAids = await prisma.hearingAid.findMany({
      orderBy: [
        { isHighlight: 'desc' },
        { order: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(hearingAids);
  } catch (error) {
    console.error('Error fetching hearing aids:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hearing aids' },
      { status: 500 }
    );
  }
}

// POST /api/admin/hearing-aids - Créer un nouvel appareil auditif
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Générer un slug à partir du nom
    const slug = generateSlug(data.name);

    // Vérifier que le slug est unique
    const existing = await prisma.hearingAid.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un appareil avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    const hearingAid = await prisma.hearingAid.create({
      data: {
        ...data,
        slug,
      },
    });

    return NextResponse.json(hearingAid);
  } catch (error) {
    console.error('Error creating hearing aid:', error);
    return NextResponse.json(
      { error: 'Failed to create hearing aid' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/hearing-aids - Mettre à jour un appareil auditif
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    // Si le nom a changé, régénérer le slug
    if (updateData.name) {
      updateData.slug = generateSlug(updateData.name);

      // Vérifier que le nouveau slug ne crée pas de conflit
      const existing = await prisma.hearingAid.findFirst({
        where: {
          slug: updateData.slug,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Un appareil avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    const hearingAid = await prisma.hearingAid.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(hearingAid);
  } catch (error) {
    console.error('Error updating hearing aid:', error);
    return NextResponse.json(
      { error: 'Failed to update hearing aid' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/hearing-aids?id=X - Supprimer un appareil auditif
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    await prisma.hearingAid.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hearing aid:', error);
    return NextResponse.json(
      { error: 'Failed to delete hearing aid' },
      { status: 500 }
    );
  }
}

// Fonction pour générer un slug à partir du nom
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .trim()
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-'); // Éviter les tirets multiples
}
