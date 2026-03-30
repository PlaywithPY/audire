import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: Envoyer un SMS
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recipient, message } = await req.json();

    if (!recipient || !message) {
      return NextResponse.json({ error: 'Missing recipient or message' }, { status: 400 });
    }

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

    // Envoyer le SMS via SMS Gateway
    const smsPayload = {
      phoneNumbers: [recipient],
      message: message,
    };

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (username && password) {
      const authString = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${authString}`;
    }

    const response = await fetch(`${gatewayUrl}/api/v1/message`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(smsPayload),
    });

    let status: 'sent' | 'failed' = 'sent';
    let errorMessage: string | undefined = undefined;

    if (!response.ok) {
      status = 'failed';
      errorMessage = `SMS Gateway error: ${response.status} ${response.statusText}`;
    }

    // Enregistrer dans les logs
    const log = await prisma.sMSLog.create({
      data: {
        recipient,
        message,
        status,
        error: errorMessage,
      },
    });

    if (status === 'failed') {
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error sending SMS:', error);

    // Enregistrer l'échec dans les logs
    try {
      await prisma.sMSLog.create({
        data: {
          recipient: (await req.json()).recipient,
          message: (await req.json()).message,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (logError) {
      console.error('Error logging SMS failure:', logError);
    }

    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
}
