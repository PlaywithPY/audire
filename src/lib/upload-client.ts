// src/lib/upload-client.ts
// Wrapper unique pour uploader un fichier vers Vercel Blob côté client.
// Bypasse la limite 4,5 Mo des routes serverless en envoyant directement au Blob.

import { upload } from '@vercel/blob/client';

export async function uploadFile(file: File): Promise<{ success: true; url: string; fileName: string }> {
  // Sanitize the filename — Vercel Blob accepts UTF-8 mais on évite les espaces / caractères exotiques.
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const blob = await upload(safeName, file, {
    access: 'public',
    handleUploadUrl: '/api/admin/upload',
  });
  return { success: true, url: blob.url, fileName: safeName };
}
