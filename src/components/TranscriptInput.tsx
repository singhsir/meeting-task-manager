'use client';

import React, { useState, useRef } from 'react';
import { Upload, Sparkles, FileText, Loader2, AlertCircle, Wand2, Lightbulb } from 'lucide-react';

interface TranscriptInputProps {
  meetingTitle: string;
  setMeetingTitle: (title: string) => void;
  transcript: string;
  setTranscript: (text: string) => void;
  onExtractTasks: () => void;
  loading: boolean;
  error: string | null;
  onOpenCredentials: () => void;
  teamCount: number;
}

export const TranscriptInput: React.FC<TranscriptInputProps> = ({
  meetingTitle,
  setMeetingTitle,
  transcript,
  setTranscript,
  onExtractTasks,
  loading,
  error,
  onOpenCredentials,
  teamCount,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileNotice, setFileNotice] = useState<string | null>(null);

  // File Upload via FileReader for Fireflies Transcript (.txt or .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      let formattedText = content;

      // If CSV (Fireflies CSV often has columns: Speaker, Timestamp, Sentence)
      if (file.name.endsWith('.csv')) {
        try {
          const lines = content.split(/[\r\n]+/);
          const parsedLines: string[] = [];

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV split (handling quoted strings)
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) =>
              p.replace(/^["']|["']$/g, '').trim()
            );

            if (i === 0 && parts.some((p) => p.toLowerCase().includes('speaker') || p.toLowerCase().includes('time'))) {
              // Header line, skip
              continue;
            }

            if (parts.length >= 3) {
              // Speaker, Time, Text
              const speaker = parts[0] || 'Unknown';
              const time = parts[1] || '';
              const text = parts.slice(2).join(' ');
              parsedLines.push(`[${time}] ${speaker}: ${text}`);
            } else if (parts.length === 2) {
              parsedLines.push(`${parts[0]}: ${parts[1]}`);
            } else {
              parsedLines.push(parts[0]);
            }
          }

          if (parsedLines.length > 0) {
            formattedText = parsedLines.join('\n');
          }
        } catch {
          // If custom csv parsing fails, fallback to raw text
          formattedText = content;
        }
      }

      setTranscript(formattedText);

      // Auto-set meeting title if default
      if (!meetingTitle || meetingTitle.startsWith('Meeting -')) {
        const cleanName = file.name.replace(/\.(txt|csv)$/i, '').replace(/[-_]/g, ' ');
        setMeetingTitle(cleanName);
      }

      setFileNotice(`Loaded "${file.name}" (${formattedText.length.toLocaleString()} characters)`);
      setTimeout(() => setFileNotice(null), 4000);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  // Sample transcript for instant MVP testing
  const handleLoadSample = () => {
    setMeetingTitle('Q4 Product Sprint & Launch Strategy');
    setTranscript(`Sarah Chen: Alright everyone, thanks for joining. Let's do a fast sync on our deliverables for next Friday, November 7th.
Alex Rivera: I've started the Supabase schema migrations for the user profiles and task boards. I need to finish the automated indexes and test the queries by Tuesday, November 4th.
David Kim: Great. Sarah, can you review the new UI color scheme and accessibility contrast ratios by Thursday, November 6th?
Sarah Chen: Yes, absolutely. I will finalize the design review and update Figma. Also, David, can you prepare the client staging environment and deploy the Next.js preview build before Wednesday, November 5th?
David Kim: Will do. Maria, could you compile the documentation for the API routes and post it to Confluence by Friday?
Maria Garcia: Sure thing! I'll document the endpoints and error responses.
Sarah Chen: Perfect. Alex, let's also schedule the penetration test run for November 10th. Let's make sure all action items are tracked!`);
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 relative overflow-hidden">
      {/* Decorative colored top border */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Meeting Notes & Transcript
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your Fireflies transcript or paste raw meeting notes. AI will extract actionable tasks automatically.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.csv"
            className="hidden"
          />

          {/* Upload Fireflies Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload Fireflies Transcript (.txt or .csv)</span>
          </button>

          {/* Quick Demo Sample */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition"
            title="Load sample meeting transcript to test instantly"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Load Sample</span>
          </button>
        </div>
      </div>

      {fileNotice && (
        <div className="mb-4 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>{fileNotice}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Task Extraction Failed</p>
              <p className="mt-0.5 text-rose-800">{error}</p>
            </div>
          </div>
          {error.includes('OpenRouter') && (
            <button
              onClick={onOpenCredentials}
              className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition shrink-0"
            >
              Add API Key
            </button>
          )}
        </div>
      )}

      {/* Meeting Title input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Meeting Title
        </label>
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="e.g. Weekly Product Sync - Oct 30"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold text-slate-900 placeholder:text-slate-400"
        />
      </div>

      {/* Textarea for Notes */}
      <div className="relative mb-4">
        <textarea
          rows={7}
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste meeting transcript or notes here, or click 'Upload Fireflies Transcript (.txt or .csv)' above..."
          className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs sm:text-sm text-slate-800 font-mono leading-relaxed resize-y bg-slate-50/50 focus:bg-white transition"
        />
        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 px-1">
          <span>{wordCount} words • {transcript.length.toLocaleString()} characters</span>
          <span>Team Roster: <strong className="text-slate-600">{teamCount} members</strong></span>
        </div>
      </div>

      {/* Footer with Extract Tasks Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-purple-600" />
          <span>AI will extract: <strong>Tasks, Assignee &amp; Deadlines</strong></span>
        </div>

        <button
          type="button"
          onClick={onExtractTasks}
          disabled={loading || !transcript.trim()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing with OpenRouter AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition" />
              <span>Extract Tasks with AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

