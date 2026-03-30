import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST: Tester la connexion au serveur SMS Gateway
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Récupérer la configuration SMS
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['sms_gateway_url', 'sms_gateway_username', 'sms_gateway_password'],
        },
      },
    });

    const gatewayUrl = settings.find((s) => s.key === 'sms_gateway_url')?.value;
    const username = settings.find((s) => s.key === 'sms_gateway_username')?.value;
    const password = settings.find((s) => s.key === 'sms_gateway_password')?.value;

    if (!gatewayUrl) {
      return NextResponse.json({ error: 'SMS Gateway not configured' }, { status: 400 });
    }

    // Tester la connexion
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (username && password) {
      const authString = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch(`${gatewayUrl}/api/v1/health`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Connection failed: ${response.status} ${response.statusText}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Connection successful' });
  } catch (error) {
    console.error('Error testing SMS connection:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Connection failed' },
      { status: 500 }
    );
  }
}
