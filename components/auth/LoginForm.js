'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
      case 2:
        if (!formData.password) {
          setError('Please enter your password');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, formData.email.toLowerCase(), formData.password);
      router.push('/');
    } catch (err) {
      console.error('Error during login:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message || 'Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const inputClasses =
      'w-full px-4 py-3 text-lg bg-[#37003C] border border-white/20 rounded-lg focus:ring-2 focus:ring-[#00ff87] focus:border-[#00ff87] transition-all duration-200 outline-none text-white placeholder-gray-400';

    switch (step) {
      case 1:
        return (
          <div className="w-full">
            <h3 className="text-2xl font-medium text-white mb-6">Enter your email</h3>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={inputClasses}
              placeholder="Enter your email"
              autoFocus
            />
          </div>
        );
      case 2:
        return (
          <div className="w-full">
            <h3 className="text-2xl font-medium text-white mb-6">Enter your password</h3>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={inputClasses}
              placeholder="Enter your password"
              autoFocus
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-md bg-[#37003C] rounded-xl shadow-xl p-6 mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Sign In</h2>
        <div className="flex justify-center items-center space-x-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-[#00ff87]' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 animate-fadeIn backdrop-blur-sm border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
        {renderStep()}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 border-2 border-[#00ff87] text-[#00ff87] rounded-lg hover:bg-[#00ff87] hover:text-[#37003C] transition-all duration-200 font-medium"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={loading && step === 2}
            className={`px-6 py-3 bg-[#00ff87] text-[#37003C] rounded-lg hover:bg-[#00ff87]/90 transition-all duration-200 font-medium ${
              step > 1 ? 'ml-auto' : 'w-full'
            } ${loading && step === 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {step < 2 ? 'Continue' : loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-gray-300">
        Don't have an account?{' '}
        <Link
          href="/signup"
          className="text-[#00ff87] hover:text-[#00ff87]/80 font-medium transition-colors duration-200 hover:underline"
        >
          Sign up here
        </Link>
      </p>
    </div>
  );
}