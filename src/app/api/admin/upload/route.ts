import { NextRequest, NextResponse } from 'next/server';
import { list, put, del } from '@vercel/blob';
import { requireAuth } from '@/lib/auth-helpers';
import fs from 'fs';
import path from 'path';

/**
 * Route API pour gérer les images avec Vercel Blob
 * GET /api/admin/upload - Liste toutes les images
 * POST /api/admin/upload - Upload une nouvelle image
 * DELETE /api/admin/upload?url=xxx - Supprime une image
 */

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    console.log('📋 Listing images from Vercel Blob and local public/images...');

    // Lister tous les blobs de Vercel
    const { blobs } = await list();

    console.log(`📦 Found ${blobs.length} blobs from Vercel`);

    // Transformer les blobs Vercel en format utilisable
    const vercelImages = blobs.map(blob => {
      const ext = blob.pathname.toLowerCase().split('.').pop() || '';
      const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(ext);

      return {
        name: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        source: 'vercel-blob',
        type: isVideo ? 'video' : 'image'
      };
    });

    // Lister les images locales dans public/images
    const localImages: any[] = [];
    try {
      const publicImagesPath = path.join(process.cwd(), 'public', 'images');

      if (fs.existsSync(publicImagesPath)) {
        const files = fs.readdirSync(publicImagesPath);

        files.forEach(file => {
          const ext = path.extname(file).toLowerCase();
          // Filtrer les fichiers images et vidéos
          const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
          const videoExts = ['.mp4', '.webm', '.ogg', '.mov'];
          const allExts = [...imageExts, ...videoExts];

          if (allExts.includes(ext)) {
            const filePath = path.join(publicImagesPath, file);
            const stats = fs.statSync(filePath);

            localImages.push({
              name: file,
              url: `/images/${file}`,
              size: stats.size,
              uploadedAt: stats.mtime.toISOString(),
              source: 'local',
              type: videoExts.includes(ext) ? 'video' : 'image'
            });
          }
        });

        console.log(`📁 Found ${localImages.length} local images`);
      }
    } catch (localError) {
      console.warn('⚠️ Could not read local images:', localError);
      // Continue même si on ne peut pas lire les images locales
    }

    // Combiner et trier par date (plus récents en premier)
    const allImages = [...vercelImages, ...localImages]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    console.log(`✅ Total: ${allImages.length} images (${vercelImages.length} Vercel + ${localImages.length} local)`);

    return NextResponse.json(allImages);
  } catch (error) {
    console.error('❌ Error listing images:', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('📤 Upload request received');

  const { error } = await requireAuth();
  if (error) {
    console.log('❌ Auth error:', error);
    return error;
  }

  try {
    const formData = await request.formData();
    console.log('📋 FormData parsed');

    const file = formData.get('file') as File;
    console.log('📁 File from formData:', file?.name, file?.type, file?.size);

    if (!file) {
      console.log('❌ No file in formData');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Vérifier le type de fichier (images + vidéos)
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime' // .mov
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non valide. Formats acceptés: JPEG, PNG, GIF, WebP, SVG, MP4, WebM, OGG, MOV' },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 50MB pour vidéos, 5MB pour images)
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Taille max: ${isVideo ? '50MB' : '5MB'}` },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${originalName}`;

    console.log('☁️ Uploading to Vercel Blob:', fileName);

    // Uploader vers Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    console.log('✅ Upload successful:', blob.url);

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: fileName,
    });
  } catch (error) {
    console.error('❌ Error uploading file:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const blobUrl = searchParams.get('url');

    if (!blobUrl) {
      return NextResponse.json({ error: 'Blob URL is required' }, { status: 400 });
    }

    console.log('🗑️ Deleting blob:', blobUrl);

    // Supprimer le blob
    await del(blobUrl);

    console.log('✅ Blob deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting blob:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
