import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Brain, ShieldAlert, Award, Calculator, TrendingUp, RefreshCw, MessageSquare } from 'lucide-react';

const AIInsights = () => {
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reductionPct, setReductionPct] = useState(20); // Slider state

  const fetchAIInsights = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/insights');
      if (res.data.success) {
        setInsightsData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to query AI advisor insights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const score = insightsData?.score || 50;
  const stats = insightsData?.statistics || { income: 0, expense: 0, net: 0, expenseRatio: 0 };

  // Calculate potential simulated savings
  const simulatedMonthlySavings = stats.expense * (reductionPct / 100);
  const simulatedYearlySavings = simulatedMonthlySavings * 12;

  // Health Score UI colors
  const getScoreColor = (sc) => {
    if (sc >= 80) return 'text-fin-emerald border-fin-emerald bg-fin-emerald/5';
    if (sc >= 65) return 'text-fin-violet border-fin-violet bg-fin-violet/5';
    if (sc >= 50) return 'text-amber-500 border-amber-500 bg-amber-500/5';
    return 'text-fin-rose border-fin-rose bg-fin-rose/5';
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-sans flex items-center gap-2">
            <Sparkles size={20} className="text-fin-violet animate-pulse" />
            AI Financial Advisor
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Automated asset logic synthesis
          </p>
        </div>

        <button
          onClick={fetchAIInsights}
          className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-300 transition-colors shadow-sm"
          title="Refresh AI Analysis"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && !insightsData ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2.5">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-fin-violet"></div>
            <span className="text-xs text-slate-400 font-bold">Synthesizing ledger history...</span>
          </div>
        </div>
      ) : !insightsData || stats.expense === 0 && stats.income === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border shadow-lg max-w-lg mx-auto mt-8">
          <Brain className="mx-auto text-fin-violet mb-4 stroke-[1.5]" size={36} />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Insufficient Data History</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 mb-6 max-w-sm mx-auto leading-relaxed">
            The AI Advisor requires registered transaction records to compile spending models and formulate recommendations.
          </p>
          <a
            href="/"
            className="px-5 py-3 rounded-xl text-xs font-black bg-fin-violet hover:bg-violet-600 text-white shadow-md transition-all inline-flex items-center gap-1.5"
          >
            Log First Transaction
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Advisor response column */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Summary Card */}
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/60 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-fin-violet/10 blur-[50px] pointer-events-none"></div>

              <div className="flex items-center gap-2 text-xs font-extrabold text-fin-violet uppercase tracking-wider mb-4">
                <Brain size={16} />
                Advisor Executive Summary
              </div>

              <p
                className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium"
                dangerouslySetInnerHTML={{ __html: insightsData.summary }}
              ></p>
            </div>

            {/* Suggestions details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Spending Insights */}
              <div className="glass-panel border rounded-2xl p-6 shadow-lg">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-amber-500" />
                  Detected Patterns
                </h3>

                <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {insightsData.insights.map((ins, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                      <span dangerouslySetInnerHTML={{ __html: ins }}></span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="glass-panel border rounded-2xl p-6 shadow-lg">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Award size={14} className="text-fin-emerald" />
                  Action Recommendations
                </h3>

                <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {insightsData.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-fin-emerald mt-1.5 shrink-0"></span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar Widgets column */}
          <div className="space-y-6">
            {/* Score Ring Widget */}
            <div className="glass-panel border rounded-2xl p-6 shadow-lg flex flex-col items-center text-center">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5">
                Financial Score
              </h3>

              <div className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center font-sans ${getScoreColor(score)}`}>
                <span className="text-3xl font-black tracking-tight">{score}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Health</span>
              </div>

              <div className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-[200px]">
                {score >= 80 ? 'Excellent cash flows control. Keep allocating assets.' :
                 score >= 65 ? 'Healthy budget control, moderate savings reserves.' :
                 score >= 50 ? 'Average profile. Focus on cutting discretionary items.' :
                 'Budget deficits detected. Action required.'}
              </div>
            </div>

            {/* Savings Simulator Calculator Widget */}
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/60 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Calculator size={15} className="text-fin-violet" />
                Savings Simulator
              </h3>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold mb-5">
                Simulate cutting back discretionary monthly expenses by moving the slider:
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Reduction target</span>
                  <span className="text-fin-violet">{reductionPct}%</span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="70"
                  step="5"
                  value={reductionPct}
                  onChange={(e) => setReductionPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fin-violet"
                />

                <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40 space-y-2 text-xs font-medium">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Monthly Surplus:</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-200">+${simulatedMonthlySavings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Annual Surplus:</span>
                    <span className="font-black text-fin-emerald">+${simulatedYearlySavings.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
