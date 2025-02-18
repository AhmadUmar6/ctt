'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import SignupForm from '@/components/auth/SignupForm';
import Navbar from '@/components/shared/Navbar';

export default function SignupPage() {
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
      <style jsx>{`
        @media (min-width: 1025px) {
          .background-container {
            background-image: url(/bg.png);
          }
        }
        
        @media (max-width: 1024px) {
          .background-container {
            background-image: url(/bg2.png);
          }
        }
      `}</style>
      <div className="background-container absolute inset-0 bg-cover bg-center bg-no-repeat z-0" />
      <Navbar className="relative z-10" />
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="w-full max-w-md px-2">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}