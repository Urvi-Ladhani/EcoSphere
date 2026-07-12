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
  Leaf,
  Activity,
  CheckCircle2,
  Play,
  TrendingUp,
  FileText
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
  LineChart,
  Line,
  AreaChart,
  Area
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
  setSubTab?: (tabId: string, subTabId: string) => void;
}

export default function Dashboard({ dbState, setActiveTab, setSubTab }: DashboardProps) {
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
  const avgEnv = Math.round(avgScores.env / deptCount) || 90;
  const avgSoc = Math.round(avgScores.soc / deptCount) || 74;
  const avgGov = Math.round(avgScores.gov / deptCount) || 88;

  // Weighted ESG Score Calculation
  const wEnv = settings.weight_environmental;
  const wSoc = settings.weight_social;
  const wGov = settings.weight_governance;
  const overallESGScore = Math.round((avgEnv * wEnv + avgSoc * wSoc + avgGov * wGov) / 100) || 81;

  // Curated 12 month emissions data for curved line chart
  const emissionsTrendData = [
    { month: 'Jul', Emissions: 1420 },
    { month: 'Aug', Emissions: 1350 },
    { month: 'Sep', Emissions: 1480 },
    { month: 'Oct', Emissions: 1200 },
    { month: 'Nov', Emissions: 1100 },
    { month: 'Dec', Emissions: 950 },
    { month: 'Jan', Emissions: 1050 },
    { month: 'Feb', Emissions: 1150 },
    { month: 'Mar', Emissions: 1380 },
    { month: 'Apr', Emissions: 1300 },
    { month: 'May', Emissions: 1250 },
    { month: 'Jun', Emissions: 1180 }
  ];

  // Map department score totals to bar chart data
  const deptChartData = departmentScores.map(ds => {
    const dept = departments.find(d => d.id === ds.department_id);
    let shortName = dept?.name || 'Dept';
    if (shortName.toLowerCase().includes('sale')) shortName = 'Sale';
    else if (shortName.toLowerCase().includes('manufact')) shortName = 'Mfg';
    else if (shortName.toLowerCase().includes('logist')) shortName = 'Logi';
    else if (shortName.toLowerCase().includes('corpor')) shortName = 'Corp';
    else if (shortName.toLowerCase().includes('engineer') || shortName.toLowerCase().includes('r&d')) shortName = 'R&D';
    
    return {
      name: shortName,
      Score: ds.total_score
    };
  });

  // Fallback data if DB is empty
  const displayDeptData = deptChartData.length > 0 ? deptChartData : [
    { name: 'Sale', Score: 68 },
    { name: 'Mfg', Score: 85 },
    { name: 'Logi', Score: 72 },
    { name: 'Corp', Score: 92 },
    { name: 'R&D', Score: 78 }
  ];

  // Quick Action Routing Handler
  const routeTo = (tabId: string, subTabId?: string) => {
    setActiveTab(tabId);
    if (subTabId && setSubTab) {
      setSubTab(tabId, subTabId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard_view">
      
      {/* 4 Clickable Score Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats_cards_grid">
        
        {/* Card 1: Environmental Score */}
        <div 
          onClick={() => routeTo('environmental', 'factors')}
          className="bg-white border-2 border-emerald-500/80 p-5 rounded-2xl cursor-pointer hover:shadow-md transition relative group overflow-hidden" 
          id="card_env_score"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Environmental Score</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{avgEnv} / 100</h3>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl group-hover:bg-emerald-100 transition">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-semibold flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-emerald-500" /> Emissions &amp; Goals tracked
          </p>
        </div>

        {/* Card 2: Social Score */}
        <div 
          onClick={() => routeTo('social', 'activities')}
          className="bg-white border-2 border-blue-500/80 p-5 rounded-2xl cursor-pointer hover:shadow-md transition relative group overflow-hidden" 
          id="card_social_score"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Social Score</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{avgSoc} / 100</h3>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl group-hover:bg-blue-100 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-500" /> CSR Volunteering logs active
          </p>
        </div>

        {/* Card 3: Governance Score */}
        <div 
          onClick={() => routeTo('governance', 'audits')}
          className="bg-white border-2 border-purple-500/80 p-5 rounded-2xl cursor-pointer hover:shadow-md transition relative group overflow-hidden" 
          id="card_gov_score"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Governance Score</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{avgGov} / 100</h3>
            </div>
            <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl group-hover:bg-purple-100 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-purple-500" /> Active auditing ledgers
          </p>
        </div>

        {/* Card 4: Overall ESG Score */}
        <div 
          onClick={() => routeTo('reports', 'summary')}
          className="bg-white border-2 border-cyan-500/85 p-5 rounded-2xl cursor-pointer hover:shadow-md transition relative group overflow-hidden" 
          id="card_overall_esg"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Overall ESG Score</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1 tracking-tight">{overallESGScore} / 100</h3>
            </div>
            <div className="bg-cyan-50 text-cyan-650 p-2.5 rounded-xl group-hover:bg-cyan-100 transition">
              <Gauge className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-500" /> Weighted corporate index
          </p>
        </div>

      </div>

      {/* Middle Row Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans" id="charts_row">
        
        {/* Chart 1: Emissions Trend */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="chart_emissions_trend">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-emerald-600" /> Emissions Trend (12 mo)
          </h3>
          <p className="text-[10px] text-slate-400 mb-6">Total monthly greenhouse gas emissions recorded (kg CO2e)</p>
          <div className="h-64" id="trend_chart_wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emissionsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Emissions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEmissions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department ESG Ranking */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="chart_dept_ranking">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-1">
            <Building className="w-4 h-4 text-slate-600" /> Department ESG Ranking
          </h3>
          <p className="text-[10px] text-slate-400 mb-6">Comparative cumulative score evaluation across modules</p>
          <div className="h-64" id="bar_chart_wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayDeptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="Score" radius={[4, 4, 0, 0]}>
                  {displayDeptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 3 ? '#1e3a8a' : '#2563eb'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom Bento Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="bottom_panels_row">
        
        {/* Panel 1: Recent Activity */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm" id="activity_panel">
          <h3 className="font-bold text-slate-800 text-sm mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {[
              { text: "Priya completed 'Zero Waste Week'", prefix: "✓", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { text: "New compliance issue in Logistics", prefix: "▲", color: "text-rose-600 bg-rose-50 border-rose-100" },
              { text: "42 new Carbon Transactions logged", prefix: "📊", color: "text-blue-600 bg-blue-50 border-blue-100" },
              { text: "R&D acknowledged Anti-Corruption Policy", prefix: "📝", color: "text-purple-600 bg-purple-50 border-purple-100" }
            ].map((activity, idx) => (
              <div key={idx} className={`p-3 rounded-xl border flex items-center gap-3 ${activity.color}`} id={`activity_item_${idx}`}>
                <span className="text-sm font-extrabold">{activity.prefix}</span>
                <span className="text-xs font-bold">{activity.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Quick Actions */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between" id="quick_actions_panel">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => routeTo('environmental', 'transactions')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                + Log Carbon Data
              </button>
              <button
                onClick={() => routeTo('gamification', 'challenges')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                🏆 Start Challenge
              </button>
              <button
                onClick={() => routeTo('reports', 'summary')}
                className="w-full bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-slate-500" /> View Reports
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
