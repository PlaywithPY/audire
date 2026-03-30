import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Récupérer tous les modèles SMS
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const templates = await prisma.sMSTemplate.findMany({
      orderBy: { templateKey: 'asc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching SMS templates:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS templates' }, { status: 500 });
  }
}

// POST: Créer un nouveau modèle SMS
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { templateKey, name, content, variables, description, isActive } = await req.json();

    if (!templateKey || !name || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const template = await prisma.sMSTemplate.create({
      data: {
        templateKey,
        name,
        content,
        variables: variables ? JSON.stringify(variables) : null,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error creating SMS template:', error);
    return NextResponse.json({ error: 'Failed to create SMS template' }, { status: 500 });
  }
}

// PUT: Mettre à jour un modèle SMS
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, templateKey, name, content, variables, description, isActive } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });
    }

    const template = await prisma.sMSTemplate.update({
      where: { id },
      data: {
        templateKey,
        name,
        content,
        variables: variables ? JSON.stringify(variables) : null,
        description,
        isActive,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error updating SMS template:', error);
    return NextResponse.json({ error: 'Failed to update SMS template' }, { status: 500 });
  }
}

// DELETE: Supprimer un modèle SMS
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });
    }

    await prisma.sMSTemplate.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting SMS template:', error);
    return NextResponse.json({ error: 'Failed to delete SMS template' }, { status: 500 });
  }
}
