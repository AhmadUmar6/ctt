'use client';
import { useEffect } from 'react';
import useAuthStore from '@/lib/authStore';

export default function AuthInitializer({ children }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  return children;
}