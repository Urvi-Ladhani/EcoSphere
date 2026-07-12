/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import DepartmentsModule from './components/DepartmentsModule';
import EnvironmentalModule from './components/EnvironmentalModule';
import SocialModule from './components/SocialModule';
import GovernanceModule from './components/GovernanceModule';
import GamificationModule from './components/GamificationModule';
import ReportsModule from './components/ReportsModule';
import SettingsModule from './components/SettingsModule';
import { api } from './lib/supabase';
import { 
  Profile, 
  Department, 
  Category, 
  EmissionFactor, 
  ProductESGProfile, 
  EnvironmentalGoal, 
  ESGPolicy, 
  PolicyAcknowledgement, 
  Audit, 
  ComplianceIssue, 
  Badge, 
  RewardItem, 
  CarbonTransaction, 
  CSRActivity, 
  EmployeeParticipation, 
  DepartmentScore, 
  ESGSettings 
} from './types';

interface FullDBState {
  profiles: Profile[];
  departments: Department[];
  categories: Category[];
  emissionFactors: EmissionFactor[];
  productsESG: ProductESGProfile[];
  environmentalGoals: EnvironmentalGoal[];
  esgPolicies: ESGPolicy[];
  policyAcknowledgements: PolicyAcknowledgement[];
  audits: Audit[];
  complianceIssues: ComplianceIssue[];
  badges: Badge[];
  rewardItems: RewardItem[];
  carbonTransactions: CarbonTransaction[];
  csrActivities: CSRActivity[];
  employeeParticipations: EmployeeParticipation[];
  departmentScores: DepartmentScore[];
  settings: ESGSettings;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Full unified database state
  const [dbState, setDbState] = useState<FullDBState | null>(null);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Load the initial DB state
  useEffect(() => {
    setLoading(true);
    api.getDbState()
      .then((state: any) => {
        const employeeBadges = state.employeeBadges || [];
        const badgesList = state.badges || [];
        const profilesList = (state.profiles || []).map((p: any) => {
          const unlockedBadgeIds = employeeBadges
            .filter((eb: any) => eb.employee_id === p.id)
            .map((eb: any) => eb.badge_id);
          
          const unlockedBadgeNames = unlockedBadgeIds
            .map((bid: any) => {
              const badge = badgesList.find((b: any) => b.id === bid);
              return badge ? badge.name : '';
            })
            .filter((name: string) => name !== '');

          return {
            ...p,
            points_balance: p.points || 0,
            unlocked_badges: unlockedBadgeNames
          };
        });

        const normalizedState: FullDBState = {
          profiles: profilesList,
          departments: state.departments || [],
          categories: state.categories || [],
          emissionFactors: state.emissionFactors || [],
          productsESG: state.productsESG || [],
          environmentalGoals: state.environmentalGoals || [],
          esgPolicies: state.esgPolicies || [],
          policyAcknowledgements: state.policyAcknowledgements || [],
          audits: state.audits || [],
          complianceIssues: state.complianceIssues || [],
          badges: (state.badges || []).map((b: any) => ({
            ...b,
            xp_threshold: b.unlock_rule_threshold || 0
          })),
          rewardItems: (state.rewards || []).map((r: any) => ({
            id: r.id,
            title: r.name,
            description: r.description,
            points_cost: r.points_required,
            stock: r.stock,
            status: r.status === 'Active' ? 'Available' : 'Unavailable'
          })),
          carbonTransactions: state.carbonTransactions || [],
          csrActivities: state.csrActivities || [],
          employeeParticipations: state.employeeParticipations || [],
          departmentScores: state.departmentScores || [],
          settings: state.settings || {
            weight_environmental: 40,
            weight_social: 30,
            weight_governance: 30,
            auto_emission_calculation: true,
            evidence_requirement_enabled: true,
            badge_auto_award_enabled: true,
          }
        };

        setDbState(normalizedState);
        setProfiles(normalizedState.profiles);

        // Bind active profile on first run
        if (!activeProfile && normalizedState.profiles.length > 0) {
          // Keep current selection if already bound, otherwise default to first
          setActiveProfile(normalizedState.profiles[0]);
        } else if (activeProfile) {
          // Sync profile state with updated values (XP / points)
          const updatedMe = normalizedState.profiles.find((p) => p.id === activeProfile.id);
          if (updatedMe) {
            setActiveProfile(updatedMe);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching database state', err);
        setLoading(false);
      });
  }, [refreshTrigger]);

  if (loading || !dbState || !activeProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-600 animate-pulse">Syncing EcoSphere Ledger &amp; Audits...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activeProfile={activeProfile}
      setActiveProfile={setActiveProfile}
      profiles={profiles}
      refreshTrigger={refreshTrigger}
      triggerRefresh={triggerRefresh}
    >
      {activeTab === 'dashboard' && (
        <Dashboard dbState={dbState} setActiveTab={setActiveTab} />
      )}

      {activeTab === 'departments' && (
        <DepartmentsModule
          departments={dbState.departments}
          departmentScores={dbState.departmentScores}
          userRole={activeProfile.role}
          triggerRefresh={triggerRefresh}
        />
      )}

      {activeTab === 'environmental' && (
        <EnvironmentalModule
          dbState={dbState}
          userRole={activeProfile.role}
          triggerRefresh={triggerRefresh}
        />
      )}

      {activeTab === 'social' && (
        <SocialModule
          dbState={dbState}
          activeProfile={activeProfile}
          triggerRefresh={triggerRefresh}
        />
      )}

      {activeTab === 'governance' && (
        <GovernanceModule
          dbState={dbState}
          activeProfile={activeProfile}
          triggerRefresh={triggerRefresh}
        />
      )}

      {activeTab === 'gamification' && (
        <GamificationModule
          dbState={dbState}
          activeProfile={activeProfile}
          triggerRefresh={triggerRefresh}
        />
      )}

      {activeTab === 'reports' && (
        <ReportsModule
          dbState={dbState}
          userRole={activeProfile.role}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsModule
          settings={dbState.settings}
          categories={dbState.categories}
          userRole={activeProfile.role}
          triggerRefresh={triggerRefresh}
        />
      )}
    </Layout>
  );
}
