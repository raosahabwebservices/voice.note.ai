import React, { useState } from 'react';
import { BookOpen, FileText, GitBranch, Database, FolderTree, Cpu, Map, CheckSquare } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'prd' | 'userflow' | 'schema' | 'structure' | 'api' | 'roadmap' | 'priority'>('prd');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Product Blueprint & Architecture</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">VoiceNotes AI - Complete MVP Documentation</h1>
          <p className="text-slate-400 text-sm mt-1">
            Senior SaaS Architect & Product Manager specification for VoiceNotes AI.
          </p>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 border-b border-slate-800/80">
        {[
          { id: 'prd', label: '1. PRD', icon: FileText },
          { id: 'userflow', label: '2. User Flow', icon: GitBranch },
          { id: 'schema', label: '3. DB Schema', icon: Database },
          { id: 'structure', label: '4. Folder Structure', icon: FolderTree },
          { id: 'api', label: '5. API Design', icon: Cpu },
          { id: 'roadmap', label: '6. Roadmap', icon: Map },
          { id: 'priority', label: '7. Feature Priority', icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeSubTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-300 space-y-6">
        {activeSubTab === 'prd' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">Product Requirements Document (PRD)</h2>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-400">1. Executive Summary</h3>
              <p className="text-sm leading-relaxed">
                VoiceNotes AI is an advanced AI-powered SaaS platform designed to convert unstructured voice recordings (lectures, meetings, investor pitches, and creator brainstorms) into highly structured, searchable smart notes with automatic Speech-to-Text, Executive Summaries, Key Points, Action Items, Deadlines, and Question Extractors.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-400">2. Target Personas</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><strong>Students:</strong> Record lectures and study groups; auto-extract study notes, key formulas, and exam prep dates.</li>
                <li><strong>Entrepreneurs:</strong> Record founder syncs and pitch feedback; auto-extract investor action items and financial milestones.</li>
                <li><strong>Professionals:</strong> Record client meetings and product roadmaps; auto-extract assignee tasks, SOC2 deadlines, and follow-ups.</li>
                <li><strong>Content Creators:</strong> Record brainstorms and sponsor reads; auto-extract video script hooks and publishing timelines.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-indigo-400">3. Core Functional Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>Browser-based audio recording via MediaRecorder API with pause/resume and waveform timer.</li>
                <li>Multi-format audio file upload (MP3, WAV, M4A, WebM) and raw transcript pasting.</li>
                <li>Server-side AI processing using Gemini 3.6 Flash multimodal capabilities (`@google/genai`).</li>
                <li>Structured JSON output extraction for summaries, key points, interactive checklist action items, deadlines, and questions.</li>
                <li>Robust search, category filtering (Student, Entrepreneur, Professional, Creator), and tag indexing.</li>
                <li>Export options: Download as formatted TXT, PDF/Print view, and instant clipboard copy.</li>
              </ul>
            </div>
          </div>
        )}

        {activeSubTab === 'userflow' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">User Flow Diagram</h2>
            
            <div className="space-y-4">
              <p className="text-sm leading-relaxed">
                The user journey is engineered for minimum friction and maximum cognitive clarity (Apple + OpenAI + Linear inspired).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">1</div>
                  <h4 className="font-semibold text-white">Capture / Input</h4>
                  <p className="text-xs text-slate-400">User clicks "Record Voice" or uploads an audio file (mp3/wav/m4a) or pastes raw transcript.</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">2</div>
                  <h4 className="font-semibold text-white">AI Processing</h4>
                  <p className="text-xs text-slate-400">Audio base64 is sent securely to Express backend and processed via Gemini 3.6 Flash multimodal SDK.</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">3</div>
                  <h4 className="font-semibold text-white">Structured View</h4>
                  <p className="text-xs text-slate-400">Note opens in modal with interactive checklists, summaries, key points, deadlines, and verbatim transcript.</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">4</div>
                  <h4 className="font-semibold text-white">Export & Action</h4>
                  <p className="text-xs text-slate-400">User checks off completed tasks, downloads as PDF/TXT, or searches archive instantly.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'schema' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">Database Schema (TypeScript / Firestore Blueprint)</h2>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Data model designed for persistent local/cloud synchronization:</p>
              <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
{`interface SmartNote {
  id: string;                    // Unique UUID
  title: string;                 // Note title (max 8 words)
  category: 'Student' | 'Entrepreneur' | 'Professional' | 'Content Creator' | 'General';
  tags: string[];                // Array of searchable tags
  summary: string;               // Executive summary
  transcript: string;            // Verbatim STT transcript
  keyPoints: string[];           // Bullet points
  actionItems: {
    task: string;
    assignee?: string;
    completed: boolean;
    dueDate?: string;
  }[];
  deadlines: {
    event: string;
    date: string;
  }[];
  questions: string[];           // Extracted questions
  audioDurationSeconds: number;  // Duration in seconds
  createdAt: string;             // ISO timestamp
  audioUrl?: string;             // Blob URL or storage reference
  sourceType: 'recording' | 'upload' | 'text' | 'sample';
}`}
              </pre>
            </div>
          </div>
        )}

        {activeSubTab === 'structure' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">Folder Structure</h2>
            
            <pre className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs font-mono text-cyan-400 overflow-x-auto">
{`/
├── server.ts                 # Express backend with Gemini 3.6 Flash integration
├── package.json              # Project dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── metadata.json             # App capability & permissions manifest
├── .env.example              # Environment variables template
└── src/
    ├── main.tsx              # React entry point
    ├── index.css             # Tailwind CSS global styles
    ├── types.ts              # Global TypeScript interfaces
    ├── data/
    │   └── sampleNotes.ts    # Rich initial sample notes for 4 personas
    └── components/
        ├── Navbar.tsx        # Top navigation & metrics header
        ├── DashboardView.tsx # Analytics dashboard & quick actions
        ├── NotesListView.tsx # Searchable smart notes library & filters
        ├── NoteDetailModal.tsx# Comprehensive note viewer & export tools
        ├── RecordAudioView.tsx# Browser MediaRecorder voice capture
        ├── UploadAudioView.tsx# Audio file upload & raw text import
        └── DocumentationView.tsx# PRD & architecture specifications
`}
            </pre>
          </div>
        )}

        {activeSubTab === 'api' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">API Design</h2>
            
            <div className="space-y-4 text-sm">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">POST</span>
                  <code className="text-white font-mono">/api/notes/generate-audio</code>
                </div>
                <p className="text-xs text-slate-400">Accepts base64 audio data, mimeType, and custom title. Returns structured JSON summary, transcript, action items, and key points via Gemini 3.6 Flash.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">POST</span>
                  <code className="text-white font-mono">/api/notes/generate-text</code>
                </div>
                <p className="text-xs text-slate-400">Accepts raw transcript text and custom title. Returns structured smart note JSON.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">GET</span>
                  <code className="text-white font-mono">/api/health</code>
                </div>
                <p className="text-xs text-slate-400">Server health check endpoint.</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'roadmap' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">Development Roadmap</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-600/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">✓</span>
                <div>
                  <h4 className="font-semibold text-white">Phase 1: MVP Core (Completed)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Browser voice recording, audio file upload, Gemini 3.6 Flash STT + smart note extraction, dashboard metrics, search, and export.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-semibold text-white">Phase 2: Cloud Sync & Team Collaboration</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Firestore cloud database integration, user authentication, shareable note links, and real-time team comments on action items.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-semibold text-white">Phase 3: Integrations & Extensions</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Google Calendar sync for extracted deadlines, Notion / Slack webhook integrations, and browser extension for direct web page voice dictation.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'priority' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3">Feature Priority Matrix (RICE / MoSCoW)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-semibold text-emerald-400">Must Have (P0 - MVP)</h3>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300">
                  <li>Browser Voice Recorder (MediaRecorder API)</li>
                  <li>Audio File Upload (mp3, wav, m4a, webm)</li>
                  <li>AI Speech-to-Text & Executive Summaries</li>
                  <li>Key Points, Action Items & Deadlines Extraction</li>
                  <li>Search & Category Filtering</li>
                  <li>Export as TXT & PDF / Print view</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-semibold text-indigo-400">Should Have (P1)</h3>
                <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300">
                  <li>Cloud persistence (Firestore database)</li>
                  <li>User accounts & secure auth</li>
                  <li>Calendar sync for deadlines</li>
                  <li>Shareable public note links</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
