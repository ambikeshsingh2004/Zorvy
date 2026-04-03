import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

export default function Dashboard({ user, setUser }) {
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_balance: 0 });
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(user?.requested_role === 'ANALYST');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/dashboard/analytics/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummary(res.data);
      } catch (err) {
        console.error('Failed to load summary', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleRequestAccess = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users/request-role', { requestedRole: 'ANALYST' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...user, requested_role: 'ANALYST' };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setRequested(true);
    } catch (err) {
      console.error('Failed to request access', err);
    }
  };

  const fmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const metrics = [
    {
      label: 'Total Income',
      value: fmt(summary.total_income),
      change: '+12.4%',
      positive: true,
      bg: 'bg-emerald-500',
    },
    {
      label: 'Total Expenses',
      value: fmt(summary.total_expense),
      change: '+3.1%',
      positive: false,
      bg: 'bg-rose-500',
    },
    {
      label: 'Net Balance',
      value: fmt(summary.net_balance),
      change: summary.net_balance >= 0 ? 'Positive' : 'Negative',
      positive: summary.net_balance >= 0,
      bg: 'bg-violet-500',
    },
  ];

  return (
    <Layout user={user} setUser={setUser}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Viewer upgrade prompt */}
        {user?.role === 'VIEWER' && (
          <div className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-2xl text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center text-sm">↑</div>
              <div>
                <p className="text-sm font-semibold">You're viewing your own data only.</p>
                <p className="text-xs text-white/50 mt-0.5">Request Analyst access to unlock system-wide insights.</p>
              </div>
            </div>
            <button
              onClick={handleRequestAccess}
              disabled={requested}
              className="shrink-0 text-xs font-semibold px-4 py-2 bg-white text-[#0A0A0A] rounded-xl hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {requested ? 'Request sent ✓' : 'Request Analyst Access'}
            </button>
          </div>
        )}

        {/* Metrics Row */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card p-6 h-32 animate-pulse bg-[#EEEDE8] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <div key={m.label} className="card p-6 group hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-2 h-2 rounded-full mt-1 ${m.bg}`} />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    m.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {m.change}
                  </span>
                </div>
                <p className="text-[#6B6B6B] text-xs font-medium uppercase tracking-wider mb-2">{m.label}</p>
                <p className="text-3xl font-black text-[#0A0A0A] tracking-tight" style={{fontFamily: 'Syne, sans-serif'}}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-[#0A0A0A]">Spending Overview</h3>
              <span className="text-xs text-[#ABABAB]">All time</span>
            </div>
            {/* Placeholder bar chart */}
            <div className="flex items-end space-x-2 h-32">
              {[40, 70, 55, 80, 60, 90, 45, 75, 50, 85, 65, 95].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center space-y-1">
                  <div
                    className="w-full rounded-t-lg bg-[#0A0A0A] transition-all duration-500"
                    style={{ height: `${h}%`, opacity: i === 11 ? 1 : 0.08 + i * 0.06 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                <span key={m} className="text-[9px] text-[#ABABAB]">{m}</span>
              ))}
            </div>
          </div>

          <div className="card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#0A0A0A] mb-1">Income vs Expense</h3>
              <p className="text-xs text-[#ABABAB]">Ratio breakdown</p>
            </div>

            {/* Simple ratio bar */}
            {(() => {
              const total = summary.total_income + summary.total_expense;
              const incomeWidth = total > 0 ? (summary.total_income / total) * 100 : 50;
              return (
                <div>
                  <div className="flex rounded-full overflow-hidden h-3 mb-3 bg-[#EEEDE8]">
                    <div className="bg-emerald-500 transition-all" style={{ width: `${incomeWidth}%` }} />
                    <div className="bg-rose-400 transition-all" style={{ width: `${100 - incomeWidth}%` }} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center space-x-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"/><span className="text-[#6B6B6B]">Income</span></span>
                      <span className="font-semibold">{incomeWidth.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center space-x-1.5"><span className="w-2 h-2 bg-rose-400 rounded-full inline-block"/><span className="text-[#6B6B6B]">Expense</span></span>
                      <span className="font-semibold">{(100 - incomeWidth).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="pt-4 border-t border-[#E8E8E4]">
              <p className="text-[10px] text-[#ABABAB] uppercase tracking-wider mb-1">Net Position</p>
              <p className={`text-xl font-black ${summary.net_balance >= 0 ? 'text-emerald-600' : 'text-rose-500'}`} style={{fontFamily: 'Syne, sans-serif'}}>
                {fmt(summary.net_balance)}
              </p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
