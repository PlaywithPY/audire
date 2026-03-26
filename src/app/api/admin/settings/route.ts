import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';

// GET - Récupérer tous les settings ou un setting spécifique
export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Si une clé spécifique est demandée
    if (key) {
      const setting = await prisma.siteSettings.findUnique({
        where: { key },
      });

      if (!setting) {
        return NextResponse.json({ key, value: '' });
      }

      return NextResponse.json(setting);
    }

    // Sinon, retourner tous les settings
    const settings = await prisma.siteSettings.findMany();

    // Transformer en objet key/value
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - Mettre à jour un setting
export async function PUT(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { key, value } = body;

    await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
