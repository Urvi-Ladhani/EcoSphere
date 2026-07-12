/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import {
  Profile,
  Department,
  Category,
  EmissionFactor,
  ProductESGProfile,
  EnvironmentalGoal,
  ESGPolicy,
  Audit,
  ComplianceIssue,
  Badge,
  Reward,
  RewardItem,
  CarbonTransaction,
  CSRActivity,
  EmployeeParticipation,
  Challenge,
  ChallengeParticipation,
  DepartmentScore,
  Notification,
  ESGSettings,
  RewardRedemption
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
  // DB Raw/General Getter
  async getDbState() {
    const fetchTable = async (table: string) => {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        console.error(`Error fetching table ${table}:`, error);
        return [];
      }
      return data || [];
    };

    const [
      profiles,
      departments,
      categories,
      emissionFactors,
      productsESG,
      environmentalGoals,
      esgPolicies,
      policyAcknowledgements,
      audits,
      complianceIssues,
      badges,
      rewards,
      carbonTransactions,
      csrActivities,
      employeeParticipations,
      challenges,
      challengeParticipations,
      departmentScores,
      employeeBadges,
      notifications,
      settingsData
    ] = await Promise.all([
      fetchTable('profiles'),
      fetchTable('departments'),
      fetchTable('categories'),
      fetchTable('emission_factors'),
      fetchTable('products_esg'),
      fetchTable('environmental_goals'),
      fetchTable('esg_policies'),
      fetchTable('policy_acknowledgements'),
      fetchTable('audits'),
      fetchTable('compliance_issues'),
      fetchTable('badges'),
      fetchTable('rewards'),
      fetchTable('carbon_transactions'),
      fetchTable('csr_activities'),
      fetchTable('employee_participations'),
      fetchTable('challenges'),
      fetchTable('challenge_participations'),
      fetchTable('department_scores'),
      fetchTable('employee_badges'),
      fetchTable('notifications'),
      supabase.from('settings').select('*').eq('id', 1).maybeSingle()
    ]);

    const defaultSettings: ESGSettings = {
      weight_environmental: 40,
      weight_social: 30,
      weight_governance: 30,
      auto_emission_calculation: true,
      evidence_requirement_enabled: true,
      badge_auto_award_enabled: true,
      notification_compliance_raised: true,
      notification_csr_challenge_decision: true,
      notification_policy_reminder: true,
      notification_badge_unlock: true
    };

    return {
      profiles,
      departments,
      categories,
      emissionFactors,
      productsESG,
      environmentalGoals,
      esgPolicies,
      policyAcknowledgements,
      audits,
      complianceIssues,
      badges,
      rewards,
      rewardItems: (rewards || []).map((r: any) => ({
        id: r.id,
        title: r.name,
        description: r.description,
        points_cost: r.points_required,
        stock: r.stock,
        status: r.status === 'Active' ? 'Available' : 'Unavailable'
      })),
      carbonTransactions,
      csrActivities,
      employeeParticipations,
      challenges,
      challengeParticipations,
      departmentScores,
      employeeBadges,
      notifications,
      settings: settingsData.data || defaultSettings
    };
  },

  async getDBState() {
    return this.getDbState();
  },

  // Settings
  async getSettings(): Promise<ESGSettings> {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    if (error || !data) {
      return {
        weight_environmental: 40,
        weight_social: 30,
        weight_governance: 30,
        auto_emission_calculation: true,
        evidence_requirement_enabled: true,
        badge_auto_award_enabled: true,
        notification_compliance_raised: true,
        notification_csr_challenge_decision: true,
        notification_policy_reminder: true,
        notification_badge_unlock: true
      };
    }
    return data;
  },

  async updateSettings(settings: Partial<ESGSettings>): Promise<ESGSettings> {
    const { data, error } = await supabase
      .from('settings')
      .update(settings)
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Auth Operations
  async login(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass
    });
    if (error) throw error;
    return data;
  },

  async signup(email: string, pass: string, name: string, role: string, departmentId: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass
    });
    if (error) throw error;
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        email,
        role,
        department_id: departmentId,
        xp: 0,
        points: 0,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`
      });
      if (profileError) throw profileError;
    }
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error || !data) return null;
    return data;
  },

  // Profiles
  async getProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data || [];
  },

  async createProfile(profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').insert(profile).select().single();
    if (error) throw error;
    return data;
  },

  async updateProfile(id: string, profile: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').update(profile).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProfile(id: string): Promise<void> {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase.from('departments').select('*');
    if (error) throw error;
    return data || [];
  },

  async createDepartment(dept: Partial<Department>): Promise<Department> {
    const { data, error } = await supabase.from('departments').insert(dept).select().single();
    if (error) throw error;
    return data;
  },

  async updateDepartment(id: string, dept: Partial<Department>): Promise<Department> {
    const { data, error } = await supabase.from('departments').update(dept).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteDepartment(id: string): Promise<void> {
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) throw error;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data || [];
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase.from('categories').insert(cat).select().single();
    if (error) throw error;
    return data;
  },

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase.from('categories').update(cat).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  // Emission Factors
  async getEmissionFactors(): Promise<EmissionFactor[]> {
    const { data, error } = await supabase.from('emission_factors').select('*');
    if (error) throw error;
    return data || [];
  },

  async createEmissionFactor(ef: Partial<EmissionFactor>): Promise<EmissionFactor> {
    const { data, error } = await supabase.from('emission_factors').insert(ef).select().single();
    if (error) throw error;
    return data;
  },

  async updateEmissionFactor(id: string, ef: Partial<EmissionFactor>): Promise<EmissionFactor> {
    const { data, error } = await supabase.from('emission_factors').update(ef).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteEmissionFactor(id: string): Promise<void> {
    const { error } = await supabase.from('emission_factors').delete().eq('id', id);
    if (error) throw error;
  },

  // Products ESG
  async getProductsESG(): Promise<ProductESGProfile[]> {
    const { data, error } = await supabase.from('products_esg').select('*');
    if (error) throw error;
    return data || [];
  },

  async createProductESG(prod: Partial<ProductESGProfile>): Promise<ProductESGProfile> {
    const { data, error } = await supabase.from('products_esg').insert(prod).select().single();
    if (error) throw error;
    return data;
  },

  async updateProductESG(id: string, prod: Partial<ProductESGProfile>): Promise<ProductESGProfile> {
    const { data, error } = await supabase.from('products_esg').update(prod).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteProductESG(id: string): Promise<void> {
    const { error } = await supabase.from('products_esg').delete().eq('id', id);
    if (error) throw error;
  },

  // Environmental Goals
  async getEnvironmentalGoals(): Promise<EnvironmentalGoal[]> {
    const { data, error } = await supabase.from('environmental_goals').select('*');
    if (error) throw error;
    return data || [];
  },

  async createEnvironmentalGoal(goal: Partial<EnvironmentalGoal>): Promise<EnvironmentalGoal> {
    const { data, error } = await supabase.from('environmental_goals').insert(goal).select().single();
    if (error) throw error;
    return data;
  },

  async updateEnvironmentalGoal(id: string, goal: Partial<EnvironmentalGoal>): Promise<EnvironmentalGoal> {
    const { data, error } = await supabase.from('environmental_goals').update(goal).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteEnvironmentalGoal(id: string): Promise<void> {
    const { error } = await supabase.from('environmental_goals').delete().eq('id', id);
    if (error) throw error;
  },

  // Policies
  async getPolicies(): Promise<ESGPolicy[]> {
    const { data, error } = await supabase.from('esg_policies').select('*');
    if (error) throw error;
    return data || [];
  },

  async createPolicy(policy: Partial<ESGPolicy>): Promise<ESGPolicy> {
    const { data, error } = await supabase.from('esg_policies').insert(policy).select().single();
    if (error) throw error;
    return data;
  },

  async updatePolicy(id: string, policy: Partial<ESGPolicy>): Promise<ESGPolicy> {
    const { data, error } = await supabase.from('esg_policies').update(policy).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deletePolicy(id: string): Promise<void> {
    const { error } = await supabase.from('esg_policies').delete().eq('id', id);
    if (error) throw error;
  },

  async acknowledgePolicy(policyId: string, employee: { employee_id: string; employee_name: string }): Promise<void> {
    const { error } = await supabase.from('policy_acknowledgements').insert({
      policy_id: policyId,
      employee_id: employee.employee_id,
      employee_name: employee.employee_name
    });
    if (error) throw error;
  },

  // Audits
  async getAudits(): Promise<Audit[]> {
    const { data, error } = await supabase.from('audits').select('*');
    if (error) throw error;
    return data || [];
  },

  async createAudit(audit: Partial<Audit>): Promise<Audit> {
    const { data, error } = await supabase.from('audits').insert(audit).select().single();
    if (error) throw error;
    return data;
  },

  async updateAudit(id: string, audit: Partial<Audit>): Promise<Audit> {
    const { data, error } = await supabase.from('audits').update(audit).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteAudit(id: string): Promise<void> {
    const { error } = await supabase.from('audits').delete().eq('id', id);
    if (error) throw error;
  },

  // Compliance Issues
  async getComplianceIssues(): Promise<ComplianceIssue[]> {
    const { data, error } = await supabase.from('compliance_issues').select('*');
    if (error) throw error;
    return data || [];
  },

  async createComplianceIssue(issue: Partial<ComplianceIssue>): Promise<ComplianceIssue> {
    const { data, error } = await supabase.from('compliance_issues').insert(issue).select().single();
    if (error) throw error;
    return data;
  },

  async updateComplianceIssue(id: string, issue: Partial<ComplianceIssue>): Promise<ComplianceIssue> {
    const { data, error } = await supabase.from('compliance_issues').update(issue).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteComplianceIssue(id: string): Promise<void> {
    const { error } = await supabase.from('compliance_issues').delete().eq('id', id);
    if (error) throw error;
  },

  // Carbon Transactions
  async getCarbonTransactions(): Promise<CarbonTransaction[]> {
    const { data, error } = await supabase.from('carbon_transactions').select('*');
    if (error) throw error;
    return data || [];
  },

  async createCarbonTransaction(tx: Partial<CarbonTransaction>): Promise<CarbonTransaction> {
    const { data, error } = await supabase.from('carbon_transactions').insert(tx).select().single();
    if (error) throw error;
    return data;
  },

  async updateCarbonTransaction(id: string, tx: Partial<CarbonTransaction>): Promise<CarbonTransaction> {
    const { data, error } = await supabase.from('carbon_transactions').update(tx).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteCarbonTransaction(id: string): Promise<void> {
    const { error } = await supabase.from('carbon_transactions').delete().eq('id', id);
    if (error) throw error;
  },

  // CSR Activities
  async getCSRActivities(): Promise<CSRActivity[]> {
    const { data, error } = await supabase.from('csr_activities').select('*');
    if (error) throw error;
    return data || [];
  },

  async createCSRActivity(act: Partial<CSRActivity>): Promise<CSRActivity> {
    const { data, error } = await supabase.from('csr_activities').insert(act).select().single();
    if (error) throw error;
    return data;
  },

  async updateCSRActivity(id: string, act: Partial<CSRActivity>): Promise<CSRActivity> {
    const { data, error } = await supabase.from('csr_activities').update(act).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteCSRActivity(id: string): Promise<void> {
    const { error } = await supabase.from('csr_activities').delete().eq('id', id);
    if (error) throw error;
  },

  // Employee Participations
  async getEmployeeParticipations(): Promise<EmployeeParticipation[]> {
    const { data, error } = await supabase.from('employee_participations').select('*');
    if (error) throw error;
    return data || [];
  },

  async createEmployeeParticipation(part: Partial<EmployeeParticipation>): Promise<EmployeeParticipation> {
    const { data, error } = await supabase.from('employee_participations').insert(part).select().single();
    if (error) throw error;
    return data;
  },

  async updateEmployeeParticipation(id: string, part: Partial<EmployeeParticipation>): Promise<EmployeeParticipation> {
    const { data, error } = await supabase.from('employee_participations').update(part).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteEmployeeParticipation(id: string): Promise<void> {
    const { error } = await supabase.from('employee_participations').delete().eq('id', id);
    if (error) throw error;
  },

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase.from('challenges').select('*');
    if (error) throw error;
    return data || [];
  },

  async createChallenge(chal: Partial<Challenge>): Promise<Challenge> {
    const { data, error } = await supabase.from('challenges').insert(chal).select().single();
    if (error) throw error;
    return data;
  },

  async updateChallenge(id: string, chal: Partial<Challenge>): Promise<Challenge> {
    const { data, error } = await supabase.from('challenges').update(chal).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteChallenge(id: string): Promise<void> {
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    if (error) throw error;
  },

  // Challenge Participations
  async getChallengeParticipations(): Promise<ChallengeParticipation[]> {
    const { data, error } = await supabase.from('challenge_participations').select('*');
    if (error) throw error;
    return data || [];
  },

  async submitChallengeParticipation(part: Partial<ChallengeParticipation>): Promise<ChallengeParticipation> {
    const { data: existing } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('challenge_id', part.challenge_id)
      .eq('employee_id', part.employee_id)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('challenge_participations')
        .update(part)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const { data, error } = await supabase.from('challenge_participations').insert(part).select().single();
    if (error) throw error;
    return data;
  },

  async updateChallengeParticipation(id: string, part: Partial<ChallengeParticipation>): Promise<ChallengeParticipation> {
    const { data, error } = await supabase.from('challenge_participations').update(part).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteChallengeParticipation(id: string): Promise<void> {
    const { error } = await supabase.from('challenge_participations').delete().eq('id', id);
    if (error) throw error;
  },

  // Badges
  async getBadges(): Promise<Badge[]> {
    const { data, error } = await supabase.from('badges').select('*');
    if (error) throw error;
    return data || [];
  },

  async createBadge(badge: Partial<Badge>): Promise<Badge> {
    const backendBadge = {
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      unlock_rule_type: badge.unlock_rule_type || 'xp_earned',
      unlock_rule_threshold: badge.unlock_rule_threshold ?? badge.xp_threshold ?? 500
    };
    const { data, error } = await supabase.from('badges').insert(backendBadge).select().single();
    if (error) throw error;
    return {
      ...data,
      xp_threshold: data.unlock_rule_threshold
    };
  },

  async deleteBadge(id: string): Promise<void> {
    const { error } = await supabase.from('badges').delete().eq('id', id);
    if (error) throw error;
  },

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const { data, error } = await supabase.from('rewards').select('*');
    if (error) throw error;
    return data || [];
  },

  async createRewardItem(item: Partial<RewardItem>): Promise<RewardItem> {
    const backendItem = {
      name: item.title,
      description: item.description,
      points_required: item.points_cost,
      stock: item.stock,
      status: item.status === 'Available' ? 'Active' : 'Inactive'
    };
    const { data, error } = await supabase.from('rewards').insert(backendItem).select().single();
    if (error) throw error;
    return {
      id: data.id,
      title: data.name,
      description: data.description,
      points_cost: data.points_required,
      stock: data.stock,
      status: data.status === 'Active' ? 'Available' : 'Unavailable'
    };
  },

  async deleteRewardItem(id: string): Promise<void> {
    const { error } = await supabase.from('rewards').delete().eq('id', id);
    if (error) throw error;
  },

  async redeemReward(rewardId: string, payload: string | { employee_id: string; employee_name?: string }): Promise<void> {
    const employeeId = typeof payload === 'string' ? payload : payload.employee_id;
    
    const { data: reward, error: rErr } = await supabase.from('rewards').select('*').eq('id', rewardId).single();
    if (rErr || !reward) throw new Error("Reward not found");

    const { data: profile, error: pErr } = await supabase.from('profiles').select('*').eq('id', employeeId).single();
    if (pErr || !profile) throw new Error("Profile not found");

    if (reward.stock <= 0) throw new Error("Reward out of stock");
    if (profile.points < reward.points_required) throw new Error("Insufficient points");

    const { error: pUpdErr } = await supabase.from('profiles').update({ points: profile.points - reward.points_required }).eq('id', employeeId);
    if (pUpdErr) throw pUpdErr;

    const { error: rUpdErr } = await supabase.from('rewards').update({ stock: reward.stock - 1 }).eq('id', rewardId);
    if (rUpdErr) throw rUpdErr;

    const { error: redErr } = await supabase.from('reward_redemptions').insert({
      reward_id: rewardId,
      employee_id: employeeId,
      employee_name: profile.name,
      points_spent: reward.points_required
    });
    if (redErr) throw redErr;
  },

  // Notifications
  async getNotifications(employeeId?: string): Promise<Notification[]> {
    let query = supabase.from('notifications').select('*');
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  },

  async markAllNotificationsRead(employeeId: string): Promise<void> {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('employee_id', employeeId);
    if (error) throw error;
  },

  // Export CSV
  async exportCSV(title: string, data: any[]): Promise<void> {
    if (!data || !Array.isArray(data)) return;
    let csvText = `${title}\nExported Date: ${new Date().toISOString().split('T')[0]}\n\n`;
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      csvText += keys.join(',') + '\n';
      data.forEach((row) => {
        const values = keys.map((key) => {
          const val = row[key];
          if (val === null || val === undefined) return '';
          const strVal = String(val).replace(/"/g, '""');
          return strVal.includes(',') || strVal.includes('\n') ? `"${strVal}"` : strVal;
        });
        csvText += values.join(',') + '\n';
      });
    } else {
      csvText += 'No records found matching current query filters.\n';
    }
    const blob = new Blob([csvText], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};
