import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

// --- DAILY FINANCE & GROWTH QUOTES ---
const DAILY_QUOTES = [
  { quote: "Rule No. 1: Never lose money. Rule No. 2: Never forget Rule No. 1.", author: "Warren Buffett" },
  { quote: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
  { quote: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { quote: "Financial freedom is available to those who learn about it and work for it.", author: "Robert Kiyosaki" },
  { quote: "Beware of little expenses. A small leak will sink a great ship.", author: "Benjamin Franklin" },
  { quote: "The habit of saving is itself an education; it fosters every virtue.", author: "T.T. Munger" },
  { quote: "It’s not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" }
];

// Helper to compute daily quote based on the current day of the year
function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- PERSISTENT OFFLINE STATE (LOCAL STORAGE) ---
  const [incomeEntries, setIncomeEntries] = useState(() => {
    const saved = localStorage.getItem('nexus_income');
    return saved ? JSON.parse(saved) : [
      { id: 1, source: 'Primary Operations / Retainer', category: 'Fixed Income', projected: 5000, actual: 5000 },
      { id: 2, source: 'Strategic Advisory / Consulting', category: 'Variable Income', projected: 1500, actual: 1800 }
    ];
  });

  const [expenseEntries, setExpenseEntries] = useState(() => {
    const saved = localStorage.getItem('nexus_expenses');
    return saved ? JSON.parse(saved) : [
      { id: 101, date: '2026-10-01', description: 'Co-working Office Pass', category: 'Business / Growth', payment: 'Credit Card', amount: 45.00, notes: 'Focus deep work session' },
      { id: 102, date: '2026-10-02', description: 'Weekly Health & Groceries', category: 'Food & Nutrition', payment: 'Debit Card', amount: 135.50, notes: 'Meal prep allocation' },
      { id: 103, date: '2026-10-03', description: 'Cloud Infrastructure & SaaS', category: 'Subscriptions & Tech', payment: 'Credit Card', amount: 89.00, notes: 'Development tools' },
      { id: 104, date: '2026-10-05', description: 'High-Yield Investment Fund', category: 'Emergency & Wealth', payment: 'Bank Transfer', amount: 600.00, notes: 'Automated wealth accumulation' }
    ];
  });

  const [budgetCaps, setBudgetCaps] = useState(() => {
    const saved = localStorage.getItem('nexus_caps');
    return saved ? JSON.parse(saved) : {
      'Housing & Utilities': 1500,
      'Food & Nutrition': 600,
      'Transportation & Auto': 350,
      'Personal & Lifestyle': 300,
      'Health & Fitness': 200,
      'Subscriptions & Tech': 150,
      'Business / Growth': 500,
      'Emergency & Wealth': 1000
    };
  });

  // Save to localStorage automatically on state change
  useEffect(() => {
    localStorage.setItem('nexus_income', JSON.stringify(incomeEntries));
  }, [incomeEntries]);

  useEffect(() => {
    localStorage.setItem('nexus_expenses', JSON.stringify(expenseEntries));
  }, [expenseEntries]);

  useEffect(() => {
    localStorage.setItem('nexus_caps', JSON.stringify(budgetCaps));
  }, [budgetCaps]);

  // Memoize Daily Quote Selection
  const todayQuote = useMemo(() => getDailyQuote(), []);

  // --- ANALYTICS & COMPUTATION ENGINE ---
  const totalProjectedIncome = incomeEntries.reduce((acc, curr) => acc + (Number(curr.projected) || 0), 0);
  const totalActualIncome = incomeEntries.reduce((acc, curr) => acc + (Number(curr.actual) || 0), 0);
  const totalActualExpenses = expenseEntries.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalBudgetCap = Object.values(budgetCaps).reduce((acc, curr) => acc + (Number(curr) || 0), 0);

  const netActualBalance = totalActualIncome - totalActualExpenses;
  const savingsRate = totalActualIncome > 0 ? ((totalActualIncome - totalActualExpenses) / totalActualIncome) * 100 : 0;

  // New Income Entry Form Handler
  const [incSource, setIncSource] = useState('');
  const [incProj, setIncProj] = useState('');
  const [incAct, setIncAct] = useState('');
  const [incCat, setIncCat] = useState('Fixed Income');

  const addIncome = (e) => {
    e.preventDefault();
    if (!incSource || !incAct) return;
    const newItem = {
      id: Date.now(),
      source: incSource,
      category: incCat,
      projected: parseFloat(incProj) || 0,
      actual: parseFloat(incAct) || 0
    };
    setIncomeEntries([...incomeEntries, newItem]);
    setIncSource('');
    setIncProj('');
    setIncAct('');
  };

  // New Expense Entry Form Handler
  const [expDesc, setExpDesc] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [expCat, setExpCat] = useState('Business / Growth');
  const [expPay, setExpPay] = useState('Credit Card');
  const [expNotes, setExpNotes] = useState('');

  const addExpense = (e) => {
    e.preventDefault();
    if (!expDesc || !expAmt) return;

    const today = new Date();
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const newItem = {
      id: Date.now(),
      date: localDate,
      description: expDesc,
      category: expCat,
      payment: expPay,
      amount: parseFloat(expAmt) || 0,
      notes: expNotes || 'N/A'
    };
    setExpenseEntries([newItem, ...expenseEntries]);
    setExpDesc('');
    setExpAmt('');
    setExpNotes('');
  };

  const deleteExpense = (id) => {
    setExpenseEntries(expenseEntries.filter(item => item.id !== id));
  };

  const deleteIncome = (id) => {
    setIncomeEntries(incomeEntries.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 md:p-8 max-w-7xl mx-auto text-slate-200">
      {/* --- HEADER NAVIGATION & BRANDING --- */}
      <header className="glass-panel rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00FF66] flex items-center justify-center font-extrabold text-black text-xl shadow-[0_0_15px_#00FF66]">
            N
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-wider text-white flex items-center gap-2">
              NEXUS<span className="text-[#00FF66] neon-text-glow">GROWTH</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider">
              PERSONAL WEALTH & PERFORMANCE ENGINE
            </p>
          </div>
        </div>

        {/* NAV TABS */}
        <nav className="flex items-center gap-2 bg-[#080E1A] p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#00FF66] text-black shadow-[0_0_12px_rgba(0,255,102,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'tracker'
                ? 'bg-[#00FF66] text-black shadow-[0_0_12px_rgba(0,255,102,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Tracker
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'monthly'
                ? 'bg-[#00FF66] text-black shadow-[0_0_12px_rgba(0,255,102,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income & Caps
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
              activeTab === 'about'
                ? 'bg-[#00FF66] text-black shadow-[0_0_12px_rgba(0,255,102,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            About ACDH
          </button>
        </nav>
      </header>

      {/* --- MAIN CONTENT SWITCHER --- */}
      <main className="flex-grow">
        {/* TAB 1: EXECUTIVE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl border-l-4 border-l-[#00FF66]">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Actual Inflow</p>
                <h3 className="text-2xl font-black text-white font-mono mt-1">${totalActualIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                <span className="text-[10px] text-[#00FF66] mt-2 block">Projected: ${totalProjectedIncome.toLocaleString()}</span>
              </div>

              <div className="glass-card p-5 rounded-2xl border-l-4 border-l-rose-500">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Total Expenses</p>
                <h3 className="text-2xl font-black text-rose-400 font-mono mt-1">${totalActualExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                <span className="text-[10px] text-slate-400 mt-2 block">Monthly Cap: ${totalBudgetCap.toLocaleString()}</span>
              </div>

              <div className="glass-card p-5 rounded-2xl border-l-4 border-l-[#00FF66]">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Net Surplus</p>
                <h3 className={`text-2xl font-black font-mono mt-1 ${netActualBalance >= 0 ? 'text-[#00FF66] neon-text-glow' : 'text-rose-500'}`}>
                  ${netActualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-[10px] text-slate-400 mt-2 block">Inflow - Outflow</span>
              </div>

              <div className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-400">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Savings / Growth Rate</p>
                <h3 className="text-2xl font-black text-emerald-400 font-mono mt-1">{savingsRate.toFixed(1)}%</h3>
                <span className="text-[10px] text-slate-400 mt-2 block">Target Retention: &gt; 25.0%</span>
              </div>
            </div>

            {/* CATEGORY COMPUTATION TABLE & BREAKDOWN */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]"></span>
                Budget vs. Actual Category Analysis
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase">
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Budget Cap</th>
                      <th className="py-3 px-4">Actual Spent</th>
                      <th className="py-3 px-4">Variance</th>
                      <th className="py-3 px-4">% Used</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {Object.keys(budgetCaps).map((cat, idx) => {
                      const cap = budgetCaps[cat] || 0;
                      const spent = expenseEntries
                        .filter(e => e.category === cat)
                        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                      const variance = cap - spent;
                      const pct = cap > 0 ? (spent / cap) * 100 : 0;

                      return (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-slate-200">{cat}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-400">${cap.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-200">${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className={`py-3.5 px-4 font-mono font-bold ${variance >= 0 ? 'text-[#00FF66]' : 'text-rose-400'}`}>
                            ${variance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${pct > 100 ? 'bg-rose-500' : 'bg-[#00FF66]'}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-slate-400">{pct.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider ${
                              spent > cap 
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-800' 
                                : 'bg-emerald-950/80 text-[#00FF66] border border-emerald-800'
                            }`}>
                              {spent > cap ? 'EXCEEDED' : 'OPTIMAL'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AUTOMATIC DAILY FINANCE & GROWTH QUOTE BLOCK */}
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#00FF66]/5 rounded-full blur-2xl"></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#00FF66] tracking-widest uppercase">
                    <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
                    Daily Growth Quote & Financial Mindset
                  </div>
                  <p className="text-lg md:text-xl font-semibold italic text-slate-100 mt-2">
                    "{todayQuote.quote}"
                  </p>
                  <p className="text-xs font-mono text-slate-400 text-right md:text-left">
                    — {todayQuote.author}
                  </p>
                </div>
                <div className="bg-[#00FF66]/10 px-4 py-2 rounded-xl border border-[#00FF66]/30 text-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono block">SYSTEM STATUS</span>
                  <span className="text-xs font-extrabold text-[#00FF66] font-mono">100% OFFLINE OPERATIONAL</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY TRANSACTION & ACTIVITY TRACKER */}
        {activeTab === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            {/* ENTRY FORM */}
            <div className="glass-panel p-6 rounded-2xl lg:col-span-1 h-fit">
              <h2 className="text-md font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                <span className="text-[#00FF66]">+</span> Encode Transaction
              </h2>
              <form onSubmit={addExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Description / Activity</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Client Dinner Meeting"
                    value={expDesc}
                    onChange={(e) => setExpDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm glass-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={expAmt}
                    onChange={(e) => setExpAmt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm glass-input font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
                  <select
                    value={expCat}
                    onChange={(e) => setExpCat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm glass-input bg-[#080E1A]"
                  >
                    {Object.keys(budgetCaps).map((c, i) => (
                      <option key={i} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={expPay}
                    onChange={(e) => setExpPay(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm glass-input bg-[#080E1A]"
                  >
                    <option value="Credit Card" className="bg-slate-900">Credit Card</option>
                    <option value="Debit Card" className="bg-slate-900">Debit Card</option>
                    <option value="Bank Transfer" className="bg-slate-900">Bank Transfer</option>
                    <option value="Cash" className="bg-slate-900">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Business / Growth Purpose</label>
                  <input
                    type="text"
                    placeholder="Notes on value generated"
                    value={expNotes}
                    onChange={(e) => setExpNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm glass-input"
                  />
                </div>

                <button type="submit" className="w-full py-3 rounded-xl neon-button text-xs uppercase tracking-wider mt-2">
                  Commit Entry
                </button>
              </form>
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                <h2 className="text-md font-bold text-white">Daily Expense & Activity Ledger</h2>
                <span className="text-xs font-mono text-[#00FF66]">{expenseEntries.length} Records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-mono text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Activity</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {expenseEntries.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-slate-500 font-mono text-xs">
                          No transactions recorded yet. Encode entries using the left panel.
                        </td>
                      </tr>
                    ) : (
                      expenseEntries.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-3 font-mono text-xs text-slate-400">{item.date}</td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-100">{item.description}</div>
                            <div className="text-[10px] text-slate-400">{item.notes}</div>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-300">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-[#00FF66]">
                            ${Number(item.amount).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => deleteExpense(item.id)}
                              className="text-xs text-rose-500 hover:text-rose-300 font-mono px-2 py-1 rounded hover:bg-rose-950/50"
                            >
                              Del
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MONTHLY INCOME & BUDGET CAPS SETTINGS */}
        {activeTab === 'monthly' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* INCOME SOURCES CONFIG */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-md font-bold text-white mb-4 border-b border-slate-800 pb-3 flex justify-between items-center">
                <span>Inflow / Income Sources</span>
                <span className="text-xs font-mono text-[#00FF66]">${totalActualIncome.toLocaleString()} Actual</span>
              </h2>

              <form onSubmit={addIncome} className="grid grid-cols-2 gap-3 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder="Income Source Title"
                  required
                  value={incSource}
                  onChange={(e) => setIncSource(e.target.value)}
                  className="col-span-2 px-3 py-2 rounded-lg text-sm glass-input"
                />
                <input
                  type="number"
                  placeholder="Projected ($)"
                  value={incProj}
                  onChange={(e) => setIncProj(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm glass-input font-mono"
                />
                <input
                  type="number"
                  placeholder="Actual ($)"
                  required
                  value={incAct}
                  onChange={(e) => setIncAct(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm glass-input font-mono"
                />
                <button type="submit" className="col-span-2 py-2 rounded-lg neon-button text-xs uppercase tracking-wider">
                  Add Income Channel
                </button>
              </form>

              <div className="space-y-3">
                {incomeEntries.map((inc) => (
                  <div key={inc.id} className="glass-card p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-100 text-sm">{inc.source}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Proj: ${Number(inc.projected).toLocaleString()} | <span className="text-[#00FF66]">Act: ${Number(inc.actual).toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteIncome(inc.id)}
                      className="text-xs text-rose-500 hover:text-rose-300 font-mono"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPENSE BUDGET CAP TARGETS */}
            <div className="glass-panel p-6 rounded-2xl">
              <h2 className="text-md font-bold text-white mb-4 border-b border-slate-800 pb-3 flex justify-between items-center">
                <span>Monthly Budget Allocation Caps</span>
                <span className="text-xs font-mono text-slate-400">${totalBudgetCap.toLocaleString()} Total Cap</span>
              </h2>

              <div className="space-y-4">
                {Object.keys(budgetCaps).map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-4 border-b border-slate-800/40 pb-2">
                    <span className="text-xs text-slate-300 font-medium">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">$</span>
                      <input
                        type="number"
                        value={budgetCaps[cat]}
                        onChange={(e) => setBudgetCaps({ ...budgetCaps, [cat]: parseFloat(e.target.value) || 0 })}
                        className="w-28 px-2 py-1 text-right text-xs rounded glass-input font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT ACDH CORPORATE SUMMARY */}
        {activeTab === 'about' && (
          <div className="glass-panel p-6 md:p-10 rounded-2xl space-y-8 animate-fadeIn">
            {/* CORPORATE BRAND HEADER */}
            <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-mono text-[#00FF66] tracking-widest uppercase block mb-1">Enterprise Overview</span>
                <h2 className="text-2xl md:text-3xl font-black text-white">ACDH CREATIVES CORP.</h2>
                <p className="text-sm text-slate-400 mt-1">Innovation through insight — Strategic solutions & financial intelligence.</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-900 border border-[#00FF66]/30 text-right">
                <span className="text-[10px] text-slate-400 block font-mono">OFFICIAL DOMAIN</span>
                <span className="text-xs font-mono text-[#00FF66] font-bold">acdhcreatives.vercel.app</span>
              </div>
            </div>

            {/* EXECUTIVE SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-5 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-[#00FF66] uppercase font-mono">About ACDH Creatives</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ACDH Creatives is an integrated corporate growth consultancy providing comprehensive brand planning, digital assets, structural documentation, and monthly financial monitoring systems for growth-oriented enterprises and high-performing individuals.
                </p>
              </div>

              <div className="glass-card p-5 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-[#00FF66] uppercase font-mono">Core Solution Value</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We eliminate fragmented management by deploying unified operational frameworks. From strategic financial budgeting tools to automated campaign systems, ACDH builds steady, trackable growth engines.
                </p>
              </div>
            </div>

            {/* SERVICE OFFERINGS GRID */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono mb-4 border-b border-slate-800 pb-2">
                Core Service Capabilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-xs font-mono text-[#00FF66] block mb-1">01. BRANDING</span>
                  <h4 className="text-sm font-bold text-white">Brand Architecture</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Logo systems, typography, color standards, and comprehensive visual guides.</p>
                </div>

                <div className="glass-card p-4 rounded-xl">
                  <span className="text-xs font-mono text-[#00FF66] block mb-1">02. MARKETING</span>
                  <h4 className="text-sm font-bold text-white">Digital Campaigns</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Social media management, high-converting ad decks, and content calendars.</p>
                </div>

                <div className="glass-card p-4 rounded-xl">
                  <span className="text-xs font-mono text-[#00FF66] block mb-1">03. WEB SYSTEMS</span>
                  <h4 className="text-sm font-bold text-white">Web & Landing Pages</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Ultra-fast web platforms, portfolio dashboards, and offline operational apps.</p>
                </div>

                <div className="glass-card p-4 rounded-xl">
                  <span className="text-xs font-mono text-[#00FF66] block mb-1">04. FINANCE</span>
                  <h4 className="text-sm font-bold text-white">Income & Expense Audits</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Monthly cash-flow planning, margin tracking, and financial monitoring sheets.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-mono gap-2">
        <div>NEXUS-GROWTH v2.4 // POWERED BY ACDH CREATIVES</div>
        <div>
          OPERATING MODE: <span className="text-[#00FF66] font-bold">LOCAL OFFLINE / ENCRYPTED</span>
        </div>
      </footer>
    </div>
  );
}