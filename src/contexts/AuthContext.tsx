import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { authLog } from '../lib/logger';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  magicLinkSent: boolean;
  magicLinkEmail: string | null;
  completingMagicLink: boolean;
  resetMagicLinkState: () => void;
}

const MAGIC_EMAIL_KEY = 'matchtech_magic_email';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState<string | null>(null);
  const [completingMagicLink, setCompletingMagicLink] = useState(false);

  useEffect(() => {
    // Detecta se a URL atual é um Magic Link de login
    if (isSignInWithEmailLink(auth, window.location.href)) {
      setCompletingMagicLink(true);
      authLog.info('Magic Link detectado na URL. Completando login...');

      // Recupera o email salvo no localStorage (mesmo dispositivo)
      let email = window.localStorage.getItem(MAGIC_EMAIL_KEY);

      // Se o usuário abriu o link em outro dispositivo, pede o email
      if (!email) {
        email = window.prompt('Por favor, confirme seu email para completar o login:');
      }

      if (email) {
        signInWithEmailLink(auth, email, window.location.href)
          .then(() => {
            authLog.info('Login via Magic Link realizado com sucesso.');
            window.localStorage.removeItem(MAGIC_EMAIL_KEY);
            // Limpa os parâmetros do link da URL sem recarregar
            window.history.replaceState(null, '', window.location.pathname);
          })
          .catch((err) => {
            authLog.error('Erro ao completar login via Magic Link:', err);
          })
          .finally(() => {
            setCompletingMagicLink(false);
          });
      } else {
        authLog.warn('Magic Link: email não fornecido pelo usuário.');
        setCompletingMagicLink(false);
      }
    }

    // Listener padrão de autenticação
    const unsubscribe = auth.onAuthStateChanged((u) => {
      authLog.info('Estado de autenticação mudou:', u?.email ?? 'não autenticado');
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Login via Google (Popup)
  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      authLog.info('Login via Google realizado com sucesso (popup).');
    } catch (err) {
      authLog.error('Erro no login via popup do Google:', err);
      throw err;
    }
  };

  // Login via Magic Link (Email sem senha)
  const sendMagicLink = async (email: string) => {
    const actionCodeSettings = {
      // Usa a URL atual do site (funciona no localhost E na Vercel automaticamente)
      url: `${window.location.origin}/onboarding`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Salva o email no localStorage para não pedir de novo quando voltar pelo link
      window.localStorage.setItem(MAGIC_EMAIL_KEY, email);
      setMagicLinkSent(true);
      setMagicLinkEmail(email);
      authLog.info(`Magic Link enviado para: ${email}`);
    } catch (err) {
      authLog.error('Erro ao enviar Magic Link:', err);
      throw err;
    }
  };

  // Reset do estado do Magic Link (para voltar à tela de login)
  const resetMagicLinkState = () => {
    setMagicLinkSent(false);
    setMagicLinkEmail(null);
  };

  const logOut = async () => {
    await signOut(auth);
    authLog.info('Usuário fez logout.');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      logOut,
      sendMagicLink,
      magicLinkSent,
      magicLinkEmail,
      completingMagicLink,
      resetMagicLinkState
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
