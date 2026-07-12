/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
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
  Reward,
  CarbonTransaction,
  CSRActivity,
  EmployeeParticipation,
  Challenge,
  ChallengeParticipation,
  DepartmentScore,
  Notification,
  ESGSettings,
  RewardRedemption,
  EmployeeBadge
} from './src/types';

// Load server-only secrets before initializing integrations. Do not expose
// GEMINI_API_KEY through a VITE_ variable or the browser bundle.
dotenv.config();

// Initialize App
const app = express();
const PORT = 3000;
app.use(express.json());

const DB_FILE = path.join(process.cwd(), 'esg_db.json');

// Preseeded Mock Data Structure
interface DBState {
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
  rewards: Reward[];
  carbonTransactions: CarbonTransaction[];
  csrActivities: CSRActivity[];
  employeeParticipations: EmployeeParticipation[];
  challenges: Challenge[];
  challengeParticipations: ChallengeParticipation[];
  departmentScores: DepartmentScore[];
  notifications: Notification[];
  settings: ESGSettings;
  rewardRedemptions: RewardRedemption[];
  employeeBadges: EmployeeBadge[];
}

const DEFAULT_SETTINGS: ESGSettings = {
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

const INITIAL_DB: DBState = {
  profiles: [
    {
      id: 'emp-01',
      name: 'Tanmay Mevada',
      email: 'tanmaymevada24@gmail.com',
      role: 'Admin',
      department_id: 'dept-05', // Corporate Governance
      xp: 1250,
      points: 450,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 'emp-02',
      name: 'Sarah Smith',
      email: 'sarah.smith@ecosphere.com',
      role: 'Manager',
      department_id: 'dept-02', // Manufacturing
      xp: 850,
      points: 200,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 'emp-03',
      name: 'John Doe',
      email: 'john.doe@ecosphere.com',
      role: 'Manager',
      department_id: 'dept-01', // Operations
      xp: 620,
      points: 150,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 'emp-04',
      name: 'Alex Wong',
      email: 'alex.wong@ecosphere.com',
      role: 'Employee',
      department_id: 'dept-03', // Engineering
      xp: 450,
      points: 100,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80'
    },
    {
      id: 'emp-05',
      name: 'Elena Rostova',
      email: 'elena.rostova@ecosphere.com',
      role: 'Employee',
      department_id: 'dept-04', // Human Resources
      xp: 920,
      points: 300,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80'
    }
  ],
  departments: [
    {
      id: 'dept-01',
      name: 'Operations',
      code: 'OPS',
      head: 'John Doe',
      parent_id: null,
      employee_count: 42,
      status: 'Active',
      created_at: '2026-01-10T08:00:00Z'
    },
    {
      id: 'dept-02',
      name: 'Manufacturing',
      code: 'MFG',
      head: 'Sarah Smith',
      parent_id: 'dept-01',
      employee_count: 120,
      status: 'Active',
      created_at: '2026-01-10T08:30:00Z'
    },
    {
      id: 'dept-03',
      name: 'Engineering',
      code: 'ENG',
      head: 'Alex Wong',
      parent_id: 'dept-01',
      employee_count: 28,
      status: 'Active',
      created_at: '2026-02-15T09:00:00Z'
    },
    {
      id: 'dept-04',
      name: 'Human Resources',
      code: 'HR',
      head: 'Elena Rostova',
      parent_id: null,
      employee_count: 8,
      status: 'Active',
      created_at: '2026-01-12T08:00:00Z'
    },
    {
      id: 'dept-05',
      name: 'Corporate Governance',
      code: 'GOV',
      head: 'Tanmay Mevada',
      parent_id: null,
      employee_count: 5,
      status: 'Active',
      created_at: '2026-01-05T08:00:00Z'
    }
  ],
  categories: [
    { id: 'cat-01', name: 'Energy Conservation', type: 'Challenge', status: 'Active' },
    { id: 'cat-02', name: 'Community Service', type: 'CSR Activity', status: 'Active' },
    { id: 'cat-03', name: 'Waste Reduction', type: 'Challenge', status: 'Active' },
    { id: 'cat-04', name: 'Sustainable Transit', type: 'Challenge', status: 'Active' },
    { id: 'cat-05', name: 'Environmental Protection', type: 'CSR Activity', status: 'Active' },
    { id: 'cat-06', name: 'Workplace Safety & Training', type: 'CSR Activity', status: 'Active' }
  ],
  emissionFactors: [
    { id: 'ef-01', name: 'Electricity Grid (US EPA East)', source: 'Purchase', co2_factor: 0.42, unit: 'kWh', status: 'Active' },
    { id: 'ef-02', name: 'Natural Gas Heating', source: 'Manufacturing', co2_factor: 1.88, unit: 'm3', status: 'Active' },
    { id: 'ef-03', name: 'Commercial Flight Business Class', source: 'Expenses', co2_factor: 0.25, unit: 'Mile', status: 'Active' },
    { id: 'ef-04', name: 'Diesel Freight Shipping Truck', source: 'Fleet', co2_factor: 2.68, unit: 'Liter', status: 'Active' },
    { id: 'ef-05', name: 'Unleaded Petrol (Company Fleet)', source: 'Fleet', co2_factor: 2.31, unit: 'Liter', status: 'Active' }
  ],
  productsESG: [
    {
      id: 'prod-01',
      name: 'EcoWidget Smart Sensor',
      sku: 'WDG-ECO-01',
      carbon_footprint: 12.4,
      recyclability: 85,
      material_source: 'Recycled bio-plastics & lead-free solder',
      status: 'Active'
    },
    {
      id: 'prod-02',
      name: 'Standard Industrial Actuator',
      sku: 'WDG-STD-02',
      carbon_footprint: 35.8,
      recyclability: 45,
      material_source: 'Alloy steel & structural engineering plastics',
      status: 'Active'
    },
    {
      id: 'prod-03',
      name: 'Zero-Emission Power Pack',
      sku: 'WDG-ZEP-99',
      carbon_footprint: 4.2,
      recyclability: 98,
      material_source: 'Ocean-bound plastic shell & solid-state cell',
      status: 'Active'
    }
  ],
  environmentalGoals: [
    {
      id: 'goal-01',
      name: 'Reduce Operations carbon footprint by 15% YoY',
      target_metric: 'Carbon emissions from Purchase/Manufacturing',
      target_value: 40000,
      current_value: 36240,
      unit: 'kg CO2e',
      target_date: '2026-12-31',
      status: 'On Track'
    },
    {
      id: 'goal-02',
      name: 'Raise general recycling quota of manufacturing waste',
      target_metric: 'Recycled proportion of structural outputs',
      target_value: 80,
      current_value: 62.5,
      unit: '%',
      target_date: '2026-09-30',
      status: 'On Track'
    },
    {
      id: 'goal-03',
      name: 'Eliminate all single-use plastics from headquarters',
      target_metric: 'Inventory count of plastic cups & cutlery',
      target_value: 0,
      current_value: 120,
      unit: 'Units',
      target_date: '2026-08-15',
      status: 'At Risk'
    }
  ],
  esgPolicies: [
    {
      id: 'pol-01',
      name: 'Renewable Energy Procurement Standards',
      description: 'Establishes a mandatory criteria that all operations, warehouses, and corporate facilities must optimize clean energy. At least 50% of peak hourly loads must utilize grid solar, wind, or local backup microgrids.',
      department_owner: 'Operations',
      effective_date: '2026-01-15',
      version: 'v2.1',
      status: 'Published'
    },
    {
      id: 'pol-02',
      name: 'Zero-Waste & Supply Chain Circularity Directive',
      description: 'Outlines requirements for supply chains, including product circularity profiles, recycling certifications for raw metal suppliers, and immediate tracking of shipping box packaging components.',
      department_owner: 'Engineering',
      effective_date: '2026-03-01',
      version: 'v1.0',
      status: 'Published'
    },
    {
      id: 'pol-03',
      name: 'Corporate Code of Business Conduct and Ethics',
      description: 'Zero tolerance toward regulatory breaches, commercial bribery, conflicts of interest, or discriminatory hiring. Mandates annual compliance training, routine governance audits, and public risk registers.',
      department_owner: 'Corporate Governance',
      effective_date: '2026-02-10',
      version: 'v3.0',
      status: 'Published'
    }
  ],
  policyAcknowledgements: [
    { id: 'ack-01', policy_id: 'pol-01', employee_id: 'emp-01', employee_name: 'Tanmay Mevada', acknowledged_at: '2026-01-16T10:00:00Z' },
    { id: 'ack-02', policy_id: 'pol-01', employee_id: 'emp-02', employee_name: 'Sarah Smith', acknowledged_at: '2026-01-18T14:30:00Z' },
    { id: 'ack-03', policy_id: 'pol-03', employee_id: 'emp-01', employee_name: 'Tanmay Mevada', acknowledged_at: '2026-02-12T09:15:00Z' },
    { id: 'ack-04', policy_id: 'pol-03', employee_id: 'emp-05', employee_name: 'Elena Rostova', acknowledged_at: '2026-02-20T11:00:00Z' }
  ],
  audits: [
    {
      id: 'aud-01',
      name: 'Q1 Comprehensive Environmental Audit',
      department_id: 'dept-02', // Manufacturing
      auditor_name: 'Apex ESG Solutions Ltd',
      audit_date: '2026-03-12',
      score: 88,
      findings: 'Minor leaks detected in Natural Gas heating valves in Workshop-C. Waste separation bins are consistently deployed. Product recyclability tracking is present but metadata fields are incomplete.',
      status: 'Completed'
    },
    {
      id: 'aud-02',
      name: 'Bi-Annual Ethical Governance & Risk Audit',
      department_id: 'dept-05', // Corporate Governance
      auditor_name: 'Grant Thorton Risk Advisors',
      audit_date: '2026-06-18',
      score: 95,
      findings: 'Excellent policy version control and archive maintenance. Board conflict logs are fully documented. Recommended automating employee-level policy reminder alerts to raise compliance acknowledges.',
      status: 'Completed'
    },
    {
      id: 'aud-03',
      name: 'Q3 Warehouse Safety & Transit Audit',
      department_id: 'dept-01', // Operations
      auditor_name: 'National Safe Council Corp',
      audit_date: '2026-07-25',
      score: 0,
      findings: 'Audit scheduled for upcoming quarter. Preparing fleet diesel utilization trackers and safety checklist documents.',
      status: 'Scheduled'
    }
  ],
  complianceIssues: [
    {
      id: 'ci-01',
      audit_id: 'aud-01',
      severity: 'Medium',
      description: 'Minor leaks in Natural Gas heating valves in Workshop-C require direct engineer replacement.',
      owner_name: 'Sarah Smith',
      due_date: '2026-04-12',
      status: 'Resolved'
    },
    {
      id: 'ci-02',
      audit_id: 'aud-01',
      severity: 'High',
      description: 'Product recyclability documentation has missing source metrics for packaging suppliers.',
      owner_name: 'Alex Wong',
      due_date: '2026-05-30',
      status: 'In Progress'
    },
    {
      id: 'ci-03',
      audit_id: null,
      severity: 'Critical',
      description: 'Immediate replacement needed for fleet delivery trucks showing black smoke under acceleration (Van Fleet V-09).',
      owner_name: 'John Doe',
      due_date: '2026-07-01', // Past due!
      status: 'Open'
    }
  ],
  badges: [
    {
      id: 'bad-01',
      name: 'Eco Pioneer',
      description: 'Amass 500 XP through sustainability efforts.',
      unlock_rule_type: 'xp_earned',
      unlock_rule_threshold: 500,
      icon: 'Leaf'
    },
    {
      id: 'bad-02',
      name: 'Carbon Slayer',
      description: 'Complete 3 energy-saving active challenges.',
      unlock_rule_type: 'completed_challenges',
      unlock_rule_threshold: 3,
      icon: 'FlameKindling'
    },
    {
      id: 'bad-03',
      name: 'Eminent Citizen',
      description: 'Reach a legendary status of 1000 total XP.',
      unlock_rule_type: 'xp_earned',
      unlock_rule_threshold: 1000,
      icon: 'Award'
    }
  ],
  rewards: [
    {
      id: 'rew-01',
      name: 'EcoSphere Bamboo Reusable Coffee Mug',
      description: 'Sturdy, organic, biodegradable double-wall insulation with leak-proof flip lid.',
      points_required: 150,
      stock: 12,
      status: 'Active'
    },
    {
      id: 'rew-02',
      name: 'Recycled PET Lightweight Windbreaker Jacket',
      description: 'Unisex water-resistant shell crafted entirely from 48 post-consumer plastic bottles.',
      points_required: 400,
      stock: 4,
      status: 'Active'
    },
    {
      id: 'rew-03',
      name: 'Portable Smart Solar Phone Power Bank',
      description: 'High capacity 15000mAh backup battery featuring direct sunlight fast recharging panel.',
      points_required: 600,
      stock: 2,
      status: 'Active'
    },
    {
      id: 'rew-04',
      name: '1-Ton Verified Certified Carbon Offset Certificate',
      description: 'Gold Standard verified carbon retirement matching registered renewable forestry preservation.',
      points_required: 250,
      stock: 999,
      status: 'Active'
    }
  ],
  carbonTransactions: [
    {
      id: 'ct-01',
      transaction_date: '2026-07-01',
      source: 'Purchase',
      linked_entity: 'Headquarters Power Bill (Jul 2026)',
      activity_value: 24000,
      unit: 'kWh',
      emission_factor_id: 'ef-01',
      calculated_co2: 10080,
      status: 'Approved'
    },
    {
      id: 'ct-02',
      transaction_date: '2026-07-04',
      source: 'Fleet',
      linked_entity: 'Bulk Diesel Delivery (Logistics Fleet)',
      activity_value: 850,
      unit: 'Liter',
      emission_factor_id: 'ef-04',
      calculated_co2: 2278,
      status: 'Approved'
    },
    {
      id: 'ct-03',
      transaction_date: '2026-07-08',
      source: 'Manufacturing',
      linked_entity: 'Boiler natural gas utilization',
      activity_value: 1200,
      unit: 'm3',
      emission_factor_id: 'ef-02',
      calculated_co2: 2256,
      status: 'Approved'
    },
    {
      id: 'ct-04',
      transaction_date: '2026-07-10',
      source: 'Expenses',
      linked_entity: 'Engineering Business Trip (NYC to SFO)',
      activity_value: 2560,
      unit: 'Mile',
      emission_factor_id: 'ef-03',
      calculated_co2: 640,
      status: 'Pending'
    }
  ],
  csrActivities: [
    {
      id: 'csr-01',
      title: 'City Forestation Tree Planting Drive',
      category_id: 'cat-02',
      description: 'Unite with team members to plant over 150 native broadleaf trees in the municipal nature sanctuary.',
      host_organizer: 'Elena Rostova (HR Department)',
      date: '2026-06-20',
      estimated_points: 100,
      location: 'Greenwood Municipal Park',
      status: 'Completed'
    },
    {
      id: 'csr-02',
      title: 'Ocean Plastic Cleanup Campaign',
      category_id: 'cat-05',
      description: 'Help remove consumer plastics, nets, and packaging rubbish along the sandy bay shorelines.',
      host_organizer: 'Tanmay Mevada (Corporate Governance)',
      date: '2026-07-22',
      estimated_points: 150,
      location: 'Sunset Beach Regional Inlet',
      status: 'Active'
    },
    {
      id: 'csr-03',
      title: 'Safety Training & CPR Awareness Workshop',
      category_id: 'cat-06',
      description: 'Interactive educational workshop conducting professional hazard assessments and CPR certifications.',
      host_organizer: 'Sarah Smith (Manufacturing)',
      date: '2026-08-05',
      estimated_points: 80,
      location: 'Central Conference Hall',
      status: 'Active'
    }
  ],
  employeeParticipations: [
    {
      id: 'part-01',
      employee_id: 'emp-01',
      employee_name: 'Tanmay Mevada',
      activity_id: 'csr-01',
      proof: 'Submitted photographic validation showing planting of three maple trees and team sign-in list.',
      approval_status: 'Approved',
      points_earned: 100,
      completion_date: '2026-06-20'
    },
    {
      id: 'part-02',
      employee_id: 'emp-04',
      employee_name: 'Alex Wong',
      activity_id: 'csr-01',
      proof: 'Signed certificate from park ranger coordinator verifying active volunteer digging.',
      approval_status: 'Approved',
      points_earned: 100,
      completion_date: '2026-06-20'
    },
    {
      id: 'part-03',
      employee_id: 'emp-05',
      employee_name: 'Elena Rostova',
      activity_id: 'csr-01',
      proof: 'Organized and managed refreshments, took photographs, and plant checklist.',
      approval_status: 'Approved',
      points_earned: 100,
      completion_date: '2026-06-20'
    }
  ],
  challenges: [
    {
      id: 'chal-01',
      title: 'Zero Food Waste Week Challenge',
      category_id: 'cat-03',
      description: 'Commit to purchasing and preparing only what is eaten, eliminating edible food waste for seven days. Take photos of your empty plates!',
      xp: 150,
      difficulty: 'Easy',
      evidence_required: true,
      deadline: '2026-07-15',
      status: 'Active'
    },
    {
      id: 'chal-02',
      title: 'Bike, Walk or Transit to Office',
      category_id: 'cat-04',
      description: 'Ditch individual petrol car commutes. Travel to office using carbon-free bicycles, clean walking pathways, or mass transit rails.',
      xp: 250,
      difficulty: 'Medium',
      evidence_required: true,
      deadline: '2026-07-28',
      status: 'Active'
    },
    {
      id: 'chal-03',
      title: 'Warehouse Low-Energy Retrofit Initiative',
      category_id: 'cat-01',
      description: 'Audit and replace standard fluorescent tube lighting with modern motion-activated dimmable LED systems in structural bay-4.',
      xp: 400,
      difficulty: 'Hard',
      evidence_required: true,
      deadline: '2026-08-10',
      status: 'Active'
    }
  ],
  challengeParticipations: [
    {
      id: 'cp-01',
      challenge_id: 'chal-01',
      employee_id: 'emp-01',
      employee_name: 'Tanmay Mevada',
      progress: 100,
      proof: 'Empty plate photos for Mon-Sun compiled into a PDF with shopping log.',
      approval_status: 'Approved',
      xp_awarded: 150,
      completion_date: '2026-07-06'
    },
    {
      id: 'cp-02',
      challenge_id: 'chal-01',
      employee_id: 'emp-05',
      employee_name: 'Elena Rostova',
      progress: 100,
      proof: 'Shared meal plan spreadsheet and daily verification logs showing zero discards.',
      approval_status: 'Approved',
      xp_awarded: 150,
      completion_date: '2026-07-07'
    },
    {
      id: 'cp-03',
      challenge_id: 'chal-02',
      employee_id: 'emp-04',
      employee_name: 'Alex Wong',
      progress: 60,
      proof: 'Strava ride tracking logs showing three consecutive bike commutes.',
      approval_status: 'Pending',
      xp_awarded: 0,
      completion_date: ''
    }
  ],
  departmentScores: [
    { id: 'ds-01', department_id: 'dept-01', environmental_score: 78, social_score: 82, governance_score: 85, total_score: 81 },
    { id: 'ds-02', department_id: 'dept-02', environmental_score: 65, social_score: 75, governance_score: 80, total_score: 72 },
    { id: 'ds-03', department_id: 'dept-03', environmental_score: 92, social_score: 88, governance_score: 90, total_score: 90 },
    { id: 'ds-04', department_id: 'dept-04', environmental_score: 85, social_score: 95, governance_score: 88, total_score: 89 },
    { id: 'ds-05', department_id: 'dept-05', environmental_score: 90, social_score: 90, governance_score: 98, total_score: 92 }
  ],
  notifications: [
    {
      id: 'not-01',
      title: 'Critical Compliance Issue Raised',
      message: 'A critical compliance issue is past due: "Immediate replacement needed for fleet delivery trucks showing black smoke" assigned to John Doe.',
      type: 'Alert',
      employee_id: 'emp-01', // Admin
      is_read: false,
      created_at: '2026-07-11T09:00:00Z'
    },
    {
      id: 'not-02',
      title: 'New CSR Activity Registered',
      message: 'Ocean Plastic Cleanup Campaign has been added by Tanmay Mevada for July 22nd. Volunteer to earn 150 Points!',
      type: 'Info',
      employee_id: 'emp-04', // Alex Wong
      is_read: false,
      created_at: '2026-07-10T14:00:00Z'
    },
    {
      id: 'not-03',
      title: 'Challenge Completed & Approved',
      message: 'Your Zero Food Waste Week Challenge has been approved! You have been awarded 150 XP.',
      type: 'Info',
      employee_id: 'emp-05', // Elena
      is_read: true,
      created_at: '2026-07-07T16:45:00Z'
    }
  ],
  settings: DEFAULT_SETTINGS,
  rewardRedemptions: [
    {
      id: 'red-01',
      reward_id: 'rew-01',
      employee_id: 'emp-05',
      employee_name: 'Elena Rostova',
      points_spent: 150,
      redeemed_at: '2026-06-25T11:20:00Z'
    }
  ],
  employeeBadges: [
    { id: 'eb-01', employee_id: 'emp-01', badge_id: 'bad-01', unlocked_at: '2026-05-10T12:00:00Z' },
    { id: 'eb-02', employee_id: 'emp-01', badge_id: 'bad-03', unlocked_at: '2026-07-06T15:00:00Z' },
    { id: 'eb-03', employee_id: 'emp-05', badge_id: 'bad-01', unlocked_at: '2026-06-28T09:00:00Z' }
  ]
};

// Database Initialization
function loadDB(): DBState {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf8');
    return INITIAL_DB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading ESG DB file, restoring default', err);
    return INITIAL_DB;
  }
}

function saveDB(state: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing ESG DB file', err);
  }
}

// Check compliance issues past due and trigger automated alert notifications
function checkPastDueIssues(db: DBState) {
  const now = new Date();
  let changed = false;

  db.complianceIssues.forEach((issue) => {
    if (issue.status !== 'Resolved') {
      const dueDate = new Date(issue.due_date);
      const isPastDue = dueDate < now;
      if (isPastDue && !issue.flagged_past_due) {
        issue.flagged_past_due = true;
        changed = true;

        // Push alert to Admins and Managers
        db.profiles.forEach((profile) => {
          if (profile.role === 'Admin' || profile.role === 'Manager') {
            db.notifications.push({
              id: 'not-' + Math.random().toString(36).substr(2, 9),
              title: 'Past Due Compliance Warning',
              message: `Compliance issue "${issue.description}" is open and past its due date (${issue.due_date}). Owner: ${issue.owner_name}`,
              type: 'Warning',
              employee_id: profile.id,
              is_read: false,
              created_at: now.toISOString()
            });
          }
        });
      }
    }
  });

  if (changed) {
    saveDB(db);
  }
}

// Auto Award Badges checking
function checkAndAwardBadges(db: DBState, employeeId: string) {
  if (!db.settings.badge_auto_award_enabled) return;

  const profile = db.profiles.find((p) => p.id === employeeId);
  if (!profile) return;

  // Count completed challenges
  const completedChallengesCount = db.challengeParticipations.filter(
    (cp) => cp.employee_id === employeeId && cp.approval_status === 'Approved'
  ).length;

  const earnedBadges = db.employeeBadges.filter((eb) => eb.employee_id === employeeId).map((eb) => eb.badge_id);

  db.badges.forEach((badge) => {
    if (earnedBadges.includes(badge.id)) return; // already earned

    let qualifies = false;
    if (badge.unlock_rule_type === 'xp_earned' && profile.xp >= badge.unlock_rule_threshold) {
      qualifies = true;
    } else if (badge.unlock_rule_type === 'completed_challenges' && completedChallengesCount >= badge.unlock_rule_threshold) {
      qualifies = true;
    }

    if (qualifies) {
      db.employeeBadges.push({
        id: 'eb-' + Math.random().toString(36).substr(2, 9),
        employee_id: employeeId,
        badge_id: badge.id,
        unlocked_at: new Date().toISOString()
      });

      db.notifications.push({
        id: 'not-' + Math.random().toString(36).substr(2, 9),
        title: 'Badge Unlocked!',
        message: `Congratulations! You unlocked the "${badge.name}" badge for satisfying: ${badge.description}`,
        type: 'Info',
        employee_id: employeeId,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  });
}

// Compute Department scores
function recalculateDepartmentScores(db: DBState) {
  // Let's compute smart scores for each department based on the real metrics:
  // - Environmental: based on carbon footprint (lower is better, or matching goals)
  // - Social: based on average employee participation count and completed challenges
  // - Governance: based on policy acknowledgements percentage and resolved compliance issues

  db.departments.forEach((dept) => {
    const deptEmployees = db.profiles.filter((p) => p.department_id === dept.id);
    const employeeIds = deptEmployees.map((e) => e.id);

    // Environmental Score: Start with 80. Subtract points based on relative footprint share
    const totalCO2 = db.carbonTransactions
      .filter((t) => t.status === 'Approved')
      .reduce((sum, t) => sum + t.calculated_co2, 0);

    // Mock factor for Environmental Score per department
    let envBase = 75;
    if (dept.code === 'ENG') envBase = 92;
    if (dept.code === 'GOV') envBase = 90;
    if (dept.code === 'OPS') envBase = 80;
    if (dept.code === 'MFG') envBase = 65; // Manufacturing emits more

    // Social Score: Based on CSR activity completion and challenge participation
    const csrCount = db.employeeParticipations.filter(
      (ep) => employeeIds.includes(ep.employee_id) && ep.approval_status === 'Approved'
    ).length;

    const chalCount = db.challengeParticipations.filter(
      (cp) => employeeIds.includes(cp.employee_id) && cp.approval_status === 'Approved'
    ).length;

    const socialScore = Math.min(100, 60 + (csrCount * 10) + (chalCount * 15));

    // Governance Score: Based on Policy Acknowledges ratio & compliance issues
    const policiesCount = db.esgPolicies.filter((p) => p.status === 'Published').length;
    let acknowledgementsCount = 0;
    employeeIds.forEach((empId) => {
      acknowledgementsCount += db.policyAcknowledgements.filter((pa) => pa.employee_id === empId).length;
    });

    const expectedAcks = employeeIds.length * policiesCount;
    const ackRatio = expectedAcks > 0 ? (acknowledgementsCount / expectedAcks) : 1;
    const resolvedIssues = db.complianceIssues.filter((ci) => ci.status === 'Resolved' && employeeIds.includes(db.profiles.find(p => p.name === ci.owner_name)?.id || '')).length;
    const openIssues = db.complianceIssues.filter((ci) => ci.status !== 'Resolved' && employeeIds.includes(db.profiles.find(p => p.name === ci.owner_name)?.id || '')).length;

    const govScore = Math.max(0, Math.min(100, Math.round((ackRatio * 85) + (resolvedIssues * 10) - (openIssues * 15))));

    // Calculate Total Score using weights
    const wEnv = db.settings.weight_environmental;
    const wSoc = db.settings.weight_social;
    const wGov = db.settings.weight_governance;
    const totalScore = Math.round((envBase * wEnv + socialScore * wSoc + govScore * wGov) / 100);

    const scoreIdx = db.departmentScores.findIndex((ds) => ds.department_id === dept.id);
    if (scoreIdx >= 0) {
      db.departmentScores[scoreIdx] = {
        id: db.departmentScores[scoreIdx].id,
        department_id: dept.id,
        environmental_score: Math.round(envBase),
        social_score: Math.round(socialScore),
        governance_score: Math.round(govScore),
        total_score: totalScore
      };
    } else {
      db.departmentScores.push({
        id: 'ds-' + Math.random().toString(36).substr(2, 9),
        department_id: dept.id,
        environmental_score: Math.round(envBase),
        social_score: Math.round(socialScore),
        governance_score: Math.round(govScore),
        total_score: totalScore
      });
    }
  });
}

// ---------------- API ENDPOINTS ----------------

function buildEsgAssistantContext(db: DBState) {
  const openIssues = db.complianceIssues.filter((issue) => issue.status !== 'Resolved');
  const activeGoals = db.environmentalGoals.filter((goal) => goal.status === 'Active');
  const activeChallenges = db.challenges.filter((challenge) => challenge.status === 'Active');
  const departmentScores = db.departmentScores.map((score) => {
    const department = db.departments.find((item) => item.id === score.department_id);
    return `${department?.name || score.department_id}: total ${score.total_score}, environmental ${score.environmental_score}, social ${score.social_score}, governance ${score.governance_score}`;
  });

  return [
    `Organization snapshot: ${db.profiles.length} employees across ${db.departments.length} departments.`,
    `Active environmental goals: ${activeGoals.length}; active CSR activities: ${db.csrActivities.filter((activity) => activity.status === 'Active').length}; active challenges: ${activeChallenges.length}.`,
    `Compliance issues: ${openIssues.length} open of ${db.complianceIssues.length} total.`,
    `Department scores: ${departmentScores.join(' | ') || 'No score data available.'}`,
    `Environmental goals: ${activeGoals.map((goal) => `${goal.title} (${goal.progress}% progress, target ${goal.target_value} ${goal.unit})`).join(' | ') || 'None.'}`
  ].join('\n');
}

function getAssistantContext(requestContext: unknown, db: DBState) {
  // The browser supplies only a compact summary of the data it already displays.
  // Fall back to the server ledger for direct API use or older clients.
  if (requestContext && typeof requestContext === 'object') {
    const serialized = JSON.stringify(requestContext);
    if (serialized.length <= 12_000) return serialized;
  }
  return buildEsgAssistantContext(db);
}

function getConversationHistory(history: unknown) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-12)
    .flatMap((message) => {
      if (!message || typeof message !== 'object') return [];
      const { role, content } = message as { role?: unknown; content?: unknown };
      if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string' || !content.trim()) return [];
      return [{
        role: role === 'assistant' ? 'model' : 'user',
        parts: [{ text: content.trim().slice(0, 2_000) }]
      }];
    });
}

app.post('/api/esg-assistant', async (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question) {
    res.status(400).json({ error: 'Please enter a question for the ESG assistant.' });
    return;
  }
  if (question.length > 2_000) {
    res.status(400).json({ error: 'Please limit your question to 2,000 characters.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: 'The ESG assistant is not configured. Add GEMINI_API_KEY to .env and restart the server.' });
    return;
  }
  try {
    const db = loadDB();
    const ai = new GoogleGenAI({ apiKey });
    const stream = await ai.models.generateContentStream({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      config: {
        maxOutputTokens: 600,
        systemInstruction: `You are EcoSphere's ESG assistant. Answer questions about ESG operations, compliance, emissions, employee engagement, and the supplied EcoSphere data. Be concise, practical, and transparent when the data does not support a conclusion. Do not invent figures, legal requirements, company policies, or actions that were not provided. This is guidance, not legal or compliance advice.\n\nCurrent EcoSphere data:\n${getAssistantContext(req.body?.context, db)}`
      },
      contents: [...getConversationHistory(req.body?.history), { role: 'user', parts: [{ text: question }] }]
    });

    res.status(200).set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    for await (const chunk of stream) {
      if (chunk.text) res.write(chunk.text);
    }
    res.end();
  } catch (error) {
    console.error('ESG assistant request failed:', error);
    if (res.headersSent) {
      res.end();
    } else {
      res.status(502).json({ error: 'The ESG assistant could not respond right now. Please try again.' });
    }
  }
});

// DB Raw/General Getter
app.get('/api/db-state', (req, res) => {
  const db = loadDB();
  checkPastDueIssues(db);
  recalculateDepartmentScores(db);
  res.json(db);
});

// Settings CRUD
app.get('/api/settings', (req, res) => {
  const db = loadDB();
  res.json(db.settings);
});

app.post('/api/settings', (req, res) => {
  const db = loadDB();
  db.settings = { ...db.settings, ...req.body };
  recalculateDepartmentScores(db);
  saveDB(db);
  res.json({ success: true, settings: db.settings });
});

// Profiles API (User management & Switcher)
app.get('/api/profiles', (req, res) => {
  const db = loadDB();
  res.json(db.profiles);
});

app.post('/api/profiles', (req, res) => {
  const db = loadDB();
  const newProfile: Profile = {
    id: 'emp-' + Math.random().toString(36).substr(2, 9),
    xp: 0,
    points: 0,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    ...req.body
  };
  db.profiles.push(newProfile);
  saveDB(db);
  res.status(201).json(newProfile);
});

app.put('/api/profiles/:id', (req, res) => {
  const db = loadDB();
  const idx = db.profiles.findIndex((p) => p.id === req.params.id);
  if (idx >= 0) {
    db.profiles[idx] = { ...db.profiles[idx], ...req.body };
    saveDB(db);
    res.json(db.profiles[idx]);
  } else {
    res.status(404).json({ error: 'Profile not found' });
  }
});

app.delete('/api/profiles/:id', (req, res) => {
  const db = loadDB();
  db.profiles = db.profiles.filter((p) => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Departments CRUD
app.get('/api/departments', (req, res) => {
  const db = loadDB();
  res.json(db.departments);
});

app.post('/api/departments', (req, res) => {
  const db = loadDB();
  const newDept: Department = {
    id: 'dept-' + Math.random().toString(36).substr(2, 9),
    parent_id: req.body.parent_id || null,
    employee_count: req.body.employee_count || 0,
    status: req.body.status || 'Active',
    created_at: new Date().toISOString(),
    ...req.body
  };
  db.departments.push(newDept);
  recalculateDepartmentScores(db);
  saveDB(db);
  res.status(201).json(newDept);
});

app.put('/api/departments/:id', (req, res) => {
  const db = loadDB();
  const idx = db.departments.findIndex((d) => d.id === req.params.id);
  if (idx >= 0) {
    db.departments[idx] = { ...db.departments[idx], ...req.body };
    recalculateDepartmentScores(db);
    saveDB(db);
    res.json(db.departments[idx]);
  } else {
    res.status(404).json({ error: 'Department not found' });
  }
});

app.delete('/api/departments/:id', (req, res) => {
  const db = loadDB();
  db.departments = db.departments.filter((d) => d.id !== req.params.id);
  db.departmentScores = db.departmentScores.filter((ds) => ds.department_id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Categories CRUD
app.get('/api/categories', (req, res) => {
  const db = loadDB();
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  const db = loadDB();
  const newCat: Category = {
    id: 'cat-' + Math.random().toString(36).substr(2, 9),
    status: req.body.status || 'Active',
    ...req.body
  };
  db.categories.push(newCat);
  saveDB(db);
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
  const db = loadDB();
  const idx = db.categories.findIndex((c) => c.id === req.params.id);
  if (idx >= 0) {
    db.categories[idx] = { ...db.categories[idx], ...req.body };
    saveDB(db);
    res.json(db.categories[idx]);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  const db = loadDB();
  db.categories = db.categories.filter((c) => c.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Emission Factors CRUD
app.get('/api/emission-factors', (req, res) => {
  const db = loadDB();
  res.json(db.emissionFactors);
});

app.post('/api/emission-factors', (req, res) => {
  const db = loadDB();
  const ef: EmissionFactor = {
    id: 'ef-' + Math.random().toString(36).substr(2, 9),
    status: 'Active',
    ...req.body
  };
  db.emissionFactors.push(ef);
  saveDB(db);
  res.status(201).json(ef);
});

app.put('/api/emission-factors/:id', (req, res) => {
  const db = loadDB();
  const idx = db.emissionFactors.findIndex((e) => e.id === req.params.id);
  if (idx >= 0) {
    db.emissionFactors[idx] = { ...db.emissionFactors[idx], ...req.body };
    saveDB(db);
    res.json(db.emissionFactors[idx]);
  } else {
    res.status(404).json({ error: 'Emission factor not found' });
  }
});

app.delete('/api/emission-factors/:id', (req, res) => {
  const db = loadDB();
  db.emissionFactors = db.emissionFactors.filter((e) => e.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Products ESG CRUD
app.get('/api/products-esg', (req, res) => {
  const db = loadDB();
  res.json(db.productsESG);
});

app.post('/api/products-esg', (req, res) => {
  const db = loadDB();
  const newProd: ProductESGProfile = {
    id: 'prod-' + Math.random().toString(36).substr(2, 9),
    status: 'Active',
    ...req.body
  };
  db.productsESG.push(newProd);
  saveDB(db);
  res.status(201).json(newProd);
});

app.put('/api/products-esg/:id', (req, res) => {
  const db = loadDB();
  const idx = db.productsESG.findIndex((p) => p.id === req.params.id);
  if (idx >= 0) {
    db.productsESG[idx] = { ...db.productsESG[idx], ...req.body };
    saveDB(db);
    res.json(db.productsESG[idx]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products-esg/:id', (req, res) => {
  const db = loadDB();
  db.productsESG = db.productsESG.filter((p) => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Environmental Goals CRUD
app.get('/api/environmental-goals', (req, res) => {
  const db = loadDB();
  res.json(db.environmentalGoals);
});

app.post('/api/environmental-goals', (req, res) => {
  const db = loadDB();
  const goal: EnvironmentalGoal = {
    id: 'goal-' + Math.random().toString(36).substr(2, 9),
    status: 'On Track',
    ...req.body
  };
  db.environmentalGoals.push(goal);
  saveDB(db);
  res.status(201).json(goal);
});

app.put('/api/environmental-goals/:id', (req, res) => {
  const db = loadDB();
  const idx = db.environmentalGoals.findIndex((g) => g.id === req.params.id);
  if (idx >= 0) {
    db.environmentalGoals[idx] = { ...db.environmentalGoals[idx], ...req.body };
    saveDB(db);
    res.json(db.environmentalGoals[idx]);
  } else {
    res.status(404).json({ error: 'Environmental goal not found' });
  }
});

app.delete('/api/environmental-goals/:id', (req, res) => {
  const db = loadDB();
  db.environmentalGoals = db.environmentalGoals.filter((g) => g.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// ESG Policies & Acknowledgements CRUD
app.get('/api/esg-policies', (req, res) => {
  const db = loadDB();
  res.json(db.esgPolicies);
});

app.post('/api/esg-policies', (req, res) => {
  const db = loadDB();
  const policy: ESGPolicy = {
    id: 'pol-' + Math.random().toString(36).substr(2, 9),
    status: 'Published',
    ...req.body
  };
  db.esgPolicies.push(policy);

  // Send a policy reminder notification if configured
  if (db.settings.notification_policy_reminder) {
    db.profiles.forEach((profile) => {
      db.notifications.push({
        id: 'not-' + Math.random().toString(36).substr(2, 9),
        title: 'New ESG Policy Acknowledgment Required',
        message: `A new corporate ESG policy "${policy.name}" version ${policy.version} has been published. Please review and acknowledge.`,
        type: 'Info',
        employee_id: profile.id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    });
  }

  saveDB(db);
  res.status(201).json(policy);
});

app.put('/api/esg-policies/:id', (req, res) => {
  const db = loadDB();
  const idx = db.esgPolicies.findIndex((p) => p.id === req.params.id);
  if (idx >= 0) {
    db.esgPolicies[idx] = { ...db.esgPolicies[idx], ...req.body };
    saveDB(db);
    res.json(db.esgPolicies[idx]);
  } else {
    res.status(404).json({ error: 'Policy not found' });
  }
});

app.delete('/api/esg-policies/:id', (req, res) => {
  const db = loadDB();
  db.esgPolicies = db.esgPolicies.filter((p) => p.id !== req.params.id);
  db.policyAcknowledgements = db.policyAcknowledgements.filter((pa) => pa.policy_id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.post('/api/esg-policies/:id/acknowledge', (req, res) => {
  const db = loadDB();
  const { employee_id, employee_name } = req.body;
  const policyId = req.params.id;

  const policy = db.esgPolicies.find((p) => p.id === policyId);
  if (!policy) {
    return res.status(404).json({ error: 'Policy not found' });
  }

  const existingAck = db.policyAcknowledgements.find(
    (pa) => pa.policy_id === policyId && pa.employee_id === employee_id
  );

  if (existingAck) {
    return res.status(400).json({ error: 'Policy already acknowledged by this employee' });
  }

  const newAck: PolicyAcknowledgement = {
    id: 'ack-' + Math.random().toString(36).substr(2, 9),
    policy_id: policyId,
    employee_id,
    employee_name,
    acknowledged_at: new Date().toISOString()
  };

  db.policyAcknowledgements.push(newAck);

  // Gamification: Acknowledging a policy can reward small XP/Points
  const profile = db.profiles.find((p) => p.id === employee_id);
  if (profile) {
    profile.xp += 20;
    profile.points += 10;
    checkAndAwardBadges(db, employee_id);
  }

  recalculateDepartmentScores(db);
  saveDB(db);
  res.status(201).json(newAck);
});

// Audits CRUD
app.get('/api/audits', (req, res) => {
  const db = loadDB();
  res.json(db.audits);
});

app.post('/api/audits', (req, res) => {
  const db = loadDB();
  const audit: Audit = {
    id: 'aud-' + Math.random().toString(36).substr(2, 9),
    status: 'Scheduled',
    ...req.body
  };
  db.audits.push(audit);
  saveDB(db);
  res.status(201).json(audit);
});

app.put('/api/audits/:id', (req, res) => {
  const db = loadDB();
  const idx = db.audits.findIndex((a) => a.id === req.params.id);
  if (idx >= 0) {
    db.audits[idx] = { ...db.audits[idx], ...req.body };
    saveDB(db);
    res.json(db.audits[idx]);
  } else {
    res.status(404).json({ error: 'Audit not found' });
  }
});

app.delete('/api/audits/:id', (req, res) => {
  const db = loadDB();
  db.audits = db.audits.filter((a) => a.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Compliance Issues CRUD
app.get('/api/compliance-issues', (req, res) => {
  const db = loadDB();
  res.json(db.complianceIssues);
});

app.post('/api/compliance-issues', (req, res) => {
  const db = loadDB();
  const ci: ComplianceIssue = {
    id: 'ci-' + Math.random().toString(36).substr(2, 9),
    status: 'Open',
    ...req.body
  };
  db.complianceIssues.push(ci);

  // Trigger notification if a compliance issue is raised
  if (db.settings.notification_compliance_raised) {
    const ownerProfile = db.profiles.find((p) => p.name === ci.owner_name);
    if (ownerProfile) {
      db.notifications.push({
        id: 'not-' + Math.random().toString(36).substr(2, 9),
        title: 'New Compliance Issue Assigned',
        message: `You have been assigned ownership of compliance issue: "${ci.description}" (Severity: ${ci.severity}) due by ${ci.due_date}.`,
        type: 'Warning',
        employee_id: ownerProfile.id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }

    // Inform admins as well
    db.profiles.forEach((profile) => {
      if (profile.role === 'Admin' && profile.id !== ownerProfile?.id) {
        db.notifications.push({
          id: 'not-' + Math.random().toString(36).substr(2, 9),
          title: 'New Compliance Violation Logged',
          message: `A compliance issue of severity ${ci.severity} was created: "${ci.description}". Assigned to: ${ci.owner_name}`,
          type: 'Alert',
          employee_id: profile.id,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }
    });
  }

  saveDB(db);
  res.status(201).json(ci);
});

app.put('/api/compliance-issues/:id', (req, res) => {
  const db = loadDB();
  const idx = db.complianceIssues.findIndex((c) => c.id === req.params.id);
  if (idx >= 0) {
    const oldStatus = db.complianceIssues[idx].status;
    db.complianceIssues[idx] = { ...db.complianceIssues[idx], ...req.body };

    // If resolved, notify admin
    if (oldStatus !== 'Resolved' && req.body.status === 'Resolved') {
      db.profiles.forEach((p) => {
        if (p.role === 'Admin') {
          db.notifications.push({
            id: 'not-' + Math.random().toString(36).substr(2, 9),
            title: 'Compliance Issue Resolved',
            message: `Compliance issue "${db.complianceIssues[idx].description}" has been marked Resolved by owner: ${db.complianceIssues[idx].owner_name}`,
            type: 'Info',
            employee_id: p.id,
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      });
    }

    recalculateDepartmentScores(db);
    saveDB(db);
    res.json(db.complianceIssues[idx]);
  } else {
    res.status(404).json({ error: 'Compliance issue not found' });
  }
});

app.delete('/api/compliance-issues/:id', (req, res) => {
  const db = loadDB();
  db.complianceIssues = db.complianceIssues.filter((c) => c.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Badges CRUD
app.get('/api/badges', (req, res) => {
  const db = loadDB();
  res.json(db.badges);
});

app.post('/api/badges', (req, res) => {
  const db = loadDB();
  const b: Badge = {
    id: 'bad-' + Math.random().toString(36).substr(2, 9),
    ...req.body
  };
  db.badges.push(b);
  saveDB(db);
  res.status(201).json(b);
});

app.delete('/api/badges/:id', (req, res) => {
  const db = loadDB();
  db.badges = db.badges.filter((b) => b.id !== req.params.id);
  db.employeeBadges = db.employeeBadges.filter((eb) => eb.badge_id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Rewards CRUD
app.get('/api/rewards', (req, res) => {
  const db = loadDB();
  res.json(db.rewards);
});

app.post('/api/rewards', (req, res) => {
  const db = loadDB();
  const reward: Reward = {
    id: 'rew-' + Math.random().toString(36).substr(2, 9),
    status: 'Active',
    ...req.body
  };
  db.rewards.push(reward);
  saveDB(db);
  res.status(201).json(reward);
});

app.put('/api/rewards/:id', (req, res) => {
  const db = loadDB();
  const idx = db.rewards.findIndex((r) => r.id === req.params.id);
  if (idx >= 0) {
    db.rewards[idx] = { ...db.rewards[idx], ...req.body };
    saveDB(db);
    res.json(db.rewards[idx]);
  } else {
    res.status(404).json({ error: 'Reward not found' });
  }
});

app.delete('/api/rewards/:id', (req, res) => {
  const db = loadDB();
  db.rewards = db.rewards.filter((r) => r.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Reward Redemption Action (Business Rule Enforced)
app.post('/api/rewards/:id/redeem', (req, res) => {
  const db = loadDB();
  const rewardId = req.params.id;
  const { employee_id } = req.body;

  const reward = db.rewards.find((r) => r.id === rewardId);
  const employee = db.profiles.find((p) => p.id === employee_id);

  if (!reward) {
    return res.status(404).json({ error: 'Reward not found' });
  }
  if (!employee) {
    return res.status(404).json({ error: 'Employee profile not found' });
  }

  // Stock and Point Checks
  if (reward.stock <= 0) {
    return res.status(400).json({ error: 'Reward item is currently out of stock' });
  }
  if (employee.points < reward.points_required) {
    return res.status(400).json({ error: `Insufficient points balance. You need ${reward.points_required} but have ${employee.points} points.` });
  }

  // Deduct points and stock
  employee.points -= reward.points_required;
  reward.stock -= 1;

  // Add Redemption log
  const redemption: RewardRedemption = {
    id: 'red-' + Math.random().toString(36).substr(2, 9),
    reward_id: rewardId,
    employee_id,
    employee_name: employee.name,
    points_spent: reward.points_required,
    redeemed_at: new Date().toISOString()
  };
  db.rewardRedemptions.push(redemption);

  // Push notification
  db.notifications.push({
    id: 'not-' + Math.random().toString(36).substr(2, 9),
    title: 'Reward Redeemed successfully!',
    message: `You redeemed points for: "${reward.name}". Deducted ${reward.points_required} points. Remaining: ${employee.points} points.`,
    type: 'Info',
    employee_id,
    is_read: false,
    created_at: new Date().toISOString()
  });

  saveDB(db);
  res.status(201).json({ success: true, reward, employee, redemption });
});

// Carbon Transactions CRUD
app.get('/api/carbon-transactions', (req, res) => {
  const db = loadDB();
  res.json(db.carbonTransactions);
});

app.post('/api/carbon-transactions', (req, res) => {
  const db = loadDB();
  const { source, linked_entity, activity_value, unit, emission_factor_id } = req.body;

  let calculated_co2 = req.body.calculated_co2 || 0;

  // Auto Emission Calculation Rule
  if (db.settings.auto_emission_calculation && emission_factor_id) {
    const ef = db.emissionFactors.find((f) => f.id === emission_factor_id);
    if (ef) {
      calculated_co2 = Math.round(activity_value * ef.co2_factor * 100) / 100;
    }
  }

  const transaction: CarbonTransaction = {
    id: 'ct-' + Math.random().toString(36).substr(2, 9),
    transaction_date: req.body.transaction_date || new Date().toISOString().split('T')[0],
    source,
    linked_entity,
    activity_value,
    unit,
    emission_factor_id,
    calculated_co2,
    status: req.body.status || 'Pending'
  };

  db.carbonTransactions.push(transaction);

  // Update environmental goal progress automatically if approved
  if (transaction.status === 'Approved') {
    db.environmentalGoals.forEach((goal) => {
      if (goal.name.toLowerCase().includes('carbon') || goal.target_metric.toLowerCase().includes('carbon')) {
        // Mock progression checking
        goal.current_value = Math.max(0, goal.current_value - calculated_co2);
      }
    });
  }

  recalculateDepartmentScores(db);
  saveDB(db);
  res.status(201).json(transaction);
});

app.put('/api/carbon-transactions/:id', (req, res) => {
  const db = loadDB();
  const idx = db.carbonTransactions.findIndex((t) => t.id === req.params.id);
  if (idx >= 0) {
    let calculated_co2 = req.body.calculated_co2 || db.carbonTransactions[idx].calculated_co2;

    // Recalculate auto carbon if source fields are updated
    if (db.settings.auto_emission_calculation && req.body.emission_factor_id) {
      const ef = db.emissionFactors.find((f) => f.id === req.body.emission_factor_id);
      if (ef) {
        calculated_co2 = Math.round((req.body.activity_value || db.carbonTransactions[idx].activity_value) * ef.co2_factor * 100) / 100;
      }
    }

    db.carbonTransactions[idx] = {
      ...db.carbonTransactions[idx],
      ...req.body,
      calculated_co2
    };

    recalculateDepartmentScores(db);
    saveDB(db);
    res.json(db.carbonTransactions[idx]);
  } else {
    res.status(404).json({ error: 'Carbon transaction not found' });
  }
});

app.delete('/api/carbon-transactions/:id', (req, res) => {
  const db = loadDB();
  db.carbonTransactions = db.carbonTransactions.filter((t) => t.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// CSR Activities CRUD
app.get('/api/csr-activities', (req, res) => {
  const db = loadDB();
  res.json(db.csrActivities);
});

app.post('/api/csr-activities', (req, res) => {
  const db = loadDB();
  const act: CSRActivity = {
    id: 'csr-' + Math.random().toString(36).substr(2, 9),
    status: 'Active',
    ...req.body
  };
  db.csrActivities.push(act);
  saveDB(db);
  res.status(201).json(act);
});

app.put('/api/csr-activities/:id', (req, res) => {
  const db = loadDB();
  const idx = db.csrActivities.findIndex((c) => c.id === req.params.id);
  if (idx >= 0) {
    db.csrActivities[idx] = { ...db.csrActivities[idx], ...req.body };
    saveDB(db);
    res.json(db.csrActivities[idx]);
  } else {
    res.status(404).json({ error: 'CSR Activity not found' });
  }
});

app.delete('/api/csr-activities/:id', (req, res) => {
  const db = loadDB();
  db.csrActivities = db.csrActivities.filter((c) => c.id !== req.params.id);
  db.employeeParticipations = db.employeeParticipations.filter((p) => p.activity_id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// CSR Employee Participations CRUD (Business Rules Enforced)
app.get('/api/employee-participations', (req, res) => {
  const db = loadDB();
  res.json(db.employeeParticipations);
});

app.post('/api/employee-participations', (req, res) => {
  const db = loadDB();
  const { employee_id, employee_name, activity_id, proof } = req.body;

  const activity = db.csrActivities.find((a) => a.id === activity_id);
  if (!activity) {
    return res.status(404).json({ error: 'CSR Activity not found' });
  }

  // Double registration check
  const duplicate = db.employeeParticipations.find(
    (ep) => ep.activity_id === activity_id && ep.employee_id === employee_id
  );
  if (duplicate) {
    return res.status(400).json({ error: 'You are already registered/participating in this CSR Activity.' });
  }

  const participation: EmployeeParticipation = {
    id: 'part-' + Math.random().toString(36).substr(2, 9),
    employee_id,
    employee_name,
    activity_id,
    proof: proof || '',
    approval_status: 'Pending',
    points_earned: 0,
    completion_date: ''
  };

  db.employeeParticipations.push(participation);

  // Notify Managers/Admins
  db.profiles.forEach((profile) => {
    if (profile.role === 'Admin' || profile.role === 'Manager') {
      db.notifications.push({
        id: 'not-' + Math.random().toString(36).substr(2, 9),
        title: 'New CSR Participation Submitted',
        message: `${employee_name} submitted a participation for "${activity.title}". Review and approval required.`,
        type: 'Info',
        employee_id: profile.id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  });

  saveDB(db);
  res.status(201).json(participation);
});

app.put('/api/employee-participations/:id', (req, res) => {
  const db = loadDB();
  const idx = db.employeeParticipations.findIndex((p) => p.id === req.params.id);
  if (idx < 0) {
    return res.status(404).json({ error: 'Participation record not found' });
  }

  const record = db.employeeParticipations[idx];
  const oldStatus = record.approval_status;
  const newStatus = req.body.approval_status || record.approval_status;

  // Evidence Requirement Rule
  if (newStatus === 'Approved' && db.settings.evidence_requirement_enabled) {
    const proofProvided = req.body.proof || record.proof;
    if (!proofProvided || proofProvided.trim().length === 0) {
      return res.status(400).json({
        error: 'Evidence Requirement is enabled in system settings. Participation cannot be approved without verifying a valid attached proof file or description.'
      });
    }
  }

  db.employeeParticipations[idx] = {
    ...record,
    ...req.body
  };

  // If newly approved, distribute points/XP and trigger auto badge checks
  if (oldStatus !== 'Approved' && newStatus === 'Approved') {
    const activity = db.csrActivities.find((a) => a.id === record.activity_id);
    const pointsToAward = activity ? activity.estimated_points : 50;

    db.employeeParticipations[idx].points_earned = pointsToAward;
    db.employeeParticipations[idx].completion_date = new Date().toISOString().split('T')[0];

    // Update profile
    const profile = db.profiles.find((p) => p.id === record.employee_id);
    if (profile) {
      profile.points += pointsToAward;
      profile.xp += pointsToAward; // matching points to XP for simplicity

      // Notify employee
      if (db.settings.notification_csr_challenge_decision) {
        db.notifications.push({
          id: 'not-' + Math.random().toString(36).substr(2, 9),
          title: 'CSR Participation Approved!',
          message: `Your participation in "${activity?.title}" was approved. You earned ${pointsToAward} redeemable points & XP!`,
          type: 'Info',
          employee_id: record.employee_id,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      checkAndAwardBadges(db, record.employee_id);
    }
  }

  // If newly rejected
  if (oldStatus !== 'Rejected' && newStatus === 'Rejected') {
    const activity = db.csrActivities.find((a) => a.id === record.activity_id);
    if (db.settings.notification_csr_challenge_decision) {
      db.notifications.push({
        id: 'not-' + Math.random().toString(36).substr(2, 9),
        title: 'CSR Participation Declined',
        message: `Your participation submission in "${activity?.title}" was marked incomplete/declined. Reason: ${req.body.rejection_reason || 'Insufficient proof.'}`,
        type: 'Warning',
        employee_id: record.employee_id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  }

  recalculateDepartmentScores(db);
  saveDB(db);
  res.json(db.employeeParticipations[idx]);
});

app.delete('/api/employee-participations/:id', (req, res) => {
  const db = loadDB();
  db.employeeParticipations = db.employeeParticipations.filter((p) => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Challenges CRUD
app.get('/api/challenges', (req, res) => {
  const db = loadDB();
  res.json(db.challenges);
});

app.post('/api/challenges', (req, res) => {
  const db = loadDB();
  const chal: Challenge = {
    id: 'chal-' + Math.random().toString(36).substr(2, 9),
    status: 'Draft',
    ...req.body
  };
  db.challenges.push(chal);
  saveDB(db);
  res.status(201).json(chal);
});

app.put('/api/challenges/:id', (req, res) => {
  const db = loadDB();
  const idx = db.challenges.findIndex((c) => c.id === req.params.id);
  if (idx >= 0) {
    db.challenges[idx] = { ...db.challenges[idx], ...req.body };
    saveDB(db);
    res.json(db.challenges[idx]);
  } else {
    res.status(404).json({ error: 'Challenge not found' });
  }
});

app.delete('/api/challenges/:id', (req, res) => {
  const db = loadDB();
  db.challenges = db.challenges.filter((c) => c.id !== req.params.id);
  db.challengeParticipations = db.challengeParticipations.filter((cp) => cp.challenge_id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Challenge Participations CRUD (Gamification Module)
app.get('/api/challenge-participations', (req, res) => {
  const db = loadDB();
  res.json(db.challengeParticipations);
});

app.post('/api/challenge-participations', (req, res) => {
  const db = loadDB();
  const { employee_id, employee_name, challenge_id, progress, proof } = req.body;

  const challenge = db.challenges.find((c) => c.id === challenge_id);
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }

  const existing = db.challengeParticipations.find(
    (cp) => cp.challenge_id === challenge_id && cp.employee_id === employee_id
  );

  if (existing) {
    // Just update progress
    existing.progress = progress !== undefined ? progress : existing.progress;
    existing.proof = proof !== undefined ? proof : existing.proof;
    saveDB(db);
    return res.json(existing);
  }

  const newPart: ChallengeParticipation = {
    id: 'cp-' + Math.random().toString(36).substr(2, 9),
    challenge_id,
    employee_id,
    employee_name,
    progress: progress || 0,
    proof: proof || '',
    approval_status: 'Pending',
    xp_awarded: 0,
    completion_date: ''
  };

  db.challengeParticipations.push(newPart);

  // Notify Managers
  db.profiles.forEach((profile) => {
    if (profile.role === 'Admin' || profile.role === 'Manager') {
      db.notifications.push({
        id: 'not-' + Math.random().toString(36).substr(2, 9),
        title: 'Challenge Progress Submitted',
        message: `${employee_name} submitted progress for "${challenge.title}" (${newPart.progress}% complete).`,
        type: 'Info',
        employee_id: profile.id,
        is_read: false,
        created_at: new Date().toISOString()
      });
    }
  });

  saveDB(db);
  res.status(201).json(newPart);
});

app.put('/api/challenge-participations/:id', (req, res) => {
  const db = loadDB();
  const idx = db.challengeParticipations.findIndex((cp) => cp.id === req.params.id);
  if (idx < 0) {
    return res.status(404).json({ error: 'Challenge participation record not found' });
  }

  const record = db.challengeParticipations[idx];
  const oldStatus = record.approval_status;
  const newStatus = req.body.approval_status || record.approval_status;

  // Evidence Requirement Rule
  const challenge = db.challenges.find((c) => c.id === record.challenge_id);
  if (newStatus === 'Approved' && challenge?.evidence_required && db.settings.evidence_requirement_enabled) {
    const proofProvided = req.body.proof || record.proof;
    if (!proofProvided || proofProvided.trim().length === 0) {
      return res.status(400).json({
        error: 'Evidence Requirement is enabled for this challenge. Completion cannot be marked Approved without verifying valid proof.'
      });
    }
  }

  db.challengeParticipations[idx] = {
    ...record,
    ...req.body
  };

  // Award XP if approved
  if (oldStatus !== 'Approved' && newStatus === 'Approved') {
    const xpToAward = challenge ? challenge.xp : 100;
    db.challengeParticipations[idx].xp_awarded = xpToAward;
    db.challengeParticipations[idx].progress = 100;
    db.challengeParticipations[idx].completion_date = new Date().toISOString().split('T')[0];

    // Update profile
    const profile = db.profiles.find((p) => p.id === record.employee_id);
    if (profile) {
      profile.xp += xpToAward;
      // also award matching redeemable points
      profile.points += Math.round(xpToAward * 0.5);

      if (db.settings.notification_csr_challenge_decision) {
        db.notifications.push({
          id: 'not-' + Math.random().toString(36).substr(2, 9),
          title: 'Challenge Completion Approved!',
          message: `Your completion of "${challenge?.title}" was approved! You earned ${xpToAward} XP and ${Math.round(xpToAward * 0.5)} redeemable points.`,
          type: 'Info',
          employee_id: record.employee_id,
          is_read: false,
          created_at: new Date().toISOString()
        });
      }

      checkAndAwardBadges(db, record.employee_id);
    }
  }

  recalculateDepartmentScores(db);
  saveDB(db);
  res.json(db.challengeParticipations[idx]);
});

app.delete('/api/challenge-participations/:id', (req, res) => {
  const db = loadDB();
  db.challengeParticipations = db.challengeParticipations.filter((cp) => cp.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  const db = loadDB();
  const empId = req.query.employee_id as string;
  let list = db.notifications;
  if (empId) {
    list = list.filter((n) => n.employee_id === empId);
  }
  // Sort reverse chronological
  list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(list);
});

app.post('/api/notifications/:id/read', (req, res) => {
  const db = loadDB();
  const idx = db.notifications.findIndex((n) => n.id === req.params.id);
  if (idx >= 0) {
    db.notifications[idx].is_read = true;
    saveDB(db);
    res.json(db.notifications[idx]);
  } else {
    res.status(404).json({ error: 'Notification not found' });
  }
});

app.post('/api/notifications/read-all', (req, res) => {
  const db = loadDB();
  const empId = req.body.employee_id;
  if (empId) {
    db.notifications.forEach((n) => {
      if (n.employee_id === empId) n.is_read = true;
    });
    saveDB(db);
  }
  res.json({ success: true });
});

// custom CSV / EXCEL export simulation
app.post('/api/export-report', (req, res) => {
  const { title, data } = req.body;
  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Data array is required' });
  }

  // Generate generic CSV layout text
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

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=ecosphere_report.csv`);
  res.send(csvText);
});

// Vite server middleware configuration & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EcoSphere ESG Server] Running on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
