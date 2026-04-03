import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

export default function UserManagement({ user, setUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateRole = async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/users/${userId}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch { alert('Failed to update role'); }
  };

  const pending = users.filter(u => u.requested_role);

  return (
    <Layout user={user} setUser={setUser}>
      <div className="max-w-[1440px] mx-auto flex flex-col gap-6">

        {/* Header Block */}
        <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg font-medium">Access Control</h3>
              <p className="text-zinc-500 text-xs mt-1">Manage user roles and permissions</p>
            </div>
            {pending.length > 0 && (
              <div className="flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="text-orange-500 text-xs font-semibold">{pending.length} Requests</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
            {[
              { label: 'Total Users', value: users.length },
              { label: 'Analysts', value: users.filter(u => u.role === 'ANALYST').length },
              { label: 'Pending', value: pending.length },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] text-zinc-500 uppercase font-medium">{label}</p>
                <p className="text-2xl text-white font-medium mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table Block */}
        <div className="bg-[#18181A] rounded-2xl p-6 border border-white/5 flex-1 flex flex-col min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[11px] font-medium text-zinc-500">User</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500">Current Role</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500">Status</th>
                  <th className="pb-4 text-[11px] font-medium text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="py-8 text-center text-zinc-500 text-xs">Loading...</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 text-xs font-semibold">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{u.name}</p>
                            <p className="text-[11px] text-zinc-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-medium text-zinc-400">{u.role}</td>
                      <td className="py-4 text-xs">
                        {u.requested_role ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px]">
                            Requests {u.requested_role}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-zinc-500 border border-white/5 text-[10px]">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          {u.role !== 'ADMIN' && u.role !== 'ANALYST' && (
                            <button
                              onClick={() => handleUpdateRole(u.id, 'ANALYST')}
                              className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-colors"
                            >
                              Grant Analyst
                            </button>
                          )}
                          {u.role === 'ANALYST' && (
                            <button
                              onClick={() => handleUpdateRole(u.id, 'VIEWER')}
                              className="text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-full hover:bg-rose-500/20 transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
