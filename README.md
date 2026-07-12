# EcoSphere – ESG Management Platform

EcoSphere is a full-stack ESG (Environmental, Social, and Governance) management platform that helps organizations measure sustainability performance, track compliance, encourage employee participation, and generate audit-ready reports. The platform combines analytics, gamification, AI assistance, and centralized ESG management into a single platform.

---

# Features

## 1. Central Dashboard & KPI Analytics

A unified dashboard providing a real-time overview of organizational ESG performance.

### Features

- Overall ESG Scorecard with customizable weightages
- Total carbon footprint tracking
- Policy acknowledgement statistics
- Employee participation metrics
- Active compliance alerts
- Department-wise performance comparison
- Monthly carbon emission trends
- Quick actions for:
  - Reporting compliance issues
  - Approving sustainability challenges
  - Viewing leaderboards
  - Acknowledging policies

---

## 2. Environmental Module

Manage environmental sustainability and carbon accounting.

### Features

- Carbon Accounting Ledger
  - Purchase emissions
  - Manufacturing emissions
  - Fleet emissions
  - Expense-based emissions

- Dynamic Emission Factors
  - kWh
  - Liters
  - USD
  - Custom conversion factors

- Product ESG Profiles
  - SKU tracking
  - Material sourcing
  - Recyclability
  - Product carbon footprint

- Environmental Goal Tracker
  - Goal creation
  - Milestone tracking
  - Target metrics
  - Progress status
    - On Track
    - At Risk
    - Achieved

---

## 3. Social Module

Monitor employee welfare and corporate social responsibility initiatives.

### Features

- CSR Activity Management
- Volunteer Registration
- Manager Approval Workflow
- Evidence Verification
- Employee Participation Tracking
- Social Performance Analytics
- Workforce Statistics
- Training Completion Charts

---

## 4. Governance Module

Manage compliance, audits, and organizational policies.

### Features

- Policy Management
- Policy Version Control
- Effective Date Tracking
- Employee Policy Acknowledgements
- Internal & External Audit Logs
- Compliance Issue Tracker
- Severity Levels
  - Low
  - Medium
  - High
  - Critical
- Automatic overdue alerts

---

## 5. Gamification & Employee Engagement

Increase employee participation through rewards and challenges.

### Features

- Sustainability Challenges
- XP Reward System
- Dynamic Leaderboard
- Achievement Badges
- Automatic Badge Unlocking
- Reward Redemption Store
- Stock Verification for Rewards

---

## 6. Report Builder & Data Export

Generate audit-ready ESG reports.

### Features

- Environmental Reports
- Social Reports
- Governance Reports
- Overall ESG Reports
- Department Filters
- Date Range Filters
- Category Filters
- Employee Filters
- CSV Export
- Excel Export
- Formula Injection Protection

---

## 7. Gemini ESG Assistant

AI-powered assistant for ESG guidance.

### Features

- Context-aware conversations
- Current ESG metrics awareness
- Carbon footprint insights
- Goal recommendations
- Compliance guidance
- Persistent chat history
- Backend API security

---

# Technology Stack

| Technology | Purpose |
|------------|---------|
| React 19 | Frontend UI |
| Vite | Build Tool |
| TypeScript | Type Safety |
| Tailwind CSS v4 | Styling |
| Lucide React | Icons |
| Recharts | Charts & Analytics |
| Framer Motion | Animations |
| Express.js | Backend Server |
| Supabase | PostgreSQL Database & Authentication |
| Google Gemini API | AI Assistant |

---

# Database Architecture

## Master Data

- Profiles
- Departments
- Categories
- Emission Factors
- ESG Product Catalog
- Badges
- Rewards

## Transactional Data

- Carbon Transactions
- CSR Activities
- Employee Participations
- Sustainability Challenges
- Challenge Participations
- Policy Acknowledgements
- Audits
- Compliance Issues
- Department Scores
- Notifications

---

# ESG Scoring Algorithm

The default ESG score is calculated as:

```text
Overall Score =
(40% × Environmental Score)
+ (30% × Social Score)
+ (30% × Governance Score)
```

### Environmental Score

Calculated using:

- Carbon emissions
- Target milestones
- Department performance

### Social Score

Based on CSR participation and challenge completion.

```text
Social Score =
min(
100,
60 + (CSR Approvals × 10)
+ (Challenge Approvals × 15)
)
```

### Governance Score

Based on policy acknowledgements and compliance performance.

```text
Governance Score =
max(
0,
min(
100,
((Acknowledgements / Expected) × 85)
+ (Resolved × 10)
- (Open × 15)
)
)
```

---

# Security Features

- Server-side Gemini API protection
- Role-Based Access Control (RBAC)
- Backend API validation
- Input sanitization
- Spreadsheet formula injection protection
- Secure authentication using Supabase

---

# Business Rules

## Evidence Validation

Managers cannot approve CSR activities requiring evidence unless verification documents are submitted.

## Compliance Alerts

Automatic notifications are generated whenever compliance issues remain unresolved beyond their due date.

## Badge Automation

Badges are awarded automatically when employees satisfy predefined XP or challenge completion requirements.

---

# Getting Started

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Supabase project
- A Gemini API key

---

## Environment Variables

Create a `.env` file in the project root and add the following:

```env
# Gemini Configuration (Server-side)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholder values with your own credentials.

Do **not** commit your actual `.env` file to GitHub.

### Optional: `.env.example`

Create a `.env.example` file and commit it to GitHub:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Add the following entries to your `.gitignore` file:

```gitignore
.env
.env.local
.env.*
```

---

## Installation

Install all dependencies.

```bash
npm install
```

Start the development server.

```bash
npm run dev
```

The application will be available at:

```
http://localhost:3000
```

---

## Production Build

Build the application.

```bash
npm run build
```

Run the production server.

```bash
npm run start
```

---

## Clean Project Cache

```bash
npm run clean
```

---

# Security Best Practices

- Never commit your `.env` file.
- Keep the Gemini API key on the server only.
- Use Supabase Row Level Security (RLS) where applicable.
- Restrict sensitive operations using Role-Based Access Control.
- Validate and sanitize all user inputs.
- Escape spreadsheet formulas when exporting CSV or Excel files.

---

# License

This project was developed as an ESG Management Platform to help organizations monitor environmental impact, improve social responsibility, strengthen governance practices, and encourage employee participation through a centralized digital solution.
