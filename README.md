# EcoSphere: ESG Management Platform

EcoSphere is a comprehensive platform designed to integrate Environmental, Social, and Governance (ESG) metrics directly into day-to-day ERP operations[cite: 3]. By replacing manual, disconnected reporting processes, EcoSphere enables organizations to measure, manage, and improve their sustainability performance through a unified dashboard while driving employee engagement through gamification[cite: 3].

---

## Core Modules

* *Environmental:* Manages carbon accounting, configures emission factors, tracks sustainability goals, and generates carbon reports[cite: 3].
* *Social:* Monitors CSR activities, employee participation, diversity metrics, and training completions[cite: 3].
* *Governance:* Centralizes ESG policies, policy acknowledgements, audits, compliance tracking, and governance reports[cite: 3].
* *Gamification:* Encourages sustainability by offering challenges, awarding XP and badges, maintaining leaderboards, and providing redeemable rewards[cite: 3].

---

## Scoring & Workflow

The platform aggregates data from daily business operations to calculate department-level Environmental, Social, and Governance scores[cite: 3]. These scores combine into an Overall ESG Score[cite: 3]. By default, this score is a weighted average consisting of 40% Environmental, 30% Social, and 30% Governance metrics, which can be configured per organization[cite: 3].

---

## Key Features & Business Rules

* *Automated Carbon Tracking:* When enabled, the platform automatically calculates Carbon Transactions from linked ERP records (such as Purchase, Manufacturing, Expense, and Fleet) using configured Emission Factors[cite: 3].
* *Gamified Reward System:* Employees earn Points and XP by participating in challenges and CSR activities, which can be redeemed for items in the Reward catalog based on stock availability[cite: 3].
* *Automated Badge Distribution:* Badges are automatically awarded to employees the moment their XP or completed-challenge count satisfies a specific unlock rule[cite: 3].
* *Compliance & Audit Management:* Every logged Compliance Issue must have an assigned Owner and a Due Date[cite: 3]. Open issues that pass their due date are flagged by the system[cite: 3].
* *Evidence Validation:* Administrators can enable an Evidence Requirement, which prevents employee CSR Activity participation from being approved without an attached proof file[cite: 3].
* *System Notifications:* The platform triggers in-app and/or email notifications for new compliance issues, CSR/Challenge approval decisions, policy acknowledgement reminders, and badge unlocks[cite: 3].

---

## Data Architecture

The application categorizes data into two main structures:
* *Master Data:* Includes foundational records such as Departments, Categories (e.g., CSR Activity Categories), Emission Factors, Product ESG Profiles, Environmental Goals, ESG Policies, Badges, and Rewards[cite: 3].
* *Transactional Data:* Logs day-to-day records including Carbon Transactions, CSR Activities, Employee Participation, Challenges, Policy Acknowledgements, Audits, Compliance Issues, and Department Scores[cite: 3].

---

## Reporting & Analytics

EcoSphere provides dedicated Environmental, Social, Governance, and overall ESG Summary Reports[cite: 3]. 

* *Custom Report Builder:* Users can build reports by combining specific criteria and exporting them to PDF, Excel, or CSV formats[cite: 3].
* *Supported Filters:* Reports can be refined by Department, Date Range, Module, Employee, Challenge, and ESG Category[cite: 3].
In Google Cloud, add the Supabase callback URL shown by the provider setup. In
Supabase **Authentication → URL Configuration**, add your deployed app URL and
the local development URL (`http://localhost:3000`) to the redirect allow list.
New Google users are created as `Employee` profiles in the first available
department; an administrator can assign their correct role and department
afterward.

## Gemini ESG assistant

`GEMINI_API_KEY` is read only by `server.ts`; it is never included in the
browser bundle. With the server running, the floating **Ask ESG Assistant**
button answers questions using Gemini and a compact, current EcoSphere ESG
snapshot. Optionally set `GEMINI_MODEL` in `.env` to use a different Gemini
model; the default is `gemini-3.5-flash`.
