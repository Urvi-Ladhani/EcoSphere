/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Leaf, Lock, Mail, User, Shield, Building2, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden" id="auth_container">
      {/* Decorative Brand Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative" id="auth_card">
        
        {/* Brand Logo & Heading */}
        <div className="flex flex-col items-center mb-8" id="auth_logo_header">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm mb-4">
            <Leaf className="w-6 h-6 text-emerald-600 fill-emerald-600/10" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
            EcoSphere <span className="text-emerald-650">Platform</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium text-center">
            Integrated Enterprise ESG Analytics &amp; Compliance Ledger
          </p>
        </div>

        {/* Tab Switcher Controls */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200/40" id="auth_tabs">
          <button
            onClick={() => { setIsSignUp(false); setError(''); }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              !isSignUp ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab_login"
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(''); }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              isSignUp ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab_register"
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-2xl font-semibold flex items-start gap-2.5 animate-fade-in animate-duration-150" id="auth_error_alert">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth_form">
          
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-450 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-350 rounded-2xl p-3 pl-11 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-455 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-355 rounded-2xl p-3 pl-11 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-455 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-355 rounded-2xl p-3 pl-11 pr-11 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 p-0.5 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Access Role</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-slate-455 absolute left-3.5 top-3.5" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-355 rounded-2xl p-3 pl-11 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium transition appearance-none cursor-pointer"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Department</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-455 absolute left-3.5 top-3.5" />
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 hover:border-slate-355 rounded-2xl p-3 pl-11 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium transition appearance-none cursor-pointer"
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
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs py-3.5 rounded-2xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-6 cursor-pointer"
            id="auth_submit_btn"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-450 fill-emerald-450" />
                {isSignUp ? 'Create Corporate Account' : 'Authenticate Session'}
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Section */}
        {!isSignUp && (
          <div className="mt-8 border-t border-slate-100 pt-6 text-[10px] text-slate-400" id="demo_accounts_info">
            <p className="font-bold uppercase tracking-wider text-slate-500 mb-2">Seeded Demo Credentials</p>
            <div className="space-y-1.5 font-mono bg-slate-50 border border-slate-100 p-3 rounded-2xl text-slate-500">
              <p>🔑 <strong className="text-slate-700">Admin</strong>: tanmaymevada24@gmail.com / admin123</p>
              <p>🔑 <strong className="text-slate-700">Manager</strong>: sarah.smith@ecosphere.com / manager123</p>
              <p>🔑 <strong className="text-slate-700">Employee</strong>: alex.wong@ecosphere.com / employee123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
