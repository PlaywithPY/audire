import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer un setting public (sans authentification)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 });
    }

    // Liste des settings publics accessibles sans authentification
    const publicSettings = ['mutuelle_reimbursement', 'use_modern_homepage_design'];

    if (!publicSettings.includes(key)) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    const setting = await prisma.siteSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      return NextResponse.json({ key, value: '0' });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 });
  }
}
