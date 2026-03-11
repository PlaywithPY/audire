import { NextRequest, NextResponse } from 'next/server';
import { list, put, del } from '@vercel/blob';
import { requireAuth } from '@/lib/auth-helpers';

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
    console.log('📋 Listing images from Vercel Blob...');

    // Lister tous les blobs
    const { blobs } = await list();

    console.log(`📦 Found ${blobs.length} blobs`);

    // Transformer en format utilisable
    const images = blobs.map(blob => ({
      name: blob.pathname,
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()); // Plus récents en premier

    return NextResponse.json(images);
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

    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.' },
        { status: 400 }
      );
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
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
