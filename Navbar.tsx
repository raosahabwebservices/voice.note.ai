import React from 'react';
import { Mic, Upload, FileText, LayoutDashboard, BookOpen, Sparkles, Zap, ShieldAlert, LogOut } from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  notesCount: number;
  totalMinutes: number;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  notesCount,
  totalMinutes,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('presale')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                VoiceNotes AI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200 rounded-full">
                SaaS v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('presale')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'presale'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-200 fill-current animate-bounce" />
            <span>⚡ Pre-Sale</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Notes</span>
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white text-blue-700 font-bold rounded-full">
              {notesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('record')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'record'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Record</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('documentation')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'documentation'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-600" />
            <span>PRD</span>
          </button>
        </nav>

        {/* User Profile & Admin Badge */}
        <div className="flex items-center space-x-2">
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('admin' as any)}
              className="flex items-center space-x-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 capitalize">{currentUser.plan} • {currentUser.country}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-300 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Subheader Navigation */}
      <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-slate-200 bg-slate-50 space-x-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('presale')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center space-x-1 ${
            activeTab === 'presale' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white border border-slate-200 text-amber-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>⚡ Pre-Sale</span>
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'notes' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          Notes ({notesCount})
        </button>
        <button
          onClick={() => setActiveTab('record')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'record' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          Record
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          Dashboard
        </button>
        {currentUser.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('admin' as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-rose-100 text-rose-700 border border-rose-200`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};

