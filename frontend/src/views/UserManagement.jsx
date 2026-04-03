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
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdateRole = async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/users/${userId}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const roleColors = {
    ADMIN:   'bg-violet-50 text-violet-700 border-violet-100',
    ANALYST: 'bg-sky-50 text-sky-700 border-sky-100',
    VIEWER:  'bg-[#EEEDE8] text-[#6B6B6B] border-[#E8E8E4]',
  };

  const pendingCount = users.filter(u => u.requested_role).length;

  return (
    <Layout user={user} setUser={setUser}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tight" style={{fontFamily: 'Syne, sans-serif'}}>
              Access Control
            </h2>
            <p className="text-xs text-[#ABABAB] mt-1">Manage system roles and pending requests</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center space-x-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">{pendingCount} pending request{pendingCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: users.length },
            { label: 'Analysts', value: users.filter(u => u.role === 'ANALYST').length },
            { label: 'Pending', value: pendingCount },
          ].map(({ label, value }) => (
            <div key={label} className="card px-5 py-4">
              <p className="text-[10px] font-semibold text-[#ABABAB] uppercase tracking-widest mb-1">{label}</p>
              <p className="text-2xl font-black text-[#0A0A0A]" style={{fontFamily: 'Syne, sans-serif'}}>{value}</p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8E8E4]">
                {['User', 'Role', 'Request', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-semibold text-[#ABABAB] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="border-b border-[#E8E8E4]">
                    {[1,2,3,4].map(j => <td key={j} className="px-5 py-4"><div className="h-3 bg-[#EEEDE8] rounded-full animate-pulse w-20" /></td>)}
                  </tr>
                ))
              ) : users.map((u) => (
                <tr key={u.id} className={`border-b border-[#E8E8E4] hover:bg-[#F7F6F3] transition-colors ${u.requested_role ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0A0A0A] text-xs">{u.name}</p>
                        <p className="text-[10px] text-[#ABABAB]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {u.requested_role ? (
                      <span className="badge-pending">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                        <span>Wants {u.requested_role}</span>
                      </span>
                    ) : (
                      <span className="text-[#ABABAB] text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-2">
                      {u.role !== 'ADMIN' && u.role !== 'ANALYST' && (
                        <button
                          onClick={() => handleUpdateRole(u.id, 'ANALYST')}
                          className="text-[10px] font-semibold px-3 py-1.5 bg-[#0A0A0A] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                        >
                          Grant Analyst
                        </button>
                      )}
                      {u.role === 'ANALYST' && (
                        <button
                          onClick={() => handleUpdateRole(u.id, 'VIEWER')}
                          className="text-[10px] font-semibold px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
