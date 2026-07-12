/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Download, 
  Trash2, 
  Sparkles, 
  CheckSquare, 
  Square, 
  FileCheck, 
  Printer,
  Compass,
  AlertCircle,
  Building2,
  User,
  CheckSquare as ChallengeIcon,
  Tag
} from 'lucide-react';
import { 
  Department, 
  CarbonTransaction, 
  ComplianceIssue, 
  Profile, 
  DepartmentScore, 
  ProductESGProfile, 
  Challenge, 
  ChallengeParticipation, 
  CSRActivity, 
  EmployeeParticipation, 
  Category 
} from '../types';

interface ReportsModuleProps {
  dbState: {
    departments: Department[];
    carbonTransactions: CarbonTransaction[];
    complianceIssues: ComplianceIssue[];
    profiles: Profile[];
    departmentScores: DepartmentScore[];
    settings: any;
    productsESG?: ProductESGProfile[];
    challenges?: Challenge[];
    challengeParticipations?: ChallengeParticipation[];
    csrActivities?: CSRActivity[];
    employeeParticipations?: EmployeeParticipation[];
    categories?: Category[];
  };
  userRole: string;
}

interface SavedReport {
  id: string;
  title: string;
  dateCreated: string;
  scope: string;
  metrics: string[];
  summary: string;
  csvData?: string; // Cache filtered CSV representation
}

export default function ReportsModule({ dbState, userRole }: ReportsModuleProps) {
  const { 
    departments, 
    carbonTransactions, 
    complianceIssues, 
    profiles, 
    departmentScores, 
    challenges = [], 
    challengeParticipations = [], 
    csrActivities = [], 
    employeeParticipations = [], 
    categories = [] 
  } = dbState;
  
  const [reports, setReports] = useState<SavedReport[]>([
    {
      id: 'rep-01',
      title: 'Q1 ESG Executive Sustainability Brief',
      dateCreated: '2026-04-10',
      scope: '2026-01-01 to 2026-03-31',
      metrics: ['Carbon Accounting', 'Corporate Governance'],
      summary: `### Q1 Executive ESG Assessment Brief

**Enterprise Overview:**
During Q1 2026, EcoSphere achieved an aggregated ESG score of **83 / 100**, driven by high carbon transparency indexes across Operations and Engineering departments.

**Environmental Operations Ledger:**
- Total Carbon Emissions: **14,614 kg CO2e**
- Leading emission driver: **Grid utilities (electricity)** accounting for 69% of the quarter's footprint.

**Social & Employee Participation:**
- Completed CSR actions: **1 tree-planting campaign** with 3 verified employee attendances.
- Cumulative points earned: **300 points** credited.

**Corporate Governance & Audit Index:**
- Compliance Open Issues: **1 (Medium Severity)**
- Policy acknowledgement rate: **75%** overall signature completion.
- Auditor Comments: Q1 comprehensive environmental audit finished with 88% compliance score.`,
      csvData: `Module,Metric,Value,Date\nEnvironmental,Carbon Footprint,14614 kg,2026-03-31\nSocial,Points Awarded,300 pts,2026-03-31\nGovernance,Compliance Score,88%,2026-03-12`
    }
  ]);

  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(reports[0]);

  // Form builder states
  const [reportTitle, setReportTitle] = useState('Custom ESG Performance Summary');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-07-31');
  const [incCarbon, setIncCarbon] = useState(true);
  const [incSocial, setIncSocial] = useState(true);
  const [incGov, setIncGov] = useState(true);
  const [incRankings, setIncRankings] = useState(true);

  // Advanced Filters
  const [filterDepartmentId, setFilterDepartmentId] = useState('All');
  const [filterEmployeeId, setFilterEmployeeId] = useState('All');
  const [filterChallengeId, setFilterChallengeId] = useState('All');
  const [filterCategoryId, setFilterCategoryId] = useState('All');
  
  const [isCompiling, setIsCompiling] = useState(false);

  const handleCompile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCompiling(true);

    setTimeout(() => {
      // 1. Filter Carbon Transactions
      let filteredCarbon = carbonTransactions.filter(t => t.status === 'Approved');
      if (startDate) filteredCarbon = filteredCarbon.filter(t => t.transaction_date >= startDate);
      if (endDate) filteredCarbon = filteredCarbon.filter(t => t.transaction_date <= endDate);
      if (filterDepartmentId !== 'All') {
        const dept = departments.find(d => d.id === filterDepartmentId);
        if (dept) {
          filteredCarbon = filteredCarbon.filter(t => t.linked_entity.toLowerCase().includes(dept.name.toLowerCase()));
        }
      }
      if (filterCategoryId !== 'All') {
        const cat = categories.find(c => c.id === filterCategoryId);
        if (cat) {
          filteredCarbon = filteredCarbon.filter(t => t.source.toLowerCase().includes(cat.name.toLowerCase().substring(0, 5)));
        }
      }

      const totalCarbon = filteredCarbon.reduce((sum, t) => sum + t.calculated_co2, 0);

      // 2. Filter CSR Participations
      let filteredCSR = employeeParticipations.filter(p => p.approval_status === 'Approved');
      if (startDate) filteredCSR = filteredCSR.filter(p => !p.completion_date || p.completion_date >= startDate);
      if (endDate) filteredCSR = filteredCSR.filter(p => !p.completion_date || p.completion_date <= endDate);
      if (filterEmployeeId !== 'All') {
        filteredCSR = filteredCSR.filter(p => p.employee_id === filterEmployeeId);
      }
      const totalCsrPoints = filteredCSR.reduce((sum, p) => sum + p.points_earned, 0);

      // 3. Filter Challenge Participations
      let filteredChallenges = challengeParticipations.filter(p => p.approval_status === 'Approved');
      if (filterEmployeeId !== 'All') {
        filteredChallenges = filteredChallenges.filter(p => p.employee_id === filterEmployeeId);
      }
      if (filterChallengeId !== 'All') {
        filteredChallenges = filteredChallenges.filter(p => p.challenge_id === filterChallengeId);
      }
      const completedChallengesCount = filteredChallenges.length;

      // 4. Filter Compliance Issues
      let filteredCompliance = complianceIssues;
      if (filterEmployeeId !== 'All') {
        const emp = profiles.find(p => p.id === filterEmployeeId);
        if (emp) filteredCompliance = filteredCompliance.filter(c => c.owner_name === emp.name);
      }
      const resolvedCount = filteredCompliance.filter(i => i.status === 'Resolved').length;
      const openCount = filteredCompliance.filter(i => i.status !== 'Resolved').length;

      let metricsArray: string[] = [];
      if (incCarbon) metricsArray.push('Carbon Accounting');
      if (incSocial) metricsArray.push('Social Participation');
      if (incGov) metricsArray.push('Governance Compliance');
      if (incRankings) metricsArray.push('Department Scores');

      // Build Document Text Summary
      let dynamicSummaryText = `### ${reportTitle}
**Scope Range**: ${startDate || 'Any'} to ${endDate || 'Any'}
**Generated On**: ${new Date().toISOString().split('T')[0]}

---

#### EXECUTIVE COMPLIANCE BRIEFING:
This evaluation brief outlines ESG (Environmental, Social, Governance) sustainability metrics logged directly within the EcoSphere Ledger.

`;

      if (incCarbon) {
        dynamicSummaryText += `**1. ENVIRONMENTAL & CARBON FOOTPRINT ANALYSIS:**
- Total CO2 Footprint: **${Math.round(totalCarbon).toLocaleString()} kg CO2e**
- Active factors contributing: ${filteredCarbon.length} approved emission events.
- Filters Applied: Department: ${filterDepartmentId === 'All' ? 'All' : departments.find(d=>d.id===filterDepartmentId)?.name}, Category: ${filterCategoryId === 'All' ? 'All' : categories.find(c=>c.id===filterCategoryId)?.name}\n\n`;
      }

      if (incSocial) {
        dynamicSummaryText += `**2. SOCIAL ENGAGEMENT & REWARDS LEDGER:**
- Total Volunteer Points Credited: **${totalCsrPoints.toLocaleString()} pts**
- Completed Sustainability Challenges: **${completedChallengesCount} challenges** verified.
- Active employee enrollments tracked: ${filteredCSR.length} CSR participation links.\n\n`;
      }

      if (incGov) {
        dynamicSummaryText += `**3. CORPORATE GOVERNANCE & RISK MONITOR:**
- Open Compliance Violations: **${openCount} Outstanding Issues**
- Resolved Non-Compliance Items: **${resolvedCount} Resolved Issues**
- Policy compliance holds: Evidence file attachments verified for all approved redemptions.\n\n`;
      }

      if (incRankings) {
        dynamicSummaryText += `**4. CORPORATE DEPARTMENT PERFORMANCE RANKINGS:**\n`;
        let deptScores = departmentScores;
        if (filterDepartmentId !== 'All') {
          deptScores = deptScores.filter(ds => ds.department_id === filterDepartmentId);
        }
        deptScores.forEach((ds) => {
          const d = departments.find(dept => dept.id === ds.department_id);
          dynamicSummaryText += `- **${d?.name || 'Dept'}**: Total Rating: **${ds.total_score}** (E:${ds.environmental_score} / S:${ds.social_score} / G:${ds.governance_score})\n`;
        });
      }

      dynamicSummaryText += `\n---\n*Report Compiled & Certified under ESG Platform Auditor Standards.*`;

      // Build CSV Data Matrix
      let csvContent = "Module,Metric,FilteredValue,ReportingPeriod\n";
      if (incCarbon) csvContent += `Environmental,Carbon Emissions,${totalCarbon} kg,${startDate} to ${endDate}\n`;
      if (incSocial) {
        csvContent += `Social,Points Awarded,${totalCsrPoints} pts,${startDate} to ${endDate}\n`;
        csvContent += `Social,Challenges Completed,${completedChallengesCount},${startDate} to ${endDate}\n`;
      }
      if (incGov) {
        csvContent += `Governance,Resolved Violations,${resolvedCount},${startDate} to ${endDate}\n`;
        csvContent += `Governance,Open Violations,${openCount},${startDate} to ${endDate}\n`;
      }

      const newReport: SavedReport = {
        id: 'rep-' + Math.random().toString(36).substr(2, 9),
        title: reportTitle,
        dateCreated: new Date().toISOString().split('T')[0],
        scope: `${startDate || 'Start'} to ${endDate || 'End'}`,
        metrics: metricsArray,
        summary: dynamicSummaryText,
        csvData: csvContent
      };

      setReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
      setIsCompiling(false);
      setShowBuilder(false);
    }, 1200);
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this archived report?')) return;
    setReports(prev => prev.filter(r => r.id !== id));
    if (selectedReport?.id === id) {
      setSelectedReport(null);
    }
  };

  const handleExportCSV = () => {
    if (!selectedReport || !selectedReport.csvData) return;
    const blob = new Blob([selectedReport.csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedReport.title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="reports_module">
      
      {/* Left Column: List of saved reports and compilation settings */}
      <div className="space-y-6" id="reports_left_panel">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" /> Executive Report History
            </h3>
            {!showBuilder && (
              <button
                onClick={() => setShowBuilder(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg transition cursor-pointer"
                title="Create Custom Report"
                id="create_report_workspace_btn"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* List of generated reports */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto" id="archived_reports_list">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => {
                    setSelectedReport(rep);
                    setShowBuilder(false);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                    isSelected 
                      ? 'border-emerald-600 bg-emerald-50/20 text-emerald-900 font-semibold' 
                      : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                  }`}
                  id={`archived_item_${rep.id}`}
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold truncate leading-tight">{rep.title}</p>
                    <span className="text-[10px] text-slate-400 font-medium">Scope: {rep.scope}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteReport(rep.id, e)}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    id={`delete_archived_report_${rep.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Report compiler sidebar options */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm" id="compliance_ratings_card">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-600" /> Compliance Rating Framework
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">ESG evaluations are scored using real-time evidence tracking. To download physical PDF compliance files or certify reports, contact your certified company auditor.</p>
          <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
            <p>&bull; <strong>90 - 100</strong>: Prime AAA Leader</p>
            <p>&bull; <strong>75 - 89</strong>: High Quality Performer</p>
            <p>&bull; <strong>50 - 74</strong>: Standard Compliant</p>
            <p>&bull; <strong>Below 50</strong>: Operational Deficiency Risk</p>
          </div>
        </div>
      </div>

      {/* Right Area: Report Builder Form OR Document Viewer (2/3 width) */}
      <div className="lg:col-span-2" id="reports_right_panel">
        
        {showBuilder ? (
          /* Report Builder Form */
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="report_builder_workspace">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" /> Custom ESG Report Compiler Workspace
              </h3>
              <button 
                onClick={() => setShowBuilder(false)} 
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                Close Builder
              </button>
            </div>

            <form onSubmit={handleCompile} className="space-y-4" id="compile_report_form">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Document Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scope Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Scope End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Advanced Filter Criteria */}
              <div className="border-t border-slate-100 pt-4 mt-4">
                <h4 className="text-xs font-bold text-slate-800 mb-2.5">Granular Database Filter Overrides</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase pl-1 mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Department Focus
                    </label>
                    <select
                      value={filterDepartmentId}
                      onChange={(e) => setFilterDepartmentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                    >
                      <option value="All">All Departments</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase pl-1 mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Specific Employee
                    </label>
                    <select
                      value={filterEmployeeId}
                      onChange={(e) => setFilterEmployeeId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                    >
                      <option value="All">All Employees</option>
                      {profiles.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase pl-1 mb-1 flex items-center gap-1">
                      <ChallengeIcon className="w-3.5 h-3.5" /> Circular Challenge
                    </label>
                    <select
                      value={filterChallengeId}
                      onChange={(e) => setFilterChallengeId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                    >
                      <option value="All">All Challenges</option>
                      {challenges.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase pl-1 mb-1 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> ESG Category
                    </label>
                    <select
                      value={filterCategoryId}
                      onChange={(e) => setFilterCategoryId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Checklist selectors */}
              <div className="space-y-2.5 mt-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Indicators to Export:</label>
                
                <div 
                  onClick={() => setIncCarbon(!incCarbon)} 
                  className="flex items-center gap-2.5 p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition text-xs text-slate-700"
                >
                  {incCarbon ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                  <span>Include Greenhouse Gas Carbon Emissions Ledger</span>
                </div>

                <div 
                  onClick={() => setIncSocial(!incSocial)} 
                  className="flex items-center gap-2.5 p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition text-xs text-slate-700"
                >
                  {incSocial ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                  <span>Include Employee CSR Activity &amp; Participation XP logs</span>
                </div>

                <div 
                  onClick={() => setIncGov(!incGov)} 
                  className="flex items-center gap-2.5 p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition text-xs text-slate-700"
                >
                  {incGov ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                  <span>Include Published Corporate Policies &amp; Compliance issues count</span>
                </div>

                <div 
                  onClick={() => setIncRankings(!incRankings)} 
                  className="flex items-center gap-2.5 p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition text-xs text-slate-700"
                >
                  {incRankings ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4 text-slate-300" />}
                  <span>Include Live Department ESG Performance rankings</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompiling}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isCompiling ? 'Compiling Index Ledger...' : 'Compile Document'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Document Viewer */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="report_document_viewer">
            {selectedReport ? (
              <div id="print_report_section">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center" id="viewer_header">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{selectedReport.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Created: {selectedReport.dateCreated} &bull; Scope: {selectedReport.scope}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedReport.csvData && (
                      <button
                        onClick={handleExportCSV}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition border border-slate-200 cursor-pointer"
                        title="Download raw data as CSV/Excel"
                      >
                        <Download className="w-3.5 h-3.5" /> Export Excel/CSV
                      </button>
                    )}
                    <button
                      onClick={triggerPrint}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                      id="print_viewer_btn"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Brief
                    </button>
                  </div>
                </div>

                <div className="p-6 text-xs text-slate-700 font-sans leading-relaxed space-y-4 prose prose-slate">
                  {/* Styled simulated markdown printer */}
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-800 shadow-inner overflow-x-auto">
                    {selectedReport.summary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400 font-medium" id="empty_viewer">
                <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No report selected. Choose a brief from history or create a new one above.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
