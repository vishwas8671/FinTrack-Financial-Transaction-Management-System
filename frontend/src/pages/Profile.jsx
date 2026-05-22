import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!name || !email) {
      setError('Name and Email fields are required');
      return;
    }

    if (password && password.length < 6) {
      setError('New Password must be at least 6 characters');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await updateProfile(name, email, password || undefined);
      setLoading(false);

      if (res.success) {
        setSuccess('Profile updated successfully!');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred during update');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header bar */}
      <div className="bg-white/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm shadow-sm font-sans">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">User Profile</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
          Manage system profile credentials
        </p>
      </div>

      <div className="glass-panel border rounded-2xl p-8 shadow-lg">
        {success && (
          <div className="mb-6 p-4 bg-fin-emerald/10 border border-fin-emerald/20 text-fin-emerald text-xs font-bold rounded-xl flex items-center gap-2.5">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-fin-rose/10 border border-fin-rose/20 text-fin-rose text-xs font-bold rounded-xl flex items-center gap-2.5">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/65 focus:border-fin-emerald focus:ring-2 focus:ring-fin-emerald/25 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/65 focus:border-fin-emerald focus:ring-2 focus:ring-fin-emerald/25 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/30 dark:border-slate-800/30 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={14} />
              Change Security Password
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/65 focus:border-fin-emerald focus:ring-2 focus:ring-fin-emerald/25 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/65 focus:border-fin-emerald focus:ring-2 focus:ring-fin-emerald/25 rounded-xl py-3 pl-11 pr-4 text-xs font-semibold outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-200/30 dark:border-slate-800/30">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <Shield size={16} className="text-fin-emerald" />
              Role: {user?.role || 'user'} Account
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl text-xs font-black bg-fin-emerald hover:bg-fin-emeraldHover disabled:bg-slate-700 text-white shadow-md shadow-fin-emerald/25 transition-all"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
