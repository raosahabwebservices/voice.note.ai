import React, { useState } from 'react';
import { SmartNote } from '../types';
import { Flame, RefreshCw, Send, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';

interface AiRoastViewProps {
  note: SmartNote;
}

export const AiRoastView: React.FC<AiRoastViewProps> = ({ note }) => {
  const [mode, setMode] = useState<'roast' | 'devil_advocate'>('roast');
  const [critique, setCritique] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [customQuery, setCustomQuery] = useState<string>('');

  const fetchCritique = async (selectedMode: 'roast' | 'devil_advocate', userMsg?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note,
          mode: selectedMode,
          userMessage: userMsg,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate critique');
      setCritique(data.critique);
    } catch (err: any) {
      console.error(err);
      setCritique('Failed to connect with AI Opponent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCritique('roast');
  }, [note.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>AI Opponent & Debate Partner (Roast My Idea Mode)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Put your note to the test with brutal VC honesty and rigorous counter-arguments.</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setMode('roast');
              fetchCritique('roast');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'roast' ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            🔥 Roast My Idea
          </button>
          <button
            onClick={() => {
              setMode('devil_advocate');
              fetchCritique('devil_advocate');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'devil_advocate' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚖️ Devil's Advocate
          </button>
        </div>
      </div>

      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
            <p className="text-sm text-slate-300 font-medium">
              {mode === 'roast' ? '🔥 VC Mentor is reviewing and roasting your ideas...' : '⚖️ Devil\'s Advocate is analyzing your assumptions...'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap shadow-inner">
                {critique}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center space-x-2 w-full sm:w-auto flex-1">
                <input
                  type="text"
                  placeholder="Challenge back or ask for counter-arguments..."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customQuery.trim()) {
                      fetchCritique(mode, customQuery);
                      setCustomQuery('');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={() => {
                    if (customQuery.trim()) {
                      fetchCritique(mode, customQuery);
                      setCustomQuery('');
                    }
                  }}
                  disabled={!customQuery.trim()}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all disabled:opacity-50 flex items-center space-x-1 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Debate</span>
                </button>
              </div>

              <button
                onClick={() => fetchCritique(mode)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs transition-all flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Roast / Critique</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
