import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coins, PlusCircle, Trash2, Calendar, Target, Award, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

const Savings = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [fundsAction, setFundsAction] = useState('deposit'); // 'deposit' | 'withdraw'

  // Goal Form
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10));

  // Funds Form
  const [fundsAmount, setFundsAmount] = useState('');

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/savings');
      if (res.data.success) {
        setGoals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load savings targets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this savings target?')) return;
    try {
      const res = await axios.delete(`/api/savings/${id}`);
      if (res.data.success) {
        fetchGoals();
      }
    } catch (err) {
      console.error('Failed to delete savings goal', err);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    if (!goalName || !goalTarget) return;

    try {
      const res = await axios.post('/api/savings', {
        name: goalName,
        targetAmount: Number(goalTarget),
        targetDate: goalDate,
      });

      if (res.data.success) {
        setShowGoalModal(false);
        setGoalName('');
        setGoalTarget('');
        fetchGoals();
      }
    } catch (err) {
      console.error('Failed to create savings goal', err);
    }
  };

  const handleOpenFundsModal = (goal, action) => {
    setSelectedGoal(goal);
    setFundsAction(action);
    setFundsAmount('');
    setShowFundsModal(true);
  };

  const handleFundsSubmit = async (e) => {
    e.preventDefault();
    if (!fundsAmount || isNaN(fundsAmount)) return;

    try {
      const amount = Number(fundsAmount);
      // Negative amount represents withdrawal
      const payloadAmount = fundsAction === 'deposit' ? amount : -amount;

      const res = await axios.post(`/api/savings/${selectedGoal._id}/funds`, {
        amount: payloadAmount,
      });

      if (res.data.success) {
        setShowFundsModal(false);
        fetchGoals();
      }
    } catch (err) {
      console.error('Failed to adjust savings goal funds', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans">Savings Planner</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Log financial reserves allocations
          </p>
        </div>

        <button
          onClick={() => setShowGoalModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-fin-emerald hover:bg-fin-emeraldHover text-white shadow-lg shadow-fin-emerald/20 transition-all flex items-center gap-1.5"
        >
          <PlusCircle size={15} />
          Create Saving Target
        </button>
      </div>

      {loading && goals.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fin-emerald"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border shadow-lg max-w-lg mx-auto mt-8">
          <Coins className="mx-auto text-fin-emerald mb-4 stroke-[1.5]" size={36} />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Savings Goals Logged</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
            Configure long-term goals (e.g. purchasing a vehicle, emergency backup fund) to allocate savings.
          </p>
          <button
            onClick={() => setShowGoalModal(true)}
            className="px-5 py-3 rounded-xl text-xs font-black bg-fin-emerald hover:bg-fin-emeraldHover text-white shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <PlusCircle size={15} />
            Add First Saving Target
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => {
            const completion = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            const isCompleted = g.status === 'completed' || completion >= 100;
            const daysLeft = Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={g._id}
                className={`glass-panel border rounded-2xl p-6 shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 ${
                  isCompleted 
                    ? 'border-fin-emerald/30 dark:border-fin-emerald/25 neon-glow-emerald' 
                    : 'border-slate-200/50 dark:border-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${
                        isCompleted ? 'bg-fin-emerald/10 text-fin-emerald' : 'bg-fin-violet/10 text-fin-violet'
                      }`}>
                        {isCompleted ? <Award size={18} /> : <Target size={18} />}
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-200 truncate max-w-[150px] font-sans">
                        {g.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteGoal(g._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-fin-rose hover:bg-fin-rose/5 transition-all"
                      title="Remove Target"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Progress Stats */}
                  <div className="mt-6 flex justify-between items-baseline font-sans">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Saved Amount</span>
                      <span className="text-xl font-black text-slate-700 dark:text-slate-100">${g.currentAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ceiling Target</span>
                      <span className="text-sm font-extrabold text-slate-500 dark:text-slate-400">${g.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Progress Gauge */}
                  <div className="mt-5 space-y-1.5">
                    <div className="w-full bg-slate-200 dark:bg-slate-850 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-fin-emerald' : 'bg-fin-violet'
                        }`}
                        style={{ width: `${Math.min(100, completion)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-extrabold tracking-wide uppercase text-slate-400">
                      <span>{completion.toFixed(0)}% Achieved</span>
                      {daysLeft > 0 ? (
                        <span className="flex items-center gap-0.5">
                          <Calendar size={10} />
                          {daysLeft} days remaining
                        </span>
                      ) : (
                        <span>Deadline passed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contribution Action keys */}
                <div className="mt-6 pt-4 border-t border-slate-150/40 dark:border-slate-800/40 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOpenFundsModal(g, 'deposit')}
                    className="py-2.5 rounded-xl bg-fin-emerald/10 border border-fin-emerald/20 hover:bg-fin-emerald hover:text-white text-fin-emerald text-[11px] font-black tracking-wide uppercase flex items-center justify-center gap-1 transition-all"
                  >
                    <ArrowUpRight size={13} />
                    Deposit
                  </button>
                  <button
                    onClick={() => handleOpenFundsModal(g, 'withdraw')}
                    className="py-2.5 rounded-xl bg-fin-rose/10 border border-fin-rose/20 hover:bg-fin-rose hover:text-white text-fin-rose text-[11px] font-black tracking-wide uppercase flex items-center justify-center gap-1 transition-all"
                    disabled={g.currentAmount === 0}
                  >
                    <ArrowDownRight size={13} />
                    Withdraw
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Creation Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowGoalModal(false)}></div>

          <div className="relative w-full max-w-sm glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              Log Savings Target
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-6">Program a target savings milestone</p>

            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Goal Name</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Electric Vehicle, Travel Fund"
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Target Ceiling ($)</label>
                <input
                  type="number"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="e.g. 10000"
                  min="1"
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Target Deadline</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-350 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-fin-emerald hover:bg-fin-emeraldHover text-white shadow-md shadow-fin-emerald/20 transition-all"
                >
                  Lock Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Funds Deposit/Withdrawal Modal */}
      {showFundsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowFundsModal(false)}></div>

          <div className="relative w-full max-w-sm glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowFundsModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 capitalize">
              {fundsAction} Funds
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-6">
              Adjust balance for "{selectedGoal?.name}"
            </p>

            <form onSubmit={handleFundsSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Amount ($)</label>
                <input
                  type="number"
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  max={fundsAction === 'withdraw' ? selectedGoal?.currentAmount : undefined}
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFundsModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-350 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-md transition-all ${
                    fundsAction === 'deposit' 
                      ? 'bg-fin-emerald hover:bg-fin-emeraldHover shadow-fin-emerald/20' 
                      : 'bg-fin-rose hover:bg-rose-600 shadow-fin-rose/20'
                  }`}
                >
                  Confirm {fundsAction}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
