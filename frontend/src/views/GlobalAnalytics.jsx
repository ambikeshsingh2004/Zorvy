import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '../components/Layout';

const PRESET_RANGES = [
  { label: 'Last 5 Days', days: 5 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 3 Months', days: 90 },
  { label: 'Last 5 Months', days: 150 },
  { label: 'Year to Date', days: null, ytd: true },
  { label: 'All Time', days: null },
];

const PIE_COLORS = ['#f97316', '#8b5cf6', '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f59e0b'];

export default function GlobalAnalytics({ user: currentUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    includeDeleted: false
  });

  const computeDateRange = (preset) => {
    const end = new Date();
    let start;
    if (preset.ytd) {
      start = new Date(end.getFullYear(), 0, 1);
    } else if (preset.days) {
      start = new Date(end);
      start.setDate(start.getDate() - preset.days);
    } else {
      return { startDate: '', endDate: '' };
    }
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const handlePresetClick = (preset, idx) => {
    setActivePreset(idx);
    const { startDate, endDate } = computeDateRange(preset);
    setFilters(prev => ({ ...prev, startDate, endDate }));
    setPage(1);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.includeDeleted) params.append('includeDeleted', 'true');
      params.append('page', page);

      const res = await axios.get(`/api/user-analytics/analyze-all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and page change
  useEffect(() => { fetchAnalytics(); }, [page]);

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <Layout user={currentUser} setUser={() => {}}>
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Global Analytics
            </h2>
            <p className="text-zinc-500 text-sm mt-1 font-medium">Aggregated data across all users in the system.</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 space-y-5">
          <h3 className="text-white text-sm font-medium mb-4">Query Filters</h3>

          {/* Date Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESET_RANGES.map((pr, i) => (
              <button
                key={i}
                onClick={() => handlePresetClick(pr, i)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-all border ${
                  activePreset === i
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white/5 text-zinc-400 border-white/5 hover:border-orange-500/30 hover:text-white'
                }`}
              >
                {pr.label}
              </button>
            ))}
          </div>

          {/* Custom Date + Type + Include Deleted */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => { setFilters(prev => ({ ...prev, startDate: e.target.value })); setActivePreset(null); }}
                className="w-full px-3 py-2.5 bg-[#121212] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500/50 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => { setFilters(prev => ({ ...prev, endDate: e.target.value })); setActivePreset(null); }}
                className="w-full px-3 py-2.5 bg-[#121212] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500/50 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-500 mb-1.5 uppercase tracking-wider">Entry Type</label>
              <select
                value={filters.type}
                onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#121212] border border-white/5 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500/50 [color-scheme:dark]"
              >
                <option value="all">All Entries</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer select-none px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={filters.includeDeleted}
                  onChange={e => setFilters(prev => ({ ...prev, includeDeleted: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/10 bg-[#121212] accent-orange-500"
                />
                <span className="text-xs text-zinc-400">Include Deleted</span>
              </label>
            </div>
          </div>

          {/* Run Query Button */}
          <button
            onClick={() => { setPage(1); fetchAnalytics(); }}
            disabled={loading}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>

        {/* Results */}
        {data && !loading && (
          <div className="flex flex-col gap-6">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Income', value: fmt(data.summary.total_income), color: 'text-emerald-400' },
                { label: 'Total Expenses', value: fmt(data.summary.total_expense), color: 'text-rose-400' },
                { label: 'Net Balance', value: fmt(data.summary.net_balance), color: data.summary.net_balance >= 0 ? 'text-emerald-400' : 'text-rose-400' },
                { label: 'Total Records', value: data.summary.total_records, color: 'text-white' },
              ].map((m, i) => (
                <div key={i} className="bg-[#18181A] rounded-2xl p-5 border border-white/5">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-2">{m.label}</p>
                  <p className={`text-2xl font-semibold tracking-tight ${m.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

              {/* Trend Chart */}
              <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex flex-col min-h-[320px]">
                <h3 className="text-white text-base font-medium mb-6">Income vs Expense Trend</h3>
                <div className="flex-1 w-full">
                  {data.trends.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-zinc-600 text-sm">No trend data for this range.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.trends} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} tickFormatter={v => v > 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Category Pie Chart */}
              <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex flex-col min-h-[320px]">
                <h3 className="text-white text-base font-medium mb-6">Category Breakdown</h3>
                {data.categories.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">No categories.</div>
                ) : (
                  <div className="flex-1 flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={data.categories}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {data.categories.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#18181A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center">
                      {data.categories.map((c, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                          {c.category} ({fmt(c.total)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Records Table */}
            <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-base font-medium">Matching Records</h3>
                <span className="text-zinc-500 text-[11px]">{data.records.length} records found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-3 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Date</th>
                      <th className="pb-3 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">User Email</th>
                      <th className="pb-3 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Category</th>
                      <th className="pb-3 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Type</th>
                      <th className="pb-3 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Amount</th>
                      <th className="pb-3 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.records.length === 0 ? (
                      <tr><td colSpan="6" className="py-8 text-center text-zinc-500 text-xs">No records match the selected filters</td></tr>
                    ) : (
                      data.records.map(r => (
                        <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 text-zinc-400 text-xs">
                            {new Date(r.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-3 text-zinc-300 text-xs">{r.user_email || '—'}</td>
                          <td className="py-3 text-zinc-300 text-xs capitalize">{r.category}</td>
                          <td className="py-3">
                            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${
                              r.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {r.type}
                            </span>
                          </td>
                          <td className={`py-3 text-xs font-medium ${r.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                          </td>
                          <td className="py-3">
                            {r.deleted_at ? (
                              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Deleted</span>
                            ) : (
                              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {data.pagination && (
                <div className="flex justify-between items-center pt-5 mt-auto border-t border-white/5 mt-6">
                  <span className="text-zinc-500 text-[11px]">Showing {data.records.length} records on this page</span>
                  <div className="flex items-center space-x-2 text-zinc-500 text-xs font-medium">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))} 
                      disabled={page === 1}
                      className="px-2 py-1 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-zinc-500"
                    >
                      &lt;
                    </button>
                    
                    <span className="text-white px-3 py-1 bg-white/5 rounded-md border border-white/10">Page {page} of {totalPages}</span>
                    
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                      disabled={page >= totalPages}
                      className="px-2 py-1 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-zinc-500"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-zinc-500 text-sm">Analyzing global data...</div>
        )}
      </div>
    </Layout>
  );
}
