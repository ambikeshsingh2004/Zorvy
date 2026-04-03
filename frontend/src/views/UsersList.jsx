import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

export default function UsersList({ user }) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/user-analytics/users?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const getRoleBadge = (role) => {
    const colors = {
      'ADMIN': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'ANALYST': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      'VIEWER': 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    };
    return colors[role] || colors['VIEWER'];
  };

  return (
    <Layout user={user} setUser={() => {}}>
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="mb-2">
          <h2 className="text-3xl font-semibold text-white tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>User Analytics</h2>
          <p className="text-zinc-500 text-sm mt-1.5 font-medium">Select a user to analyze their financial records in detail.</p>
        </div>

        {/* Users Table */}
        <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex-1 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-medium">All Users</h3>
            <span className="text-zinc-500 text-xs">{pagination.total} total users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Name</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Email</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Role</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Joined</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="py-8 text-center text-zinc-500 text-xs">Loading users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-zinc-500 text-xs">No users found</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 text-white text-sm font-medium">{u.name}</td>
                      <td className="py-4 text-zinc-400 text-xs">{u.email}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[10px] font-medium ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 text-zinc-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => navigate(`/user-analytics/${u.id}`)}
                          className="px-5 py-2 text-xs font-medium rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                        >
                          Analyze
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center pt-5 mt-auto border-t border-white/5 mt-6">
            <span className="text-zinc-500 text-[11px]">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 text-zinc-400 hover:text-white hover:border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).slice(0, 5).map(p => (
                <button
                  key={p}
                  onClick={() => fetchUsers(p)}
                  className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                    p === pagination.page
                      ? 'bg-orange-500 text-white'
                      : 'text-zinc-500 hover:text-white border border-white/5 hover:border-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/5 text-zinc-400 hover:text-white hover:border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
