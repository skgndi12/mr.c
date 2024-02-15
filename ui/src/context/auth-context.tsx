'use client';

import { fetchSignOut, getUserSelf, linkToSignIn } from '@/lib/apis/auth';
import { User } from '@/lib/definitions/user';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface ContextShape {
  user?: User;
  signOut: () => Promise<void>;
  signIn: () => void;
}

const AuthContext = createContext<ContextShape | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    // why void?
    // we don't handle getUserSelf error
    // becuase failure to getUserSelf is just considered
    // to be signed out.
    void getUserSelf().then(setUser);
  }, []);

  const signOut = async () => {
    await fetchSignOut();
    void getUserSelf().then(setUser);
  };

  const signIn = () => {
    linkToSignIn();
  };

  return <AuthContext.Provider value={{ user, signOut, signIn }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
