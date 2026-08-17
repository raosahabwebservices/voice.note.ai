import React, { useState } from 'react';
import { UserProfile, ActiveTab } from '../types';
import { Shield, Search, CheckCircle2, XCircle, UserCheck, UserX, ArrowLeft, Zap, Mail, Phone, Globe, Calendar } from 'lucide-react';

interface AdminViewProps {
  currentUser: UserProfile | null;
  users: UserProfile[];
  onTogglePremium: (userId: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  showToast: (msg: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  users,
  onTogglePremium,
  setActiveTab,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Security Check: if not admin, redirect or show access denied
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto text-2xl font-bold">
          🔒
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-sm text-slate-400">
            You must be logged in as an administrator (<code className="text-indigo-400">hy399035@gmail.com</code>) to view the Admin Panel (`/admin`).
          </p>
        </div>
        <button
          onClick={() => setActiveTab('auth')}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control Center (/admin)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Global User & Premium Management</h1>
          <p className="text-slate-400 text-sm">
            Manage registered users, review payment status, and instantly grant or revoke Lifetime Premium access.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
            👑
          </div>
          <div>
            <p className="text-xs text-slate-400">Logged in as Admin</p>
            <p className="text-sm font-bold text-white">{currentUser.email}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <p className="text-xs text-slate-400 font-medium">Total Registered Users</p>
          <p className="text-3xl font-black text-white">{users.length}</p>
          <p className="text-[11px] text-indigo-400 font-medium">Global Signups</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <p className="text-xs text-slate-400 font-medium">Active Premium Users</p>
          <p className="text-3xl font-black text-emerald-400">{users.filter(u => u.isPremium).length}</p>
          <p className="text-[11px] text-emerald-500 font-medium">Unlocked Voice AI Access</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <p className="text-xs text-slate-400 font-medium">Pending Payments / Standard</p>
          <p className="text-3xl font-black text-amber-400">{users.filter(u => !u.isPremium).length}</p>
          <p className="text-[11px] text-amber-500 font-medium">Showing Pre-Sale Screen</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="py-4 px-6">User Profile</th>
                <th className="py-4 px-6">Contact & Country</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Access Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 space-y-0.5">
                      <div className="font-bold text-white flex items-center space-x-2">
                        <span>{user.name}</span>
                        {user.email === 'hy399035@gmail.com' && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">Super Admin</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 space-y-0.5 text-xs text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span>{user.country}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {user.isPremium ? (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lifetime Premium (Active)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Payment Pending (₹1,999)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          onTogglePremium(user.id);
                          showToast(`Updated premium status for ${user.name}`);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-end space-x-1.5 ml-auto ${
                          user.isPremium
                            ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        }`}
                      >
                        {user.isPremium ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Revoke Access</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approve Premium</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
