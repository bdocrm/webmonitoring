'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface LoginErrorHandlerProps {
  onError: (error: string) => void;
}

export function LoginErrorHandler({ onError }: LoginErrorHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        CredentialsSignin: 'Invalid email or password. Please try again.',
        InvalidEmail: 'Please enter a valid email address.',
        NoUser: 'No account found with that email.',
        InvalidPassword: 'Incorrect password.',
        SessionExpired: 'Your session has expired. Please log in again.',
      };
      onError(errorMessages[errorParam] || 'Login failed. Please try again.');
    }
  }, [searchParams, onError]);

  return null;
}
