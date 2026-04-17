'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, LogIn, Mail, Lock } from 'lucide-react';
import { LoginErrorHandler } from './error-handler';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    console.log('🔐 Login attempt:', { email, password: '***', rememberMe });

    try {
      console.log('📡 Calling signIn...');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('📡 signIn result:', result);

      if (result?.error) {
        console.error('❌ Auth error:', result.error);
        
        const errorMessages: Record<string, string> = {
          CredentialsSignin: 'Invalid email or password',
          InvalidEmail: 'Please enter a valid email',
          NoUser: 'No user found with that email',
          InvalidPassword: 'Incorrect password',
        };
        
        setError(errorMessages[result.error] || 'Login failed. Please try again.');
        setLoading(false);
      } else if (result?.ok) {
        console.log('✅ Login successful, redirecting...');
        if (rememberMe) {
          localStorage.setItem('rememberEmail', email);
        }
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        console.error('❓ Unknown result:', result);
        setError('Login failed - unknown error');
        setLoading(false);
      }
    } catch (err) {
      console.error('💥 Exception:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-black flex items-center justify-center p-4 relative overflow-hidden">
      <Suspense fallback={null}>
        <LoginErrorHandler onError={setError} />
      </Suspense>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-brand-tufts/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-brand-orange/10 to-transparent rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-brand-black/50 backdrop-blur-xl border border-brand-tufts/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-navy to-brand-tufts rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-brand-powder font-heading mb-2">Website Monitor</h1>
            <p className="text-brand-powder/60 text-sm">Sign in to access your dashboard</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 animate-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-medium">Login Failed</p>
                <p className="text-red-300 text-xs mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-brand-powder/80 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-brand-navy/30 border border-brand-tufts/30 rounded-lg text-brand-powder placeholder-brand-powder/30 focus:outline-none focus:border-brand-tufts focus:ring-1 focus:ring-brand-tufts transition"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-brand-powder/80 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-brand-navy/30 border border-brand-tufts/30 rounded-lg text-brand-powder placeholder-brand-powder/30 focus:outline-none focus:border-brand-tufts focus:ring-1 focus:ring-brand-tufts transition"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-brand-navy border border-brand-tufts/30 rounded cursor-pointer accent-brand-tufts"
                disabled={loading}
              />
              <label htmlFor="remember" className="text-sm text-brand-powder/60 cursor-pointer">
                Remember my email
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-brand-navy to-brand-tufts hover:from-brand-navy/90 hover:to-brand-tufts/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2 mt-6 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-tufts/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-brand-powder/40 bg-brand-black/50">Debug Info</span>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-brand-navy/20 rounded p-3 text-xs text-brand-powder/40 space-y-1 mb-4">
            <p>💡 Check browser console for detailed logs</p>
            <p>🔍 Error details will help troubleshoot issues</p>
            <p>✅ NEXTAUTH_SECRET must be set in .env.local</p>
          </div>

          {/* Footer */}
          <p className="text-center text-brand-powder/30 text-xs">
            Website Monitoring System • v1.0+Enhanced
          </p>
        </div>
      </div>
    </div>
  );
}
