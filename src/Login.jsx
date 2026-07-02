import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Supabase သို့ Login ဝင်ရန် လှမ်းတောင်းဆိုခြင်း
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg('အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-blue-600">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-wider text-gray-900">NET AGE</h1>
          <p className="text-sm text-gray-500 font-medium tracking-widest mt-1 uppercase">Business Analysis</p>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">စနစ်သို့ ဝင်ရောက်ရန် (Login)</h2>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-semibold text-center border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">အီးမေးလ် (Email)</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="admin@netage.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">စကားဝှက် (Password)</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition disabled:opacity-50"
          >
            {loading ? 'ဝင်ရောက်နေသည်...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400 font-medium">
          <p>&copy; {new Date().getFullYear()} Net Age Computers. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;