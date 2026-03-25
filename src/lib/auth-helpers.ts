import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

/**
 * Vérifie si l'utilisateur est authentifié en tant qu'admin
 * Retourne la session si authentifié, sinon retourne une réponse d'erreur 401
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
      session: null,
    };
  }

  return {
    error: null,
    session,
  };
}
