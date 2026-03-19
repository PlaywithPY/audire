import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Récupérer tous les types d'appareils
export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const deviceTypes = await prisma.deviceType.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(deviceTypes);
  } catch (error) {
    console.error('Error fetching device types:', error);
    return NextResponse.json({ error: 'Failed to fetch device types' }, { status: 500 });
  }
}

// POST - Créer un nouveau type d'appareil
export async function POST(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, slug, description, order } = body;

    const deviceType = await prisma.deviceType.create({
      data: {
        name,
        slug,
        description,
        order: order || 0,
      },
    });

    revalidatePath('/admin/products');

    return NextResponse.json(deviceType);
  } catch (error) {
    console.error('Error creating device type:', error);
    return NextResponse.json({ error: 'Failed to create device type' }, { status: 500 });
  }
}

// PUT - Mettre à jour un type d'appareil
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { id, name, slug, description, order } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const deviceType = await prisma.deviceType.update({
      where: { id: parseInt(id) },
      data: {
        name,
        slug,
        description,
        order,
      },
    });

    revalidatePath('/admin/products');

    return NextResponse.json(deviceType);
  } catch (error) {
    console.error('Error updating device type:', error);
    return NextResponse.json({ error: 'Failed to update device type' }, { status: 500 });
  }
}

// DELETE - Supprimer un type d'appareil
export async function DELETE(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await prisma.deviceType.delete({
      where: { id: parseInt(id) },
    });

    revalidatePath('/admin/products');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting device type:', error);
    return NextResponse.json({ error: 'Failed to delete device type' }, { status: 500 });
  }
}
