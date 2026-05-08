import { NextRequest, NextResponse } from 'next/server';
import { list, del } from '@vercel/blob';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireAuth } from '@/lib/auth-helpers';
import fs from 'fs';
import path from 'path';

/**
 * GET    /api/admin/upload                  Liste les médias (Vercel Blob + public/images)
 * POST   /api/admin/upload                  Upload direct côté client via @vercel/blob/client
 *                                           (le navigateur envoie au Blob, on signe juste le token —
 *                                           bypass de la limite 4,5 Mo des routes serverless)
 * DELETE /api/admin/upload?url=xxx          Supprime un blob
 */

const MAX_BYTES = 200 * 1024 * 1024; // 200 Mo plafond — Blob accepte jusqu'à 5 Go

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const { blobs } = await list();
    const vercelImages = blobs.map((blob) => {
      const ext = blob.pathname.toLowerCase().split('.').pop() || '';
      const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
      return {
        name: blob.pathname, url: blob.url, size: blob.size,
        uploadedAt: blob.uploadedAt, source: 'vercel-blob',
        type: isVideo ? 'video' : 'image',
      };
    });

    const localImages: any[] = [];
    try {
      const dir = path.join(process.cwd(), 'public', 'images');
      if (fs.existsSync(dir)) {
        for (const file of fs.readdirSync(dir)) {
          const ext = path.extname(file).toLowerCase();
          const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
          const videoExts = ['.mp4', '.webm', '.ogg', '.mov'];
          if (![...imageExts, ...videoExts].includes(ext)) continue;
          const stats = fs.statSync(path.join(dir, file));
          localImages.push({
            name: file, url: `/images/${file}`, size: stats.size,
            uploadedAt: stats.mtime.toISOString(), source: 'local',
            type: videoExts.includes(ext) ? 'video' : 'image',
          });
        }
      }
    } catch (e) { console.warn('⚠️ local images:', e); }

    const all = [...vercelImages, ...localImages].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    return NextResponse.json(all);
  } catch (e) {
    console.error('❌ list:', e);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { error } = await requireAuth();
  if (error) return error;

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Vérifications côté serveur AVANT que le navigateur ne reçoive son token signé.
        const ext = (pathname.split('.').pop() || '').toLowerCase();
        const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4', 'webm', 'ogg', 'mov'];
        if (!allowed.includes(ext)) {
          throw new Error(`Extension non autorisée : .${ext}`);
        }
        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
          ],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('✅ Upload terminé:', blob.url);
        // Possibilité d'enregistrer en base ici si besoin plus tard.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (e: any) {
    console.error('❌ upload:', e);
    return NextResponse.json(
      { error: e?.message || 'Upload failed' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const blobUrl = request.nextUrl.searchParams.get('url');
    if (!blobUrl) return NextResponse.json({ error: 'Blob URL required' }, { status: 400 });
    await del(blobUrl);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('❌ delete:', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
