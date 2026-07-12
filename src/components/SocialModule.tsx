/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HeartHandshake, 
  MapPin, 
  Clock, 
  Award, 
  Plus, 
  Trash2, 
  Users, 
  Check, 
  X, 
  UserCheck, 
  AlertCircle,
  FileCheck,
  CheckCircle,
  XCircle,
  UserCheck as UsersIcon,
  HelpCircle
} from 'lucide-react';
import { 
  CSRActivity, 
  EmployeeParticipation, 
  Category, 
  Profile 
} from '../types';
import { api } from '../lib/supabase';
import { 
  ResponsiveContainer, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface SocialModuleProps {
  dbState: {
    csrActivities: CSRActivity[];
    employeeParticipations: EmployeeParticipation[];
    categories: Category[];
    profiles: Profile[];
    settings: any;
  };
  activeProfile: Profile | null;
  triggerRefresh: () => void;
  activeSubTab?: string;
  setActiveSubTab?: (tab: any) => void;
}

type SubTab = 'activities' | 'participation' | 'diversity';

export default function SocialModule(props: SocialModuleProps) {
  const { dbState, activeProfile, triggerRefresh } = props;
  const { csrActivities, employeeParticipations, categories, profiles, settings } = dbState;
  
  const [localSubTab, setLocalSubTab] = useState<SubTab>('activities');
  const activeSubTab = (props.activeSubTab as SubTab) || localSubTab;
  const setActiveSubTab = props.setActiveSubTab || setLocalSubTab;

  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isManagement = activeProfile?.role === 'Admin' || activeProfile?.role === 'Manager';

  // --- CSR Activity Form State ---
  const [actTitle, setActTitle] = useState('');
  const [actCatId, setActCatId] = useState('');
  const [actHost, setActHost] = useState('');
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actPoints, setActPoints] = useState(100);
  const [actLocation, setActLocation] = useState('');

  // --- Employee Register Proof Form State ---
  const [showParticipationForm, setShowParticipationForm] = useState<string | null>(null);
  const [proofInput, setProofInput] = useState('');

  // --- Advanced Selected Row State for Approvals Queue ---
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  // Set default category on startup
  React.useEffect(() => {
    const csrCats = categories.filter(c => c.type === 'CSR Activity');
    if (csrCats.length > 0 && !actCatId) {
      setActCatId(csrCats[0].id);
    }
  }, [categories]);

  const resetForms = () => {
    setShowAddForm(false);
    setShowParticipationForm(null);
    setErrorMessage('');
    setSelectedPartId(null);
    setActTitle('');
    setActHost('');
    setActLocation('');
    setActPoints(100);
    setProofInput('');
    const csrCats = categories.filter(c => c.type === 'CSR Activity');
    if (csrCats.length > 0) {
      setActCatId(csrCats[0].id);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || actPoints <= 0 || !actCatId) {
      setErrorMessage('Activity Title, points estimate, and category are required.');
      return;
    }
    try {
      await api.createCSRActivity({
        title: actTitle,
        category_id: actCatId,
        description: `Organized corporate campaign for volunteer support.`,
        host_organizer: actHost || activeProfile?.name || 'CSR Team',
        date: actDate,
        estimated_points: Number(actPoints),
        location: actLocation || 'Remote/HQ',
        status: 'Active'
      });
      triggerRefresh();
      resetForms();
    } catch (err) {
      setErrorMessage('Failed to create campaign.');
    }
  };

  const handleJoinCSR = async (activityId: string) => {
    if (!activeProfile) return;
    try {
      await api.createEmployeeParticipation({
        id: 'part-' + Math.random().toString(36).substr(2, 9),
        employee_id: activeProfile.id,
        employee_name: activeProfile.name,
        activity_id: activityId,
        proof: '',
        approval_status: 'Pending',
        points_earned: 0,
        completion_date: null
      });
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to register join request.');
    }
  };

  const handleSubmitProof = async (activityId: string) => {
    if (!activeProfile) return;
    if (settings.evidence_requirement_enabled && !proofInput.trim()) {
      alert('Please attach photographic evidence file/description.');
      return;
    }
    try {
      await api.createEmployeeParticipation({
        id: 'part-' + Math.random().toString(36).substr(2, 9),
        employee_id: activeProfile.id,
        employee_name: activeProfile.name,
        activity_id: activityId,
        proof: proofInput,
        approval_status: 'Pending',
        points_earned: 0,
        completion_date: null
      });
      triggerRefresh();
      resetForms();
    } catch (err: any) {
      alert(err.message || 'Failed to submit attendance proof.');
    }
  };

  const handleApproveParticipation = async (id: string) => {
    try {
      await api.updateEmployeeParticipation(id, { approval_status: 'Approved' });
      setSelectedPartId(null);
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleDeclineParticipation = async (id: string) => {
    const reason = prompt('Please specify rejection reason for feedback:');
    if (reason === null) return;
    try {
      await api.updateEmployeeParticipation(id, { 
        approval_status: 'Rejected',
        rejection_reason: reason || 'Insufficient evidence.' 
      } as any);
      setSelectedPartId(null);
      triggerRefresh();
    } catch (err: any) {
      alert('Action failed.');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    if (!confirm('Cancel this CSR Campaign entirely?')) return;
    await api.deleteCSRActivity(id);
    triggerRefresh();
  };

  // --- Diversity Chart Metrics ---
  const COLORS = ['#059669', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'];
  const genderData = [
    { name: 'Female', value: 45 },
    { name: 'Male', value: 52 },
    { name: 'Non-Binary', value: 3 }
  ];
  const ageDist = [
    { range: '20-29', value: 20 },
    { range: '30-39', value: 48 },
    { range: '40-49', value: 22 },
    { range: '50+', value: 10 }
  ];
  const trainingCompletion = [
    { name: 'Engineering', completed: 85, pending: 15 },
    { name: 'Operations', completed: 70, pending: 30 },
    { name: 'Corporate GOV', completed: 100, pending: 0 },
    { name: 'HR Staff', completed: 92, pending: 8 }
  ];

  return (
    <div className="space-y-6" id="social_module">
      {/* Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="social_header">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" /> CSR &amp; Employee Engagement
          </h2>
          <p className="text-xs text-slate-500 mt-1">Participate in community programs, submit attendance proof, manage approvals, and evaluate diversity indicators.</p>
        </div>

        {isManagement && !showAddForm && (
          <button
            onClick={() => {
              resetForms();
              setShowAddForm(true);
            }}
            className="bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 self-start md:self-auto transition cursor-pointer"
            id="register_csr_btn"
          >
            <Plus className="w-4 h-4" /> Create CSR Campaign
          </button>
        )}
      </div>

      {/* Navigation Toggles */}
      <div className="flex border-b border-slate-200" id="social_tabs">
        {[
          { id: 'activities', label: 'CSR Activities', icon: HeartHandshake },
          { id: 'participation', label: 'Employee Participation', icon: FileCheck },
          { id: 'diversity', label: 'Diversity Dashboard', icon: Users }
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
                isActive ? 'border-emerald-650 text-emerald-650' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
              id={`social_tab_${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Forms */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm max-w-2xl" id="csr_addition_form">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Organize Corporate CSR Activity</h3>
            <button onClick={resetForms} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium mt-4">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleCreateActivity} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Activity Title</label>
                <input
                  type="text"
                  placeholder="e.g., Tree Plantation Drive"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Activity Category</label>
                <select
                  value={actCatId}
                  onChange={(e) => setActCatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                >
                  {categories.filter(c => c.type === 'CSR Activity').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Host Organizer</label>
                <input
                  type="text"
                  value={actHost}
                  onChange={(e) => setActHost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Estimated Points</label>
                <input
                  type="number"
                  min={10}
                  value={actPoints}
                  onChange={(e) => setActPoints(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Campaign Date</label>
                <input
                  type="date"
                  value={actDate}
                  onChange={(e) => setActDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Activity Location</label>
              <input
                type="text"
                placeholder="e.g. Greenwood Municipal Park"
                value={actLocation}
                onChange={(e) => setActLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition cursor-pointer">
              Publish Campaign
            </button>
          </form>
        </div>
      )}

      {/* Tab 1: CSR Activities Grid & Approvals Queue */}
      {activeSubTab === 'activities' && (
        <div className="space-y-6" id="activities_tab_workspace">
          {/* Action Trigger */}
          {isManagement && !showAddForm && (
            <button
              onClick={() => {
                resetForms();
                setShowAddForm(true);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              id="new_activity_btn"
            >
              <Plus className="w-4 h-4" /> + New Activity
            </button>
          )}

          {/* CSR Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in" id="csr_activities_grid">
            {csrActivities.map((act) => {
              const myPart = employeeParticipations.find(ep => ep.activity_id === act.id && ep.employee_id === activeProfile?.id);
              const joinCount = employeeParticipations.filter(ep => ep.activity_id === act.id).length;
              
              // Map icons dynamically
              let iconEmoji = '🌱';
              if (act.title.toLowerCase().includes('blood') || act.title.toLowerCase().includes('health')) iconEmoji = '🩸';
              else if (act.title.toLowerCase().includes('beach') || act.title.toLowerCase().includes('cleanup')) iconEmoji = '🏖️';
              else if (act.title.toLowerCase().includes('workshop') || act.title.toLowerCase().includes('safety') || act.title.toLowerCase().includes('training')) iconEmoji = '📚';

              return (
                <div key={act.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition" id={`csr_card_${act.id}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-xs">
                      <span>{iconEmoji}</span>
                      <span>{act.title}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 leading-none mb-1.5">{joinCount} joined</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                      {settings.evidence_requirement_enabled ? 'Evidence Required' : 'Open'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold text-amber-700 font-mono">+{act.estimated_points} pts</span>
                    
                    {myPart ? (
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wide font-bold ${
                        myPart.approval_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        myPart.approval_status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {myPart.approval_status}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (settings.evidence_requirement_enabled) {
                            setShowParticipationForm(act.id);
                          } else {
                            handleJoinCSR(act.id);
                          }
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-lg cursor-pointer"
                        id={`join_csr_${act.id}`}
                      >
                        Join
                      </button>
                    )}
                  </div>

                  {/* Submission form popup */}
                  {showParticipationForm === act.id && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase">Attach Proof Description/URL</label>
                      <input
                        type="text"
                        placeholder="e.g. Photo path or completion brief"
                        value={proofInput}
                        onChange={(e) => setProofInput(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-[10px] rounded p-1.5 focus:outline-none"
                      />
                      <div className="flex gap-1">
                        <button onClick={() => handleSubmitProof(act.id)} className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-1 rounded">Submit</button>
                        <button onClick={() => setShowParticipationForm(null)} className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-1 rounded">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Employee Participation: approval queue */}
          {isManagement && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-6" id="approvals_queue_ledger">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
                Employee Participation: approval queue
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="p-3">Employee</th>
                      <th className="p-3">Activity/Challenge</th>
                      <th className="p-3">Proof</th>
                      <th className="p-3 text-right">Points</th>
                      <th className="p-3 text-center">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {employeeParticipations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">No employee registrations in approval queue.</td>
                      </tr>
                    ) : (
                      employeeParticipations.map((part) => {
                        const act = csrActivities.find(a => a.id === part.activity_id);
                        const isSelected = selectedPartId === part.id;
                        return (
                          <tr 
                            key={part.id} 
                            onClick={() => setSelectedPartId(part.id === selectedPartId ? null : part.id)}
                            className={`cursor-pointer transition hover:bg-slate-50/50 ${
                              isSelected ? 'bg-emerald-50/20 font-semibold' : ''
                            }`}
                            id={`queue_part_row_${part.id}`}
                          >
                            <td className="p-3 font-semibold text-slate-800">{part.employee_name}</td>
                            <td className="p-3 font-medium text-slate-700">{act?.title || 'CSR Campaign'}</td>
                            <td className="p-3 font-mono text-slate-500 select-all">{part.proof || <span className="text-slate-400 italic">No evidence attached</span>}</td>
                            <td className="p-3 text-right font-mono text-amber-700 font-bold">+{act?.estimated_points || 50}</td>
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                                part.approval_status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                part.approval_status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                                'bg-amber-100 text-amber-800 border-amber-200'
                              }`}>
                                {part.approval_status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100" id="queue_actions">
                <button
                  onClick={() => {
                    if (selectedPartId) handleApproveParticipation(selectedPartId);
                  }}
                  disabled={!selectedPartId}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                    selectedPartId 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed'
                  }`}
                  id="approve_selected_btn"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    if (selectedPartId) handleDeclineParticipation(selectedPartId);
                  }}
                  disabled={!selectedPartId}
                  className={`text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                    selectedPartId 
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed'
                  }`}
                  id="reject_selected_btn"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Employee Participation Ledger (Full History View) */}
      {activeSubTab === 'participation' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="approvals_ledger_card">
          <div className="p-5 border-b border-slate-100 bg-slate-50/55 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-sm">Employee Participation Ledger History</span>
            <span className="text-xs text-slate-400">Total participants: <strong className="text-slate-700">{employeeParticipations.length} records</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">CSR Activity Title</th>
                  <th className="p-3">Evidence Description</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Reviewed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {employeeParticipations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No historical participation records.</td>
                  </tr>
                ) : (
                  employeeParticipations.map((part) => {
                    const activity = csrActivities.find(a => a.id === part.activity_id);
                    return (
                      <tr key={part.id} className="hover:bg-slate-50/50" id={`ledger_part_row_${part.id}`}>
                        <td className="p-3 whitespace-nowrap font-bold text-slate-800">{part.employee_name}</td>
                        <td className="p-3 font-medium text-slate-700">{activity?.title || 'CSR Campaign'}</td>
                        <td className="p-3 text-slate-500 leading-relaxed max-w-sm font-mono text-[10px] select-all">
                          {part.proof || <span className="text-slate-400 italic">No proof file submitted.</span>}
                          {part.rejection_reason && (
                            <p className="text-[10px] text-rose-500 font-semibold mt-1">Feedback: "{part.rejection_reason}"</p>
                          )}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            part.approval_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            part.approval_status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {part.approval_status}
                          </span>
                        </td>
                        <td className="p-3 text-center text-slate-400">{part.completion_date || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Diversity Dashboard */}
      {activeSubTab === 'diversity' && (
        <div className="space-y-6" id="diversity_workspace">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Gender Distribution */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="gender_chart_card">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
                Gender Representation
              </h3>
              <div className="h-64" id="gender_chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Age Demographics */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="age_chart_card">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
                Age Distribution Metrics
              </h3>
              <div className="h-64" id="age_chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageDist}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6">
                      {ageDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Social Governance Training Completion */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="training_chart_card">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              Mandatory ESG &amp; Ethics Training Completion
            </h3>
            <div className="h-52 mt-4" id="training_chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingCompletion} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#059669" name="Completed (%)" />
                  <Bar dataKey="pending" stackId="a" fill="#e2e8f0" name="Pending (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
