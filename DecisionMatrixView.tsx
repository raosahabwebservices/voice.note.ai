import React from 'react';
import { SmartNote } from '../types';
import { Scale, CheckCircle2, XCircle, Sparkles, AlertCircle } from 'lucide-react';

interface DecisionMatrixViewProps {
  note: SmartNote;
}

export const DecisionMatrixView: React.FC<DecisionMatrixViewProps> = ({ note }) => {
  const matrix = note.decisionMatrix || {
    dilemma: note.title || "Strategic Decision / Dilemma",
    options: [
      {
        option: "Option A",
        pros: ["High engagement & conversion potential", "Faster market penetration"],
        cons: ["Requires initial resource investment"],
        suitability: "Recommended for growth phase"
      },
      {
        option: "Option B",
        pros: ["Higher margins & sustainability", "Targeted premium audience"],
        cons: ["Slower initial adoption rate"],
        suitability: "Recommended for premium scaling"
      }
    ],
    recommendation: "Evaluate based on short-term cash flow vs long-term brand positioning. Start with Option A for initial momentum."
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Voice-to-Logic Matrix (Pro vs. Con Decision Table)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">AI-powered dilemma analysis and option evaluation from your voice note.</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
          Decision Maker
        </span>
      </div>

      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        {/* Dilemma Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Identified Dilemma / Choice</h4>
            <p className="text-white font-medium text-base">"{matrix.dilemma}"</p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(matrix.options || []).map((opt, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all shadow-lg ${
                idx === 0
                  ? 'bg-indigo-950/40 border-indigo-500/40 shadow-indigo-600/10'
                  : 'bg-violet-950/40 border-violet-500/40 shadow-violet-600/10'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    idx === 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  }`}>
                    Option {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Matrix Node</span>
                </div>

                <h4 className="font-semibold text-white text-lg">{opt.option}</h4>

                <div className="space-y-3 pt-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1.5 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" /> Pros & Advantages
                    </span>
                    <ul className="space-y-1.5">
                      {(opt.pros || []).map((pro, pIdx) => (
                        <li key={pIdx} className="text-xs text-slate-300 flex items-start space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block mb-1.5 flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5 inline mr-1" /> Cons & Risks
                    </span>
                    <ul className="space-y-1.5">
                      {(opt.cons || []).map((con, cIdx) => (
                        <li key={cIdx} className="text-xs text-slate-300 flex items-start space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {opt.suitability && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 italic">
                  💡 <strong className="text-slate-300">Suitability:</strong> {opt.suitability}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Recommendation Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 shadow-xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI Strategic Recommendation</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {matrix.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
