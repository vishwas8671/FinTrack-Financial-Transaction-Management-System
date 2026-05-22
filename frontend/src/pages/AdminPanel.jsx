import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Server, ShieldCheck, Trash2, ArrowUpRight, ArrowDownRight, Activity, Terminal } from 'lucide-react';

const AdminPanel = () => {
  const [adminStats, setAdminStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const statsRes = await axios.get('/api/admin/stats');
      if (statsRes.data.success) {
        setAdminStats(statsRes.data.data);
      }

      const usersRes = await axios.get('/api/admin/users');
      if (usersRes.data.success) {
        setUsersList(usersRes.data.data);
      }

      const logsRes = await axios.get('/api/admin/logs');
      if (logsRes.data.success) {
        setActivityLogs(logsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin auditing statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    // Poll logs every 15 seconds
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('WARNING: Deleting this user will erase all their associated transactions, budgets, and goals permanently. Proceed?')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${id}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
      console.error('Failed to delete user account', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck size={22} className="text-fin-violet" />
            Security & System Panel
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Administrative Audits & Metrics
          </p>
        </div>
      </div>

      {loading && !adminStats ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fin-violet"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-sans">
            <div className="glass-panel border rounded-2xl p-5 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Global Platform Users</span>
              <span className="text-2xl font-black text-slate-700 dark:text-slate-100 mt-2 block">{adminStats?.totalUsers || 0}</span>
            </div>
            <div className="glass-panel border rounded-2xl p-5 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Global Transactions</span>
              <span className="text-2xl font-black text-slate-700 dark:text-slate-100 mt-2 block">{adminStats?.totalTransactions || 0}</span>
            </div>
            <div className="glass-panel border rounded-2xl p-5 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Global Net Deposit flow</span>
              <span className={`text-2xl font-black mt-2 block ${adminStats?.globalNet >= 0 ? 'text-fin-emerald' : 'text-fin-rose'}`}>
                ${adminStats?.globalNet?.toLocaleString() || 0}
              </span>
            </div>
            <div className="glass-panel border rounded-2xl p-5 shadow-md">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Active Budgets ceiling count</span>
              <span className="text-2xl font-black text-slate-700 dark:text-slate-100 mt-2 block">{adminStats?.activeBudgets || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User directories */}
            <div className="lg:col-span-2 glass-panel border rounded-2xl p-6 shadow-lg">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                <Users size={15} />
                User Profiles Directory
              </h3>

              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 border-b border-slate-200/40 dark:border-slate-800/40">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800/50 text-xs">
                    {usersList.map((usr) => (
                      <tr key={usr._id} className="hover:bg-slate-550/10 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">{usr.name}</td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">{usr.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            usr.role === 'admin' 
                              ? 'bg-fin-violet/10 text-fin-violet border border-fin-violet/20' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 dark:text-slate-500 font-medium">
                          {new Date(usr.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(usr._id)}
                            className="p-1.5 text-fin-rose hover:bg-fin-rose/5 rounded-lg border border-transparent hover:border-fin-rose/10 transition-all"
                            title="Delete User account permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit log activity */}
            <div className="glass-panel border rounded-2xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                  <Terminal size={15} />
                  Live Activity Audit
                </h3>

                <div className="space-y-3 max-h-[300px] overflow-y-auto font-mono text-[10px] leading-relaxed">
                  {activityLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold">
                      Waiting for server requests...
                    </div>
                  ) : (
                    activityLogs.map((log, i) => (
                      <div
                        key={i}
                        className="p-2 border border-slate-200/20 dark:border-slate-800/40 rounded-xl bg-slate-900/40 dark:bg-slate-950/20 flex flex-col gap-0.5 text-slate-400"
                      >
                        <div className="flex justify-between font-bold">
                          <span className={log.status < 300 ? 'text-fin-emerald' : 'text-fin-rose'}>
                            {log.method} {log.status}
                          </span>
                          <span className="text-slate-500">{log.duration}</span>
                        </div>
                        <div className="truncate font-semibold text-[9px] text-slate-450">{log.url}</div>
                        <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                          <span>User: {log.user}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
