'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import Link from 'next/link';

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    teamName: '',
    country: null,
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const countryOptions = countryList().getData();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!formData.name.trim() || formData.name.trim().length < 2) {
          setError('Please enter your full name (minimum 2 characters)');
          return false;
        }
        break;
      case 2:
        {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
          }
        }
        break;
      case 3:
        if (!formData.teamName.trim() || formData.teamName.trim().length < 3) {
          setError('Team name must be at least 3 characters');
          return false;
        }
        break;
      case 4:
        if (!formData.country) {
          setError('Please select your country');
          return false;
        }
        break;
      case 5:
        if (!formData.password || formData.password.length < 6) {
          setError('Password must be at least 6 characters');
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
    if (step !== 5) {
      nextStep();
      return;
    }
    
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.toLowerCase(),
        formData.password
      );

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        teamName: formData.teamName.trim(),
        country: formData.country.label,
        leagues: ['overall', formData.country.label],
        points: 0,
        createdAt: new Date()
      });

      setSuccess(true);
    } catch (err) {
      console.error('Error during signup:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-[#37003C] rounded-xl shadow-xl p-6 mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome Aboard! 🎉</h2>
          <p className="text-gray-200 mb-4">Your account has been created successfully.</p>
          <p className="text-gray-200 mb-4">You are now logged in and can access your dashboard.</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    const inputClasses =
      'w-full px-4 py-3 text-lg bg-[#37003C] border border-white/20 rounded-lg focus:ring-2 focus:ring-[#00ff87] focus:border-[#00ff87] transition-all duration-200 outline-none text-white placeholder-gray-400';

    switch (step) {
      case 1:
        return (
          <div className="w-full">
            <h3 className="text-2xl font-medium text-white mb-6">What's your name?</h3>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={inputClasses}
              placeholder="Enter your full name"
              autoFocus
            />
          </div>
        );
      case 2:
        return (
          <div className="w-full">
            <h3 className="text-2xl font-medium text-white mb-6">What's your email?</h3>
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
      case 3:
        return (
          <div className="w-full">
            <h3 className="text-2xl font-medium text-white mb-6">Name your team</h3>
            <input
              type="text"
              value={formData.teamName}
              onChange={(e) => handleInputChange('teamName', e.target.value)}
              className={inputClasses}
              placeholder="Enter your team name"
              autoFocus
            />
          </div>
        );
      case 4:
        return (
          <div className="w-full">
            <h3 className="text-2xl font-medium text-white mb-6">Select your country</h3>
            <Select
              options={countryOptions}
              value={formData.country}
              onChange={(value) => handleInputChange('country', value)}
              placeholder="Search your country..."
              isSearchable
              classNamePrefix="select"
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '48px',
                  backgroundColor: '#37003C',
                  borderRadius: '0.5rem',
                  border: state.isFocused ? '1px solid #00ff87' : '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 255, 135, 0.2)' : 'none',
                  '&:hover': { border: '1px solid #00ff87' },
                  color: 'white'
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: '#37003C',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? '#00ff87'
                    : state.isFocused
                    ? 'rgba(255, 255, 255, 0.1)'
                    : '#37003C',
                  color: state.isSelected ? '#37003C' : 'white',
                  '&:active': { backgroundColor: '#00ff87' }
                }),
                singleValue: (base) => ({
                  ...base,
                  color: 'white'
                }),
                input: (base) => ({
                  ...base,
                  color: 'white'
                }),
                placeholder: (base) => ({
                  ...base,
                  color: 'rgba(255, 255, 255, 0.5)'
                })
              }}
            />
          </div>
        );
      case 5:
        return (
          <div className="w-full">
            <h3 className="text-2xl font-medium text-white mb-6">Create a password</h3>
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
        <h2 className="text-3xl font-bold text-white mb-4">Create Your Account</h2>
        <div className="flex justify-center items-center space-x-2">
          {[1, 2, 3, 4, 5].map((i) => (
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

      <form onSubmit={handleSubmit} className="space-y-6">
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
            disabled={loading && step === 5}
            className={`px-6 py-3 bg-[#00ff87] text-[#37003C] rounded-lg hover:bg-[#00ff87]/90 transition-all duration-200 font-medium ${
              step > 1 ? 'ml-auto' : 'w-full'
            } ${loading && step === 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {step < 5 ? 'Continue' : loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-gray-300">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-[#00ff87] hover:text-[#00ff87]/80 font-medium transition-colors duration-200 hover:underline"
        >
          Login here
        </Link>
      </p>
    </div>
  );
}