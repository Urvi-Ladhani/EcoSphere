/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingDown, 
  Users, 
  ShieldAlert, 
  Award, 
  ArrowUpRight, 
  Building, 
  Gauge, 
  Calendar,
  Sparkles,
  AlertTriangle,
  Leaf
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Department, DepartmentScore, CarbonTransaction, ComplianceIssue, Profile, ESGSettings } from '../types';

interface DashboardProps {
  dbState: {
    departments: Department[];
    departmentScores: DepartmentScore[];
    carbonTransactions: CarbonTransaction[];
    complianceIssues: ComplianceIssue[];
    profiles: Profile[];
    settings: ESGSettings;
  };
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ dbState, setActiveTab }: DashboardProps) {
  const { departments, departmentScores, carbonTransactions, complianceIssues, profiles, settings } = dbState;

  // 1. Calculate Aggregated Scoring
  const avgScores = departmentScores.reduce(
    (acc, ds) => {
      acc.env += ds.environmental_score;
      acc.soc += ds.social_score;
      acc.gov += ds.governance_score;
      return acc;
    },
    { env: 0, soc: 0, gov: 0 }
  );

  const deptCount = departmentScores.length || 1;
  const avgEnv = Math.round(avgScores.env / deptCount);
  const avgSoc = Math.round(avgScores.soc / deptCount);
  const avgGov = Math.round(avgScores.gov / deptCount);

  // Weighted ESG Score Calculation
  const wEnv = settings.weight_environmental;
  const wSoc = settings.weight_social;
  const wGov = settings.weight_governance;
  const overallESGScore = Math.round((avgEnv * wEnv + avgSoc * wSoc + avgGov * wGov) / 100);

  // 2. Compute carbon footprint metrics
  const approvedTx = carbonTransactions.filter(t => t.status === 'Approved');
  const totalCarbonEmissions = approvedTx.reduce((sum, t) => sum + t.calculated_co2, 0);

  // Format carbon by source for chart
  const carbonBySource = approvedTx.reduce((acc: Record<string, number>, t) => {
    acc[t.source] = (acc[t.source] || 0) + t.calculated_co2;
    return acc;
  }, {});

  const carbonChartData = Object.entries(carbonBySource).map(([name, value]) => ({
    name,
    Emissions: Math.round(value)
  }));

  // 3. Compliance overview
  const totalIssues = complianceIssues.length;
  const resolvedIssues = complianceIssues.filter(i => i.status === 'Resolved').length;
  const openIssues = complianceIssues.filter(i => i.status !== 'Resolved');
  const pastDueCount = openIssues.filter(i => {
    const dueDate = new Date(i.due_date);
    const now = new Date();
    return dueDate < now;
  }).length;

  // 4. Social Engagement Metrics
  const totalXP = profiles.reduce((sum, p) => sum + p.xp, 0);
  const avgXP = Math.round(totalXP / (profiles.length || 1));

  // Department Table Data ordered by total score descending (Department ESG rankings)
  const sortedDepartmentScores = [...departmentScores].sort((a, b) => b.total_score - a.total_score);

  // Color mappings
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Overall Score gauge layout
  const radialData = [
    { name: 'Environmental', value: avgEnv, fill: '#10b981' },
    { name: 'Social', value: avgSoc, fill: '#3b82f6' },
    { name: 'Governance', value: avgGov, fill: '#f59e0b' }
  ];

  return (
    <div className="space-y-6" id="dashboard_view">
      {/* Platform Welcome Alert bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="welcome_banner">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">EcoSphere Sustainability Index</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time enterprise metrics, role-based governance compliance, and carbon tracking ledger.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Auto Calculation: {settings.auto_emission_calculation ? 'ON' : 'OFF'}</span>
          </div>
          <button 
            onClick={() => setActiveTab('reports')} 
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
            id="builder_shortcut_btn"
          >
            Custom Report Builder <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Critical Warnings / Alert bar */}
      {pastDueCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 text-rose-800" id="past_due_alerts">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
          <div>
            <p className="font-bold text-sm">Critical Compliance Alert ({pastDueCount} Past Due Issue{pastDueCount > 1 ? 's' : ''})</p>
            <p className="text-xs text-rose-700 mt-1">There are resolved compliance issues or audits past their due dates. Immediate manager intervention is required on the Governance tab.</p>
            <div className="mt-2 space-y-1">
              {openIssues.filter(i => new Date(i.due_date) < new Date()).map(i => (
                <div key={i.id} className="text-xs flex items-center gap-2 font-medium">
                  <span className="bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">Past Due</span>
                  <span>{i.description} — Owner: <strong>{i.owner_name}</strong> (Due: {i.due_date})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats_cards_grid">
        {/* Card 1: Overall ESG Score */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition relative overflow-hidden" id="card_overall_esg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Overall ESG Score</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{overallESGScore} / 100</h3>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${overallESGScore}%` }}></div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px]">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">High Quality</span>
            <span className="text-slate-400">Weighted scoring matrix</span>
          </div>
        </div>

        {/* Card 2: Environmental (Carbon) */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition" id="card_env_carbon">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Carbon Emissions</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{Math.round(totalCarbonEmissions / 1000).toLocaleString()} <span className="text-xs font-normal text-slate-400">tCO2e</span></h3>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '68%' }}></div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400">
            Total ledger footprint: <strong className="text-slate-600 font-semibold">{Math.round(totalCarbonEmissions).toLocaleString()} kg CO2e</strong>
          </div>
        </div>

        {/* Card 3: Social & CSR */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition" id="card_social_engagement">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Social XP Balance</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{totalXP.toLocaleString()} <span className="text-xs font-normal text-slate-400">XP</span></h3>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalXP / 15000) * 100)}%` }}></div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400">
            Avg employee balance: <strong className="text-slate-600 font-semibold">{avgXP} XP</strong>
          </div>
        </div>

        {/* Card 4: Governance Issues */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition" id="card_gov_issues">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Governance Compliance</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{resolvedIssues} / {totalIssues}</h3>
            </div>
            <div className="bg-amber-50 text-amber-600 p-2 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 100}%` }}></div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400">
            Open issues: <strong className={openIssues.length > 0 ? "text-rose-600 font-bold" : "text-slate-600 font-semibold"}>{openIssues.length} Pending</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Visualizations and Department ESG rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="charts_and_rankings_grid">
        
        {/* Left Column: Visualizations (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6" id="dashboard_left_col">
          {/* Carbon Emissions by Source Chart */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="carbon_chart_container">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" /> Carbon Emissions by Source (kg CO2e)
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">Calculated emissions based on approved supplier invoices, factory gas use, fleet transport, and travel expense receipts.</p>
            <div className="h-72" id="carbon_chart">
              {carbonChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No approved carbon transactions found.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carbonChartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Emissions" radius={[6, 6, 0, 0]}>
                      {carbonChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Sub-Bento row: Category weights config visualization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="weights_row">
            {/* Pie Chart of Weights */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="weights_chart_card">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Scoring Configurations</h3>
                <p className="text-[11px] text-slate-500 mt-1">Weighted distribution configured for Overall ESG Score calculation.</p>
              </div>
              <div className="h-44 flex items-center justify-center" id="weights_pie_chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: `E (${wEnv}%)`, value: wEnv, fill: '#10b981' },
                        { name: `S (${wSoc}%)`, value: wSoc, fill: '#3b82f6' },
                        { name: `G (${wGov}%)`, value: wGov, fill: '#f59e0b' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-center text-xs text-slate-600 font-medium pt-2 border-t border-slate-100">
                <div>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>
                  E: {wEnv}%
                </div>
                <div>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5"></span>
                  S: {wSoc}%
                </div>
                <div>
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>
                  G: {wGov}%
                </div>
              </div>
            </div>

            {/* Platform Gamification highlight card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="gamification_quick_card">
              <div>
                <span className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">Gamification Hub</span>
                <h3 className="text-base font-bold mt-2 flex items-center gap-1.5 text-white">
                  <Award className="w-5 h-5 text-amber-400" /> EcoSphere Leaderboards
                </h3>
                <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">Employees are driving real-world change! Compete in active sustainability challenges to claim rare badges and redeem items in the catalog.</p>
              </div>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-700/60 text-xs" id="leaderboard_quick_link">
                <span className="text-slate-400 font-medium">Enterprise XP: <strong>{totalXP.toLocaleString()} XP</strong></span>
                <button 
                  onClick={() => setActiveTab('gamification')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  id="view_leaderboard_shortcut"
                >
                  Join Challenges &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Department ESG Rankings (1/3 width on desktop) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="rankings_container">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-5 h-5 text-slate-600" /> Department Rankings
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">Ranked by weighted total scores representing Environmental, Social, and Governance performance combined.</p>
            
            <div className="space-y-3.5" id="rankings_list">
              {sortedDepartmentScores.map((score, idx) => {
                const dept = departments.find(d => d.id === score.department_id);
                if (!dept) return null;
                return (
                  <div 
                    key={score.id} 
                    className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 transition flex items-center justify-between gap-4"
                    id={`rank_item_${score.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        idx === 1 ? 'bg-slate-200 text-slate-800' :
                        idx === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{dept.name}</p>
                        <span className="text-[10px] text-slate-500 font-medium">{dept.code} &bull; {dept.employee_count} Employees</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-800 block">{score.total_score} pts</span>
                      <div className="flex gap-1.5 mt-1">
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded font-bold" title="Environmental">E:{score.environmental_score}</span>
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-1 py-0.2 rounded font-bold" title="Social">S:{score.social_score}</span>
                        <span className="text-[9px] bg-amber-50 text-amber-700 px-1 py-0.2 rounded font-bold" title="Governance">G:{score.governance_score}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6" id="rankings_footer">
            <button
              onClick={() => setActiveTab('departments')}
              className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition"
              id="view_departments_tab_btn"
            >
              Manage Departments &amp; Heads
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
