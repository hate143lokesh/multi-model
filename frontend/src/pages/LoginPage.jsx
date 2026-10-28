import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardHat, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import apiService from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@constructai.io');
  const [password, setPassword] = useState('constructai123');
  const [fullName, setFullName] = useState('Chief Site Engineer');
  const [role, setRole] = useState('Principal Project Manager');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiService.login(email, password);
      localStorage.setItem('constructai_token', res.data.access_token);
      localStorage.setItem('constructai_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiService.register({
        email,
        password,
        full_name: fullName,
        role
      });
      localStorage.setItem('constructai_token', res.data.access_token);
      localStorage.setItem('constructai_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.demoLogin();
      localStorage.setItem('constructai_token', res.data.access_token);
      localStorage.setItem('constructai_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C15] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 mx-auto mb-4 border border-orange-400/30">
            <HardHat className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Construct<span className="text-orange-500">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal Construction Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <h2 className="text-base font-bold text-white">
              {isRegister ? 'Create Site Engineer Account' : 'Sign In to Construction Hub'}
            </h2>
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              {isRegister ? 'Already have account?' : 'Register new account'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins, PE"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Site Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="Principal Project Manager">Principal Project Manager</option>
                    <option value="Senior Structural Engineer">Senior Structural Engineer</option>
                    <option value="Site Safety Officer (OSHA)">Site Safety Officer (OSHA)</option>
                    <option value="Quality Control Inspector">Quality Control Inspector</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@constructai.io"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Complete Registration' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500 block mb-2 font-mono">
              DEMONSTRATION & PROJECT EVALUATION
            </span>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-orange-500/40 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>1-Click Instant Demo Login (Lead Engineer)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500">
          ConstructAI Platform • Enterprise Multimodal Vision System
        </div>
      </div>
    </div>
  );
}
