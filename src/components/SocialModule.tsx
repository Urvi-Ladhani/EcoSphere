/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Trash2, 
  Users, 
  Award, 
  MapPin, 
  Clock, 
  FileCheck, 
  Upload, 
  AlertCircle, 
  Check, 
  X,
  UserCheck,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { CSRActivity, EmployeeParticipation, Category, Profile } from '../types';
import { api } from '../lib/supabase';

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
}

type SubTab = 'activities' | 'approvals' | 'diversity';

export default function SocialModule({
  dbState,
  activeProfile,
  triggerRefresh
}: SocialModuleProps) {
  const { csrActivities, employeeParticipations, categories, profiles, settings } = dbState;
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('activities');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showParticipationForm, setShowParticipationForm] = useState<string | null>(null); // holds activityId
  const [errorMessage, setErrorMessage] = useState('');

  const isManagement = activeProfile?.role === 'Admin' || activeProfile?.role === 'Manager';

  // --- CSR Activity Form State ---
  const [actTitle, setActTitle] = useState('');
  const [actCatId, setActCatId] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actHost, setActHost] = useState('');
  const [actDate, setActDate] = useState('');
  const [actPoints, setActPoints] = useState(100);
  const [actLocation, setActLocation] = useState('');

  // --- Participation Form State ---
  const [partProof, setPartProof] = useState('');

  const resetForms = () => {
    setShowAddForm(false);
    setShowParticipationForm(null);
    setErrorMessage('');
    // CSR
    setActTitle('');
    setActCatId(categories.filter(c => c.type === 'CSR Activity')[0]?.id || '');
    setActDesc('');
    setActHost(activeProfile?.name || '');
    setActDate('');
    setActPoints(100);
    setActLocation('');
    // Part
    setPartProof('');
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actCatId || !actLocation.trim() || !actDate) {
      setErrorMessage('Title, category, location, and date are required.');
      return;
    }
    try {
      await api.createCSRActivity({
        title: actTitle,
        category_id: actCatId,
        description: actDesc,
        host_organizer: actHost,
        date: actDate,
        estimated_points: Number(actPoints),
        location: actLocation,
        status: 'Active'
      });
      triggerRefresh();
      resetForms();
    } catch (err: any) {
      setErrorMessage('Failed to create CSR campaign.');
    }
  };

  const handleSubmitParticipation = async (e: React.FormEvent, activityId: string) => {
    e.preventDefault();
    if (!activeProfile) return;

    if (settings.evidence_requirement_enabled && (!partProof || partProof.trim().length === 0)) {
      setErrorMessage('Evidence Requirement is enabled in the platform. You must submit photographic proof descriptions, ranger receipts, or team logs.');
      return;
    }

    try {
      await api.createEmployeeParticipation({
        employee_id: activeProfile.id,
        employee_name: activeProfile.name,
        activity_id: activityId,
        proof: partProof
      });
      triggerRefresh();
      resetForms();
      alert('Participation logged successfully! Your submission is now in the approvals workspace queue.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error logging participation.');
    }
  };

  const handleApproveParticipation = async (id: string) => {
    try {
      await api.updateEmployeeParticipation(id, { approval_status: 'Approved' });
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
  // Mock statistics for a balanced, inclusive presentation
  const genderData = [
    { name: 'Female', value: 45, fill: '#3b82f6' },
    { name: 'Male', value: 50, fill: '#10b981' },
    { name: 'Non-Binary / Other', value: 5, fill: '#f59e0b' }
  ];

  const payGapData = [
    { role: 'Executive', Male: 110000, Female: 108000 },
    { role: 'Engineering', Male: 85000, Female: 86500 },
    { role: 'Operations', Male: 62000, Female: 63000 },
    { role: 'Manufacturing', Male: 48000, Female: 47500 }
  ];

  const trainingCompletion = [
    { department: 'Engineering', Completion: 95 },
    { department: 'Operations', Completion: 88 },
    { department: 'Manufacturing', Completion: 80 },
    { department: 'Human Resources', Completion: 100 },
    { department: 'Governance', Completion: 100 }
  ];

  return (
    <div className="space-y-6" id="social_module">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="social_header">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" /> CSR Activities &amp; Social Index
          </h2>
          <p className="text-xs text-slate-500 mt-1">Participate in community programs, submit attendance proof, manage approvals, and evaluate diversity indicators.</p>
        </div>

        {isManagement && !showAddForm && (
          <button
            onClick={() => {
              resetForms();
              setShowAddForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 self-start md:self-auto transition"
            id="register_csr_btn"
          >
            <Plus className="w-4 h-4" /> Create CSR Campaign
          </button>
        )}
      </div>

      {/* Navigation Toggles */}
      <div className="flex border-b border-slate-200" id="social_tabs">
        {[
          { id: 'activities', label: 'CSR Campaigns', icon: HeartHandshake },
          { id: 'approvals', label: 'Approvals Workspace', icon: FileCheck },
          { id: 'diversity', label: 'Inclusivity & Training', icon: Users }
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
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                isActive ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'
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
            <button onClick={resetForms} className="text-slate-400 hover:text-slate-600">
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
                  placeholder="e.g., Blood Donation &amp; Health Drive"
                  value={actTitle}
                  onChange={(e) => setActTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Activity Category</label>
                <select
                  value={actCatId}
                  onChange={(e) => setActCatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
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
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Planned Date</label>
                <input
                  type="date"
                  value={actDate}
                  onChange={(e) => setActDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Redeemable Points (Credits)</label>
                <input
                  type="number"
                  min={10}
                  value={actPoints}
                  onChange={(e) => setActPoints(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Location / Target Site</label>
              <input
                type="text"
                placeholder="e.g., Regional HQ / Zoom Remote link"
                value={actLocation}
                onChange={(e) => setActLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Detailed Description</label>
              <textarea
                placeholder="Describe logistics, clothes to wear, target outcomes..."
                rows={3}
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl">Cancel</button>
              <button type="submit" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Launch Campaign</button>
            </div>
          </form>
        </div>
      )}

      {/* RENDER LISTS */}

      {/* Tab 1: CSR Campaigns list */}
      {activeSubTab === 'activities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="csr_campaigns_grid">
          {csrActivities.map((act) => {
            const hasRegistered = employeeParticipations.some(
              ep => ep.activity_id === act.id && ep.employee_id === activeProfile?.id
            );
            const myParticipation = employeeParticipations.find(
              ep => ep.activity_id === act.id && ep.employee_id === activeProfile?.id
            );

            return (
              <div 
                key={act.id} 
                className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                  act.status === 'Completed' ? 'opacity-80 bg-slate-50/50' : 'border-slate-200'
                }`}
                id={`csr_card_${act.id}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wide font-bold ${
                        act.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {act.status}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm mt-1.5">{act.title}</h4>
                    </div>

                    {isManagement && (
                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        id={`delete_csr_${act.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{act.description}</p>

                  <div className="space-y-2 mt-4 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{act.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{act.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>Organizer: {act.host_organizer}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between gap-4" id={`csr_actions_${act.id}`}>
                  <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg font-bold">
                    <Award className="w-4 h-4" />
                    <span>+{act.estimated_points} Points</span>
                  </div>

                  {/* Active user sign-up logic */}
                  {act.status === 'Active' && (
                    <div>
                      {hasRegistered ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                            myParticipation?.approval_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            myParticipation?.approval_status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {myParticipation?.approval_status === 'Approved' && 'Approved & Credited!'}
                            {myParticipation?.approval_status === 'Rejected' && 'Submission Declined'}
                            {myParticipation?.approval_status === 'Pending' && 'Pending Verification'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            resetForms();
                            setShowParticipationForm(act.id);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition"
                          id={`signup_csr_btn_${act.id}`}
                        >
                          Register Attendance
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline Register Attendance Verification form */}
                {showParticipationForm === act.id && (
                  <div className="mt-4 p-4 border border-emerald-150 bg-emerald-50/20 rounded-xl" id={`participation_form_${act.id}`}>
                    <h5 className="font-bold text-xs text-slate-700 flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" /> Verify Attendance &amp; Complete Activity
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Please provide proof description, photo details, or coordinator codes as required by organization settings.</p>
                    
                    <form onSubmit={(e) => handleSubmitParticipation(e, act.id)} className="space-y-3 mt-3">
                      {errorMessage && (
                        <p className="text-[10px] text-rose-700 font-semibold">{errorMessage}</p>
                      )}
                      
                      <textarea
                        placeholder="e.g., Checked in with Elena at 9:00 AM, helped plant 4 broadleaf maples along Sector 3."
                        rows={2}
                        value={partProof}
                        onChange={(e) => setPartProof(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-xs rounded-lg p-2 font-medium"
                      ></textarea>

                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={resetForms} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm">Submit Verification</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Participation Inbox (Approvals workspace) */}
      {activeSubTab === 'approvals' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="approvals_ledger_card">
          <div className="p-5 border-b border-slate-100 bg-slate-50/55 flex justify-between items-center">
            <span className="font-bold text-slate-800 text-sm">Approvals Workspace (Manager/Admin Portal)</span>
            {settings.evidence_requirement_enabled && (
              <span className="text-[10px] bg-rose-50 border border-rose-150 text-rose-800 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Evidence Requirement Enabled
              </span>
            )}
          </div>

          <div className="overflow-x-auto" id="approvals_table_container">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/50 text-slate-500 font-semibold border-b border-slate-200">
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">CSR Activity Title</th>
                  <th className="p-3">Evidence Description</th>
                  <th className="p-3 text-center">Status</th>
                  {isManagement && <th className="p-3 text-center">Audit Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {employeeParticipations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">No participation records reported in the queue.</td>
                  </tr>
                ) : (
                  employeeParticipations.map((part) => {
                    const activity = csrActivities.find(a => a.id === part.activity_id);
                    return (
                      <tr key={part.id} className="hover:bg-slate-50/50" id={`part_row_${part.id}`}>
                        <td className="p-3 whitespace-nowrap font-bold text-slate-800">{part.employee_name}</td>
                        <td className="p-3 font-medium text-slate-700">{activity?.title || 'Unknown Activity'}</td>
                        <td className="p-3 text-slate-500 leading-relaxed max-w-sm">{part.proof || <span className="text-rose-500 italic">No proof file/description submitted.</span>}</td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            part.approval_status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            part.approval_status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {part.approval_status}
                          </span>
                        </td>
                        {isManagement && (
                          <td className="p-3 text-center whitespace-nowrap">
                            {part.approval_status === 'Pending' ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleApproveParticipation(part.id)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold"
                                  id={`approve_part_${part.id}`}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDeclineParticipation(part.id)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded text-[10px] font-bold"
                                  id={`decline_part_${part.id}`}
                                >
                                  Decline
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[10px] font-medium">Reviewed</span>
                            )}
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

      {/* Tab 3: Diversity Metrics Charts */}
      {activeSubTab === 'diversity' && (
        <div className="space-y-6" id="diversity_workspace">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Gender Representation */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="gender_chart_card">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-emerald-600" /> Gender Demographics
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Distribution count across active organization census.</p>
              
              <div className="h-44 flex items-center justify-center mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-[10px] text-slate-600 font-bold pt-2 border-t border-slate-150">
                {genderData.map((g) => (
                  <div key={g.name}>
                    <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: g.fill }}></span>
                    {g.name}: {g.value}%
                  </div>
                ))}
              </div>
            </div>

            {/* Pay Equity Index */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm md:col-span-2" id="pay_gap_chart_card">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" /> Pay Equity Index per Role (USD)
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Average yearly wages showing progress toward zero gender pay disparities.</p>

              <div className="h-56 mt-4" id="pay_gap_chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payGapData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="role" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Male" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Female" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Social Governance Training Completion */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="training_chart_card">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Mandatory ESG &amp; Ethics Training Completion
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Percentage completion of annual ethics and workplace standards modules per department.</p>

            <div className="h-52 mt-4" id="training_chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trainingCompletion} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <YAxis dataKey="department" type="category" stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Completion" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
