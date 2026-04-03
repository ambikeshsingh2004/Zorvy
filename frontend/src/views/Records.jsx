import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

export default function Records({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const getLocalDatetimePattern = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0,16);
  };

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ amount: '', type: 'expense', category: '', date: getLocalDatetimePattern(), notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
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
    if (!confirm('Soft delete this record?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/records/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/records', { ...form, amount: parseFloat(form.amount) }, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      setForm({ amount: '', type: 'expense', category: '', date: getLocalDatetimePattern(), notes: '' });
      fetchRecords(); // refresh list
    } catch (err) { alert(err.response?.data?.error || 'Failed to create record'); }
    finally { setSaving(false); }
  };

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v);
  const canMutate = ['ADMIN', 'VIEWER'].includes(user?.role);

  return (
    <Layout user={user} setUser={() => {}}>
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">

        {/* Header Block */}
        <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-medium">All Records</h3>
            {canMutate && (
              <button onClick={() => setShowModal(true)} className="py-2.5 px-6 border border-orange-500/50 rounded-full text-orange-500 text-sm font-medium hover:bg-orange-500/10 transition-colors">
                New transfer
              </button>
            )}
          </div>

          <div className="flex border-b border-white/5 pb-2">
            {['all', 'income', 'expense'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`py-2 px-6 text-sm font-medium transition-colors relative capitalize ${
                  filter === f ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f}
                {filter === f && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Table Block */}
        <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex-1 flex flex-col min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[11px] font-medium text-zinc-500">Time</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500">Category</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500">Type</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500">INR amount</th>
                  {canMutate && <th className="pb-4 text-[11px] font-medium text-zinc-500 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={canMutate ? 5 : 4} className="py-8 text-center text-zinc-500 text-xs">Loading...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={canMutate ? 5 : 4} className="py-8 text-center text-zinc-500 text-xs">No records found</td></tr>
                ) : (
                  records.map((r, i) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 text-zinc-400 text-xs">
                        {new Date(r.date).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                      </td>
                      <td className="py-4 text-zinc-300 text-xs capitalize">
                        {r.category}
                        {r.notes && <span className="block text-[#a1a1aa] text-[10px] mt-1">{r.notes}</span>}
                      </td>
                      <td className="py-4 text-zinc-300 text-xs capitalize">{r.type}</td>
                      <td className={`py-4 text-xs font-medium ${r.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {r.type === 'income' ? '+' : '-'}{fmt(r.amount)} INR
                      </td>
                      {canMutate && (
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="text-[10px] font-medium text-rose-500/0 hover:bg-rose-500/10 hover:text-rose-400 px-3 py-1.5 rounded border border-rose-500/0 hover:border-rose-500/20 group-hover:text-rose-500/50 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center pt-5 mt-auto border-t border-white/5 mt-6">
            <span className="text-zinc-500 text-[11px]">Showing {records.length} results</span>
            <div className="flex items-center space-x-2 text-zinc-500 text-xs font-medium cursor-pointer">
              <span>&lt;</span>
              <span className="text-white">1</span>
              <span>2</span>
              <span>...</span>
              <span>5</span>
              <span>&gt;</span>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#18181A] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">✕</button>
            <h3 className="text-xl font-medium text-white mb-6">New Transaction</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex bg-white/5 rounded-lg p-1 mb-6">
                {['expense', 'income'].map(t => (
                  <button type="button" key={t} onClick={() => setForm({ ...form, type: t })} className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-all ${form.type === t ? (t === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400') : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Amount (INR)</label>
                <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50" placeholder="0.00" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Category</label>
                  <input required type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50" placeholder="e.g. Groceries" />
                </div>
                <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Date & Time</label>
                  <input required type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 [color-scheme:dark]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">Notes (Optional)</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-3 bg-[#121212] border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 h-24 resize-none" placeholder="Add some details..." />
              </div>

              <button disabled={saving} type="submit" className="w-full py-3 mt-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}
