import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, SlidersHorizontal, Plus, Edit, Trash2, ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [type, setType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState('expense');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDescription, setFormDescription] = useState('');
  const [formIsRecurring, setFormIsRecurring] = useState(false);
  const [formInterval, setFormInterval] = useState('none');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        category,
        type,
        startDate,
        endDate,
        page,
        limit: 10,
      };

      const res = await axios.get('/api/transactions', { params });
      if (res.data.success) {
        setTransactions(res.data.data);
        setTotalPages(res.data.pagination.pages || 1);
        setTotalCount(res.data.pagination.total || 0);
      }
    } catch (err) {
      console.error('Failed to load transactions list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 on filter trigger
    setPage(1);
  }, [search, category, type, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [page, search, category, type, startDate, endDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await axios.delete(`/api/transactions/${id}`);
      if (res.data.success) {
        fetchTransactions();
      }
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedTxId(null);
    setFormTitle('');
    setFormAmount('');
    setFormType('expense');
    setFormCategory('Food');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormDescription('');
    setFormIsRecurring(false);
    setFormInterval('none');
    setShowModal(true);
  };

  const handleOpenEditModal = (tx) => {
    setIsEditing(true);
    setSelectedTxId(tx._id);
    setFormTitle(tx.title);
    setFormAmount(tx.amount);
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormDate(new Date(tx.date).toISOString().slice(0, 10));
    setFormDescription(tx.description || '');
    setFormIsRecurring(tx.isRecurring || false);
    setFormInterval(tx.recurringInterval || 'none');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle || !formAmount) return;

    try {
      const txData = {
        title: formTitle,
        amount: Number(formAmount),
        type: formType,
        category: formCategory,
        date: formDate,
        description: formDescription,
        isRecurring: formIsRecurring,
        recurringInterval: formInterval,
      };

      let res;
      if (isEditing) {
        res = await axios.put(`/api/transactions/${selectedTxId}`, txData);
      } else {
        res = await axios.post('/api/transactions', txData);
      }

      if (res.data.success) {
        setShowModal(false);
        fetchTransactions();
      }
    } catch (err) {
      console.error('Failed to save transaction details', err);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setType('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans">Cash Ledger</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Total ledger entries: {totalCount}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-fin-emerald hover:bg-fin-emeraldHover text-white shadow-lg shadow-fin-emerald/20 transition-all flex items-center gap-1.5"
        >
          <Plus size={15} />
          Create Transaction
        </button>
      </div>

      {/* Filter Control panel */}
      <div className="glass-panel border rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
          <SlidersHorizontal size={14} />
          Sort & Filter Ledger
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search size={14} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title..."
              className="w-full bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/65 rounded-xl py-2 pl-9 pr-4 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-fin-emerald"
            />
          </div>

          {/* Type Sort */}
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/65 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-fin-emerald"
            >
              <option value="All">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/65 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-fin-emerald"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Salary">Salary</option>
              <option value="Travel">Travel</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Investments">Investments</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Date pickers */}
          <div className="flex items-center gap-2 lg:col-span-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Calendar size={12} />
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/65 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none"
                placeholder="Start Date"
              />
            </div>
            <span className="text-slate-400 text-xs font-bold">to</span>
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Calendar size={12} />
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/65 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none"
                placeholder="End Date"
              />
            </div>
            {(search || category !== 'All' || type !== 'All' || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="p-2 rounded-xl text-fin-rose hover:bg-fin-rose/10 transition-colors border border-transparent hover:border-fin-rose/25"
                title="Clear Filter Settings"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel border rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 border-b border-slate-200/40 dark:border-slate-800/40">
                <th className="py-4.5 px-6">Transaction</th>
                <th className="py-4.5 px-6">Category</th>
                <th className="py-4.5 px-6">Date</th>
                <th className="py-4.5 px-6">Description</th>
                <th className="py-4.5 px-6 text-right">Amount</th>
                <th className="py-4.5 px-6 text-center">Interval</th>
                <th className="py-4.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fin-emerald"></div>
                      <span className="text-xs text-slate-400 font-bold">Querying ledger database...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold">
                    No transactions registered matching the current filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-200">
                      {tx.title}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/30 dark:border-slate-700/30 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-slate-400 dark:text-slate-500 truncate max-w-xs font-medium">
                      {tx.description || '—'}
                    </td>
                    <td className={`py-4 px-6 text-right font-black ${
                      tx.type === 'income' ? 'text-fin-emerald' : 'text-fin-rose'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        tx.isRecurring 
                          ? 'bg-fin-violet/10 text-fin-violet border border-fin-violet/20' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200/10'
                      }`}>
                        {tx.isRecurring ? tx.recurringInterval : 'none'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(tx)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-700/40 transition-colors"
                          title="Edit Entry"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1.5 rounded-lg text-fin-rose hover:bg-fin-rose/10 border border-transparent hover:border-fin-rose/20 transition-colors"
                          title="Delete Entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
              Showing page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal (Add/Edit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>

          <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 overflow-hidden">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 capitalize">
              {isEditing ? 'Modify Transaction' : 'Record Transaction'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-6">Update asset ledger configurations</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Transaction Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Amazon Cloud, Paycheck, Gas"
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
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => {
                      setFormType(e.target.value);
                      setFormCategory(e.target.value === 'income' ? 'Salary' : 'Food');
                    }}
                    className="glass-input"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="glass-input"
                  >
                    {formType === 'income' ? (
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="glass-input"
                    required
                  />
                </div>
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
                  {isEditing ? 'Update Entry' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
