'use client';

import React from 'react';
import { Check, Plus, Trash2, Calendar, User, ListChecks, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StagedTask, TaskStatus } from '@/types';

interface StagingAreaProps {
  tasks: StagedTask[];
  setTasks: React.Dispatch<React.SetStateAction<StagedTask[]>>;
  teamMembers: string[];
  onSaveToBoard: () => Promise<void>;
  saving: boolean;
  onDiscard: () => void;
  supabaseReady: boolean;
  onOpenCredentials: () => void;
}

export const StagingArea: React.FC<StagingAreaProps> = ({
  tasks,
  setTasks,
  teamMembers,
  onSaveToBoard,
  saving,
  onDiscard,
  supabaseReady,
  onOpenCredentials,
}) => {
  if (tasks.length === 0) return null;

  const handleUpdateTask = (id: string, updates: Partial<StagedTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddTask = () => {
    const newTask: StagedTask = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      description: '',
      owner: teamMembers[0] || 'Unassigned',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'To Do',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleSaveWithCelebration = async () => {
    await onSaveToBoard();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#ec4899', '#f59e0b', '#10b981'],
      });
    } catch {
      // ignore confetti errors
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/50 rounded-2xl border-2 border-indigo-200/80 shadow-lg p-6 sm:p-7 relative animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-indigo-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Review &amp; Stage Action Items
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-xs">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Edit descriptions, select owners from your team roster, and set deadlines before pushing to your Task Board.
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddTask}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-800 transition"
          >
            Discard
          </button>
        </div>
      </div>

      {!supabaseReady && (
        <div className="mt-4 p-3 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Note:</strong> Supabase is not connected yet. Tasks will be saved locally in this session until you connect Supabase!
            </span>
          </div>
          <button
            onClick={onOpenCredentials}
            className="font-bold underline text-indigo-800 hover:text-indigo-950 shrink-0"
          >
            Connect Supabase
          </button>
        </div>
      )}

      {/* Task List */}
      <div className="mt-5 space-y-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="bg-white rounded-xl border border-indigo-100/90 shadow-sm p-4 hover:shadow-md transition flex flex-col md:flex-row md:items-center gap-3 group"
          >
            {/* Number indicator */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
            </div>

            {/* Description (editable) */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={task.description}
                onChange={(e) => handleUpdateTask(task.id, { description: e.target.value })}
                placeholder="What needs to be done?"
                className="w-full px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition"
              />
            </div>

            {/* Owner Dropdown (from LocalStorage Team List) */}
            <div className="w-full md:w-44 shrink-0">
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <select
                  value={task.owner}
                  onChange={(e) => handleUpdateTask(task.id, { owner: e.target.value })}
                  className="w-full pl-8 pr-7 py-2 text-xs font-semibold text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
                >
                  <option value="Unassigned">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deadline (editable date picker) */}
            <div className="w-full md:w-36 shrink-0">
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={task.deadline || ''}
                  onChange={(e) => handleUpdateTask(task.id, { deadline: e.target.value })}
                  className="w-full pl-8 pr-2 py-1.5 text-xs text-slate-700 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Initial Status selector */}
            <div className="w-full md:w-32 shrink-0">
              <select
                value={task.status}
                onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as TaskStatus })}
                className="w-full px-2.5 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer"
              >
                <option value="To Do">🔴 To Do</option>
                <option value="In Progress">🟡 In Progress</option>
                <option value="Done">🟢 Done</option>
              </select>
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => handleDeleteTask(task.id)}
              className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition self-end md:self-center"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer with Save to Board Button */}
      <div className="mt-6 pt-5 border-t border-indigo-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          Ready to track? Saving will store this meeting in <code className="bg-white/80 px-1 py-0.5 rounded border border-indigo-200">meetings</code> and populate <code className="bg-white/80 px-1 py-0.5 rounded border border-indigo-200">tasks</code>.
        </p>

        <button
          type="button"
          onClick={handleSaveWithCelebration}
          disabled={saving || tasks.length === 0}
          className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <span>Saving to Board...</span>
          ) : (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save {tasks.length} Tasks to Board</span>
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

