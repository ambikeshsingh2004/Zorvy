import { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';

export default function Dashboard({ user, setUser }) {
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_balance: 0 });
  const [trends, setTrends] = useState([]);
  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(user?.requested_role === 'ANALYST');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get('/api/dashboard/analytics/summary', { headers }),
      axios.get('/api/dashboard/analytics/trends', { headers }),
      axios.get('/api/dashboard/analytics/recent', { headers }),
      axios.get('/api/dashboard/analytics/categories', { headers }),
    ]).then(([s, t, r, c]) => {
      setSummary(s.data);
      // Format trends for recharts
      const formattedTrends = t.data.map(d => ({
        name: new Date(d.month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        value: Number(d.income)
      }));
      setTrends(formattedTrends);
      setRecent(r.data);
      setCategories(c.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

  const handleRequestAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users/request-role', { requestedRole: 'ANALYST' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = { ...user, requested_role: 'ANALYST' };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setRequested(true);
    } catch (err) { console.error(err); }
  };

  return (
    <Layout user={user} setUser={setUser}>
      
      {/* Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h2>
          <p className="text-zinc-500 text-sm mt-1.5 font-medium">Core financial metrics and recent activity.</p>
        </div>
      </div>

      {/* Viewer upgrade prompt */}
      {user?.role === 'VIEWER' && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[#18181A] border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 text-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Viewing personal data only</p>
              <p className="text-zinc-500 text-[11px] mt-0.5">Request Analyst access to unlock system-wide insights and analytics.</p>
            </div>
          </div>
          <button
            onClick={handleRequestAccess}
            disabled={requested}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 text-white text-xs font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-500/20"
          >
            {requested ? '✓ Request Pending' : 'Request Analyst Access'}
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-zinc-500 text-sm">Loading dashboard data...</div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Income', value: fmt(summary.total_income), color: 'text-emerald-400', bg: 'bg-[#18181A]' },
              { label: 'Total Expenses', value: fmt(summary.total_expense), color: 'text-rose-400', bg: 'bg-[#18181A]' },
              { label: 'Net Balance', value: fmt(summary.net_balance), color: 'text-white', bg: 'bg-gradient-to-br from-orange-600 to-rose-600 border-none' },
            ].map((m, i) => (
              <div key={i} className={`rounded-2xl p-6 border border-white/5 ${m.bg}`}>
                <p className={`text-xs font-medium uppercase tracking-widest ${i === 2 ? 'text-white/60' : 'text-zinc-500'} mb-2`}>{m.label}</p>
                <p className={`text-3xl font-semibold tracking-tight ${m.color}`} style={{ fontFamily: 'Syne, sans-serif' }}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            
            {/* Monthly Trends */}
            <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex flex-col min-h-[300px]">
              <h3 className="text-white text-lg font-medium mb-6">Monthly Trends (Income)</h3>
              <div className="flex-1 w-full relative">
                {trends.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm">No trend data yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 10}} tickFormatter={(v) => v > 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Category Wise Totals */}
            <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex flex-col min-h-[300px] max-h-[400px] overflow-auto">
              <h3 className="text-white text-lg font-medium mb-6">Category Totals</h3>
              <div className="flex-1 space-y-4">
                {categories.length === 0 ? (
                  <div className="text-zinc-600 text-sm text-center pt-10">No categories found.</div>
                ) : (
                  categories.map((c, i) => {
                    const isIncome = c.type === 'income';
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div>
                          <p className="text-sm font-medium text-zinc-300 capitalize">{c.category}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{c.count} records ({c.type})</p>
                        </div>
                        <div className={`text-sm font-semibold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isIncome ? '+' : '-'}{fmt(c.total)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Bottom Table: Recent Activity */}
          <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex-1 flex flex-col">
            <h3 className="text-white text-lg font-medium mb-6">Recent Activity</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Date', 'Category', 'Type', 'Amount'].map(h => (
                      <th key={h} className="pb-4 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-zinc-500 text-xs">No recent activity</td></tr>
                  ) : (
                    recent.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 text-zinc-400 text-xs">
                          {new Date(r.date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-4 text-zinc-300 text-xs capitalize">{r.category}</td>
                        <td className="py-4 text-zinc-300 text-xs capitalize">{r.type}</td>
                        <td className={`py-4 text-xs font-medium ${r.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {recent.length > 0 && (
              <div className="text-right mt-4 pt-4 border-t border-white/5">
                <a href="/records" className="text-xs text-orange-500 hover:text-orange-400 transition-colors font-medium">View all records →</a>
              </div>
            )}
          </div>

        </div>
      )}
    </Layout>
  );
}
