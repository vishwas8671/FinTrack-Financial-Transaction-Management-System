import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, TrendingUp } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  // Quick seed logins for evaluators
  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@fintrack.com');
      setPassword('admin123');
    } else {
      setEmail('demo@fintrack.com');
      setPassword('demo123');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden bg-slate-900">
      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-fin-emerald/20 blur-[100px] animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-fin-violet/20 blur-[100px] animate-pulse-glow"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="p-3 bg-fin-emerald/10 text-fin-emerald rounded-2xl border border-fin-emerald/30 shadow-lg shadow-fin-emerald/10">
            <TrendingUp size={30} className="stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">FinTrack</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Asset Management System</p>
        </div>

        {/* Card panel */}
        <div className="glass-panel backdrop-blur-lg border border-slate-700/60 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400 text-xs font-semibold mb-6">Sign in to monitor your portfolio assets</p>

          {error && (
            <div className="mb-5 p-3.5 bg-fin-rose/10 border border-fin-rose/20 text-fin-rose text-xs font-semibold rounded-xl flex items-center gap-2.5">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-800/40 border border-slate-700/50 focus:border-fin-emerald focus:ring-2 focus:ring-fin-emerald/30 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800/40 border border-slate-700/50 focus:border-fin-emerald focus:ring-2 focus:ring-fin-emerald/30 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-fin-emerald hover:bg-fin-emeraldHover disabled:bg-slate-700 font-extrabold text-sm text-white rounded-xl shadow-lg shadow-fin-emerald/25 hover:shadow-fin-emerald/35 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Seed logs shortcut */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
              Developer Demo Shortcuts
            </span>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleQuickLogin('admin')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-bold transition-colors"
              >
                Autofill Admin
              </button>
              <button
                onClick={() => handleQuickLogin('user')}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-bold transition-colors"
              >
                Autofill Demo User
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 font-semibold">
              Don't have an account?{' '}
              <Link to="/register" className="text-fin-emerald hover:text-fin-emeraldHover font-bold transition-all">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
