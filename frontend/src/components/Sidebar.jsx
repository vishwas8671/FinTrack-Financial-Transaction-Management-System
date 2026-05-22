import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Coins,
  Sparkles,
  FileText,
  ShieldCheck,
  User,
  LogOut,
  TrendingUp,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/budgets', label: 'Budgets', icon: PieChart },
    { path: '/savings', label: 'Savings', icon: Coins },
    { path: '/insights', label: 'AI Insights', icon: Sparkles },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  if (user && user.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: ShieldCheck });
  }

  return (
    <aside className="w-64 glass-panel border-r shrink-0 flex flex-col justify-between h-screen sticky top-0 z-20">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/60 flex items-center gap-3">
          <div className="p-2..5 bg-fin-emerald/10 text-fin-emerald rounded-xl border border-fin-emerald/30 shadow-md">
            <TrendingUp size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-fin-emerald to-fin-violet bg-clip-text text-transparent">
              FinTrack
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Asset Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 flex flex-col gap-1.5 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-fin-emerald text-white shadow-lg shadow-fin-emerald/20 border border-fin-emerald/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Actions footer */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/60 flex flex-col gap-2">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-slate-100 dark:bg-slate-800 text-fin-emerald font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`
          }
        >
          <div className="p-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
            <User size={14} />
          </div>
          <div className="truncate text-left flex-1">
            <div className="font-semibold text-xs leading-none dark:text-slate-300">
              {user?.name || 'User Profile'}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {user?.role === 'admin' ? 'Admin Access' : 'User Account'}
            </span>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-fin-rose hover:bg-fin-rose/10 transition-all border border-transparent hover:border-fin-rose/20"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
