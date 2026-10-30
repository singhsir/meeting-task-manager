'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Key, Eye, EyeOff, Save, CheckCircle2, Lock, ExternalLink, FileText } from 'lucide-react';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsUpdated: () => void;
  initialSupabaseUrl?: string;
  hasAnonKey?: boolean;
  hasOpenRouterKey?: boolean;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  onCredentialsUpdated,
  initialSupabaseUrl = '',
  hasAnonKey = false,
  hasOpenRouterKey = false,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(initialSupabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl,
          supabaseAnonKey,
          openrouterKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save credentials.');
      }

      setMessage({
        type: 'success',
        text: 'Credentials saved securely to your local .env.local file! Reloading connections...',
      });

      setTimeout(() => {
        onCredentialsUpdated();
        onClose();
      }, 1200);
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Error saving credentials.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                Secure Local Environment
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  Private & Safe
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Credentials are saved directly to your local <code className="text-amber-300">.env.local</code> file.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>Your keys never leave your machine:</strong> This form writes directly to your local Next.js environment file on your computer. Nothing is transmitted to external servers or logged in chat.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-200'
                  : 'bg-rose-100 text-rose-900 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Supabase URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Supabase Project URL
              </label>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Find in Supabase <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900 font-mono transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Found in Supabase: Project Settings &gt; API &gt; Project URL
            </p>
          </div>

          {/* Supabase Anon Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Supabase Anon (Public) Key
              </label>
              {hasAnonKey && !supabaseAnonKey && (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Already configured on disk
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showAnonKey ? 'text' : 'password'}
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder={hasAnonKey ? '••••••••••••••••••••••••••••••••' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900 font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowAnonKey(!showAnonKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Found in Supabase: Project Settings &gt; API &gt; Project API keys &gt; <code className="bg-slate-100 px-1 py-0.5 rounded">anon</code> <code className="bg-slate-100 px-1 py-0.5 rounded">public</code>
            </p>
          </div>

          {/* OpenRouter API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                OpenRouter API Key
              </label>
              {hasOpenRouterKey && !openrouterKey && (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Already configured on disk
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showOpenRouterKey ? 'text' : 'password'}
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                placeholder={hasOpenRouterKey ? '••••••••••••••••••••••••••••••••' : 'sk-or-v1-...'}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-900 font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showOpenRouterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Found at: <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-indigo-600 underline">openrouter.ai/keys</a> (secret key, never exposed to browser)
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Or edit <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env.local</code> in Notepad</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/20 transition disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving Securely...' : 'Save & Connect'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

