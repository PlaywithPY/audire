import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Récupérer tous les textes (ou filtrer par pageKey)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('pageKey');

    const where = pageKey ? { pageKey } : {};
    const pageTexts = await prisma.pageText.findMany({
      where,
      orderBy: [
        { pageKey: 'asc' },
        { textKey: 'asc' }
      ]
    });

    return NextResponse.json(pageTexts);
  } catch (error: any) {
    console.error('Error fetching page texts:', error);

    // Messages d'erreur plus explicites
    if (error?.code === 'P1001') {
      return NextResponse.json({
        error: 'Cannot connect to database. Please check DATABASE_URL in environment variables.',
        details: 'Database server is not reachable. If using Neon, the database may be in sleep mode.'
      }, { status: 500 });
    }

    if (error?.code === 'P2021') {
      return NextResponse.json({
        error: 'Table PageText does not exist. Please run database migrations.',
        details: 'Run: npx prisma migrate deploy'
      }, { status: 500 });
    }

    return NextResponse.json({
      error: 'Failed to fetch page texts',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// POST: Créer un nouveau texte
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pageKey, textKey, content, label } = body;

    const pageText = await prisma.pageText.create({
      data: {
        pageKey,
        textKey,
        content,
        label: label || null,
      },
    });

    return NextResponse.json(pageText);
  } catch (error: any) {
    console.error('Error creating page text:', error);

    // Messages d'erreur plus explicites
    if (error?.code === 'P1001') {
      return NextResponse.json({
        error: 'Cannot connect to database. Please check DATABASE_URL in environment variables.',
        details: 'Database server is not reachable. If using Neon, the database may be in sleep mode.'
      }, { status: 500 });
    }

    if (error?.code === 'P2021') {
      return NextResponse.json({
        error: 'Table PageText does not exist. Please run database migrations.',
        details: 'Run: npx prisma migrate deploy'
      }, { status: 500 });
    }

    if (error?.code === 'P2002') {
      return NextResponse.json({
        error: 'A text with this pageKey and textKey already exists.',
        details: 'Please use a different combination or update the existing text.'
      }, { status: 409 });
    }

    return NextResponse.json({
      error: 'Failed to create page text',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// PUT: Mettre à jour un texte existant
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, pageKey, textKey, content, label } = body;

    let pageText;

    // Si pageKey et textKey sont fournis, chercher d'abord l'enregistrement
    if (pageKey && textKey) {
      const existingText = await prisma.pageText.findFirst({
        where: {
          pageKey,
          textKey,
        },
      });

      if (existingText) {
        // Mettre à jour l'enregistrement existant
        pageText = await prisma.pageText.update({
          where: { id: existingText.id },
          data: {
            content,
            label: label || null,
          },
        });
      } else {
        // Créer un nouvel enregistrement
        pageText = await prisma.pageText.create({
          data: {
            pageKey,
            textKey,
            content,
            label: label || null,
          },
        });
      }
    } else if (id) {
      // Sinon, utiliser l'ID directement
      pageText = await prisma.pageText.update({
        where: { id },
        data: {
          content,
          label: label || null,
        },
      });
    } else {
      return NextResponse.json({
        error: 'Missing required parameters',
        details: 'Either provide id, or both pageKey and textKey'
      }, { status: 400 });
    }

    return NextResponse.json(pageText);
  } catch (error: any) {
    console.error('Error updating page text:', error);

    // Messages d'erreur plus explicites
    if (error?.code === 'P1001') {
      return NextResponse.json({
        error: 'Cannot connect to database. Please check DATABASE_URL in environment variables.',
        details: 'Database server is not reachable. If using Neon, the database may be in sleep mode.'
      }, { status: 500 });
    }

    if (error?.code === 'P2021') {
      return NextResponse.json({
        error: 'Table PageText does not exist. Please run database migrations.',
        details: 'Run: npx prisma migrate deploy'
      }, { status: 500 });
    }

    if (error?.code === 'P2025') {
      return NextResponse.json({
        error: 'Text not found',
        details: 'The text with this ID does not exist.'
      }, { status: 404 });
    }

    if (error?.code === 'P2002') {
      return NextResponse.json({
        error: 'A text with this pageKey and textKey already exists.',
        details: 'This should not happen in PUT. Please contact support.'
      }, { status: 409 });
    }

    return NextResponse.json({
      error: 'Failed to update page text',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE: Supprimer un texte
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await prisma.pageText.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting page text:', error);

    // Messages d'erreur plus explicites
    if (error?.code === 'P1001') {
      return NextResponse.json({
        error: 'Cannot connect to database. Please check DATABASE_URL in environment variables.',
        details: 'Database server is not reachable. If using Neon, the database may be in sleep mode.'
      }, { status: 500 });
    }

    if (error?.code === 'P2021') {
      return NextResponse.json({
        error: 'Table PageText does not exist. Please run database migrations.',
        details: 'Run: npx prisma migrate deploy'
      }, { status: 500 });
    }

    if (error?.code === 'P2025') {
      return NextResponse.json({
        error: 'Text not found',
        details: 'The text with this ID does not exist.'
      }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Failed to delete page text',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
