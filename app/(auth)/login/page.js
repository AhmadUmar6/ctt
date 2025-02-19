'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { auth } from '@/lib/firebase';
import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/shared/Navbar';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Head>
        {/* Preload background images */}
        <link rel="preload" as="image" href="/bg.png" media="(min-width: 1025px)" />
        <link rel="preload" as="image" href="/bg2.png" media="(max-width: 1024px)" />
      </Head>
      
      {/* Background container with optimized image loading */}
      <div className="absolute inset-0 z-0">
        <picture className="block w-full h-full">
          <source media="(min-width: 1025px)" srcSet="/bg.png" />
          <source media="(max-width: 1024px)" srcSet="/bg2.png" />
          <img
            src="/bg.png"
            alt="Background"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </picture>
      </div>
      
      <Navbar className="relative z-10" />
      
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md px-2">
          <LoginForm />
        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        color: 'rgba(255, 255, 255, 0.5)', 
        fontSize: '12px',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}>
        Designed by: <a 
          href="#" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ 
            color: 'rgba(255, 255, 255, 0.8)',
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >Ahmad Umar</a>
      </footer>
    </div>
  );
}