'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { Navbar } from '@/components/Navbar';
import { TranscriptInput } from '@/components/TranscriptInput';
import { StagingArea } from '@/components/StagingArea';
import { TaskBoard } from '@/components/TaskBoard';
import { CredentialsModal } from '@/components/CredentialsModal';
import { TeamManagerModal } from '@/components/TeamManagerModal';
import { AuthModal } from '@/components/AuthModal';
import { RlsHelperModal } from '@/components/RlsHelperModal';
import { getSupabase } from '@/lib/supabaseClient';
import { Task, StagedTask, TaskStatus } from '@/types';
import { ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const DEFAULT_TEAM = [
  'Alex Rivera',
  'Sarah Chen',
  'David Kim',
  'Maria Garcia',
  'James Wilson',
];

export default function HomePage() {
  // App Config & Auth state
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [openrouterReady, setOpenrouterReady] = useState(false);
  const [hasAnonKey, setHasAnonKey] = useState(false);
  const [hasOpenRouterKey, setHasOpenRouterKey] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [user, setUser] = useState<User | null>(null);

  // Modals state
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [rlsModalOpen, setRlsModalOpen] = useState(false);

  // Team list (Local Storage)
  const [teamMembers, setTeamMembers] = useState<string[]>(DEFAULT_TEAM);

  // Transcript & Note Input
  const [meetingTitle, setMeetingTitle] = useState('Meeting Notes');
  const [transcript, setTranscript] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Staging Area
  const [stagedTasks, setStagedTasks] = useState<StagedTask[]>([]);
  const [savingToBoard, setSavingToBoard] = useState(false);
  const stagingRef = useRef<HTMLDivElement>(null);

  // Task Board
  const [boardTasks, setBoardTasks] = useState<Task[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Check configuration status on mount
  const checkConfigStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/config-status');
      if (res.ok) {
        const data = await res.json();
        setSupabaseReady(data.supabaseReady);
        setOpenrouterReady(data.openrouterReady);
        setHasAnonKey(data.hasAnonKey);
        setHasOpenRouterKey(data.hasOpenRouterKey);
        if (data.supabaseUrl) setSupabaseUrl(data.supabaseUrl);
      }
    } catch (e) {
      console.error('Failed to check configuration:', e);
    }
  }, []);

  // 2. Load Team Members from Local Storage
  useEffect(() => {
    setMeetingTitle('Meeting - ' + new Date().toLocaleDateString());
    try {
      const saved = localStorage.getItem('meeting_team_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeamMembers(parsed);
        }
      }
    } catch {
      // ignore
    }
    checkConfigStatus();
  }, [checkConfigStatus]);

  // Update team in state + localStorage
  const handleUpdateTeam = (newTeam: string[]) => {
    setTeamMembers(newTeam);
    try {
      localStorage.setItem('meeting_team_members', JSON.stringify(newTeam));
    } catch {
      // ignore
    }
  };

  // 3. Supabase Auth listener & task fetcher
  const fetchBoardTasks = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      // Load from localStorage as fallback
      try {
        const local = localStorage.getItem('meeting_local_tasks');
        if (local) setBoardTasks(JSON.parse(local));
      } catch {
        // ignore
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching tasks from Supabase:', error.message);
        // Fallback to local tasks
        const local = localStorage.getItem('meeting_local_tasks');
        if (local) setBoardTasks(JSON.parse(local));
      } else if (data) {
        setBoardTasks(data as Task[]);
      }
    } catch (e) {
      console.error('Failed to load board tasks:', e);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) setUser(data.user);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
        fetchBoardTasks();
      });

      fetchBoardTasks();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      fetchBoardTasks();
    }
  }, [supabaseReady, fetchBoardTasks]);

  // Sign out handler
  const handleSignOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      showToast('Signed out successfully');
    }
  };

  // 4. Extract Tasks with OpenRouter AI via /api/extract
  const handleExtractTasks = async () => {
    if (!transcript.trim()) return;

    if (!openrouterReady) {
      setExtractError('OpenRouter API key is not configured. Click "Add API Key" below or in Credentials.');
      setCredentialsOpen(true);
      return;
    }

    setExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          teamMembers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract tasks.');
      }

      const tasks: StagedTask[] = (data.tasks || []).map((t: any) => ({
        id: 'staged_' + Math.random().toString(36).substr(2, 9),
        description: t.description || 'Action item',
        owner: t.owner && t.owner !== 'Unassigned' ? t.owner : teamMembers[0] || 'Unassigned',
        deadline: t.deadline || '',
        status: 'To Do',
      }));

      if (tasks.length === 0) {
        setExtractError('No specific action items were found in the provided transcript. Try pasting more notes.');
      } else {
        setStagedTasks(tasks);
        showToast(`AI extracted ${tasks.length} actionable tasks!`);
        setTimeout(() => {
          stagingRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err: any) {
      setExtractError(err.message || 'Error communicating with AI.');
    } finally {
      setExtracting(false);
    }
  };

  // 5. Save Staged Tasks to Supabase
  const handleSaveToBoard = async () => {
    if (stagedTasks.length === 0) return;
    setSavingToBoard(true);

    const supabase = getSupabase();

    try {
      if (supabase && supabaseReady) {
        // 1. Insert meeting into meetings table: id, created_at, title, raw_notes
        const { data: meetingData, error: meetingError } = await supabase
          .from('meetings')
          .insert([
            {
              title: meetingTitle || 'Meeting - ' + new Date().toLocaleDateString(),
              raw_notes: transcript || '',
            },
          ])
          .select()
          .single();

        if (meetingError) {
          console.warn('Meeting insert error:', meetingError.message);
          if (meetingError.message.toLowerCase().includes('row-level security') || meetingError.message.toLowerCase().includes('policy')) {
            setRlsModalOpen(true);
            throw new Error('Supabase meetings table permission error: ' + meetingError.message);
          }
        }

        const meetingId = meetingData?.id || null;

        // 2. Insert tasks into tasks table: id, created_at, meeting_id, description, owner, deadline, status
        const tasksToInsert = stagedTasks.map((st) => ({
          meeting_id: meetingId,
          description: st.description,
          owner: st.owner,
          deadline: st.deadline && st.deadline.trim() ? st.deadline.trim() : null,
          status: st.status,
        }));

        const { data: insertedTasks, error: tasksError } = await supabase
          .from('tasks')
          .insert(tasksToInsert)
          .select();

        if (tasksError) {
          if (tasksError.message.toLowerCase().includes('row-level security') || tasksError.message.toLowerCase().includes('policy')) {
            setRlsModalOpen(true);
          }
          throw new Error('Supabase task save error: ' + tasksError.message);
        }

        if (insertedTasks) {
          setBoardTasks((prev) => [...(insertedTasks as Task[]), ...prev]);
        } else {
          await fetchBoardTasks();
        }
      } else {
        // Fallback: local session save
        const newTasks: Task[] = stagedTasks.map((st) => ({
          id: 'task_' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          meeting_id: null,
          description: st.description,
          owner: st.owner,
          deadline: st.deadline,
          status: st.status,
        }));
        const updated = [...newTasks, ...boardTasks];
        setBoardTasks(updated);
        try {
          localStorage.setItem('meeting_local_tasks', JSON.stringify(updated));
        } catch {
          // ignore
        }
      }

      showToast(`Saved ${stagedTasks.length} tasks to your Board!`);
      setStagedTasks([]);
      setTranscript('');
      setMeetingTitle('Meeting - ' + new Date().toLocaleDateString());
    } catch (err: any) {
      if (err.message && (err.message.toLowerCase().includes('row-level security') || err.message.toLowerCase().includes('policy'))) {
        setRlsModalOpen(true);
      } else {
        alert('Error saving tasks: ' + err.message);
      }
    } finally {
      setSavingToBoard(false);
    }
  };

  // 6. Update task status in Supabase
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic UI update
    setBoardTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    const supabase = getSupabase();
    if (supabase && supabaseReady) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ status: newStatus })
          .eq('id', taskId);
        if (error) console.error('Status update error:', error.message);
      } catch (e) {
        console.error('Failed to update status in Supabase:', e);
      }
    } else {
      // Local storage update
      try {
        const updated = boardTasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        );
        localStorage.setItem('meeting_local_tasks', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  // 7. Delete task from Supabase
  const handleDeleteTask = async (taskId: string) => {
    setBoardTasks((prev) => prev.filter((t) => t.id !== taskId));

    const supabase = getSupabase();
    if (supabase && supabaseReady) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) console.error('Delete task error:', error.message);
      } catch (e) {
        console.error('Failed to delete in Supabase:', e);
      }
    } else {
      try {
        const updated = boardTasks.filter((t) => t.id !== taskId);
        localStorage.setItem('meeting_local_tasks', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-fadeIn border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenCredentials={() => setCredentialsOpen(true)}
        onOpenTeam={() => setTeamModalOpen(true)}
        supabaseReady={supabaseReady}
        openrouterReady={openrouterReady}
        teamCount={teamMembers.length}
      />

      {/* Setup Alert Banner if credentials missing */}
      {(!supabaseReady || !openrouterReady) && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-4 py-2.5 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>
                <strong>Setup Step:</strong> Connect your Supabase project and OpenRouter key to enable authentication, database persistence, and AI extraction.
              </span>
            </div>
            <button
              onClick={() => setCredentialsOpen(true)}
              className="px-3 py-1 rounded-lg bg-white text-slate-900 font-bold hover:bg-slate-100 transition shadow-xs shrink-0 cursor-pointer"
            >
              Configure Credentials Safely
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Meeting Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Meeting Action Items &amp; Task Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Upload Fireflies transcripts or meeting notes, let AI detect action items with assignees &amp; deadlines, and organize tasks on your sticky-note Kanban board.
            </p>
          </div>
        </div>

        {/* 1. Transcript & Note Input Section */}
        <section>
          <TranscriptInput
            meetingTitle={meetingTitle}
            setMeetingTitle={setMeetingTitle}
            transcript={transcript}
            setTranscript={setTranscript}
            onExtractTasks={handleExtractTasks}
            loading={extracting}
            error={extractError}
            onOpenCredentials={() => setCredentialsOpen(true)}
            teamCount={teamMembers.length}
          />
        </section>

        {/* 2. Staging Area (Visible after AI extraction) */}
        {stagedTasks.length > 0 && (
          <section ref={stagingRef}>
            <StagingArea
              tasks={stagedTasks}
              setTasks={setStagedTasks}
              teamMembers={teamMembers}
              onSaveToBoard={handleSaveToBoard}
              saving={savingToBoard}
              onDiscard={() => setStagedTasks([])}
              supabaseReady={supabaseReady}
              onOpenCredentials={() => setCredentialsOpen(true)}
            />
          </section>
        )}

        {/* 3. Task Board Section */}
        <section className="pt-2">
          <TaskBoard
            tasks={boardTasks}
            onUpdateStatus={handleUpdateStatus}
            onDeleteTask={handleDeleteTask}
            teamMembers={teamMembers}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <p>Meeting Task Manager • Next.js, Supabase, Tailwind CSS &amp; OpenRouter AI</p>
      </footer>

      {/* Modals */}
      <CredentialsModal
        isOpen={credentialsOpen}
        onClose={() => setCredentialsOpen(false)}
        onCredentialsUpdated={checkConfigStatus}
        initialSupabaseUrl={supabaseUrl}
        hasAnonKey={hasAnonKey}
        hasOpenRouterKey={hasOpenRouterKey}
      />

      <TeamManagerModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        teamMembers={teamMembers}
        onUpdateTeam={handleUpdateTeam}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          checkConfigStatus();
          fetchBoardTasks();
        }}
        onNeedCredentials={() => setCredentialsOpen(true)}
        isConfigured={supabaseReady}
      />

      <RlsHelperModal
        isOpen={rlsModalOpen}
        onClose={() => setRlsModalOpen(false)}
        onRetry={handleSaveToBoard}
      />
    </div>
  );
}
