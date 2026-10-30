'use client';

import React, { useState, useRef } from 'react';
import { X, Users, Upload, Plus, Trash2, CheckCircle2, UserCheck } from 'lucide-react';

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMembers: string[];
  onUpdateTeam: (newTeam: string[]) => void;
}

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  isOpen,
  onClose,
  teamMembers,
  onUpdateTeam,
}) => {
  const [newName, setNewName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Add a single member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newName.trim();
    if (!clean) return;

    if (teamMembers.includes(clean)) {
      setFeedback(`"${clean}" is already in your team list.`);
      return;
    }

    const updated = [...teamMembers, clean];
    onUpdateTeam(updated);
    setNewName('');
    setFeedback(`Added "${clean}" to team.`);
    setTimeout(() => setFeedback(null), 2500);
  };

  // Remove member
  const handleRemoveMember = (nameToRemove: string) => {
    const updated = teamMembers.filter((m) => m !== nameToRemove);
    onUpdateTeam(updated);
  };

  // File Upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const extractedNames: string[] = [];
      const lines = content.split(/[\r\n]+/);

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Skip obvious header rows
        const lower = trimmed.toLowerCase();
        if (
          lower === 'name' ||
          lower === 'full name' ||
          lower === 'first name' ||
          lower === 'team member' ||
          lower === 'members'
        ) {
          continue;
        }

        // Check if CSV format (contains commas)
        if (trimmed.includes(',')) {
          const parts = trimmed.split(',').map((p) => p.replace(/^["']|["']$/g, '').trim());
          for (const p of parts) {
            if (p && !p.includes('@') && isNaN(Number(p)) && p.length > 1) {
              extractedNames.push(p);
            }
          }
        } else {
          // Plain TXT line
          const clean = trimmed.replace(/^["']|["']$/g, '').trim();
          if (clean && !clean.includes('@') && isNaN(Number(clean))) {
            extractedNames.push(clean);
          }
        }
      }

      // Merge unique names with existing
      const combined = Array.from(new Set([...teamMembers, ...extractedNames]));
      onUpdateTeam(combined);
      setFeedback(`Imported ${extractedNames.length} names from "${file.name}"!`);
      setTimeout(() => setFeedback(null), 3000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Team Members Roster</h3>
              <p className="text-xs text-indigo-200">
                Persisted in your browser&apos;s Local Storage for task assignments
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

        {/* Upload Button Section */}
        <div className="p-6 pb-3 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.csv"
            className="hidden"
          />
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Team List (.txt or .csv)</span>
            </button>
            <span className="text-xs text-slate-400 font-medium">OR add manually</span>
          </div>

          {/* Quick manual add input */}
          <form onSubmit={handleAddMember} className="mt-3 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {feedback && (
            <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Member List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3">
            <span>SAVED MEMBERS ({teamMembers.length})</span>
            <span className="text-[11px] text-slate-400">Available in Owner dropdowns</span>
          </div>

          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <UserCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p>No team members uploaded yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Upload a .txt/.csv file or type names above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {teamMembers.map((member) => (
                <div
                  key={member}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 transition group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 uppercase">
                      {member.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 truncate">{member}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition opacity-60 group-hover:opacity-100"
                    title={`Remove ${member}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Synced with Local Storage</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

