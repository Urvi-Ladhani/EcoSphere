/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Save, 
  Sparkles, 
  Sliders, 
  Bell, 
  ShieldAlert, 
  Check, 
  Plus, 
  Trash2,
  FolderOpen,
  Info
} from 'lucide-react';
import { ESGSettings, Category } from '../types';
import { api } from '../lib/supabase';

interface SettingsModuleProps {
  settings: ESGSettings;
  categories: Category[];
  userRole: string;
  triggerRefresh: () => void;
}

export default function SettingsModule({
  settings,
  categories,
  userRole,
  triggerRefresh
}: SettingsModuleProps) {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isManagement = userRole === 'Admin' || userRole === 'Manager';

  // --- Dynamic Weights State ---
  const [wEnv, setWEnv] = useState(settings.weight_environmental);
  const [wSoc, setWSoc] = useState(settings.weight_social);
  const [wGov, setWGov] = useState(settings.weight_governance);

  // --- Boolean Toggles State ---
  const [autoEmission, setAutoEmission] = useState(settings.auto_emission_calculation);
  const [evidenceReq, setEvidenceReq] = useState(settings.evidence_requirement_enabled);
  const [badgeAuto, setBadgeAuto] = useState(settings.badge_auto_award_enabled);

  const [notifCompliance, setNotifCompliance] = useState(settings.notification_compliance_raised);
  const [notifCSR, setNotifCSR] = useState(settings.notification_csr_challenge_decision);
  const [notifPolicy, setNotifPolicy] = useState(settings.notification_policy_reminder);
  const [notifBadge, setNotifBadge] = useState(settings.notification_badge_unlock);

  // --- Category Form State ---
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'Challenge' | 'CSR Activity'>('Challenge');

  useEffect(() => {
    setWEnv(settings.weight_environmental);
    setWSoc(settings.weight_social);
    setWGov(settings.weight_governance);
    setAutoEmission(settings.auto_emission_calculation);
    setEvidenceReq(settings.evidence_requirement_enabled);
    setBadgeAuto(settings.badge_auto_award_enabled);
    setNotifCompliance(settings.notification_compliance_raised);
    setNotifCSR(settings.notification_csr_challenge_decision);
    setNotifPolicy(settings.notification_policy_reminder);
    setNotifBadge(settings.notification_badge_unlock);
  }, [settings]);

  const totalSum = Number(wEnv) + Number(wSoc) + Number(wGov);
  const isSumValid = totalSum === 100;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!isSumValid) {
      setErrorMsg(`Mathematical Error: ESG scoring weights must sum to exactly 100%. Current sum: ${totalSum}%.`);
      return;
    }

    try {
      const updatedSettings: ESGSettings = {
        weight_environmental: Number(wEnv),
        weight_social: Number(wSoc),
        weight_governance: Number(wGov),
        auto_emission_calculation: autoEmission,
        evidence_requirement_enabled: evidenceReq,
        badge_auto_award_enabled: badgeAuto,
        notification_compliance_raised: notifCompliance,
        notification_csr_challenge_decision: notifCSR,
        notification_policy_reminder: notifPolicy,
        notification_badge_unlock: notifBadge
      };

      await api.updateSettings(updatedSettings);
      setSuccessMsg('Platform configuration updated successfully! ESG metrics are re-calculated across all departments.');
      triggerRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Failed to save settings.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!catName.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }
    try {
      await api.createCategory({
        name: catName,
        type: catType,
        status: 'Active'
      });
      setCatName('');
      triggerRefresh();
    } catch (err) {
      setErrorMsg('Failed to create category code.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category code?')) return;
    try {
      await api.deleteCategory(id);
      triggerRefresh();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  return (
    <div className="space-y-6" id="settings_module">
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="settings_header">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-emerald-600" /> Administrative Console &amp; Configurations
        </h2>
        <p className="text-xs text-slate-500 mt-1">Calibrate carbon weighting models, adjust gamification thresholds, manage corporate classifications, and customize automated notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="settings_workspace">
        
        {/* Left Side: System Toggles & Weights (2/3 width) */}
        <div className="lg:col-span-2 space-y-6" id="settings_left_panel">
          
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" /> Dynamic Score Weighting Models
              </h3>
              
              {isManagement && (
                <button
                  type="submit"
                  disabled={!isSumValid}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm ${
                    isSumValid 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  id="save_settings_btn"
                >
                  <Save className="w-4 h-4" /> Save Parameters
                </button>
              )}
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-150 text-xs rounded-xl font-medium">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-150 text-xs rounded-xl font-medium">
                {errorMsg}
              </div>
            )}

            {/* Sum indicator gauge */}
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              isSumValid ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
            }`} id="sum_validation_indicator">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Organization Weighted Sum Requirement:
              </span>
              <span className="text-sm font-extrabold">{totalSum} % / 100% {isSumValid ? '✓ (Valid)' : '✗ (Sum must equal 100%)'}</span>
            </div>

            {/* sliders */}
            <div className="space-y-4" id="weight_sliders">
              {/* E */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Environmental Weighting (E-Score)</span>
                  <span className="text-slate-700">{wEnv} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wEnv}
                  disabled={!isManagement}
                  onChange={(e) => setWEnv(Number(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* S */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-700">Social &amp; CSR Weighting (S-Score)</span>
                  <span className="text-slate-700">{wSoc} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wSoc}
                  disabled={!isManagement}
                  onChange={(e) => setWSoc(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* G */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">Corporate Governance Weighting (G-Score)</span>
                  <span className="text-slate-700">{wGov} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wGov}
                  disabled={!isManagement}
                  onChange={(e) => setWGov(Number(e.target.value))}
                  className="w-full accent-amber-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Core Toggles */}
            <div className="pt-6 border-t border-slate-100 space-y-4" id="system_boolean_toggles">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Operational Framework Rules</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Toggle 1: Auto carbon calculations */}
                <div className="flex items-start justify-between gap-4 p-3 border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Auto Emission Calculations</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Automatically calculates carbon KG footprints using conversion factor constants.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoEmission}
                    disabled={!isManagement}
                    onChange={(e) => setAutoEmission(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5"
                  />
                </div>

                {/* Toggle 2: CSR evidence requirement */}
                <div className="flex items-start justify-between gap-4 p-3 border border-slate-100 rounded-xl">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Incentive Evidence Validation</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mandates uploading proof descriptions prior to CSR activity approval and points release.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={evidenceReq}
                    disabled={!isManagement}
                    onChange={(e) => setEvidenceReq(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5"
                  />
                </div>

                {/* Toggle 3: Auto Award badges */}
                <div className="flex items-start justify-between gap-4 p-3 border border-slate-100 rounded-xl sm:col-span-2">
                  <div>
                    <p className="text-xs font-bold text-slate-700">Automated Badge Milestones</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Scans profile balances in real-time to auto-award certificates once milestone XP thresholds are crossed.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={badgeAuto}
                    disabled={!isManagement}
                    onChange={(e) => setBadgeAuto(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Notification triggers customization */}
            <div className="pt-6 border-t border-slate-100 space-y-4" id="notification_customization">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                <Bell className="w-4 h-4 text-slate-500" /> Dynamic Alerts Configuration
              </h4>

              <div className="space-y-2.5 text-xs text-slate-700">
                {/* 1 */}
                <div className="flex items-center justify-between">
                  <span>Dispatch Alerts on raising compliance issues</span>
                  <input
                    type="checkbox"
                    checked={notifCompliance}
                    disabled={!isManagement}
                    onChange={(e) => setNotifCompliance(e.target.checked)}
                    className="w-4 h-4 text-emerald-600"
                  />
                </div>

                {/* 2 */}
                <div className="flex items-center justify-between">
                  <span>Dispatch Alerts on challenge/CSR approvals</span>
                  <input
                    type="checkbox"
                    checked={notifCSR}
                    disabled={!isManagement}
                    onChange={(e) => setNotifCSR(e.target.checked)}
                    className="w-4 h-4 text-emerald-600"
                  />
                </div>

                {/* 3 */}
                <div className="flex items-center justify-between">
                  <span>Send reminders on publishing corporate policies</span>
                  <input
                    type="checkbox"
                    checked={notifPolicy}
                    disabled={!isManagement}
                    onChange={(e) => setNotifPolicy(e.target.checked)}
                    className="w-4 h-4 text-emerald-600"
                  />
                </div>

                {/* 4 */}
                <div className="flex items-center justify-between">
                  <span>Instantly dispatch inbox alerts when unlocking achievement badges</span>
                  <input
                    type="checkbox"
                    checked={notifBadge}
                    disabled={!isManagement}
                    onChange={(e) => setNotifBadge(e.target.checked)}
                    className="w-4 h-4 text-emerald-600"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Side: Category Codes CRUD (1/3 width) */}
        <div className="space-y-6" id="settings_right_panel">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <FolderOpen className="w-4.5 h-4.5 text-emerald-600" /> Category Dictionary Codes
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">Publish or remove custom classifications representing ESG challenges and CSR activities.</p>

            {isManagement && (
              <form onSubmit={handleCreateCategory} className="space-y-3 pt-3 border-t border-slate-100" id="add_category_form">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Water Security Program"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Target Type</label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2 font-medium"
                  >
                    <option value="Challenge">Platform Challenge</option>
                    <option value="CSR Activity">CSR Activity Campaign</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Code
                </button>
              </form>
            )}

            {/* List of active categories */}
            <div className="pt-4 border-t border-slate-100 space-y-2 max-h-[220px] overflow-y-auto" id="categories_list">
              {categories.map((cat) => (
                <div key={cat.id} className="p-2.5 border border-slate-50 bg-slate-55 rounded-xl flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[8px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.2 rounded uppercase mr-1.5">{cat.type}</span>
                    <strong className="text-slate-700 font-bold">{cat.name}</strong>
                  </div>

                  {isManagement && (
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                      id={`delete_cat_${cat.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
