'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  HelpCircle,
  ExternalLink,
  X,
  Info,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabaseClient';

interface LoginScreenProps {
  onSuccess: () => void;
  onOpenCredentials: () => void;
  isConfigured: boolean;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onOpenCredentials,
  isConfigured,
}) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [googleHelpOpen, setGoogleHelpOpen] = useState(false);

  // Email/Password Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isConfigured) {
      setErrorMsg('Supabase is not configured yet. Please configure your Project URL and Anon Key first.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setErrorMsg('Supabase client could not be initialized.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error('Invalid email or password. If you haven\'t created an account yet, click "Create Account" below.');
          }
          if (error.message.toLowerCase().includes('email not confirmed')) {
            throw new Error('Please check your email inbox to confirm your address, or disable "Confirm email" in Supabase Auth settings.');
          }
          throw error;
        }
        if (data.user) {
          setSuccessMsg('Successfully signed in! Loading your dashboard...');
          setTimeout(() => {
            onSuccess();
          }, 600);
        }
      } else if (mode === 'signup') {
        const { error, data } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          setSuccessMsg('Account created and signed in! Loading your dashboard...');
          setTimeout(() => {
            onSuccess();
          }, 600);
        } else {
          setSuccessMsg('Account created! If email confirmation is enabled in your Supabase project, check your inbox. Otherwise, switch to "Sign In" now.');
          setMode('signin');
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
        if (error) throw error;
        setSuccessMsg('Password reset link sent! Please check your email inbox.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isConfigured) {
      setErrorMsg('Supabase is not configured yet. Please configure your credentials first.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setErrorMsg('Supabase client could not be initialized.');
      return;
    }

    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setGoogleLoading(false);
      setErrorMsg(
        'Google Sign-In is not enabled yet in your Supabase project. Please use Email/Password below or see setup steps.'
      );
      setGoogleHelpOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

      {/* Top Credentials Helper link */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onOpenCredentials}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>API &amp; Database Settings</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-fadeIn">
        {/* Brand Header */}
        <div className="px-8 pt-8 pb-5 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-indigo-500/25 text-white mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            TaskPulse
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {mode === 'signin' && 'Sign in to access your Meeting Task Manager'}
            {mode === 'signup' && 'Create an account to manage your team tasks'}
            {mode === 'forgot' && 'Reset your password to regain access'}
          </p>

          {/* Top Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition ${
                mode === 'signin'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
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
              className={`flex-1 py-1.5 rounded-lg transition ${
                mode === 'signup'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Database Notice if not configured */}
        {!isConfigured && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Supabase credentials not configured
            </span>
            <button
              onClick={onOpenCredentials}
              className="font-bold underline text-indigo-700 hover:text-indigo-900 shrink-0"
            >
              Add Keys
            </button>
          </div>
        )}

        <div className="p-7 space-y-4">
          {/* Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="leading-relaxed font-medium">{errorMsg}</p>
                {errorMsg.toLowerCase().includes('google') && (
                  <button
                    type="button"
                    onClick={() => setGoogleHelpOpen(true)}
                    className="mt-1.5 text-[11px] font-bold underline text-indigo-700 hover:text-indigo-900 block"
                  >
                    View 3-Step Google Setup Guide
                  </button>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign-In Button (shown for signin & signup) */}
          {mode !== 'forgot' && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {/* Official Google 'G' icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Requires Google enabled in Supabase</span>
                <button
                  type="button"
                  onClick={() => setGoogleHelpOpen(true)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Setup Guide</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  or use instant email &amp; password
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900 transition"
                />
              </div>
            </div>

            {/* Password (if not forgot mode) */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    minLength={6}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 shadow-md shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>
                {loading
                  ? 'Verifying...'
                  : mode === 'signin'
                  ? 'Sign In to Dashboard'
                  : mode === 'signup'
                  ? 'Create Admin Account'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
            {mode === 'signin' && (
              <p>
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Create One Free
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Sign In
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="font-bold text-indigo-600 hover:text-indigo-800"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google Setup Guide Modal */}
      {googleHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base">How to Enable Google Login</h3>
              </div>
              <button
                onClick={() => setGoogleHelpOpen(false)}
                className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                <p className="font-bold">Why did you see &quot;Unsupported provider&quot;?</p>
                <p className="mt-1 text-amber-900">
                  By default, Supabase only enables <strong>Email/Password</strong> authentication. Third-party providers like Google must be enabled in your Supabase dashboard with Google Cloud OAuth credentials.
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="font-bold text-slate-900">Choose your fastest path:</p>
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                  <p className="font-extrabold text-indigo-950">⚡ Fastest Option (Takes 10 seconds — Zero Google setup required):</p>
                  <p className="text-indigo-900">
                    Use <strong>Email &amp; Password</strong> on the login screen! Click <strong>&quot;Create Account&quot;</strong>, enter your email and password, and click <strong>Create Admin Account</strong>. You will be logged in immediately.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900">🔧 If you want Google Sign-In enabled in Supabase:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                    <li>
                      Go to your{' '}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 font-bold underline"
                      >
                        Supabase Dashboard <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </li>
                    <li>
                      In the left sidebar, click <strong>Authentication</strong> &gt; <strong>Providers</strong>
                    </li>
                    <li>
                      Click on <strong>Google</strong> and toggle <strong>&quot;Enable Google provider&quot;</strong>
                    </li>
                    <li>
                      Enter your Google <strong>Client ID</strong> and <strong>Client Secret</strong> (from Google Cloud Console), then click <strong>Save</strong>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setGoogleHelpOpen(false)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                >
                  Got It, Use Email/Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-slate-400">
        Protected with Supabase Authentication
      </p>
    </div>
  );
};
