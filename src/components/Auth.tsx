import React, { useState, useEffect } from 'react';
import { Leaf, Lock, Mail, User, Shield, Building2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { api } from '../lib/supabase';
import { Department } from '../types';

interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Manager' | 'Employee'>('Employee');
  const [departmentId, setDepartmentId] = useState('');
  
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch departments for registration select
  useEffect(() => {
    api.getDepartments()
      .then(setDepartments)
      .catch((err) => console.error("Error loading departments for auth", err));
  }, []);

  // Pre-fill first department ID if loaded
  useEffect(() => {
    if (departments.length > 0 && !departmentId) {
      setDepartmentId(departments[0].id);
    }
  }, [departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Email and Password are required.');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Full Name is required.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await api.signup(email, password, name, role, departmentId);
      } else {
        await api.login(email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4 font-sans relative overflow-hidden" id="auth_container">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative" id="auth_card">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8" id="auth_logo_header">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 animate-bounce">
            <Leaf className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
            EcoSphere <span className="text-emerald-400">Platform</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium text-center">
            Integrated Enterprise ESG Analytics &amp; Compliance Ledger
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-850 p-1.5 rounded-2xl mb-6 border border-white/5" id="auth_tabs">
          <button
            onClick={() => { setIsSignUp(false); setError(''); }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition ${
              !isSignUp ? 'bg-emerald-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
            id="tab_login"
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(''); }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition ${
              isSignUp ? 'bg-emerald-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
            id="tab_register"
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-2xl font-semibold flex items-center gap-2 animate-fade-in" id="auth_error_alert">
            <span>{error}</span>
          </div>
        )}

        {/* Sign In & Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth_form">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 pl-11 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 pl-11 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 pl-11 pr-11 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-white p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Access Role</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3 pl-11 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium appearance-none"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Department</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3 pl-11 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium appearance-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-750 text-slate-950 font-extrabold text-xs py-3 rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-150 flex items-center justify-center gap-2 mt-6 cursor-pointer"
            id="auth_submit_btn"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                {isSignUp ? 'Create Corporate Account' : 'Authenticate Session'}
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Panel */}
        {!isSignUp && (
          <div className="mt-8 border-t border-white/5 pt-6 text-[10px] text-slate-400" id="demo_accounts_info">
            <p className="font-bold uppercase tracking-wider text-slate-500 mb-2">Seeded Demo Credentials</p>
            <div className="space-y-1.5 font-mono">
              <p>🔑 <strong className="text-slate-300">Admin</strong>: tanmaymevada24@gmail.com / admin123</p>
              <p>🔑 <strong className="text-slate-300">Manager</strong>: sarah.smith@ecosphere.com / manager123</p>
              <p>🔑 <strong className="text-slate-300">Employee</strong>: alex.wong@ecosphere.com / employee123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
