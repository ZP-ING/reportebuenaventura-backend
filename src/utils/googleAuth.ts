import { supabase } from './supabase/client';

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Inicia sesión con Google (Supabase OAuth)
 */
export async function signInWithGoogle(): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 🔧 Usa redirectTo explícito
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    console.error('Error en signInWithGoogle:', error);
    throw error;
  }
}

/**
 * Verifica si hay sesión activa después de la redirección
 */
export async function checkGoogleAuthSession(): Promise<GoogleUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const user = session.user;

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario',
      picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    };
  } catch (error) {
    console.error('Error verificando sesión de Google:', error);
    return null;
  }
}

/**
 * Cierra la sesión
 */
export async function signOutGoogle(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    throw error;
  }
}

/**
 * Escucha cambios de sesión
 */
export function onAuthStateChange(
  callback: (user: GoogleUser | null) => void
): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        callback({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuario',
          picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        });
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}

