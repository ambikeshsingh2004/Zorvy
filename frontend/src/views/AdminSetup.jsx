import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminSetup() {
  const [status, setStatus] = useState({ type: '', msg: '' });
  const navigate = useNavigate();

  const handleSetup = async () => {
    try {
      const res = await axios.post('/api/auth/setup-admin');
      setStatus({ type: 'success', msg: res.data.message });
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Setup failed' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Initialize Setup</h2>
        <p className="text-gray-600 mb-8">This will create the default Super Admin user account for your system. Do this only once on a fresh deployment.</p>
        
        {status.msg && (
          <div className={`p-4 mb-4 text-sm rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {status.msg}
          </div>
        )}

        <button
          onClick={handleSetup}
          className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 font-semibold w-full"
        >
          Create Default Admin
        </button>
        
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-6 py-2 text-gray-500 hover:text-gray-800 font-medium w-full"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
