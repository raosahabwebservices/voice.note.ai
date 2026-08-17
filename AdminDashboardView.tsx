import React, { useState, useEffect } from 'react';
import { UserProfile, AuditLogItem } from '../types';
import { Users, Mic, Activity, DollarSign, ShieldAlert, Search, Trash2, ChevronLeft, ChevronRight, BarChart3, RefreshCw, LogOut, Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AdminDashboardViewProps {
  currentUser: UserProfile;
  token: string;
  onExitAdmin: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ currentUser, token, onExitAdmin }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'users' | 'jobs' | 'analytics' | 'audit'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  
  // User pagination & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selected user inspect modal
  const [inspectUser, setInspectUser] = useState<any>(null);
  const [, setLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, usersRes, jobsRes, analyticsRes, auditRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch(`/api/admin/users?search=${searchQuery}&plan=${selectedPlanFilter}&country=${selectedCountryFilter}&page=${currentPage}`, { headers }),
        fetch('/api/admin/jobs', { headers }),
        fetch('/api/admin/analytics', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users);
        setTotalPages(uData.totalPages || 1);
      }
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
    } catch (e) {
      console.error("Failed to load admin metrics", e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchQuery, selectedPlanFilter, selectedCountryFilter, currentPage]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to set user status to ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchAdminData();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleChangePlan = async (userId: string, currentPlan: string) => {
    const nextPlan = currentPlan === 'Free' ? 'Pro' : currentPlan === 'Pro' ? 'Enterprise' : 'Free';
    if (!confirm(`Change user plan from ${currentPlan} to ${nextPlan}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: nextPlan }),
      });
      if (res.ok) fetchAdminData();
    } catch (e) {
      alert('Failed to update plan');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('WARNING: Deleting this user will permanently erase their profile and all voice notes. Proceed?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInspectUser(null);
        fetchAdminData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete user');
      }
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  const handleInspectUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInspectUser(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Admin Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
            🛡️
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center space-x-2">
              <span>VoiceNotes AI Admin Dashboard</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-mono font-bold">SECURE ADMIN</span>
            </h1>
            <p className="text-xs text-slate-600 font-medium">Signed in as <span className="text-slate-900 font-bold">{currentUser.email}</span> (Role: ADMIN)</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAdminData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border border-slate-200 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onExitAdmin}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit to App</span>
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 flex space-x-2 overflow-x-auto shadow-sm">
        {[
          { id: 'overview', label: '📊 Overview & KPIs', icon: BarChart3 },
          { id: 'users', label: '👥 User Management & Plans', icon: Users },
          { id: 'jobs', label: '🎙️ Audio Processing & Jobs', icon: Mic },
          { id: 'analytics', label: '📈 Analytics & Charts', icon: Activity },
          { id: 'audit', label: '📋 Admin Audit Logs', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
                activeAdminTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeAdminTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Registered Users</span>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">{stats.totalUsers}</span>
                  <span className="text-xs text-emerald-600 font-bold">+{stats.newUsersToday} today</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Audio Recordings</span>
                  <Mic className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">{stats.totalRecordings}</span>
                  <span className="text-xs text-slate-500 font-medium">~{Math.round(stats.totalProcessedAudioSeconds / 60)} mins</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Subscriptions</span>
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">{stats.paidUsers}</span>
                  <span className="text-xs text-emerald-600 font-bold">Pro & Enterprise</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Estimated Revenue</span>
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">${stats.estimatedRevenue}</span>
                  <span className="text-xs text-amber-600 font-bold">ARR / MRR</span>
                </div>
              </div>
            </div>

            {/* Quick Health Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span>System Health & Job Queue</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-700 font-medium">Active Background Jobs</span>
                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg font-bold">{stats.processingJobsCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-700 font-medium">Failed Processing Jobs</span>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-lg font-bold ${stats.failedJobsCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {stats.failedJobsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-700 font-medium">Gemini AI Model Fallback</span>
                    <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold">Operational (3.5 / 2.5 Flash)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span>Quick Actions & Security</span>
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveAdminTab('users')}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Manage User Accounts & Active Plans</span>
                    <span className="text-blue-600 font-bold">View All →</span>
                  </button>
                  <button
                    onClick={() => setActiveAdminTab('jobs')}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Inspect Audio Processing Jobs & Stages</span>
                    <span className="text-cyan-600 font-bold">Monitor →</span>
                  </button>
                  <button
                    onClick={() => setActiveAdminTab('audit')}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 text-xs font-semibold flex items-center justify-between transition-all"
                  >
                    <span>Review Admin Audit Activity Log</span>
                    <span className="text-emerald-600 font-bold">Audit →</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeAdminTab === 'users' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden space-y-4 shadow-sm">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by registered name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <select
                  value={selectedPlanFilter}
                  onChange={(e) => setSelectedPlanFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none font-semibold"
                >
                  <option value="">All Plans</option>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>

                <select
                  value={selectedCountryFilter}
                  onChange={(e) => setSelectedCountryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none font-semibold"
                >
                  <option value="">All Countries</option>
                  <option value="US">United States (US)</option>
                  <option value="IN">India (IN)</option>
                  <option value="GB">United Kingdom (GB)</option>
                  <option value="AE">UAE (AE)</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase tracking-wider font-bold">
                    <th className="p-4">Registered Name</th>
                    <th className="p-4">Contact Email & Phone</th>
                    <th className="p-4">Country</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Purchased Plan</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Recordings</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {u.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800 font-medium">{u.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{u.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-slate-700">{u.country}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-700">{u.authProvider}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.plan === 'Enterprise' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                          u.plan === 'Pro' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          🌟 {u.plan} Active
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800">{u.totalRecordings}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleInspectUser(u.id)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleChangePlan(u.id, u.plan)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg font-bold"
                          title="Click to manually cycle & update user subscription plan"
                        >
                          Change Plan
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className={`px-2.5 py-1 rounded-lg font-bold ${u.status === 'ACTIVE' ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}
                          >
                            {u.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-semibold bg-slate-50">
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex space-x-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 bg-white border border-slate-300 rounded-lg disabled:opacity-50 shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 bg-white border border-slate-300 rounded-lg disabled:opacity-50 shadow-sm"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIO & JOBS */}
        {activeAdminTab === 'jobs' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden space-y-4 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Audio Processing Queue & Jobs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-bold">
                    <th className="p-3">Job ID</th>
                    <th className="p-3">User Email</th>
                    <th className="p-3">Audio Title</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Status / Stage</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-blue-50/30">
                      <td className="p-3 text-blue-600 font-bold">{j.id}</td>
                      <td className="p-3 text-slate-700 font-medium">{j.userEmail}</td>
                      <td className="p-3 text-slate-900 font-sans font-bold">{j.title}</td>
                      <td className="p-3 font-semibold">{Math.round(j.durationSeconds)}s</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          j.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          j.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {j.status}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{j.currentStage}</div>
                      </td>
                      <td className="p-3">
                        <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                          <div className="bg-blue-600 h-full transition-all" style={{ width: `${j.progress}%` }} />
                        </div>
                      </td>
                      <td className="p-3 text-right text-slate-500 font-medium">{new Date(j.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-500 font-medium">No active or recorded jobs in queue.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS */}
        {activeAdminTab === 'analytics' && analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Daily User Registrations</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 12, color: '#0f172a' }} />
                    <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Audio Processing Volume (Hours)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.audioVolume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: 12, color: '#0f172a' }} />
                    <Area type="monotone" dataKey="hours" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeAdminTab === 'audit' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Admin Activity Audit Log</h3>
            <div className="space-y-2 font-mono text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600 font-bold">{log.adminEmail}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-slate-900 font-bold">{log.action}</span>
                    </div>
                    {log.targetUserEmail && <div className="text-[10px] text-slate-500">Target User: {log.targetUserEmail}</div>}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <p className="text-slate-500 text-center py-6 font-medium">No audit log entries recorded yet.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* INSPECT USER MODAL */}
      {inspectUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">{inspectUser.user.name}</h2>
                <p className="text-xs text-slate-600 font-mono font-medium">{inspectUser.user.email} • {inspectUser.user.phone || 'No phone'}</p>
              </div>
              <button onClick={() => setInspectUser(null)} className="text-slate-400 hover:text-slate-900 text-base font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold">Account Plan</span>
                <p className="text-slate-900 font-bold flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{inspectUser.user.plan} Active 🌟</span>
                </p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold">Status</span>
                <p className="text-emerald-600 font-bold">{inspectUser.user.status}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold">Auth Provider</span>
                <p className="text-slate-900 uppercase font-mono font-bold">{inspectUser.user.authProvider}</p>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold">Joined Date</span>
                <p className="text-slate-900 font-bold">{new Date(inspectUser.user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">User Voice Notes ({inspectUser.notes.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {inspectUser.notes.map((n: any) => (
                  <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{n.title}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{Math.round(n.audioDurationSeconds)}s • {new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">{n.category}</span>
                  </div>
                ))}
                {inspectUser.notes.length === 0 && <p className="text-xs text-slate-500 font-medium">No notes recorded yet.</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              {inspectUser.user.role !== 'ADMIN' && (
                <button
                  onClick={() => handleDeleteUser(inspectUser.user.id)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete User</span>
                </button>
              )}
              <button
                onClick={() => setInspectUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
