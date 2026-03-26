import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Récupérer un ou tous les centres
export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const centreId = searchParams.get('id');

    if (centreId) {
      // Récupérer un centre spécifique
      const centre = await prisma.centre.findUnique({
        where: { id: parseInt(centreId) },
      });

      if (!centre) {
        return NextResponse.json({ error: 'Centre not found' }, { status: 404 });
      }

      return NextResponse.json(centre);
    } else {
      // Récupérer tous les centres
      const centres = await prisma.centre.findMany({
        orderBy: [
          { isDefault: 'desc' }, // Centre par défaut en premier
          { name: 'asc' },
        ],
      });

      return NextResponse.json(centres);
    }
  } catch (error) {
    console.error('Error fetching centres:', error);
    return NextResponse.json({ error: 'Failed to fetch centres' }, { status: 500 });
  }
}

// PUT - Mettre à jour un centre
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, name, slug, phoneFixe, phoneMobile, email, address, postalCode, city, isActive, isDefault, latitude, longitude } = body;

    if (!id) {
      return NextResponse.json({ error: 'Centre ID is required' }, { status: 400 });
    }

    // Si on définit ce centre comme par défaut, retirer le flag des autres
    if (isDefault === true) {
      await prisma.centre.updateMany({
        where: { isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    // Mettre à jour le centre
    const updatedCentre = await prisma.centre.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(phoneFixe && { phoneFixe }),
        ...(phoneMobile !== undefined && { phoneMobile }),
        ...(email && { email }),
        ...(address && { address }),
        ...(postalCode && { postalCode }),
        ...(city && { city }),
        ...(isActive !== undefined && { isActive }),
        ...(isDefault !== undefined && { isDefault }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
      },
    });

    return NextResponse.json(updatedCentre);
  } catch (error) {
    console.error('Error updating centre:', error);
    return NextResponse.json({ error: 'Failed to update centre' }, { status: 500 });
  }
}

// POST - Créer un nouveau centre
export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, slug, phoneFixe, phoneMobile, email, address, postalCode, city, isDefault } = body;

    // Vérifier les champs obligatoires
    if (!name || !slug || !phoneFixe || !email || !address || !postalCode || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Si on définit ce centre comme par défaut, retirer le flag des autres
    if (isDefault === true) {
      await prisma.centre.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // Créer le centre avec ses horaires par défaut
    const newCentre = await prisma.centre.create({
      data: {
        name,
        slug,
        phoneFixe,
        phoneMobile: phoneMobile || null,
        email,
        address,
        postalCode,
        city,
        isActive: true,
        isDefault: isDefault || false,
        // Créer automatiquement les horaires par défaut pour tous les jours
        openingHours: {
          create: [
            // Dimanche - Fermé
            { dayOfWeek: 0, isOpen: false, morningOpen: null, morningClose: null, afternoonOpen: null, afternoonClose: null },
            // Lundi à Vendredi - 9h-12h, 13h-17h
            { dayOfWeek: 1, isOpen: true, morningOpen: '9h', morningClose: '12h', afternoonOpen: '13h', afternoonClose: '17h' },
            { dayOfWeek: 2, isOpen: true, morningOpen: '9h', morningClose: '12h', afternoonOpen: '13h', afternoonClose: '17h' },
            { dayOfWeek: 3, isOpen: true, morningOpen: '9h', morningClose: '12h', afternoonOpen: '13h', afternoonClose: '17h' },
            { dayOfWeek: 4, isOpen: true, morningOpen: '9h', morningClose: '12h', afternoonOpen: '13h', afternoonClose: '17h' },
            { dayOfWeek: 5, isOpen: true, morningOpen: '9h', morningClose: '12h', afternoonOpen: '13h', afternoonClose: '17h' },
            // Samedi - Sur rendez-vous
            { dayOfWeek: 6, isOpen: true, morningOpen: null, morningClose: null, afternoonOpen: null, afternoonClose: null },
          ],
        },
      },
      include: {
        openingHours: true,
      },
    });

    return NextResponse.json(newCentre);
  } catch (error) {
    console.error('Error creating centre:', error);
    return NextResponse.json({ error: 'Failed to create centre' }, { status: 500 });
  }
}

// DELETE - Supprimer un centre
export async function DELETE(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const centreId = searchParams.get('id');

    if (!centreId) {
      return NextResponse.json({ error: 'Centre ID is required' }, { status: 400 });
    }

    const id = parseInt(centreId);

    // Vérifier que ce n'est pas le centre par défaut
    const centre = await prisma.centre.findUnique({
      where: { id },
    });

    if (centre?.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default centre' }, { status: 400 });
    }

    // Supprimer le centre (cascade delete des horaires)
    await prisma.centre.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting centre:', error);
    return NextResponse.json({ error: 'Failed to delete centre' }, { status: 500 });
  }
}
