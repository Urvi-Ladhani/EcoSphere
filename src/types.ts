/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department_id: string;
  xp: number;
  points: number;
  avatar: string;
  points_balance?: number;
  unlocked_badges?: string[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  parent_id: string | null;
  employee_count: number;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'CSR Activity' | 'Challenge';
  status: 'Active' | 'Inactive';
}

export interface EmissionFactor {
  id: string;
  name: string;
  source: 'Purchase' | 'Manufacturing' | 'Expenses' | 'Fleet';
  co2_factor: number; // kg CO2e per unit
  unit: string; // e.g., kWh, Liter, kg, USD
  status: 'Active' | 'Inactive';
}

export interface ProductESGProfile {
  id: string;
  name: string;
  sku: string;
  carbon_footprint: number; // kg CO2e
  recyclability: number; // percentage
  material_source: string;
  status: 'Active' | 'Inactive';
}

export interface EnvironmentalGoal {
  id: string;
  name: string;
  target_metric: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  status: 'On Track' | 'At Risk' | 'Achieved';
}

export interface ESGPolicy {
  id: string;
  name: string;
  description: string;
  department_owner: string;
  effective_date: string;
  version: string;
  status: 'Published' | 'Draft' | 'Archived';
}

export interface PolicyAcknowledgement {
  id: string;
  policy_id: string;
  employee_id: string;
  employee_name: string;
  acknowledged_at: string;
}

export interface Audit {
  id: string;
  name: string;
  department_id: string;
  auditor_name: string;
  audit_date: string;
  score: number; // 0 - 100
  findings: string;
  status: 'Draft' | 'Scheduled' | 'Completed';
}

export interface ComplianceIssue {
  id: string;
  audit_id: string | null;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  owner_name: string;
  due_date: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  flagged_past_due?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlock_rule_type: 'completed_challenges' | 'xp_earned';
  unlock_rule_threshold: number;
  icon: string;
  xp_threshold?: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  stock: number;
  status: 'Active' | 'Inactive';
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  points_cost: number;
  stock: number;
  status: 'Available' | 'Unavailable' | string;
}

export interface CarbonTransaction {
  id: string;
  transaction_date: string;
  source: 'Purchase' | 'Manufacturing' | 'Expenses' | 'Fleet';
  linked_entity: string; // e.g., "Invoice #3002", "Company Van ID-09"
  activity_value: number;
  unit: string;
  emission_factor_id: string;
  calculated_co2: number; // kg CO2e
  status: 'Pending' | 'Approved';
}

export interface CSRActivity {
  id: string;
  title: string;
  category_id: string;
  description: string;
  host_organizer: string;
  date: string;
  estimated_points: number;
  location: string;
  status: 'Active' | 'Completed';
}

export interface EmployeeParticipation {
  id: string;
  employee_id: string;
  employee_name: string;
  activity_id: string;
  proof: string;
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  points_earned: number;
  completion_date: string;
}

export interface Challenge {
  id: string;
  title: string;
  category_id: string;
  description: string;
  xp: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  evidence_required: boolean;
  deadline: string;
  status: 'Draft' | 'Active' | 'Under Review' | 'Completed' | 'Archived';
}

export interface ChallengeParticipation {
  id: string;
  challenge_id: string;
  employee_id: string;
  employee_name: string;
  progress: number; // 0 - 100
  proof: string;
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  xp_awarded: number;
  completion_date: string;
}

export interface DepartmentScore {
  id: string;
  department_id: string;
  environmental_score: number; // 0-100
  social_score: number; // 0-100
  governance_score: number; // 0-100
  total_score: number; // weighted or simple
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Alert';
  employee_id: string;
  is_read: boolean;
  created_at: string;
}

export interface ESGSettings {
  weight_environmental: number; // default 40
  weight_social: number; // default 30
  weight_governance: number; // default 30
  auto_emission_calculation: boolean; // default true
  evidence_requirement_enabled: boolean; // default true
  badge_auto_award_enabled: boolean; // default true
  notification_compliance_raised: boolean;
  notification_csr_challenge_decision: boolean;
  notification_policy_reminder: boolean;
  notification_badge_unlock: boolean;
}

export interface RewardRedemption {
  id: string;
  reward_id: string;
  employee_id: string;
  employee_name: string;
  points_spent: number;
  redeemed_at: string;
}

export interface EmployeeBadge {
  id: string;
  employee_id: string;
  badge_id: string;
  unlocked_at: string;
}
