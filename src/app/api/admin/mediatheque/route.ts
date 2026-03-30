import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'media');

// Fonction pour s'assurer que le dossier uploads existe
async function ensureUploadDir() {
  try {
    await readdir(UPLOAD_DIR);
  } catch (error) {
    // Si le dossier n'existe pas, le créer
    const { mkdir } = await import('fs/promises');
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// GET: Liste tous les fichiers de la médiathèque
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUploadDir();
    const files = await readdir(UPLOAD_DIR);

    const mediaFiles = await Promise.all(
      files.map(async (filename) => {
        const filePath = join(UPLOAD_DIR, filename);
        const stats = await stat(filePath);

        return {
          id: filename,
          url: `/uploads/media/${filename}`,
          filename: filename,
          uploadedAt: stats.birthtime.toISOString(),
          size: stats.size,
          type: filename.split('.').pop() || '',
          usedIn: [], // TODO: implémenter la recherche d'utilisation
        };
      })
    );

    // Trier par date de création décroissante
    mediaFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(mediaFiles);
  } catch (error) {
    console.error('Error fetching media files:', error);
    return NextResponse.json({ error: 'Failed to fetch media files' }, { status: 500 });
  }
}

// POST: Upload un nouveau fichier
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUploadDir();

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images are allowed' }, { status: 400 });
    }

    // Générer un nom de fichier unique
    const extension = file.name.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${extension}`;
    const filePath = join(UPLOAD_DIR, uniqueFilename);

    // Convertir le fichier en Buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      url: `/uploads/media/${uniqueFilename}`,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

// DELETE: Supprimer un fichier
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const fileId = url.searchParams.get('id');

    if (!fileId) {
      return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
    }

    const filePath = join(UPLOAD_DIR, fileId);
    await unlink(filePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
