import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Récupérer la configuration SMS
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Récupérer les paramètres SMS depuis la base de données
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['sms_gateway_url', 'sms_gateway_username', 'sms_gateway_password'],
        },
      },
    });

    const config = {
      gatewayUrl: settings.find((s) => s.key === 'sms_gateway_url')?.value || '',
      username: settings.find((s) => s.key === 'sms_gateway_username')?.value || '',
      password: settings.find((s) => s.key === 'sms_gateway_password')?.value || '',
      isConfigured: !!settings.find((s) => s.key === 'sms_gateway_url')?.value,
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching SMS config:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS config' }, { status: 500 });
  }
}

// POST: Sauvegarder la configuration SMS
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { gatewayUrl, username, password } = await req.json();

    // Sauvegarder les paramètres dans la base de données
    await prisma.setting.upsert({
      where: { key: 'sms_gateway_url' },
      update: { value: gatewayUrl },
      create: { key: 'sms_gateway_url', value: gatewayUrl },
    });

    if (username) {
      await prisma.setting.upsert({
        where: { key: 'sms_gateway_username' },
        update: { value: username },
        create: { key: 'sms_gateway_username', value: username },
      });
    }

    if (password) {
      await prisma.setting.upsert({
        where: { key: 'sms_gateway_password' },
        update: { value: password },
        create: { key: 'sms_gateway_password', value: password },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving SMS config:', error);
    return NextResponse.json({ error: 'Failed to save SMS config' }, { status: 500 });
  }
}
