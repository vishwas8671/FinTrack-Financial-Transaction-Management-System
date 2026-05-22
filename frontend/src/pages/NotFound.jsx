import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 font-sans">
      <div className="p-4 bg-fin-rose/10 border border-fin-rose/20 text-fin-rose rounded-2xl mb-5 shadow-lg">
        <ShieldAlert size={36} className="stroke-[2]" />
      </div>

      <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Page Not Found</h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1 mb-8">
        Error Code 404: Invalid route request
      </p>

      <Link
        to="/"
        className="px-5 py-3 bg-fin-emerald hover:bg-fin-emeraldHover text-white text-xs font-black rounded-xl shadow-lg shadow-fin-emerald/20 transition-all flex items-center gap-1.5"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
