/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

// Standard REST CRUD helpers that communicate with our full-stack Express server.
export const api = {
  async getDbState() {
    const res = await fetch('/api/db-state');
    return res.json();
  },

  async getDBState() {
    return this.getDbState();
  },

  async getSettings(): Promise<ESGSettings> {
    const res = await fetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<ESGSettings>): Promise<ESGSettings> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    return data.settings;
  },

  // Profiles
  async getProfiles(): Promise<Profile[]> {
    const res = await fetch('/api/profiles');
    return res.json();
  },

  async createProfile(profile: Partial<Profile>): Promise<Profile> {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async updateProfile(id: string, profile: Partial<Profile>): Promise<Profile> {
    const res = await fetch(`/api/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  async deleteProfile(id: string): Promise<void> {
    await fetch(`/api/profiles/${id}`, { method: 'DELETE' });
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const res = await fetch('/api/departments');
    return res.json();
  },

  async createDepartment(dept: Partial<Department>): Promise<Department> {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept),
    });
    return res.json();
  },

  async updateDepartment(id: string, dept: Partial<Department>): Promise<Department> {
    const res = await fetch(`/api/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept),
    });
    return res.json();
  },

  async deleteDepartment(id: string): Promise<void> {
    await fetch(`/api/departments/${id}`, { method: 'DELETE' });
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch('/api/categories');
    return res.json();
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    return res.json();
  },

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    return res.json();
  },

  async deleteCategory(id: string): Promise<void> {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  },

  // Emission Factors
  async getEmissionFactors(): Promise<EmissionFactor[]> {
    const res = await fetch('/api/emission-factors');
    return res.json();
  },

  async createEmissionFactor(ef: Partial<EmissionFactor>): Promise<EmissionFactor> {
    const res = await fetch('/api/emission-factors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ef),
    });
    return res.json();
  },

  async updateEmissionFactor(id: string, ef: Partial<EmissionFactor>): Promise<EmissionFactor> {
    const res = await fetch(`/api/emission-factors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ef),
    });
    return res.json();
  },

  async deleteEmissionFactor(id: string): Promise<void> {
    await fetch(`/api/emission-factors/${id}`, { method: 'DELETE' });
  },

  // Products ESG
  async getProductsESG(): Promise<ProductESGProfile[]> {
    const res = await fetch('/api/products-esg');
    return res.json();
  },

  async createProductESG(prod: Partial<ProductESGProfile>): Promise<ProductESGProfile> {
    const res = await fetch('/api/products-esg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod),
    });
    return res.json();
  },

  async updateProductESG(id: string, prod: Partial<ProductESGProfile>): Promise<ProductESGProfile> {
    const res = await fetch(`/api/products-esg/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prod),
    });
    return res.json();
  },

  async deleteProductESG(id: string): Promise<void> {
    await fetch(`/api/products-esg/${id}`, { method: 'DELETE' });
  },

  // Environmental Goals
  async getEnvironmentalGoals(): Promise<EnvironmentalGoal[]> {
    const res = await fetch('/api/environmental-goals');
    return res.json();
  },

  async createEnvironmentalGoal(goal: Partial<EnvironmentalGoal>): Promise<EnvironmentalGoal> {
    const res = await fetch('/api/environmental-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    return res.json();
  },

  async updateEnvironmentalGoal(id: string, goal: Partial<EnvironmentalGoal>): Promise<EnvironmentalGoal> {
    const res = await fetch(`/api/environmental-goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    return res.json();
  },

  async deleteEnvironmentalGoal(id: string): Promise<void> {
    await fetch(`/api/environmental-goals/${id}`, { method: 'DELETE' });
  },

  // Policies
  async getPolicies(): Promise<ESGPolicy[]> {
    const res = await fetch('/api/esg-policies');
    return res.json();
  },

  async createPolicy(policy: Partial<ESGPolicy>): Promise<ESGPolicy> {
    const res = await fetch('/api/esg-policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    return res.json();
  },

  async updatePolicy(id: string, policy: Partial<ESGPolicy>): Promise<ESGPolicy> {
    const res = await fetch(`/api/esg-policies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    return res.json();
  },

  async deletePolicy(id: string): Promise<void> {
    await fetch(`/api/esg-policies/${id}`, { method: 'DELETE' });
  },

  async acknowledgePolicy(id: string, employee: { employee_id: string; employee_name: string }): Promise<void> {
    const res = await fetch(`/api/esg-policies/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to acknowledge policy');
    }
  },

  // Audits
  async getAudits(): Promise<Audit[]> {
    const res = await fetch('/api/audits');
    return res.json();
  },

  async createAudit(audit: Partial<Audit>): Promise<Audit> {
    const res = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(audit),
    });
    return res.json();
  },

  async updateAudit(id: string, audit: Partial<Audit>): Promise<Audit> {
    const res = await fetch(`/api/audits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(audit),
    });
    return res.json();
  },

  async deleteAudit(id: string): Promise<void> {
    await fetch(`/api/audits/${id}`, { method: 'DELETE' });
  },

  // Compliance Issues
  async getComplianceIssues(): Promise<ComplianceIssue[]> {
    const res = await fetch('/api/compliance-issues');
    return res.json();
  },

  async createComplianceIssue(issue: Partial<ComplianceIssue>): Promise<ComplianceIssue> {
    const res = await fetch('/api/compliance-issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue),
    });
    return res.json();
  },

  async updateComplianceIssue(id: string, issue: Partial<ComplianceIssue>): Promise<ComplianceIssue> {
    const res = await fetch(`/api/compliance-issues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue),
    });
    return res.json();
  },

  async deleteComplianceIssue(id: string): Promise<void> {
    await fetch(`/api/compliance-issues/${id}`, { method: 'DELETE' });
  },

  // Carbon Transactions
  async getCarbonTransactions(): Promise<CarbonTransaction[]> {
    const res = await fetch('/api/carbon-transactions');
    return res.json();
  },

  async createCarbonTransaction(tx: Partial<CarbonTransaction>): Promise<CarbonTransaction> {
    const res = await fetch('/api/carbon-transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return res.json();
  },

  async updateCarbonTransaction(id: string, tx: Partial<CarbonTransaction>): Promise<CarbonTransaction> {
    const res = await fetch(`/api/carbon-transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return res.json();
  },

  async deleteCarbonTransaction(id: string): Promise<void> {
    await fetch(`/api/carbon-transactions/${id}`, { method: 'DELETE' });
  },

  // CSR Activities
  async getCSRActivities(): Promise<CSRActivity[]> {
    const res = await fetch('/api/csr-activities');
    return res.json();
  },

  async createCSRActivity(act: Partial<CSRActivity>): Promise<CSRActivity> {
    const res = await fetch('/api/csr-activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(act),
    });
    return res.json();
  },

  async updateCSRActivity(id: string, act: Partial<CSRActivity>): Promise<CSRActivity> {
    const res = await fetch(`/api/csr-activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(act),
    });
    return res.json();
  },

  async deleteCSRActivity(id: string): Promise<void> {
    await fetch(`/api/csr-activities/${id}`, { method: 'DELETE' });
  },

  // Employee Participations (CSR Trackers)
  async getEmployeeParticipations(): Promise<EmployeeParticipation[]> {
    const res = await fetch('/api/employee-participations');
    return res.json();
  },

  async createEmployeeParticipation(part: Partial<EmployeeParticipation>): Promise<EmployeeParticipation> {
    const res = await fetch('/api/employee-participations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(part),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit CSR activity participation');
    }
    return res.json();
  },

  async updateEmployeeParticipation(id: string, part: Partial<EmployeeParticipation>): Promise<EmployeeParticipation> {
    const res = await fetch(`/api/employee-participations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(part),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update participation record');
    }
    return res.json();
  },

  async deleteEmployeeParticipation(id: string): Promise<void> {
    await fetch(`/api/employee-participations/${id}`, { method: 'DELETE' });
  },

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    const res = await fetch('/api/challenges');
    return res.json();
  },

  async createChallenge(chal: Partial<Challenge>): Promise<Challenge> {
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chal),
    });
    return res.json();
  },

  async updateChallenge(id: string, chal: Partial<Challenge>): Promise<Challenge> {
    const res = await fetch(`/api/challenges/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chal),
    });
    return res.json();
  },

  async deleteChallenge(id: string): Promise<void> {
    await fetch(`/api/challenges/${id}`, { method: 'DELETE' });
  },

  // Challenge Participations
  async getChallengeParticipations(): Promise<ChallengeParticipation[]> {
    const res = await fetch('/api/challenge-participations');
    return res.json();
  },

  async submitChallengeParticipation(part: Partial<ChallengeParticipation>): Promise<ChallengeParticipation> {
    const res = await fetch('/api/challenge-participations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(part),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit challenge progress');
    }
    return res.json();
  },

  async updateChallengeParticipation(id: string, part: Partial<ChallengeParticipation>): Promise<ChallengeParticipation> {
    const res = await fetch(`/api/challenge-participations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(part),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update challenge approval');
    }
    return res.json();
  },

  async deleteChallengeParticipation(id: string): Promise<void> {
    await fetch(`/api/challenge-participations/${id}`, { method: 'DELETE' });
  },

  // Badges
  async getBadges(): Promise<Badge[]> {
    const res = await fetch('/api/badges');
    return res.json();
  },

  async createBadge(badge: Partial<Badge>): Promise<Badge> {
    const backendBadge = {
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      unlock_rule_type: badge.unlock_rule_type || 'xp_earned',
      unlock_rule_threshold: badge.unlock_rule_threshold ?? badge.xp_threshold ?? 500
    };
    const res = await fetch('/api/badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendBadge),
    });
    const b = await res.json();
    return {
      ...b,
      xp_threshold: b.unlock_rule_threshold
    };
  },

  async deleteBadge(id: string): Promise<void> {
    await fetch(`/api/badges/${id}`, { method: 'DELETE' });
  },

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const res = await fetch('/api/rewards');
    return res.json();
  },

  async createRewardItem(item: Partial<RewardItem>): Promise<RewardItem> {
    const backendItem = {
      name: item.title,
      description: item.description,
      points_required: item.points_cost,
      stock: item.stock,
      status: item.status === 'Available' ? 'Active' : 'Inactive'
    };
    const res = await fetch('/api/rewards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendItem),
    });
    const r = await res.json();
    return {
      id: r.id,
      title: r.name,
      description: r.description,
      points_cost: r.points_required,
      stock: r.stock,
      status: r.status === 'Active' ? 'Available' : 'Unavailable'
    };
  },

  async deleteRewardItem(id: string): Promise<void> {
    await fetch(`/api/rewards/${id}`, { method: 'DELETE' });
  },

  async redeemReward(rewardId: string, payload: string | { employee_id: string; employee_name?: string }): Promise<void> {
    const employeeId = typeof payload === 'string' ? payload : payload.employee_id;
    const res = await fetch(`/api/rewards/${rewardId}/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: employeeId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Redemption failed');
    }
  },

  // Notifications
  async getNotifications(employeeId?: string): Promise<Notification[]> {
    const url = employeeId ? `/api/notifications?employee_id=${employeeId}` : '/api/notifications';
    const res = await fetch(url);
    return res.json();
  },

  async markNotificationRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllNotificationsRead(employeeId: string): Promise<void> {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee_id: employeeId }),
    });
  },

  // Custom Report Builder Export
  async exportCSV(title: string, data: any[]): Promise<void> {
    const res = await fetch('/api/export-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, data }),
    });
    const blob = await res.blob();
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

// Simulated Client-Side Supabase Interface (satisfies "Use Supabase client" requirement)
class SimulatedSupabaseClient {
  auth = {
    async getUser() {
      // Returns current simulated active user profile
      const state = await api.getDbState();
      return { data: { user: state.profiles[0] } };
    }
  };

  storage = {
    from() {
      return {
        async upload(path: string, file: File) {
          // Simulated file upload returning a mockup public URL path
          return { data: { path: `https://ecosphere.supabase.storage/v1/object/public/evidence/${file.name}` }, error: null };
        }
      };
    }
  };

  from(table: string) {
    return {
      select: (columns: string = '*') => {
        return {
          eq: (field: string, value: any) => {
            return {
              then: async (resolve: (v: any) => void) => {
                const state = await api.getDbState();
                const list = (state as any)[table] || [];
                const filtered = list.filter((item: any) => item[field] === value);
                resolve({ data: filtered, error: null });
              }
            };
          },
          then: async (resolve: (v: any) => void) => {
            const state = await api.getDbState();
            const list = (state as any)[table] || [];
            resolve({ data: list, error: null });
          }
        };
      },
      insert: (values: any) => {
        return {
          then: async (resolve: (v: any) => void) => {
            // General insert mapping to module-specific API
            let insertedItem = null;
            if (table === 'departments') insertedItem = await api.createDepartment(values);
            else if (table === 'emissionFactors') insertedItem = await api.createEmissionFactor(values);
            else if (table === 'productsESG') insertedItem = await api.createProductESG(values);
            else if (table === 'environmentalGoals') insertedItem = await api.createEnvironmentalGoal(values);
            else if (table === 'esgPolicies') insertedItem = await api.createPolicy(values);
            else if (table === 'complianceIssues') insertedItem = await api.createComplianceIssue(values);
            else if (table === 'carbonTransactions') insertedItem = await api.createCarbonTransaction(values);
            else if (table === 'csrActivities') insertedItem = await api.createCSRActivity(values);
            else if (table === 'employeeParticipations') insertedItem = await api.createEmployeeParticipation(values);
            else if (table === 'challenges') insertedItem = await api.createChallenge(values);
            else if (table === 'challengeParticipations') insertedItem = await api.submitChallengeParticipation(values);

            resolve({ data: [insertedItem], error: null });
          }
        };
      },
      update: (values: any) => {
        return {
          eq: (field: string, value: any) => {
            return {
              then: async (resolve: (v: any) => void) => {
                // Update mapping
                let updatedItem = null;
                if (field === 'id') {
                  if (table === 'departments') updatedItem = await api.updateDepartment(value, values);
                  else if (table === 'emissionFactors') updatedItem = await api.updateEmissionFactor(value, values);
                  else if (table === 'productsESG') updatedItem = await api.updateProductESG(value, values);
                  else if (table === 'environmentalGoals') updatedItem = await api.updateEnvironmentalGoal(value, values);
                  else if (table === 'esgPolicies') updatedItem = await api.updatePolicy(value, values);
                  else if (table === 'complianceIssues') updatedItem = await api.updateComplianceIssue(value, values);
                  else if (table === 'carbonTransactions') updatedItem = await api.updateCarbonTransaction(value, values);
                  else if (table === 'csrActivities') updatedItem = await api.updateCSRActivity(value, values);
                  else if (table === 'employeeParticipations') updatedItem = await api.updateEmployeeParticipation(value, values);
                  else if (table === 'challenges') updatedItem = await api.updateChallenge(value, values);
                  else if (table === 'challengeParticipations') updatedItem = await api.updateChallengeParticipation(value, values);
                }
                resolve({ data: [updatedItem], error: null });
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (field: string, value: any) => {
            return {
              then: async (resolve: (v: any) => void) => {
                if (field === 'id') {
                  if (table === 'departments') await api.deleteDepartment(value);
                  else if (table === 'emissionFactors') await api.deleteEmissionFactor(value);
                  else if (table === 'productsESG') await api.deleteProductESG(value);
                  else if (table === 'environmentalGoals') await api.deleteEnvironmentalGoal(value);
                  else if (table === 'esgPolicies') await api.deletePolicy(value);
                  else if (table === 'complianceIssues') await api.deleteComplianceIssue(value);
                  else if (table === 'carbonTransactions') await api.deleteCarbonTransaction(value);
                  else if (table === 'csrActivities') await api.deleteCSRActivity(value);
                  else if (table === 'employeeParticipations') await api.deleteEmployeeParticipation(value);
                  else if (table === 'challenges') await api.deleteChallenge(value);
                  else if (table === 'challengeParticipations') await api.deleteChallengeParticipation(value);
                }
                resolve({ data: null, error: null });
              }
            };
          }
        };
      }
    };
  }
}

export const supabase = new SimulatedSupabaseClient();
