'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { fetchSignOut, getUserSelf, linkToSignIn } from '@/lib/apis/auth/client';
import { protectedPaths } from '@/lib/constants/auth';
import type { User } from '@/lib/definitions/auth';

interface ContextShape {
  user?: User;
  signOut: () => Promise<void>;
  signIn: () => void;
}

const AuthContext = createContext<ContextShape | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();

  const handleGetUserSelf = async () => {
    const user = await getUserSelf();
    setUser(user);
  };

  useEffect(() => {
    void handleGetUserSelf();
  }, []);

  const signOut = async () => {
    await fetchSignOut();
    await handleGetUserSelf();
  };

  const signIn = () => {
    linkToSignIn();
  };

  const pathname = usePathname();
  useEffect(() => {
    const protect = async () => {
      const isLoggedIn = !!(await getUserSelf());
      if (!isLoggedIn) {
        // TODO: redirect to the sign-in page
        signIn();
      }
    };

    if (protectedPaths.includes(pathname)) {
      void protect();
    }
  }, [pathname, user]);

  return <AuthContext.Provider value={{ user, signOut, signIn }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
