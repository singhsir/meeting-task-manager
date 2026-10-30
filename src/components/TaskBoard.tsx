'use client';

import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  Inbox,
  Filter,
} from 'lucide-react';
import { Task, TaskStatus } from '@/types';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  teamMembers: string[];
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onUpdateStatus,
  onDeleteTask,
  teamMembers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOwner =
      selectedOwner === 'all' || task.owner.toLowerCase() === selectedOwner.toLowerCase();
    return matchesSearch && matchesOwner;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'Done');

  const getOwnerColor = (name: string) => {
    const colors = [
      'from-rose-500 to-pink-500',
      'from-indigo-500 to-purple-500',
      'from-blue-500 to-cyan-500',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-purple-500 to-violet-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  const renderStickyTaskCard = (task: Task) => {
    // Dynamic border & accent based on status
    const isTodo = task.status === 'To Do';
    const isInProgress = task.status === 'In Progress';
    const isDone = task.status === 'Done';

    return (
      <div
        key={task.id}
        className={`group relative rounded-2xl p-5 border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 bg-white flex flex-col justify-between ${
          isTodo
            ? 'border-rose-200/90 shadow-rose-500/5 hover:border-rose-300'
            : isInProgress
            ? 'border-amber-200/90 shadow-amber-500/5 hover:border-amber-300'
            : 'border-emerald-200/90 shadow-emerald-500/5 hover:border-emerald-300 opacity-95'
        }`}
      >
        {/* Sticky note top colored tab strip */}
        <div
          className={`absolute top-0 left-6 right-6 h-1 rounded-b-md ${
            isTodo
              ? 'bg-gradient-to-r from-rose-500 to-red-500'
              : isInProgress
              ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          }`}
        />

        {/* Card Header & Delete */}
        <div className="flex items-start justify-between gap-2 mb-3">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
              isTodo
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : isInProgress
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isTodo ? 'bg-rose-500' : isInProgress ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            {task.status}
          </span>

          {/* Delete Action */}
          <button
            onClick={() => onDeleteTask(task.id)}
            className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
            title="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Task Description */}
        <p
          className={`text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed mb-4 flex-1 ${
            isDone ? 'line-through text-slate-400' : ''
          }`}
        >
          {task.description}
        </p>

        {/* Metadata: Owner & Deadline */}
        <div className="pt-3 border-t border-slate-100/90 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Owner pill */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 max-w-[150px]">
            <div
              className={`w-4 h-4 rounded-full bg-gradient-to-tr ${getOwnerColor(
                task.owner
              )} text-white text-[9px] font-bold flex items-center justify-center shrink-0 uppercase`}
            >
              {task.owner.charAt(0) || 'U'}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 truncate" title={task.owner}>
              {task.owner}
            </span>
          </div>

          {/* Deadline pill */}
          {task.deadline && (
            <div
              className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/80"
              title="Target Deadline"
            >
              <Calendar className="w-3 h-3 text-indigo-500" />
              <span>{task.deadline}</span>
            </div>
          )}
        </div>

        {/* Transition Buttons */}
        <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
          {isTodo && (
            <button
              onClick={() => onUpdateStatus(task.id, 'In Progress')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
              title="Start task"
            >
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {isInProgress && (
            <>
              <button
                onClick={() => onUpdateStatus(task.id, 'To Do')}
                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                title="Move back to To Do"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>To Do</span>
              </button>
              <button
                onClick={() => onUpdateStatus(task.id, 'Done')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                title="Mark as completed"
              >
                <span>Done</span>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              </button>
            </>
          )}

          {isDone && (
            <button
              onClick={() => onUpdateStatus(task.id, 'In Progress')}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title="Reopen task"
            >
              <span>Reopen</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Board Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Action Items Board</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {tasks.length} total
            </span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks or owners..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          {/* Owner Filter Dropdown */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white cursor-pointer"
            >
              <option value="all">All Owners</option>
              {teamMembers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty State when no tasks exist at all */}
      {tasks.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-10 sm:p-14 text-center shadow-xs">
          {/* Clean, friendly graphic */}
          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100 transform rotate-6 animate-pulse" />
            <div className="relative w-full h-full rounded-3xl bg-white border border-slate-200 flex items-center justify-center shadow-md">
              <Inbox className="w-10 h-10 text-indigo-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Your Task Board is Ready!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            No tasks have been added yet. Upload your Fireflies meeting transcript above or click <strong>&quot;Load Sample&quot;</strong> to watch AI extract actionable tasks instantly.
          </p>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-Powered Extraction with OpenRouter</span>
          </div>
        </div>
      ) : (
        /* 3-Column Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column 1: TO DO */}
          <div className="bg-slate-50/70 rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col min-h-[450px]">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-rose-200/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">To Do</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                {todoTasks.length}
              </span>
            </div>

            {/* Tasks list */}
            <div className="space-y-3.5 flex-1">
              {todoTasks.map((t) => renderStickyTaskCard(t))}
              {todoTasks.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/40">
                  <Clock className="w-5 h-5 text-slate-300 mb-1" />
                  <span>No to-dos right now</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: IN PROGRESS */}
          <div className="bg-slate-50/70 rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col min-h-[450px]">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-amber-200/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">In Progress</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                {inProgressTasks.length}
              </span>
            </div>

            {/* Tasks list */}
            <div className="space-y-3.5 flex-1">
              {inProgressTasks.map((t) => renderStickyTaskCard(t))}
              {inProgressTasks.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/40">
                  <Sparkles className="w-5 h-5 text-slate-300 mb-1" />
                  <span>Nothing in progress</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: DONE */}
          <div className="bg-slate-50/70 rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col min-h-[450px]">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-emerald-200/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">Completed</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                {doneTasks.length}
              </span>
            </div>

            {/* Tasks list */}
            <div className="space-y-3.5 flex-1">
              {doneTasks.map((t) => renderStickyTaskCard(t))}
              {doneTasks.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-white/40">
                  <CheckCircle2 className="w-5 h-5 text-slate-300 mb-1" />
                  <span>No completed tasks yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

