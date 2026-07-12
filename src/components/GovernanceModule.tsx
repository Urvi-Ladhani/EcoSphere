/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  CheckCircle, 
  FileText, 
  BookOpen, 
  Award, 
  User, 
  Calendar,
  AlertTriangle,
  Fingerprint,
  Info
} from 'lucide-react';
import { ESGPolicy, Audit, ComplianceIssue, Profile, PolicyAcknowledgement, Department } from '../types';
import { api } from '../lib/supabase';

interface GovernanceModuleProps {
  dbState: {
    esgPolicies: ESGPolicy[];
    policyAcknowledgements: PolicyAcknowledgement[];
    audits: Audit[];
    complianceIssues: ComplianceIssue[];
    profiles: Profile[];
    departments?: Department[];
  };
  activeProfile: Profile | null;
  triggerRefresh: () => void;
}

type SubTab = 'policies' | 'acknowledgements' | 'audits' | 'compliance';

export default function GovernanceModule({
  dbState,
  activeProfile,
  triggerRefresh
}: GovernanceModuleProps) {
  const { esgPolicies, policyAcknowledgements, audits, complianceIssues, profiles, departments = [] } = dbState;
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('audits');
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isManagement = activeProfile?.role === 'Admin' || activeProfile?.role === 'Manager';

  // --- Policy Form State ---
  const [polName, setPolName] = useState('');
  const [polDesc, setPolDesc] = useState('');
  const [polOwner, setPolOwner] = useState('Corporate Governance');
  const [polEffective, setPolEffective] = useState('');
  const [polVersion, setPolVersion] = useState('v1.0');

  // --- Audit Form State ---
  const [audName, setAudName] = useState('');
  const [audDeptId, setAudDeptId] = useState('');
  const [audAuditor, setAudAuditor] = useState('');
  const [audDate, setAudDate] = useState('');
  const [audScore, setAudScore] = useState(0);
  const [audFindings, setAudFindings] = useState('');
  const [audStatus, setAudStatus] = useState<'Draft' | 'Scheduled' | 'Completed'>('Scheduled');

  // --- Compliance Form State ---
  const [ciAuditId, setCiAuditId] = useState<string | null>(null);
  const [ciSeverity, setCiSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [ciDesc, setCiDesc] = useState('');
  const [ciOwner, setCiOwner] = useState('');
  const [ciDueDate, setCiDueDate] = useState('');

  const resetForms = () => {
    setShowAddForm(false);
    setErrorMessage('');
    // Policy
    setPolName('');
    setPolDesc('');
    setPolOwner('Corporate Governance');
    setPolEffective('');
    setPolVersion('v1.0');
    // Audit
    setAudName('');
    setAudDeptId(profiles[0]?.department_id || '');
    setAudAuditor('');
    setAudDate('');
    setAudScore(0);
    setAudFindings('');
    setAudStatus('Scheduled');
    // Compliance
    setCiAuditId(null);
    setCiSeverity('Medium');
    setCiDesc('');
    setCiOwner('');
    setCiDueDate('');
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!polName.trim() || !polDesc.trim() || !polEffective) {
      setErrorMessage('Policy name, effective date, and description details are required.');
      return;
    }
    try {
      await api.createPolicy({
        name: polName,
        description: polDesc,
        department_owner: polOwner,
        effective_date: polEffective,
        version: polVersion,
        status: 'Published'
      });
      triggerRefresh();
      resetForms();
    } catch (err) {
      setErrorMessage('Failed to create ESG policy.');
    }
  };

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audName.trim() || !audAuditor.trim() || !audDate) {
      setErrorMessage('Audit title, auditor name, and scheduled date are required.');
      return;
    }
    try {
      await api.createAudit({
        name: audName,
        department_id: audDeptId || null as any,
        auditor_name: audAuditor,
        audit_date: audDate,
        score: Number(audScore),
        findings: audFindings,
        status: audStatus
      });
      triggerRefresh();
      resetForms();
    } catch (err) {
      setErrorMessage('Failed to schedule audit.');
    }
  };

  const handleCreateCompliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ciDesc.trim() || !ciOwner.trim() || !ciDueDate) {
      setErrorMessage('Compliance description, assigned owner, and target due date are required.');
      return;
    }
    try {
      await api.createComplianceIssue({
        audit_id: ciAuditId,
        severity: ciSeverity,
        description: ciDesc,
        owner_name: ciOwner,
        due_date: ciDueDate,
        status: 'Open'
      });
      triggerRefresh();
      resetForms();
    } catch (err) {
      setErrorMessage('Failed to report violation issue.');
    }
  };

  const handleAcknowledgePolicy = async (policyId: string) => {
    if (!activeProfile) return;
    try {
      await api.acknowledgePolicy(policyId, {
        employee_id: activeProfile.id,
        employee_name: activeProfile.name
      });
      triggerRefresh();
      alert('Policy successfully acknowledged! You have earned +20 XP & +10 Points!');
    } catch (err: any) {
      alert(err.message || 'Acknowledgment failed.');
    }
  };

  const handleResolveCompliance = async (id: string) => {
    try {
      await api.updateComplianceIssue(id, { status: 'Resolved' });
      triggerRefresh();
    } catch (err) {
      alert('Failed to resolve issue.');
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm('Archive and delete policy permanently?')) return;
    await api.deletePolicy(id);
    triggerRefresh();
  };

  const handleDeleteAudit = async (id: string) => {
    if (!confirm('Cancel and remove audit ledger?')) return;
    await api.deleteAudit(id);
    triggerRefresh();
  };

  const handleDeleteCompliance = async (id: string) => {
    if (!confirm('Delete compliance issue?')) return;
    await api.deleteComplianceIssue(id);
    triggerRefresh();
  };

  const handleExportAuditsCSV = () => {
    let csv = "Title,Department,Auditor,Date,Findings,Status\n";
    audits.forEach(a => {
      const dept = departments.find(d => d.id === a.department_id);
      csv += `"${a.name}","${dept?.name || 'Corporate'}","${a.auditor_name}","${a.audit_date}","${a.findings}","${a.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "audits_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="governance_module">
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="gov_header">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Corporate Governance &amp; Compliance
          </h2>
          <p className="text-xs text-slate-500 mt-1">Audit ESG guidelines, publish policies, acknowledge ethical directives, and monitor unresolved corporate risks.</p>
        </div>

        {isManagement && !showAddForm && (
          <button
            onClick={() => {
              resetForms();
              setShowAddForm(true);
            }}
            className={`text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 self-start md:self-auto transition cursor-pointer ${
              activeSubTab === 'audits' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
            id="gov_action_btn"
          >
            <Plus className="w-4 h-4" />
            {activeSubTab === 'policies' && 'Publish ESG Policy'}
            {activeSubTab === 'audits' && 'Log Audit Record'}
            {activeSubTab === 'compliance' && 'Raise Compliance Issue'}
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200" id="gov_tabs">
        {[
          { id: 'policies', label: 'Policies', icon: BookOpen },
          { id: 'acknowledgements', label: 'Policy Acknowledgements', icon: Fingerprint },
          { id: 'audits', label: 'Audits', icon: FileText },
          { id: 'compliance', label: 'Compliance Issues', icon: AlertTriangle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as SubTab);
                resetForms();
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isActive 
                  ? (tab.id === 'audits' ? 'border-purple-600 text-purple-600 font-extrabold' : 'border-emerald-600 text-emerald-600 font-extrabold') 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id={`gov_tab_${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Creation Forms */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-2xl" id="gov_form_wrapper">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">
              {activeSubTab === 'policies' && 'Publish New Corporate ESG Guideline'}
              {activeSubTab === 'audits' && 'Schedule / Record ESG Audit'}
              {activeSubTab === 'compliance' && 'Log Operational Non-Compliance Violation'}
            </h3>
            <button onClick={resetForms} className="text-slate-400 hover:text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl text-rose-700 text-xs font-medium mt-4">
              {errorMessage}
            </div>
          )}

          {/* Form 1: Policy */}
          {activeSubTab === 'policies' && (
            <form onSubmit={handleCreatePolicy} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Policy Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Conflict Mineral Mitigation Directive"
                    value={polName}
                    onChange={(e) => setPolName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Version Code</label>
                  <input
                    type="text"
                    placeholder="v1.0"
                    value={polVersion}
                    onChange={(e) => setPolVersion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department Owner</label>
                  <input
                    type="text"
                    value={polOwner}
                    onChange={(e) => setPolOwner(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={polEffective}
                    onChange={(e) => setPolEffective(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Directive Details &amp; Mandates</label>
                <textarea
                  placeholder="Draft policy codes, penalties, standards, guidelines..."
                  rows={4}
                  value={polDesc}
                  onChange={(e) => setPolDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Publish Policy</button>
              </div>
            </form>
          )}

          {/* Form 2: Audit */}
          {activeSubTab === 'audits' && (
            <form onSubmit={handleCreateAudit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Audit Ledger Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Annual Conflict Miner Risk Audit"
                    value={audName}
                    onChange={(e) => setAudName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Auditing Body Name</label>
                  <input
                    type="text"
                    placeholder="e.g., SGS Global Verification Group"
                    value={audAuditor}
                    onChange={(e) => setAudAuditor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Audit Date</label>
                  <input
                    type="date"
                    value={audDate}
                    onChange={(e) => setAudDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Score (0-100, if Complete)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={audScore}
                    onChange={(e) => setAudScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={audStatus}
                    onChange={(e) => setAudStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft Checklist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Findings Notes / Deficiencies</label>
                <textarea
                  placeholder="Log auditor comments, leaks, violations, notes..."
                  rows={3}
                  value={audFindings}
                  onChange={(e) => setAudFindings(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Save Audit Record</button>
              </div>
            </form>
          )}

          {/* Form 3: Compliance Issue */}
          {activeSubTab === 'compliance' && (
            <form onSubmit={handleCreateCompliance} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Associated Audit (Optional)</label>
                  <select
                    value={ciAuditId || ''}
                    onChange={(e) => setCiAuditId(e.target.value || null)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    <option value="">Independent Violation (No Audit Link)</option>
                    {audits.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Severity Rating</label>
                  <select
                    value={ciSeverity}
                    onChange={(e) => setCiSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Disruption</option>
                    <option value="Critical">Critical Breach</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Owner (Full Name)</label>
                  <input
                    type="text"
                    placeholder="e.g., Sarah Smith"
                    value={ciOwner}
                    onChange={(e) => setCiOwner(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Remediation Due Date</label>
                  <input
                    type="date"
                    value={ciDueDate}
                    onChange={(e) => setCiDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Mitigation Required</label>
                <textarea
                  placeholder="Outline exactly what is broken and how it must be fixed."
                  rows={3}
                  value={ciDesc}
                  onChange={(e) => setCiDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
                <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Raise Violation Issue</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* RENDER LISTS */}

      {/* Tab 1: Policies List */}
      {activeSubTab === 'policies' && (
        <div className="space-y-4" id="policies_list">
          {esgPolicies.map((pol) => {
            const hasAcknowledged = policyAcknowledgements.some(
              pa => pa.policy_id === pol.id && pa.employee_id === activeProfile?.id
            );
            const ackCount = policyAcknowledgements.filter(pa => pa.policy_id === pol.id).length;

            return (
              <div key={pol.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id={`pol_card_${pol.id}`}>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{pol.status}</span>
                    <span className="text-[10px] text-slate-400 font-bold">Version: {pol.version} &bull; Effective: {pol.effective_date}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{pol.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">{pol.description}</p>
                  <span className="inline-block text-[10px] text-slate-400 font-semibold">Department Owner: {pol.department_owner} &bull; {ackCount} Signatures Collected</span>
                </div>

                <div className="flex md:flex-col items-end gap-3 self-stretch justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                  {hasAcknowledged ? (
                    <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-xs font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Acknowledged</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcknowledgePolicy(pol.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
                      id={`ack_pol_btn_${pol.id}`}
                    >
                      <Fingerprint className="w-4 h-4" /> Acknowledge
                    </button>
                  )}

                  {isManagement && (
                    <button
                      onClick={() => handleDeletePolicy(pol.id)}
                      className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1 px-2 py-1 hover:bg-slate-50 rounded-lg"
                      id={`delete_pol_${pol.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Policy Acknowledgements */}
      {activeSubTab === 'acknowledgements' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="acknowledgements_ledger_card">
          <div className="p-5 border-b border-slate-100 bg-slate-50/55 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-sm">Policy Acknowledgement Sign-offs Ledger</span>
            <span className="text-xs text-slate-400">Total sign-offs: <strong className="text-slate-700">{policyAcknowledgements.length} signatures</strong></span>
          </div>

          <div className="overflow-x-auto" id="acks_table_container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3">Employee</th>
                  <th className="p-3">Policy Title</th>
                  <th className="p-3 text-center">Acknowledged Date</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {policyAcknowledgements.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 italic">No acknowledgement records signed yet.</td>
                  </tr>
                ) : (
                  policyAcknowledgements.map((ack) => {
                    const policy = esgPolicies.find(p => p.id === ack.policy_id);
                    return (
                      <tr key={ack.id} className="hover:bg-slate-50/50" id={`ack_row_${ack.id}`}>
                        <td className="p-3 font-bold text-slate-800">{ack.employee_name}</td>
                        <td className="p-3 font-medium text-slate-700">{policy?.name || 'ESG Directive Policy'}</td>
                        <td className="p-3 text-center text-slate-500">{ack.acknowledged_at?.split('T')[0] || new Date().toISOString().split('T')[0]}</td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wide font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Signed
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audits & Compliance raised */}
      {activeSubTab === 'audits' && (
        <div className="space-y-6" id="audits_tab_view">
          
          {/* Audits Ledger */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="audits_ledger_card">
            
            {/* Header / Actions Row */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/55 flex justify-between items-center flex-wrap gap-3">
              <span className="font-bold text-slate-800 text-sm">Official ESG Auditing Records Ledger</span>
              <div className="flex gap-2">
                {isManagement && (
                  <button
                    onClick={() => {
                      resetForms();
                      setShowAddForm(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-750 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm"
                    id="new_audit_btn"
                  >
                    <Plus className="w-3 h-3" /> + New Audit
                  </button>
                )}
                <button
                  onClick={handleExportAuditsCSV}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-300 transition cursor-pointer flex items-center gap-1"
                  id="export_audits_btn"
                >
                  Export ▾
                </button>
              </div>
            </div>

            <div className="overflow-x-auto" id="audits_table_container">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="p-3">Title</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Auditor</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Findings</th>
                    <th className="p-3 text-center">Status</th>
                    {isManagement && <th className="p-3 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {audits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic">No recorded audits found.</td>
                    </tr>
                  ) : (
                    audits.map((aud) => {
                      const dept = departments.find(d => d.id === aud.department_id);
                      
                      // Map status labels
                      const displayStatus = aud.status === 'Completed' ? 'Completed' :
                                            aud.status === 'Scheduled' ? 'Under Review' : 'Draft';
                      const statusColor = displayStatus === 'Completed' ? 'bg-blue-100 text-blue-800 border-blue-200 font-bold' :
                                          displayStatus === 'Under Review' ? 'bg-purple-100 text-purple-800 border-purple-200 font-bold' :
                                          'bg-slate-100 text-slate-600 border-slate-200 font-bold';

                      return (
                        <tr key={aud.id} className="hover:bg-slate-50/50" id={`aud_row_${aud.id}`}>
                          <td className="p-3 font-semibold text-slate-800">{aud.name}</td>
                          <td className="p-3 font-semibold text-slate-650">{dept?.name || 'Corporate'}</td>
                          <td className="p-3 font-medium text-slate-600">{aud.auditor_name}</td>
                          <td className="p-3 font-medium text-slate-500">{aud.audit_date}</td>
                          <td className="p-3 text-slate-550 max-w-xs truncate" title={aud.findings}>{aud.findings || 'No notes recorded.'}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] border ${statusColor}`}>
                              {displayStatus}
                            </span>
                          </td>
                          {isManagement && (
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleDeleteAudit(aud.id)}
                                className="text-slate-450 hover:text-rose-650 p-1 cursor-pointer"
                                id={`delete_aud_${aud.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance issues section header */}
          <div className="mt-8 border-t border-slate-150 pt-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 pl-1">
              Compliance Issues raised from Audits — severity-tagged, resolution tracked
            </h4>

            {/* Compliance Issues raised Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="compliance_ledger_table_container">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="p-3">Issue</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {complianceIssues.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 italic">No compliance issues logged.</td>
                      </tr>
                    ) : (
                      complianceIssues.map((ci) => {
                        const audit = audits.find(a => a.id === ci.audit_id);
                        const dept = departments.find(d => d.id === audit?.department_id);
                        const deptName = dept?.name || 'Corporate';

                        // Severity coloring matching drawing pills
                        const displaySeverity = ci.severity;
                        const sevColor = displaySeverity === 'Critical' || displaySeverity === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold' :
                                         displaySeverity === 'Medium' ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' :
                                         'bg-slate-100 text-slate-600 border-slate-200 font-bold';

                        // Status coloring matching drawing pills
                        const displayStatus = ci.status;
                        const statusColor = displayStatus === 'Open' ? 'bg-rose-100 text-rose-800 border-rose-200 font-bold' :
                                            'bg-emerald-100 text-emerald-800 border-emerald-250 font-bold';

                        return (
                          <tr key={ci.id} className="hover:bg-slate-50/50" id={`queue_ci_row_${ci.id}`}>
                            <td className="p-3 font-semibold text-slate-800">{ci.description}</td>
                            <td className="p-3">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] border ${sevColor}`}>
                                {displaySeverity}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-650">{deptName}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] border ${statusColor}`}>
                                {displayStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Compliance Issues History */}
      {activeSubTab === 'compliance' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="compliance_issues_card">
          <div className="p-5 border-b border-slate-100 bg-slate-50/55 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-sm">Full Compliance Violation Risks Log</span>
            <span className="text-xs text-slate-400">Total reported: <strong className="text-slate-700">{complianceIssues.length} issues</strong></span>
          </div>

          <div className="overflow-x-auto" id="compliance_table_container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-3">Severity</th>
                  <th className="p-3">Description of Breach</th>
                  <th className="p-3">Assigned Owner</th>
                  <th className="p-3">Mitigation Due</th>
                  <th className="p-3 text-center">Status</th>
                  {isManagement && <th className="p-3 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {complianceIssues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">No violations logged.</td>
                  </tr>
                ) : (
                  complianceIssues.map((ci) => {
                    const isOverdue = ci.status !== 'Resolved' && new Date(ci.due_date) < new Date();
                    return (
                      <tr 
                        key={ci.id} 
                        className={`hover:bg-slate-50/50 ${isOverdue ? 'bg-rose-50/30' : ''}`}
                        id={`ci_row_${ci.id}`}
                      >
                        <td className="p-3 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wide font-bold ${
                            ci.severity === 'Critical' ? 'bg-rose-105 text-rose-800' :
                            ci.severity === 'High' ? 'bg-orange-105 text-orange-850' :
                            ci.severity === 'Medium' ? 'bg-amber-105 text-amber-850' :
                            'bg-slate-105 text-slate-750'
                          }`}>
                            {ci.severity}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-800 leading-normal">{ci.description}</p>
                          {isOverdue && (
                            <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-rose-500" /> Past Due Audit Warning
                            </p>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap font-medium text-slate-700">{ci.owner_name}</td>
                        <td className="p-3 whitespace-nowrap font-medium text-slate-500">{ci.due_date}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ci.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ci.status}
                          </span>
                        </td>
                        {isManagement && (
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              {ci.status !== 'Resolved' && (
                                <button
                                  onClick={() => handleResolveCompliance(ci.id)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                                  id={`resolve_ci_${ci.id}`}
                                >
                                  Resolve
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteCompliance(ci.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                id={`delete_ci_${ci.id}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
