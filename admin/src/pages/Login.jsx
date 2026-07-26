import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const Login = ({ onLoginSuccess, apiUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Login failed. Please check your credentials.');
        return;
      }

      // Check if user role is admin
      if (data.user.role !== 'admin') {
        setMessage('Access Denied: You do not have administrator permissions.');
        return;
      }

      // Save credentials and trigger success callback
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      onLoginSuccess(data.token, data.user);

    } catch (err) {
      console.error(err);
      setMessage('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center px-4">
      <div className="mb-8">
        <Logo className="h-14 w-auto" />
      </div>

      <div className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm space-y-6 w-full max-w-md">
        <div className="text-center pb-2 border-b border-stone-100">
          <h2 className="text-sm font-black tracking-wider uppercase text-stone-900">Admin Control Panel</h2>
          <p className="text-[10px] text-stone-400 font-bold uppercase mt-1">Authorized Personnel Only</p>
        </div>

        {message && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-stone-400"><Mail className="w-4 h-4" /></span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fashion.com"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-stone-400"><Lock className="w-4 h-4" /></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 text-white font-semibold text-xs py-3 rounded-xl hover:bg-stone-850 transition-colors shadow-sm flex justify-center items-center space-x-1.5"
          >
            <span>{loading ? 'Authenticating...' : 'Secure Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
