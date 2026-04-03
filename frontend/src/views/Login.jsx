import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login({ setUser }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      console.log('[FRONTEND] Submitting to endpoint:', endpoint);
      console.log('[FRONTEND] Payload:', payload);

      const res = await axios.post(endpoint, payload);

      console.log('[FRONTEND] Response status:', res.status);
      console.log('[FRONTEND] Response data:', res.data);

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate('/');
    } catch (err) {
      console.error('[FRONTEND] Error status:', err.response?.status);
      console.error('[FRONTEND] Error data:', err.response?.data);
      console.error('[FRONTEND] Full error:', err.message);
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-[#0A0A0A] flex-col justify-between p-12 relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* Glowing orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600 rounded-full blur-[120px] opacity-20 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">Z</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">ZorvFinance</span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-white/70 text-xs font-medium">Live financial tracking</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.05] tracking-tight" style={{fontFamily: 'Syne, sans-serif'}}>
            Take control<br/>
            <span className="text-violet-400">of your money.</span>
          </h1>

          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            A unified dashboard to track income, expenses, and your financial health — built for teams and individuals.
          </p>

          {/* Stat pills */}
          <div className="flex items-center space-x-3 pt-2">
            {[['$2.4M', 'Tracked monthly'], ['3 Roles', 'Access control'], ['100%', 'Secure']].map(([val, label]) => (
              <div key={val} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="text-white font-bold text-sm">{val}</div>
                <div className="text-white/40 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="flex -space-x-2">
              {['A', 'B', 'C'].map((l) => (
                <div key={l} className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 border-2 border-[#0A0A0A] flex items-center justify-center text-white text-xs font-bold">{l}</div>
              ))}
            </div>
            <p className="text-white/40 text-xs">Trusted by thousands of users</p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">Z</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">ZorvFinance</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tight" style={{fontFamily: 'Syne, sans-serif'}}>
              {mode === 'login' ? 'Welcome back.' : 'Get started.'}
            </h2>
            <p className="text-[#6B6B6B] text-sm mt-1.5">
              {mode === 'login' ? 'Sign in to your account to continue.' : 'Create a free account in seconds.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-[#EEEDE8] rounded-xl p-1 mb-6">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setForm({ name: '', email: '', password: '' }); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  mode === m ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start space-x-2.5 p-3.5 mb-5 bg-rose-50 border border-rose-100 rounded-xl">
              <span className="text-rose-500 text-xs mt-0.5">✕</span>
              <span className="text-rose-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 uppercase tracking-wider">Full Name</label>
                <input type="text" name="name" required placeholder="John Doe" value={form.name} onChange={handleChange} className="input-field" autoComplete="name" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" name="email" required placeholder="you@example.com" value={form.email} onChange={handleChange} className="input-field" autoComplete="email" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 uppercase tracking-wider">Password</label>
              <input type="password" name="password" required placeholder={mode === 'signup' ? 'Minimum 6 characters' : '••••••••'} value={form.password} onChange={handleChange} className="input-field" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? '...' : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6B6B6B]">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-violet-600 font-semibold hover:text-violet-700">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="mt-8 text-center text-[10px] text-[#ABABAB]">
            By continuing you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
