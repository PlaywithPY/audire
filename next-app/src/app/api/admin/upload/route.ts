import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { requireAuth } from '@/lib/auth-helpers';

/**
 * Route API pour gérer les images
 * GET /api/admin/upload - Liste toutes les images
 * POST /api/admin/upload - Upload une nouvelle image
 * DELETE /api/admin/upload?file=xxx.jpg - Supprime une image
 */

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads');

    if (!existsSync(uploadsDir)) {
      return NextResponse.json([]);
    }

    const files = await readdir(uploadsDir);
    const images = files
      .filter(file => !file.startsWith('.')) // Ignorer .gitkeep
      .map(file => ({
        name: file,
        url: `/uploads/${file}`,
      }))
      .sort((a, b) => b.name.localeCompare(a.name)); // Plus récents en premier

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
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

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${originalName}`;
    const filePath = join(uploadsDir, fileName);

    // Convertir le fichier en buffer et le sauvegarder
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retourner l'URL publique du fichier
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    // Sécurité : empêcher les traversées de répertoire
    if (fileName.includes('..') || fileName.includes('/')) {
      return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadsDir, fileName);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
