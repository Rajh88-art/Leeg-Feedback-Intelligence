'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import LeegLogo from '@/components/LeegLogo';
import {
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signOut } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [verifyingSession, setVerifyingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const verifyRecoveryLink = async () => {
      try {
        // 1. Check for explicit error parameters in query string or URL hash
        const queryError =
          searchParams.get('error_description') || searchParams.get('error');
        if (queryError) {
          if (mounted) {
            setErrorMsg(
              'This password reset link is invalid, expired, or has already been used. Please request a new recovery link.'
            );
            setHasValidSession(false);
            setVerifyingSession(false);
          }
          return;
        }

        if (typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          );
          const hashError =
            hashParams.get('error_description') || hashParams.get('error');
          if (hashError) {
            if (mounted) {
              setErrorMsg(
                'This password reset link has expired or was already used. Please request a fresh recovery link.'
              );
              setHasValidSession(false);
              setVerifyingSession(false);
            }
            return;
          }
        }

        // 2. Handle PKCE code parameter (?code=...)
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            code
          );
          if (!error && data?.session?.user) {
            if (mounted) {
              setHasValidSession(true);
              setUserEmail(data.session.user.email || null);
              setVerifyingSession(false);
            }
            return;
          }
        }

        // 3. Handle token_hash parameter (?token_hash=...&type=recovery)
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        if (tokenHash && type === 'recovery') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });
          if (!error && data?.session?.user) {
            if (mounted) {
              setHasValidSession(true);
              setUserEmail(data.session.user.email || null);
              setVerifyingSession(false);
            }
            return;
          }
        }

        // 4. Check existing Supabase recovery session (established via URL hash or callback)
        const { data: sessionData, error: sessionErr } =
          await supabase.auth.getSession();
        if (!sessionErr && sessionData?.session?.user) {
          const { data: userData, error: userErr } =
            await supabase.auth.getUser();
          if (!userErr && userData?.user) {
            if (mounted) {
              setHasValidSession(true);
              setUserEmail(userData.user.email || null);
              setVerifyingSession(false);
            }
            return;
          }
        }

        // Give hash-based PASSWORD_RECOVERY event a short window to fire
        setTimeout(async () => {
          if (!mounted) return;
          const { data: retryData } = await supabase.auth.getSession();
          if (retryData?.session?.user) {
            setHasValidSession(true);
            setUserEmail(retryData.session.user.email || null);
          } else {
            setHasValidSession(false);
            setErrorMsg(
              'No active password recovery session was found. The link may have expired or already been used.'
            );
          }
          setVerifyingSession(false);
        }, 700);
      } catch {
        if (mounted) {
          setHasValidSession(false);
          setErrorMsg(
            'Unable to verify password recovery session. Please request a new reset link.'
          );
          setVerifyingSession(false);
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (
        (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') &&
        session?.user
      ) {
        if (mounted) {
          setHasValidSession(true);
          setUserEmail(session.user.email || null);
          setErrorMsg(null);
          setVerifyingSession(false);
        }
      }
    });

    verifyRecoveryLink();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [searchParams, supabase]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!hasValidSession) {
      setErrorMsg(
        'Cannot update password without a verified recovery session. Please request a new reset link.'
      );
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please confirm your new password.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(
          error.message ||
            'Failed to update password. Your recovery link may have expired.'
        );
        setSubmitting(false);
        return;
      }

      // Sign out the temporary recovery session after saving the new password
      await signOut();

      setSuccessMsg(
        'Your password has been updated. Redirecting you to sign in...'
      );

      setTimeout(() => {
        router.push('/login?reset=success');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'An unexpected error occurred while updating password.'
      );
      setSubmitting(false);
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
            <LeegLogo size={44} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-[#161B19]">
              Leeg
            </h1>
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-[#EFF3EF] text-[#123D32] border border-[#CED9D0]">
              Intelligence
            </span>
          </div>
        </Link>
        <p className="text-xs text-[#53615A] font-medium">
          Secure Account Password Update
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white py-7 px-6 sm:px-8 shadow-sm border border-[#DCE4DD] rounded-2xl">
        <div className="mb-5 flex items-center justify-between pb-3 border-b border-[#EFF3EF]">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#123D32]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#161B19]">
              Set New Password
            </h2>
          </div>
          <Link
            href="/login"
            className="text-xs font-medium text-[#123D32] hover:text-[#0B2822] flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Sign In
          </Link>
        </div>

        {verifyingSession ? (
          <div className="py-10 text-center space-y-3">
            <Loader2 className="w-6 h-6 text-[#123D32] animate-spin mx-auto" />
            <p className="text-xs font-medium text-[#53615A]">
              Verifying your password recovery link...
            </p>
          </div>
        ) : !hasValidSession && !successMsg ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="block mb-0.5">
                  Invalid or Expired Recovery Link
                </strong>
                {errorMsg ||
                  'This password reset link is no longer valid. Recovery links expire after a short period and can only be used once.'}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login?mode=forgot"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-[#123D32] hover:bg-[#0B2822] text-white text-xs font-semibold transition-all"
              >
                <span>Request a New Reset Link</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A8CBB7]" />
              </Link>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center py-2 px-4 rounded-lg bg-[#EFF3EF] hover:bg-[#E2EBE4] text-[#161B19] text-xs font-medium transition-all"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {userEmail && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-[#EFF3EF] border border-[#DCE4DD] text-[11px] text-[#123D32]">
                Updating password for <strong>{userEmail}</strong>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="leading-relaxed font-medium">{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="leading-relaxed font-medium">{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="new-password"
                    className="block text-xs font-semibold text-[#161B19]"
                  >
                    New Password
                  </label>
                  <span className="text-[11px] text-[#53615A]">
                    Min. 6 characters
                  </span>
                </div>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F9B86]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="block w-full pl-9 pr-9 py-2 text-xs text-[#161B19] bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#53615A] hover:text-[#161B19]"
                    aria-label={
                      showNewPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold text-[#161B19] mb-1.5"
                >
                  Confirm New Password
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F9B86]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="block w-full pl-9 pr-9 py-2 text-xs text-[#161B19] bg-[#F8FAF7] border border-[#CED9D0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#123D32] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#53615A] hover:text-[#161B19]"
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || Boolean(successMsg)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-[#123D32] hover:bg-[#0B2822] disabled:opacity-60 transition-all cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Update Password &amp; Sign Out</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A8CBB7]" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-[#53615A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#123D32]" />
          <span>Verified Supabase Auth recovery session required</span>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-[#6F9B86]/15 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full flex items-center justify-center">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-[#53615A]">
              Loading password reset portal...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
