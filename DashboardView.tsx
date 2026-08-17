import React from 'react';
import { SmartNote, ActiveTab, UserProfile } from '../types';
import { Sparkles, Mic, Upload, FileText, Clock, CheckCircle2, ArrowRight, Brain, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardViewProps {
  notes: SmartNote[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectNote: (note: SmartNote) => void;
  currentUser: UserProfile;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  notes,
  setActiveTab,
  onSelectNote,
  currentUser,
}) => {
  const totalNotes = notes.length;
  const totalSeconds = notes.reduce((acc, note) => acc + (note.audioDurationSeconds || 0), 0);
  const totalMinutes = (totalSeconds / 60).toFixed(1);

  const allActionItems = notes.flatMap(n => n.actionItems || []);
  const completedActions = allActionItems.filter(a => a.completed).length;
  const pendingActions = allActionItems.length - completedActions;

  const categoryCounts = notes.reduce((acc, note) => {
    acc[note.category] = (acc[note.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentNotes = [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  // Compute last 7 days productivity data
  const getLast7DaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const displayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      days.push({ dateStr, label: displayLabel, count: 0, minutes: 0 });
    }

    notes.forEach(note => {
      const noteDateStr = new Date(note.createdAt).toISOString().split('T')[0];
      const found = days.find(d => d.dateStr === noteDateStr);
      if (found) {
        found.count += 1;
        found.minutes += Math.round((note.audioDurationSeconds || 0) / 60);
      }
    });

    return days;
  };

  const chartData = getLast7DaysData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn bg-slate-50 min-h-screen text-slate-900">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/25 text-white text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Audio Intelligence Engine Active</span>
              </div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-bold shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-900" />
                <span>Plan: {currentUser.plan} Active 🌟</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-amber-200">{currentUser.name}</span>!
            </h1>
            <p className="text-indigo-100 max-w-2xl text-sm sm:text-base font-medium">
              Transform lectures, meetings, interviews, and brainstorms into crystal-clear executive summaries, searchable transcripts, and actionable deadlines instantly.
            </p>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('record')}
              className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-white text-blue-600 hover:bg-slate-100 px-5 py-3 rounded-xl font-bold shadow-md transition-all hover:scale-105"
            >
              <Mic className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Record Voice</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-blue-900/40 hover:bg-blue-900/60 text-white px-5 py-3 rounded-xl font-medium border border-white/20 backdrop-blur-md transition-all"
            >
              <Upload className="w-4 h-4 text-cyan-300" />
              <span>Upload Audio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Smart Notes</p>
            <p className="text-3xl font-extrabold text-slate-900">{totalNotes}</p>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>All synced securely</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Minutes Processed</p>
            <p className="text-3xl font-extrabold text-slate-900">{totalMinutes}m</p>
            <div className="flex items-center space-x-1 text-xs text-cyan-600 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Real-time AI STT</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Action Items</p>
            <p className="text-3xl font-extrabold text-slate-900">{completedActions}/{allActionItems.length}</p>
            <div className="flex items-center space-x-1 text-xs text-indigo-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{pendingActions} pending tasks</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Categories</p>
            <p className="text-3xl font-extrabold text-slate-900">{Object.keys(categoryCounts).length}</p>
            <div className="flex items-center space-x-1 text-xs text-emerald-600 font-medium">
              <Brain className="w-3.5 h-3.5" />
              <span>Students, Founders & Pros</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Brain className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 7-Day Productivity Graph */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">7-Day Productivity Activity</h2>
              <p className="text-xs text-slate-500">Number of smart notes processed over the last 7 days</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>Live Analytics</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '1rem',
                  color: '#0f172a',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: any) => [`${value} notes`, 'Processed']}
                labelStyle={{ color: '#475569', fontWeight: 600, marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorNotes)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Target Audiences / Category Quick Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { name: 'Student', desc: 'Lectures & Study notes', count: categoryCounts['Student'] || 0, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { name: 'Entrepreneur', desc: 'Pitches & Strategy', count: categoryCounts['Entrepreneur'] || 0, color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { name: 'Professional', desc: 'Meetings & Syncs', count: categoryCounts['Professional'] || 0, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { name: 'Content Creator', desc: 'Scripts & Ideation', count: categoryCounts['Content Creator'] || 0, color: 'bg-rose-50 border-rose-200 text-rose-700' },
        ].map((cat) => (
          <div
            key={cat.name}
            onClick={() => setActiveTab('notes')}
            className={`cursor-pointer rounded-2xl ${cat.color} border p-5 transition-all hover:scale-[1.02] shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900">{cat.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-white text-xs font-bold text-slate-800 shadow-sm border border-slate-200">
                {cat.count}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">{cat.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent Notes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Recent Smart Notes</h2>
          </div>
          <button
            onClick={() => setActiveTab('notes')}
            className="flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View All Notes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recentNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note)}
              className="group bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                      {note.category}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.round((note.audioDurationSeconds || 0) / 60)}m audio
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-slate-600 line-clamp-2">
                {note.summary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
