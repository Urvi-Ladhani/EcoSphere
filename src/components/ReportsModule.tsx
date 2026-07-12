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
  Tag,
  Play,
  Leaf,
  Users,
  ShieldAlert,
  ChevronDown
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
  Category,
  Audit,
  ESGPolicy,
  EmissionFactor
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
    emissionFactors?: EmissionFactor[];
    esgPolicies?: ESGPolicy[];
    audits?: Audit[];
  };
  userRole: string;
  activeSubTab?: string;
  setActiveSubTab?: (tab: any) => void;
}

type SubTab = 'environmental' | 'social' | 'governance' | 'summary' | 'custom';

interface SavedReport {
  id: string;
  title: string;
  dateCreated: string;
  scope: string;
  metrics: string[];
  summary: string;
  csvData?: string;
}

export default function ReportsModule(props: ReportsModuleProps) {
  const { dbState, userRole } = props;
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
    categories = [],
    emissionFactors = [],
    esgPolicies = [],
    audits = []
  } = dbState;
  
  const [localSubTab, setLocalSubTab] = useState<SubTab>('summary');
  const activeSubTab = (props.activeSubTab as SubTab) || localSubTab;
  const setActiveSubTab = props.setActiveSubTab || setLocalSubTab;

  // Custom Builder Filters
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-07-31');
  const [filterDepartmentId, setFilterDepartmentId] = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [filterEmployeeId, setFilterEmployeeId] = useState('All');
  const [filterChallengeId, setFilterChallengeId] = useState('All');
  const [filterCategoryId, setFilterCategoryId] = useState('All');

  // Report Modal / Viewer state
  const [compiledReport, setCompiledReport] = useState<SavedReport | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [reportError, setReportError] = useState('');

  // --- Dynamic Compilation Logic ---
  const runCompileReport = (titleOverride?: string, moduleOverride?: 'Environmental' | 'Social' | 'Governance') => {
    if (!startDate || !endDate || startDate > endDate) {
      setReportError('Choose a valid reporting period: the end date must be on or after the start date.');
      return;
    }
    setReportError('');
    setIsCompiling(true);
    try {
      const reportModule = moduleOverride || filterModule;
      const inRange = (date?: string | null) => Boolean(date && date >= startDate && date <= endDate);
      // 1. Environmental
      let filteredCarbon = carbonTransactions.filter(t => t.status === 'Approved');
      filteredCarbon = filteredCarbon.filter(t => inRange(t.transaction_date));
      if (filterDepartmentId !== 'All') {
        const dept = departments.find(d => d.id === filterDepartmentId);
        if (dept) {
          filteredCarbon = filteredCarbon.filter(t => t.linked_entity.toLowerCase().includes(dept.name.toLowerCase()));
        }
      }
      const totalCarbon = filteredCarbon.reduce((sum, t) => sum + t.calculated_co2, 0);

      // 2. Social
      let filteredCSR = employeeParticipations.filter(p => p.approval_status === 'Approved');
      filteredCSR = filteredCSR.filter(p => inRange(p.completion_date));
      if (filterEmployeeId !== 'All') {
        filteredCSR = filteredCSR.filter(p => p.employee_id === filterEmployeeId);
      }
      if (filterDepartmentId !== 'All') {
        filteredCSR = filteredCSR.filter((p) => profiles.find((profile) => profile.id === p.employee_id)?.department_id === filterDepartmentId);
      }
      if (filterCategoryId !== 'All') {
        const activityIds = new Set(csrActivities.filter((activity) => activity.category_id === filterCategoryId).map((activity) => activity.id));
        filteredCSR = filteredCSR.filter((p) => activityIds.has(p.activity_id));
      }
      const totalCsrPoints = filteredCSR.reduce((sum, p) => sum + p.points_earned, 0);

      // 3. Challenges
      let filteredChallenges = challengeParticipations.filter(p => p.approval_status === 'Approved');
      if (filterEmployeeId !== 'All') {
        filteredChallenges = filteredChallenges.filter(p => p.employee_id === filterEmployeeId);
      }
      filteredChallenges = filteredChallenges.filter(p => inRange(p.completion_date));
      if (filterChallengeId !== 'All') {
        filteredChallenges = filteredChallenges.filter(p => p.challenge_id === filterChallengeId);
      }
      if (filterDepartmentId !== 'All') {
        filteredChallenges = filteredChallenges.filter((p) => profiles.find((profile) => profile.id === p.employee_id)?.department_id === filterDepartmentId);
      }
      if (filterCategoryId !== 'All') {
        const challengeIds = new Set(challenges.filter((challenge) => challenge.category_id === filterCategoryId).map((challenge) => challenge.id));
        filteredChallenges = filteredChallenges.filter((p) => challengeIds.has(p.challenge_id));
      }
      const completedChallengesCount = filteredChallenges.length;

      // 4. Governance
      let filteredCompliance = complianceIssues;
      if (filterEmployeeId !== 'All') {
        const emp = profiles.find(p => p.id === filterEmployeeId);
        if (emp) filteredCompliance = filteredCompliance.filter(c => c.owner_name === emp.name);
      }
      const resolvedCount = filteredCompliance.filter(i => i.status === 'Resolved').length;
      const openCount = filteredCompliance.filter(i => i.status !== 'Resolved').length;

      const title = titleOverride || "Custom ESG Evaluation Report";
      
      let summaryText = `### ${title}
**Reporting Period**: ${startDate} to ${endDate}
**Generated Date**: ${new Date().toISOString().split('T')[0]}

---

#### 📋 EXECUTIVE EVALUATION BRIEFING:
This document outlines verified ESG (Environmental, Social, Governance) compliance records compiled directly from the EcoSphere Platform.

`;

      if (reportModule === 'All' || reportModule === 'Environmental') {
        summaryText += `**1. ENVIRONMENTAL DISCLOSURES (CARBON & WASTE):**
- Verified Greenhouse Footprint: **${Math.round(totalCarbon).toLocaleString()} kg CO2e**
- Logged Environmental Events: ${filteredCarbon.length} approved emission actions.
- Target Department: ${filterDepartmentId === 'All' ? 'All Corporate Departments' : departments.find(d=>d.id===filterDepartmentId)?.name}\n\n`;
      }

      if (reportModule === 'All' || reportModule === 'Social') {
        summaryText += `**2. SOCIAL RESPONSIBILITY & ENGAGEMENT:**
- Corporate Volunteering Points: **${totalCsrPoints.toLocaleString()} pts**
- Sustainability Challenges Completed: **${completedChallengesCount} challenges**
- Active CSR Event Registrations: ${filteredCSR.length} sign-ups verified.\n\n`;
      }

      if (reportModule === 'All' || reportModule === 'Governance') {
        summaryText += `**3. CORPORATE GOVERNANCE & COMPLIANCE INDEX:**
- Outstanding Compliance Risks: **${openCount} Open Issues**
- Resolved Non-Compliance Items: **${resolvedCount} Resolved Issues**
- Policy acknowledgement metrics are certified under verified employee signatures.\n\n`;
      }

      summaryText += `**4. CORPORATE DEPARTMENT PERFORMANCE RANKINGS:**\n`;
      let deptScores = departmentScores;
      if (filterDepartmentId !== 'All') {
        deptScores = deptScores.filter(ds => ds.department_id === filterDepartmentId);
      }
      deptScores.forEach((ds) => {
        const d = departments.find(dept => dept.id === ds.department_id);
        summaryText += `- **${d?.name || 'Dept'}**: Total Rating: **${ds.total_score}** (E:${ds.environmental_score} / S:${ds.social_score} / G:${ds.governance_score})\n`;
      });

      summaryText += `\n---\n*Report Compiled & Certified under ESG Platform Auditor Standards.*`;

      // Build CSV
      const csvRows: Array<[string, string, string | number, string]> = [];
      if (reportModule === 'All' || reportModule === 'Environmental') csvRows.push(['Environmental', 'Carbon Emissions', `${totalCarbon} kg`, `${startDate} to ${endDate}`]);
      if (reportModule === 'All' || reportModule === 'Social') {
        csvRows.push(['Social', 'Points Awarded', `${totalCsrPoints} pts`, `${startDate} to ${endDate}`]);
        csvRows.push(['Social', 'Challenges Completed', completedChallengesCount, `${startDate} to ${endDate}`]);
      }
      if (reportModule === 'All' || reportModule === 'Governance') {
        csvRows.push(['Governance', 'Resolved Violations', resolvedCount, `${startDate} to ${endDate}`]);
        csvRows.push(['Governance', 'Open Violations', openCount, `${startDate} to ${endDate}`]);
      }
      const csvContent = ['Module,Metric,FilteredValue,ReportingPeriod', ...csvRows.map((row) => row.map(escapeCsvCell).join(','))].join('\n');

      setCompiledReport({
        id: 'rep-' + Math.random().toString(36).substr(2, 9),
        title,
        dateCreated: new Date().toISOString().split('T')[0],
        scope: `${startDate} to ${endDate}`,
        metrics: ['Environmental', 'Social', 'Governance'],
        summary: summaryText,
        csvData: csvContent
      });

    } finally {
      setIsCompiling(false);
    }
  };

  function escapeCsvCell(value: unknown) {
    const text = String(value ?? '');
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return /[",\n]/.test(safeText) ? `"${safeText.replace(/"/g, '""')}"` : safeText;
  }

  const downloadReport = (excel = false) => {
    if (!compiledReport?.csvData) {
      setReportError('Generate a report before exporting it.');
      return;
    }
    const contents = `${excel ? '\uFEFF' : ''}${compiledReport.csvData}`;
    const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${compiledReport.title.toLowerCase().replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}${excel ? '_excel' : ''}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    downloadReport(false);
  };

  const handleExportExcel = () => {
    // Excel CSV export with BOM for correct encoding formatting
    downloadReport(true);
  };

  return (
    <div className="space-y-6" id="reports_module">
      
      {/* Sub-Tabs Navigation Bar */}
      <div className="flex border-b border-slate-200" id="reports_tabs">
        {[
          { id: 'environmental', label: 'Environmental', icon: Leaf },
          { id: 'social', label: 'Social', icon: Users },
          { id: 'governance', label: 'Governance', icon: ShieldAlert },
          { id: 'summary', label: 'ESG Summary', icon: FileText },
          { id: 'custom', label: 'Custom Builder', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as SubTab);
                setCompiledReport(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isActive ? 'border-slate-800 text-slate-900 font-extrabold bg-slate-50' : 'border-transparent text-slate-500 hover:text-slate-850'
              }`}
              id={`report_tab_${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {reportError && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{reportError}</div>}

      {/* Tab: ESG Summary (Default Home Page mapping Excalidraw Cards) */}
      {activeSubTab === 'summary' && !compiledReport && (
        <div className="space-y-6 animate-fade-in" id="summary_dashboard">
          
          {/* Grid of Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="report_cards_grid">
            
            {/* Environmental Report */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between" id="card_report_env">
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-xs">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Environmental Report</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Emissions, goals, vendor &amp; product breakdown</p>
              </div>
              <button 
                onClick={() => {
                  setActiveSubTab('environmental');
                  runCompileReport('Environmental Impact Brief', 'Environmental');
                }}
                className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg transition cursor-pointer"
              >
                Generate
              </button>
            </div>

            {/* Social Report */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between" id="card_report_social">
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-xs">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Social Report</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Diversity, CSR participation, training completion</p>
              </div>
              <button 
                onClick={() => {
                  setActiveSubTab('social');
                  runCompileReport('Social Engagement & CSR Brief', 'Social');
                }}
                className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg transition cursor-pointer"
              >
                Generate
              </button>
            </div>

            {/* Governance Report */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between" id="card_report_gov">
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-xs">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Governance Report</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Policies, audits, compliance &amp; risk summary</p>
              </div>
              <button 
                onClick={() => {
                  setActiveSubTab('governance');
                  runCompileReport('Governance & Compliance Brief', 'Governance');
                }}
                className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg transition cursor-pointer"
              >
                Generate
              </button>
            </div>

            {/* ESG Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between" id="card_report_summary">
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-xs">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>ESG Summary</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Executive overview: all 4 scores + dept comparison</p>
              </div>
              <button 
                onClick={() => {
                  runCompileReport("EcoSphere Executive ESG Summary Brief");
                }}
                className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 rounded-lg transition cursor-pointer"
              >
                Generate
              </button>
            </div>

          </div>

          {/* Custom Report Builder: Filters widgets container */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm" id="custom_builder_filters_card">
            <h3 className="font-bold text-slate-800 text-sm mb-4">
              Custom Report Builder: Filters
            </h3>

            {/* Selector Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3" id="filters_row">
              
              {/* Date Range Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Date Range</label>
                <div className="flex flex-col gap-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 text-[10px] rounded p-1.5 font-semibold text-slate-700"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 text-[10px] rounded p-1.5 font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Department</label>
                <select
                  value={filterDepartmentId}
                  onChange={(e) => setFilterDepartmentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 text-[10px] rounded p-1.5 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Module Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Module</label>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 text-[10px] rounded p-1.5 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Modules</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Social">Social</option>
                  <option value="Governance">Governance</option>
                </select>
              </div>

              {/* Employee Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Employee</label>
                <select
                  value={filterEmployeeId}
                  onChange={(e) => setFilterEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 text-[10px] rounded p-1.5 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Employees</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Challenge Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Challenge</label>
                <select
                  value={filterChallengeId}
                  onChange={(e) => setFilterChallengeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 text-[10px] rounded p-1.5 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Challenges</option>
                  {challenges.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">ESG Category</label>
                <select
                  value={filterCategoryId}
                  onChange={(e) => setFilterCategoryId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 text-[10px] rounded p-1.5 font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Action buttons bar */}
            <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-100 flex-wrap" id="builder_actions_row">
              <button
                onClick={() => runCompileReport()}
                disabled={isCompiling}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> {isCompiling ? 'Running...' : 'Run Report'}
              </button>
              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Export: PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Export: Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Export: CSV
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Report Document Viewer overlay/modal inside summary tab */}
      {compiledReport && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="report_viewer_section">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight">{compiledReport.title}</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Reporting period: {compiledReport.scope} &bull; Generated just now</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition border border-slate-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Save CSV
              </button>
              <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print PDF
              </button>
              <button
                onClick={() => setCompiledReport(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
          <div className="p-6 text-xs text-slate-700 font-sans leading-relaxed space-y-4">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-800 shadow-inner overflow-x-auto">
              {compiledReport.summary}
            </div>
          </div>
        </div>
      )}

      {/* Individual tab compiled briefs */}
      {activeSubTab === 'environmental' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="direct_env_report">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-600" /> Environmental Impact Brief
            </h3>
            <div className="flex gap-2">
              <button onClick={() => runCompileReport('Environmental Impact Brief', 'Environmental')} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">Generate Report</button>
              <button onClick={() => window.print()} className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"><Printer className="w-3.5 h-3.5" /> Print</button>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-800">
            {`### Environmental Operations ESG Analysis Report

**Reporting Ledger Period**: Q1/Q2 Year-to-Date
**Emission Factors Matrix**: ${dbState.emissionFactors?.length || 0} active carbon coefficients configured.

**Environmental Performance & Carbon Footprint Metrics:**
- Total CO2 Footprint: **${Math.round(carbonTransactions.filter(t => t.status === 'Approved').reduce((sum, t) => sum + t.calculated_co2, 0)).toLocaleString()} kg CO2e**
- Verified Emission Log Actions: ${carbonTransactions.filter(t => t.status === 'Approved').length} approved transactions.
- Product Circular Recyclability: ${dbState.productsESG?.map(p => `${p.name} (${p.recyclability}% Recyclable)`).join(', ') || 'N/A'}`}
          </div>
        </div>
      )}

      {activeSubTab === 'social' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="direct_social_report">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" /> Social Engagement &amp; CSR Report
            </h3>
            <div className="flex gap-2">
              <button onClick={() => runCompileReport('Social Engagement & CSR Brief', 'Social')} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">Generate Report</button>
              <button onClick={() => window.print()} className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"><Printer className="w-3.5 h-3.5" /> Print</button>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-800">
            {`### Social Engagement & Inclusivity ESG Report

**Volunteer Metrics:**
- Total CSR Programs Active: ${csrActivities.length} programs organized.
- Total Participation Point Value: **${employeeParticipations.filter(p => p.approval_status === 'Approved').reduce((sum, p) => sum + p.points_earned, 0).toLocaleString()} points** credited.
- Employee Volunteer Attendances: ${employeeParticipations.filter(p => p.approval_status === 'Approved').length} sign-offs.

**Diversity Indicators:**
- Diversity gender representation, age index ratios, and mandatory code training logs are fully registered inside the Social Module Inclusivity Dashboard.`}
          </div>
        </div>
      )}

      {activeSubTab === 'governance' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="direct_gov_report">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" /> Governance Policies &amp; Audits Report
            </h3>
            <div className="flex gap-2">
              <button onClick={() => runCompileReport('Governance & Compliance Brief', 'Governance')} className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">Generate Report</button>
              <button onClick={() => window.print()} className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"><Printer className="w-3.5 h-3.5" /> Print</button>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-800">
            {`### Corporate Governance & Risk Auditing Report

**Audit Records Summary:**
- Published Ethics & Security Guidelines: ${dbState.esgPolicies?.length || 0} active policies.
- Audit Evaluations: ${dbState.audits?.length || 0} official audits completed/scheduled.
- Compliance Violations Logged: **${complianceIssues.filter(i => i.status !== 'Resolved').length} Open Issues** / ${complianceIssues.filter(i => i.status === 'Resolved').length} Resolved.

**Compliance Auditing Ledger:**
${dbState.audits?.map((a) => {
  const displayStatus = a.status === 'Completed' ? 'Completed' : 'Under Review';
  return `- **${a.name}**: Scheduled Date: ${a.audit_date} | Findings: ${a.findings || 'No notes.'} | Status: [${displayStatus}]`;
}).join('\n')}`}
          </div>
        </div>
      )}

      {/* Custom Builder Workspace (Tab 5) */}
      {activeSubTab === 'custom' && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4" id="custom_builder_tab_workspace">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-emerald-600" /> Executive ESG Custom Brief Compiler Workspace
            </h3>
          </div>
          <p className="text-xs text-slate-500">Configure report variables dynamically. Select the filters and module checkboxes to generate and archive customized briefs.</p>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              runCompileReport("Custom Exec ESG Assessment Brief");
            }}
            className="space-y-4"
          >
            {/* Range inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Multi select filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Module</label>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none"
                >
                  <option value="All">All Modules</option>
                  <option value="Environmental">Environmental</option>
                  <option value="Social">Social</option>
                  <option value="Governance">Governance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Employee</label>
                <select value={filterEmployeeId} onChange={(e) => setFilterEmployeeId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none">
                  <option value="All">All Employees</option>
                  {profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Challenge</label>
                <select value={filterChallengeId} onChange={(e) => setFilterChallengeId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none">
                  <option value="All">All Challenges</option>
                  {challenges.map((challenge) => <option key={challenge.id} value={challenge.id}>{challenge.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ESG Category</label>
                <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-2.5 font-medium focus:outline-none">
                  <option value="All">All Categories</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
            >
              Compile Custom Document
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
