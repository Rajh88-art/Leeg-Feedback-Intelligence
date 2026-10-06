'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Database,
  Building2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, isConfigured } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
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
          setSuccessMsg('Authentication successful. Redirecting to dashboard...');
          // Push to dashboard
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 400);
        }
      } else {
        const { error, message } = await signUp(email, password);
        if (error) {
          setErrorMsg(error);
          setLoading(false);
        } else {
          setSuccessMsg(message || 'Account created successfully! Signing you in...');
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 600);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during authentication.');
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('LeegProduct2026!');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-purple-100 selection:text-purple-900">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl opacity-70" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0c111d] border border-slate-800 text-white shadow-md mb-3">
            <span className="font-black text-xl text-purple-400">L</span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Leeg</h1>
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
              Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Internal Customer Feedback & Career OS Intelligence Platform
          </p>
        </div>

        {/* Auth Card */}
        <div className="mt-7 bg-white py-8 px-6 sm:px-8 shadow-xs border border-slate-200/90 rounded-2xl">
          {/* Sign In vs Sign Up Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
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
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Status / Alert Messages */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vp.product@leeg.ai"
                  className="block w-full pl-9 pr-3 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {mode === 'signin' && (
                  <span className="text-[11px] text-slate-400 font-normal">
                    Min. 6 characters
                  </span>
                )}
              </div>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                  className="block w-full pl-9 pr-9 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-300" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
              <span className="font-medium text-slate-600">Quick Test Credentials:</span>
              <button
                type="button"
                onClick={() => handleFillDemo('vp@leeg.ai')}
                className="text-purple-600 hover:text-purple-700 font-semibold underline underline-offset-2"
              >
                Auto-fill
              </button>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/70 text-[11px] font-mono text-slate-600 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Email:</span>
                <span className="text-slate-800">vp@leeg.ai</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Password:</span>
                <span className="text-slate-800">LeegProduct2026!</span>
              </div>
            </div>
          </div>

          {/* Supabase backend status indicator */}
          <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Auth Service:</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-full text-[10px] ${
                isConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConfigured ? 'bg-emerald-500' : 'bg-purple-500'
                }`}
              />
              {isConfigured ? 'Supabase Live Connected' : 'Supabase Auth Ready (.env.local)'}
            </span>
          </div>
        </div>

        {/* Security / System Footer */}
        <div className="mt-6 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted internal authentication session</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Leeg Technologies Inc. &bull; Calgary Startup &bull; Career OS
          </p>
        </div>
      </div>
    </div>
  );
}
