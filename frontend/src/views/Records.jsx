import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

export default function Records({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'income' | 'expense'

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const typeParam = filter !== 'all' ? `&type=${filter}` : '';
      const res = await axios.get(`/api/records?limit=50${typeParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(res.data.data);
    } catch (err) {
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/records/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const fmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const canMutate = ['ADMIN', 'VIEWER'].includes(user?.role);

  const totalIncome = records.filter(r => r.type === 'income').reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + parseFloat(r.amount), 0);

  return (
    <Layout user={user} setUser={() => {}}>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="flex bg-[#EEEDE8] rounded-xl p-1">
            {['all', 'income', 'expense'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 capitalize ${
                  filter === f ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {canMutate && (
            <button className="btn-primary flex items-center space-x-2">
              <span>+</span><span>New Record</span>
            </button>
          )}
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Showing', value: `${records.length} records`, neutral: true },
            { label: 'Income', value: fmt(totalIncome), green: true },
            { label: 'Expenses', value: fmt(totalExpense), red: true },
          ].map(({ label, value, neutral, green, red }) => (
            <div key={label} className="card px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-[#ABABAB] font-medium">{label}</span>
              <span className={`text-sm font-bold ${green ? 'text-emerald-600' : red ? 'text-rose-500' : 'text-[#0A0A0A]'}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E8E4]">
                {['Date', 'Category', 'Type', 'Amount', ...(canMutate ? [''] : [])].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#ABABAB] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="border-b border-[#E8E8E4]">
                    {[1,2,3,4].map(j => (
                      <td key={j} className="px-5 py-4"><div className="h-3 bg-[#EEEDE8] rounded-full animate-pulse w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center">
                    <p className="text-[#ABABAB] text-sm">No records found</p>
                    <p className="text-[#ABABAB] text-xs mt-1">Add your first record to get started</p>
                  </td>
                </tr>
              ) : records.map((r) => (
                <tr key={r.id} className="border-b border-[#E8E8E4] hover:bg-[#F7F6F3] transition-colors group">
                  <td className="px-5 py-4 text-xs text-[#6B6B6B] font-medium">
                    {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-[#0A0A0A] capitalize">{r.category}</span>
                    {r.notes && <p className="text-[10px] text-[#ABABAB] mt-0.5 truncate max-w-[180px]">{r.notes}</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={r.type === 'income' ? 'badge-income' : 'badge-expense'}>
                      {r.type === 'income' ? '↑' : '↓'} {r.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${r.type === 'income' ? 'text-emerald-600' : 'text-[#0A0A0A]'}`}>
                      {r.type === 'income' ? '+' : '-'}{fmt(r.amount)}
                    </span>
                  </td>
                  {canMutate && (
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-[11px] font-medium text-[#ABABAB] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </Layout>
  );
}
