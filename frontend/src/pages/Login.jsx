import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, register, token, user } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [token, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setMessage(res.message || 'Login failed');
        }
      } else {
        const res = await register(name, email, password);
        if (!res.success) {
          setMessage(res.message || 'Registration failed');
        }
      }
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-100">
          <button
            onClick={() => {
              setTab('login');
              setMessage('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-colors ${
              tab === 'login' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setTab('register');
              setMessage('');
            }}
            className={`flex-1 pb-3 text-sm font-semibold tracking-wider uppercase border-b-2 transition-colors ${
              tab === 'register' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400'
            }`}
          >
            Sign Up
          </button>
        </div>

        {message && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-stone-400"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Radhika Patel"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 pl-10 pr-3 text-xs focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-stone-400"><Mail className="w-4 h-4" /></span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 pl-10 pr-3 text-xs focus:outline-none focus:border-stone-400"
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
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2 pl-10 pr-3 text-xs focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 text-white font-semibold text-xs py-3 rounded-xl hover:bg-stone-850 transition-colors shadow-sm flex justify-center items-center space-x-1.5"
          >
            <span>{loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
