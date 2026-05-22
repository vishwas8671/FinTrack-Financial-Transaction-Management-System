import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FileText, Download, FileSpreadsheet, RefreshCw, Calendar, CheckCircle } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reports statement history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCompileReport = async (e) => {
    e.preventDefault();
    if (!selectedMonth) return;

    try {
      setCompiling(true);
      const res = await axios.post('/api/reports', { month: selectedMonth });
      if (res.data.success) {
        fetchReports();
      }
    } catch (err) {
      console.error('Failed to compile report statement', err);
    } finally {
      setCompiling(false);
    }
  };

  // Dynamic CSV download helper
  const handleExportCSV = async () => {
    try {
      // Fetch all transactions
      const res = await axios.get('/api/transactions?limit=1000');
      if (!res.data.success) return;

      const transactions = res.data.data;
      if (transactions.length === 0) {
        alert('No transactions registered to export');
        return;
      }

      // Compose CSV headers
      const csvHeaders = ['Title', 'Amount ($)', 'Type', 'Category', 'Date', 'Description', 'Recurring', 'Interval'];
      const csvRows = [csvHeaders.join(',')];

      transactions.forEach((tx) => {
        const row = [
          `"${tx.title.replace(/"/g, '""')}"`,
          tx.amount,
          tx.type,
          tx.category,
          new Date(tx.date).toLocaleDateString(),
          `"${(tx.description || '').replace(/"/g, '""')}"`,
          tx.isRecurring ? 'TRUE' : 'FALSE',
          tx.recurringInterval,
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `FinTrack_Statement_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating CSV ledger export', err);
    }
  };

  // Compile PDF document
  const handleExportPDF = async (report) => {
    try {
      // Fetch transactions for the specific month
      const startOfMonth = `${report.month}-01`;
      const dateObj = new Date(startOfMonth);
      const endOfMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).toISOString().slice(0, 10);

      const res = await axios.get(`/api/transactions?startDate=${startOfMonth}&endDate=${endOfMonth}&limit=100`);
      if (!res.data.success) return;

      const txs = res.data.data;

      // Initialize jsPDF doc
      const doc = new jsPDF();

      // Palette styling
      const primaryColor = [15, 23, 42]; // Slate 900
      const accentColor = [16, 185, 129]; // Emerald 500

      // Title & branding header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('FinTrack', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Financial Asset Intelligence Ledger', 14, 25);

      // Statement Month title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`Monthly Financial Statement — ${report.name.split(' - ')[1]}`, 14, 40);

      // Metas grid
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 45, 196, 45);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary Metrics:', 14, 52);

      doc.setFont('helvetica', 'normal');
      doc.text(`Total Income: $${report.totalIncome.toFixed(2)}`, 14, 60);
      doc.text(`Total Expense: $${report.totalExpense.toFixed(2)}`, 14, 66);

      const netSavings = report.totalIncome - report.totalExpense;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(netSavings >= 0 ? accentColor[0] : 244, netSavings >= 0 ? accentColor[1] : 63, netSavings >= 0 ? accentColor[2] : 94);
      doc.text(`Net Cash Flow: $${netSavings.toFixed(2)}`, 14, 72);

      doc.setLineWidth(0.5);
      doc.line(14, 78, 196, 78);

      // Table mapping
      const tableHeaders = [['Title', 'Category', 'Date', 'Type', 'Amount']];
      const tableRows = txs.map((tx) => [
        tx.title,
        tx.category,
        new Date(tx.date).toLocaleDateString(),
        tx.type.toUpperCase(),
        `$${tx.amount.toFixed(2)}`,
      ]);

      doc.autoTable({
        startY: 85,
        head: tableHeaders,
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          4: { halign: 'right' },
        },
      });

      // Download file
      doc.save(`FinTrack_Statement_${report.month}.pdf`);
    } catch (err) {
      console.error('Error generating PDF compiled statement', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white/40 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-sm shadow-sm font-sans">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Financial Reports</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Compile statements and download ledgers
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-200 hover:bg-slate-350 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/40 dark:border-slate-700/50 shadow-sm flex items-center gap-1.5 transition-all"
        >
          <FileSpreadsheet size={15} />
          Export CSV History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compiler Form card */}
        <div className="glass-panel border rounded-2xl p-6 shadow-lg h-fit">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Calendar size={14} />
            Compile Monthly Ledger
          </h3>

          <form onSubmit={handleCompileReport} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="glass-input text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={compiling}
              className="w-full py-3 bg-fin-emerald hover:bg-fin-emeraldHover disabled:bg-slate-700 font-extrabold text-xs text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {compiling ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <RefreshCw size={14} />
                  <span>Compile Statements</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Statements history list */}
        <div className="lg:col-span-2 glass-panel border rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <FileText size={14} />
            Compiled Statements Registry
          </h3>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {loading && reports.length === 0 ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-fin-emerald mx-auto mb-2"></div>
                <span className="text-xs text-slate-400 font-bold">Querying statement histories...</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 font-bold border border-dashed border-slate-200/50 dark:border-slate-800/60 rounded-2xl">
                No compiled statements located. Use the compiler card to generate one.
              </div>
            ) : (
              reports.map((rep) => {
                const balance = rep.totalIncome - rep.totalExpense;

                return (
                  <div
                    key={rep._id}
                    className="p-4 bg-white/40 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 rounded-xl flex items-center justify-between hover:bg-slate-550/20 dark:hover:bg-slate-800/25 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-fin-emerald/10 text-fin-emerald rounded-lg">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">{rep.name}</h4>
                        <div className="flex gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide mt-0.5">
                          <span>Income: ${rep.totalIncome.toFixed(0)}</span>
                          <span>Expense: ${rep.totalExpense.toFixed(0)}</span>
                          <span className={balance >= 0 ? 'text-fin-emerald' : 'text-fin-rose'}>
                            Net: ${balance.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleExportPDF(rep)}
                      className="px-3.5 py-2 rounded-xl text-xs font-black bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-300/45 dark:border-slate-700/60 transition-colors flex items-center gap-1"
                    >
                      <Download size={12} />
                      PDF
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
