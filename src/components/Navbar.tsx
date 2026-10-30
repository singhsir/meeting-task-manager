'use client';

import React from 'react';
import { Sparkles, KeyRound, Users, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenCredentials: () => void;
  onOpenTeam: () => void;
  supabaseReady: boolean;
  openrouterReady: boolean;
  teamCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onSignOut,
  onOpenCredentials,
  onOpenTeam,
  supabaseReady,
  openrouterReady,
  teamCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white font-bold">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 bg-clip-text text-transparent">
                  TaskPulse
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xs">
                  AI MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Meeting Transcript to Action Board</p>
            </div>
          </div>

          {/* Quick status & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Team Members Button */}
            <button
              onClick={onOpenTeam}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Manage team members for task assignment"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Team</span>
              <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                {teamCount}
              </span>
            </button>

            {/* Credentials / Status Button */}
            <button
              onClick={onOpenCredentials}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                supabaseReady && openrouterReady
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100 animate-pulse'
              }`}
              title="Configure API and Database Keys"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Credentials & Keys</span>
              {supabaseReady && openrouterReady ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                  <AlertCircle className="w-3 h-3" /> Setup Needed
                </span>
              )}
            </button>

            {/* Auth Button / Profile */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-xs uppercase"
                  title={user.email || 'User'}
                >
                  {user.email?.charAt(0) || 'U'}
                </div>
                <button
                  onClick={onSignOut}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1 rounded transition"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

