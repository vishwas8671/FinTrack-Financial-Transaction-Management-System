import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import {
  Wallet,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Activity,
  PlusCircle,
  Clock,
  ArrowRight,
  Database,
  Utensils,
  ShoppingBag,
  Receipt,
  Briefcase,
  Plane,
  Film,
  PieChart as InvestIcon,
  HelpCircle,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    categoryTotals: [],
    monthlyData: [],
    recentTransactions: [],
  });
  const [aiScore, setAiScore] = useState(50);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('expense'); // 'income' | 'expense'

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDescription, setFormDescription] = useState('');
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [formInterval, setFormInterval] = useState('none');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await axios.get('/api/transactions/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const insightsRes = await axios.get('/api/insights');
      if (insightsRes.data.success) {
        setAiScore(insightsRes.data.data.score || 50);
      }

      const budgetsRes = await axios.get('/api/budgets');
      if (budgetsRes.data.success) {
        setBudgets(budgetsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSeedData = async () => {
    try {
      setLoading(true);
      // Seed several dummy transactions
      const sampleTxs = [
        { title: 'Monthly Salary', amount: 5000, type: 'income', category: 'Salary', date: '2026-05-01', description: 'Tech Corp paycheck' },
        { title: 'Appartment Rent', amount: 1500, type: 'expense', category: 'Bills', date: '2026-05-02', description: 'Monthly lease cost' },
        { title: 'Whole Foods Grocery', amount: 220, type: 'expense', category: 'Food', date: '2026-05-04', description: 'Weekly groceries' },
        { title: 'Amazon Shopping', amount: 350, type: 'expense', category: 'Shopping', date: '2026-05-08', description: 'Ergonomic keyboard and mouse' },
        { title: 'Netflix Subscription', amount: 16, type: 'expense', category: 'Entertainment', date: '2026-05-10', description: 'Streaming plan' },
        { title: 'Freelance Design Work', amount: 850, type: 'income', category: 'Salary', date: '2026-05-12', description: 'Client landing page design' },
        { title: 'S&P 500 ETF Deposit', amount: 500, type: 'expense', category: 'Investments', date: '2026-05-15', description: 'Index fund purchase' },
        { title: 'Restaurant Dining', amount: 95, type: 'expense', category: 'Food', date: '2026-05-18', description: 'Family dinner' },
        { title: 'Gas Fill-up', amount: 65, type: 'expense', category: 'Travel', date: '2026-05-20', description: 'Commute fuel' },
      ];

      for (const tx of sampleTxs) {
        await axios.post('/api/transactions', tx);
      }

      // Seed 2 budgets
      await axios.post('/api/budgets', { category: 'Food', limitAmount: 300 });
      await axios.post('/api/budgets', { category: 'Shopping', limitAmount: 400 });

      // Refresh
      await fetchDashboardData();
    } catch (err) {
      console.error('Error seeding demo metrics', err);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setFormCategory(type === 'income' ? 'Salary' : 'Food');
    setFormTitle('');
    setFormAmount('');
    setFormDescription('');
    setFormIsRecurring(false);
    setFormInterval('none');
    setShowModal(true);
  };

  const handleAddTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formAmount) return;

    try {
      const res = await axios.post('/api/transactions', {
        title: formTitle,
        amount: Number(formAmount),
        type: modalType,
        category: formCategory,
        date: formDate,
        description: formDescription,
        isRecurring: formIsRecurring,
        recurringInterval: formInterval,
      });

      if (res.data.success) {
        setShowModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to log transaction', err);
    }
  };

  // Recharts PIE configuration
  const COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ec4899', '#3f3f46', '#f43f5e', '#14b8a6'];

  const formattedPieData = stats.categoryTotals.map(item => ({
    name: item.name,
    value: parseFloat(item.value.toFixed(2)),
  }));

  // Score description color helper
  const getScoreColor = (score) => {
    if (score >= 75) return 'text-fin-emerald';
    if (score >= 50) return 'text-fin-violet';
    return 'text-fin-rose';
  };

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Financial Command Center</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Real-time asset allocations</p>
        </div>

        <div className="flex items-center gap-3">
          {stats.recentTransactions.length === 0 && (
            <button
              onClick={handleSeedData}
              className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/40 dark:border-slate-700/50 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Database size={14} />
              Seed Demo Environment
            </button>
          )}

          <button
            onClick={() => handleOpenModal('income')}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-fin-emerald hover:bg-fin-emeraldHover text-white shadow-lg shadow-fin-emerald/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            Log Income
          </button>
          <button
            onClick={() => handleOpenModal('expense')}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-fin-violet hover:bg-violet-600 text-white shadow-lg shadow-fin-violet/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            Log Expense
          </button>
        </div>
      </div>

      {loading && stats.recentTransactions.length === 0 ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fin-emerald"></div>
        </div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Balance"
              value={`$${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={Wallet}
              color="emerald"
            />
            <MetricCard
              title="Monthly Income"
              value={`$${stats.totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={IncomeIcon}
              color="emerald"
            />
            <MetricCard
              title="Monthly Expense"
              value={`$${stats.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={ExpenseIcon}
              color="rose"
            />
            <MetricCard
              title="AI Health Score"
              value={`${aiScore}/100`}
              icon={Activity}
              color={aiScore >= 75 ? 'emerald' : aiScore >= 50 ? 'violet' : 'rose'}
            />
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area chart */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-lg">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                <IncomeIcon size={16} className="text-fin-emerald" />
                Asset Trends (Cash Flow)
              </h3>
              <div className="h-72">
                {stats.monthlyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                    No timeline aggregates available yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415515" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category breakdown Pie */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-lg flex flex-col justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ExpenseIcon size={16} className="text-fin-rose" />
                Category Allocations
              </h3>

              <div className="h-56 relative flex items-center justify-center">
                {formattedPieData.length === 0 ? (
                  <div className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                    No expense allocations parsed.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formattedPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {formattedPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => `$${val}`}
                        contentStyle={{
                          backgroundColor: 'rgba(30, 41, 59, 0.9)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Legends list */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-bold overflow-y-auto max-h-20">
                {formattedPieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lower layout grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent transactions */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  Recent Cash Ledger
                </h3>
                <a
                  href="/transactions"
                  className="text-xs text-fin-emerald hover:text-fin-emeraldHover font-black flex items-center gap-1 transition-all"
                >
                  View Ledger
                  <ArrowRight size={14} />
                </a>
              </div>

              <div className="space-y-3.5">
                {stats.recentTransactions.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                    No transactions registered. Click "Log Income/Expense" to start.
                  </div>
                ) : (
                  stats.recentTransactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="p-3.5 bg-white/40 dark:bg-slate-900/30 border border-slate-200/20 dark:border-slate-800/40 rounded-xl flex items-center justify-between transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${
                          tx.type === 'income'
                            ? 'bg-fin-emerald/10 text-fin-emerald border-fin-emerald/20'
                            : 'bg-fin-rose/10 text-fin-rose border-fin-rose/20'
                        }`}>
                          {tx.type === 'income' ? <IncomeIcon size={16} /> : <ExpenseIcon size={16} />}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">{tx.title}</h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide">
                            {tx.category} • {new Date(tx.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-black ${tx.type === 'income' ? 'text-fin-emerald' : 'text-fin-rose'}`}>
                          {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Budgets Tracker side list */}
            <div className="glass-panel rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-lg">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                <IncomeIcon size={16} className="text-fin-emerald" />
                Active Monthly Budgets
              </h3>

              <div className="space-y-5">
                {budgets.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                    No budget parameters defined. Set limits on the Budgets screen.
                  </div>
                ) : (
                  budgets.slice(0, 4).map((b) => {
                    const ratio = b.limitAmount > 0 ? (b.spentAmount / b.limitAmount) * 100 : 0;
                    const isExceeded = b.spentAmount > b.limitAmount;
                    const isNear = !isExceeded && ratio >= 80;

                    return (
                      <div key={b._id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-700 dark:text-slate-300 font-bold">{b.category}</span>
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            ${b.spentAmount.toFixed(0)} / <span className="font-bold text-slate-700 dark:text-slate-300">${b.limitAmount.toFixed(0)}</span>
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isExceeded ? 'bg-fin-rose' : isNear ? 'bg-amber-500' : 'bg-fin-emerald'
                            }`}
                            style={{ width: `${Math.min(100, ratio)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-extrabold tracking-wide uppercase">
                          <span className={isExceeded ? 'text-fin-rose' : isNear ? 'text-amber-500' : 'text-slate-400'}>
                            {isExceeded ? 'Limit Exceeded' : isNear ? '80% Warning Limit' : 'In Range'}
                          </span>
                          <span className="text-slate-400">
                            {ratio.toFixed(0)}% Used
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

          <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 capitalize">
              Log New {modalType}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-6">Record cash transactions into the database</p>

            <form onSubmit={handleAddTransactionSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transaction Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Weekly Groceries, Paycheck, Gas"
                  className="glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Amount ($)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="glass-input"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="glass-input"
                  >
                    {modalType === 'income' ? (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Investments">Investments</option>
                        <option value="Others">Others</option>
                      </>
                    ) : (
                      <>
                        <option value="Food">Food</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills">Bills</option>
                        <option value="Travel">Travel</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Investments">Investments</option>
                        <option value="Others">Others</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transaction Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional details"
                  rows="2"
                  className="glass-input"
                ></textarea>
              </div>

              {/* Recurring Switch */}
              <div className="border border-slate-200/50 dark:border-slate-800/60 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Recurring Transaction</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500">Auto-repeat payments over intervals</span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsRecurring}
                  onChange={(e) => setFormIsRecurring(e.target.checked)}
                  className="h-4.5 w-4.5 text-fin-emerald focus:ring-fin-emerald/30 border-slate-300 dark:border-slate-700 rounded"
                />
              </div>

              {formIsRecurring && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Interval</label>
                  <select
                    value={formInterval}
                    onChange={(e) => setFormInterval(e.target.value)}
                    className="glass-input"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-350 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-fin-emerald hover:bg-fin-emeraldHover text-white shadow-md shadow-fin-emerald/20 transition-all"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
