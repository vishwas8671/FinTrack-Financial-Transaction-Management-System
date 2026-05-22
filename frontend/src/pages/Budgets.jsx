import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Edit3, AlertTriangle, CheckCircle } from 'lucide-react';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [formCategory, setFormCategory] = useState('Food');
  const [formLimit, setFormLimit] = useState('');
  const [formMonth, setFormMonth] = useState(new Date().toISOString().slice(0, 7)); // e.g. "2026-05"

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/budgets?month=${formMonth}`);
      if (res.data.success) {
        setBudgets(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load budgets configuration', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [formMonth]);

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget limit parameter?')) return;
    try {
      const res = await axios.delete(`/api/budgets/${id}`);
      if (res.data.success) {
        fetchBudgets();
      }
    } catch (err) {
      console.error('Failed to delete budget limit', err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formLimit || isNaN(formLimit)) return;

    try {
      const res = await axios.post('/api/budgets', {
        category: formCategory,
        limitAmount: Number(formLimit),
        month: formMonth,
      });

      if (res.data.success) {
        setShowModal(false);
        setFormLimit('');
        fetchBudgets();
      }
    } catch (err) {
      console.error('Failed to set budget configuration', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans">Monthly Budgets</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Configure category spend ceilings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={formMonth}
            onChange={(e) => setFormMonth(e.target.value)}
            className="glass-input text-xs py-2 px-3 font-semibold text-slate-700 dark:text-slate-200 outline-none"
          />
          <button
            onClick={() => {
              setFormLimit('');
              setShowModal(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-fin-emerald hover:bg-fin-emeraldHover text-white shadow-lg shadow-fin-emerald/20 transition-all flex items-center gap-1.5"
          >
            <PlusCircle size={15} />
            Set Budget Limit
          </button>
        </div>
      </div>

      {loading && budgets.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fin-emerald"></div>
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border shadow-lg max-w-lg mx-auto mt-8">
          <AlertTriangle className="mx-auto text-amber-500 mb-4 stroke-[1.5]" size={36} />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Budgets Programmed</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
            Defining category ceilings helps flag overspending. Set up your first spending limit now.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 rounded-xl text-xs font-black bg-fin-emerald hover:bg-fin-emeraldHover text-white shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <PlusCircle size={15} />
            Configure First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((b) => {
            const ratio = b.limitAmount > 0 ? (b.spentAmount / b.limitAmount) * 100 : 0;
            const isExceeded = b.spentAmount > b.limitAmount;
            const isNear = !isExceeded && ratio >= 80;

            return (
              <div
                key={b._id}
                className={`glass-panel border rounded-2xl p-6 shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 ${
                  isExceeded
                    ? 'border-fin-rose/30 dark:border-fin-rose/25 neon-glow-rose'
                    : isNear
                    ? 'border-amber-500/30 dark:border-amber-500/25'
                    : 'border-slate-200/50 dark:border-slate-800/60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/20 dark:border-slate-700/20 rounded-lg text-[9px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {b.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mt-2 font-sans">
                        Spent: ${b.spentAmount.toFixed(2)}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteBudget(b._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-fin-rose hover:bg-fin-rose/5 transition-all border border-transparent hover:border-fin-rose/10"
                      title="Remove Limit parameter"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                      <span>Usage Progress</span>
                      <span>
                        Limit: <span className="text-slate-600 dark:text-slate-300 font-extrabold">${b.limitAmount.toFixed(2)}</span>
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-850 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded ? 'bg-fin-rose' : isNear ? 'bg-amber-500' : 'bg-fin-emerald'
                        }`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-150/40 dark:border-slate-800/40 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-1.5">
                    {isExceeded ? (
                      <>
                        <AlertTriangle size={15} className="text-fin-rose" />
                        <span className="text-fin-rose font-bold text-[10px] uppercase tracking-wide">
                          Over Limit by ${Math.abs(b.spentAmount - b.limitAmount).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} className="text-fin-emerald" />
                        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wide">
                          Remaining: ${(b.limitAmount - b.spentAmount).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>

                  <span className="text-slate-400 font-semibold">
                    {ratio.toFixed(0)}% Consumed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

          <div className="relative w-full max-w-sm glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              Configure Category Budget
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-6">Establish a strict monthly ceiling</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Spending Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="glass-input"
                >
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Travel">Travel</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Investments">Investments</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Limit Amount ($)</label>
                <input
                  type="number"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  placeholder="0.00"
                  min="1"
                  className="glass-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Target Month</label>
                <input
                  type="month"
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

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
                  Lock Ceiling
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
