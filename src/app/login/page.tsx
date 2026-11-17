'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LeegLogo from '@/components/LeegLogo';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Database,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithOAuth, resetPassword, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Synchronize initial mode & status from query string (?mode=signup, ?mode=forgot, ?reset=success, ?expired=1)
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup') {
      setMode('signup');
    } else if (urlMode === 'forgot' || urlMode === 'reset') {
      setMode('forgot');
    }

    if (searchParams.get('reset') === 'success') {
      setMode('signin');
      setSuccessMsg(
        'Your password has been updated. Please sign in with your new password.'
      );
    }

    if (searchParams.get('expired') === '1') {
      setErrorMsg(
        'Your session expired. Please sign in again to access the workspace.'
      );
    }

    const oauthError = searchParams.get('error');
    if (oauthError === 'oauth_error') {
      setErrorMsg(
        'OAuth authentication could not be completed. Please sign in with your email and password.'
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your work email address.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      const res = await resetPassword(email);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(
          res.message ||
            'If an account is associated with that email address, a password reset link has been sent.'
        );
      }
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error);
          setLoading(false);
        } else {
          setSuccessMsg('Authentication successful. Redirecting to workspace...');
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 300);
        }
      } else {
        const { error, message } = await signUp(email, password);
        if (error) {
          setErrorMsg(error);
          setLoading(false);
        } else {
          setSuccessMsg(
            message || 'Employee account created. Accessing workspace...'
          );
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 450);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred during authentication.');
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setOauthLoading(provider);

    const { error } = await signInWithOAuth(provider);
    if (error) {
      setErrorMsg(error);
      setOauthLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link
          href="/"
          className="inline-flex flex-col items-center group transition-transform hover:scale-[1.01]"
        >
          <div className="mb-3">
            <LeegLogo size={46} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-[#161B19]">Leeg</h1>
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0]">
              Intelligence
            </span>
          </div>
        </Link>
        <p className="text-xs text-[#53615A] font-medium">
          Customer Feedback &amp; Career OS Product Intelligence
        </p>

        {/* Access Restriction Notice */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#EFF3EF] border border-[#DCE4DD] text-[11px] text-[#123D32]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#123D32] shrink-0" />
          <span>Internal workspace — access restricted to authorized Leeg team members.</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white py-7 px-6 sm:px-8 shadow-sm border border-[#DCE4DD] rounded-2xl">
        {/* Sign In vs Employee Registration Tabs */}
        {mode !== 'forgot' ? (
          <div className="flex rounded-lg bg-[#EFF3EF] p-1 mb-6 border border-[#DCE4DD]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#123D32] shadow-2xs'
                  : 'text-[#53615A] hover:text-[#161B19]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#123D32] shadow-2xs'
                  : 'text-[#53615A] hover:text-[#161B19]'
              }`}
            >
              Employee Registration
            </button>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-between pb-3 border-b border-[#EFF3EF]">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#123D32]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#161B19]">
                Reset Password
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs font-medium text-[#123D32] hover:text-[#0B2822] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" /> Back to Sign In
            </button>
          </div>
        )}

        {/* Alert Messages */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="leading-relaxed font-medium">{successMsg}</div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#161B19] mb-1.5">
              Work Email Address
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F9B86]">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@leeg.ai"
                className="block w-full pl-9 pr-3 py-2 text-xs text-[#161B19] bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] focus:bg-white transition-all placeholder:text-[#8C9B92]"
              />
            </div>
            {mode === 'forgot' && (
              <p className="mt-1.5 text-[11px] text-[#53615A] leading-relaxed">
                Enter your email address to receive a secure password reset link redirecting to{' '}
                <code className="font-mono text-[10px] bg-[#EFF3EF] px-1 py-0.5 rounded">
                  /reset-password
                </code>
                .
              </p>
            )}
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-[#161B19]">
                  Password
                </label>
                {mode === 'signin' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-[#123D32] hover:text-[#0B2822] font-semibold hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                ) : (
                  <span className="text-[11px] text-[#53615A] font-normal">
                    Min. 6 characters
                  </span>
                )}
              </div>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F9B86]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-9 py-2 text-xs text-[#161B19] bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] focus:bg-white transition-all placeholder:text-[#8C9B92]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#53615A] hover:text-[#161B19] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-semibold text-white bg-[#123D32] hover:bg-[#0B2822] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#123D32] disabled:opacity-60 transition-all cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A8CBB7]" />
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>Register Employee Account</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A8CBB7]" />
                </>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </button>
          </div>
        </form>

        {/* Social Authentication Section (only on signin / signup) */}
        {mode !== 'forgot' && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#DCE4DD]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-[#53615A] text-[11px] font-medium uppercase tracking-wider">
                  or continue with
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={oauthLoading !== null}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-[#DCE4DD] rounded-lg bg-white text-xs font-medium text-[#161B19] hover:bg-[#F8FAF7] hover:border-[#6F9B86] transition-all cursor-pointer disabled:opacity-60"
              >
                {oauthLoading === 'google' ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#6F9B86] border-t-[#123D32] rounded-full animate-spin mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.27v3.15C3.25 21.36 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.26c-.25-.72-.38-1.49-.38-2.26s.13-1.54.38-2.26V6.59H1.27C.46 8.2 0 10.05 0 12s.46 3.8 1.27 5.41l4.01-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.64 1.27 6.59l4.01 3.15c.95-2.84 3.6-4.99 6.72-4.99z"
                    />
                  </svg>
                )}
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('github')}
                disabled={oauthLoading !== null}
                className="w-full inline-flex items-center justify-center px-3 py-2 border border-[#DCE4DD] rounded-lg bg-white text-xs font-medium text-[#161B19] hover:bg-[#F8FAF7] hover:border-[#6F9B86] transition-all cursor-pointer disabled:opacity-60"
              >
                {oauthLoading === 'github' ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#6F9B86] border-t-[#123D32] rounded-full animate-spin mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2 fill-[#161B19]" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                )}
                <span>GitHub</span>
              </button>
            </div>
          </div>
        )}

        {/* Supabase backend status indicator */}
        <div className="mt-5 pt-3 border-t border-[#EFF3EF] flex items-center justify-between text-[11px] text-[#53615A]">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#6F9B86]" />
            <span>Authentication:</span>
          </div>
          <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full text-[10px] bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#123D32]" />
            {isConfigured ? 'Supabase Auth Connected' : 'Supabase Auth Ready'}
          </span>
        </div>
      </div>

      {/* Security / System Footer */}
      <div className="mt-6 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#53615A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#123D32]" />
          <span>Encrypted Supabase session with Row-Level Security</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] bg-[#6F9B86]/15 rounded-full blur-3xl opacity-70" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-[#53615A]">
              Loading authentication portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
