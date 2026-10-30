'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, Copy, Check, ExternalLink, Terminal, CheckCircle2 } from 'lucide-react';

interface RlsHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export const RlsHelperModal: React.FC<RlsHelperModalProps> = ({
  isOpen,
  onClose,
  onRetry,
}) => {
  const [copiedQuick, setCopiedQuick] = useState(false);
  const [copiedPolicies, setCopiedPolicies] = useState(false);

  if (!isOpen) return null;

  const quickSql = `-- 10-Second Fix: Disable RLS for MVP
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;`;

  const policySql = `-- Alternative: Enable Public Policies
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on meetings" ON meetings FOR ALL USING (true) WITH CHECK (true);`;

  const handleCopy = (text: string, type: 'quick' | 'policy') => {
    navigator.clipboard.writeText(text);
    if (type === 'quick') {
      setCopiedQuick(true);
      setTimeout(() => setCopiedQuick(false), 2500);
    } else {
      setCopiedPolicies(true);
      setTimeout(() => setCopiedPolicies(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-900 via-rose-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                Fix Supabase Row-Level Security (RLS)
              </h3>
              <p className="text-xs text-rose-200">
                Supabase blocks saves until table permissions are enabled for your app.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-xl p-1.5 hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* Explanation Alert */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Why did this error happen?</p>
              <p className="text-xs leading-relaxed text-amber-900">
                When you create tables in Supabase, PostgreSQL turns on <strong>Row Level Security (RLS)</strong> by default. This blocks all inserts and queries from your app until you give permissions.
              </p>
            </div>
          </div>

          {/* Quick Solution (Recommended) */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-slate-900">Recommended 10-Second Fix (Disable RLS for MVP)</span>
              </div>
              <button
                onClick={() => handleCopy(quickSql, 'quick')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
              >
                {copiedQuick ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL Query</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-xs overflow-x-auto">
              <pre>{quickSql}</pre>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-1.5 pt-1 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">How to run this in 3 clicks:</p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>
                  Open your{' '}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 font-bold underline inline-flex items-center gap-0.5"
                  >
                    Supabase Dashboard <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </li>
                <li>
                  Click <strong>SQL Editor</strong> on the left sidebar (looks like <Terminal className="w-3 h-3 inline text-slate-500" />)
                </li>
                <li>
                  Click <strong>New query</strong>, paste the copied SQL, and click <strong>Run</strong> (or press <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[10px]">Ctrl+Enter</kbd>)
                </li>
              </ol>
            </div>
          </div>

          {/* Alternative 2: Keep RLS enabled with Public Policies */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="font-bold text-slate-900">Alternative: Keep RLS On &amp; Add Open Access Policies</span>
              </div>
              <button
                onClick={() => handleCopy(policySql, 'policy')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
              >
                {copiedPolicies ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Policies</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative bg-slate-900 text-slate-100 rounded-xl p-3.5 font-mono text-xs overflow-x-auto">
              <pre>{policySql}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">Run the SQL in Supabase, then try again.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onRetry();
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Ran the SQL — Save Tasks Now!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

