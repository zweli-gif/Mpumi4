# Growth Farm - Detailed Implementation Plan

## Overview
This document outlines the complete implementation plan for the Growth Farm Operating System, organized by feature area with detailed interaction specifications.

---

## Phase 1: Foundation & Branding

### 1.1 Logo Replacement
**Priority:** Immediate
**Effort:** 30 minutes

| Task | Details |
|------|---------|
| Replace logo | Use new GFlogov1.jpg (balloon logo with "GROWTH FARM" text) |
| Update header | Replace text "GROWTH FARM" with logo image |
| Update favicon | Generate favicon from logo |
| Locations | Header, login page, any branding elements |

---

## Phase 2: Settings Page Enhancements

### 2.1 Team Management (Editable)
**Priority:** High
**Effort:** 2-3 hours

| Interaction | Details |
|-------------|---------|
| View Members | List all team members with avatar, name, email, job title, role |
| Edit Member | Click edit icon → Modal with fields: Name, Email, Job Title, Role (dropdown) |
| Delete Member | Click delete icon → Confirmation dialog → Remove from database |
| Invite Member | Click "Invite" → Modal: Name, Email, Job Title, Role → Creates pending invite |
| Job Title Badge | Brown badge showing job title (e.g., "CEO", "CFO", "Design Lead") |

**Database Changes:**
- `jobTitle` field already added to users table ✓

### 2.2 Company Info (Editable)
**Priority:** High
**Effort:** 1-2 hours

| Field | Interaction |
|-------|-------------|
| Company Name | Inline edit with save button |
| Tagline | Inline edit with save button |
| Mission Statement | Textarea with save button |
| Business Units | Add/Edit/Delete departments |

**Database Changes:**
- Create `companySettings` table: `id`, `name`, `tagline`, `mission`, `updatedAt`

### 2.3 Annual Goals (New Section)
**Priority:** High
**Effort:** 3-4 hours

| Interaction | Details |
|-------------|---------|
| View Goals | Table grouped by Strategic Objective |
| Add Goal | Click "+" → Modal: Goal Name, Annual Target, Unit (%, $, #), EXCO Owner |
| Edit Goal | Click edit → Same modal pre-filled |
| Delete Goal | Click delete → Confirmation |

**Database Schema:**
```sql
annualGoals: id, strategicObjectiveId, name, targetValue, unit, excoOwner, year, createdAt
```

---

## Phase 3: Monthly KPI Targets

### 3.1 Monthly Targets Page
**Priority:** High
**Effort:** 4-5 hours

**Layout:**
- Tabs for each Strategic Objective (Community Growth, Impact Delivery, etc.)
- Within each tab: Table of KPIs

**Table Structure:**
| KPI Name | Annual Target | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|----------|---------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| Revenue  | R24M          | [2M]| [2M]| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

**Interactions:**

| Element | Behavior |
|---------|----------|
| Monthly Target (Grey) | Pre-filled, editable grey tab. Click to edit, shows save icon |
| Actual Value | Editable input box with small save icon (💾) next to it |
| Performance Indicator | After 5th of month, previous month locks. Shows: 🟢 (≥75%), 🟡 (60-74%), 🔴 (<60%) |
| Lock Mechanism | After 5th, previous month's actual becomes read-only with colored dot |

**Auto-Generation Logic:**
- When annual goal is set, divide by 12 for even distribution
- Allow manual adjustment of monthly targets
- Sum of monthly targets should equal annual target (validation)

**Database Schema:**
```sql
monthlyTargets: id, annualGoalId, month (1-12), year, targetValue, actualValue, isLocked, lockedAt, performanceStatus
```

---

## Phase 4: Weekly Activity Tracker

### 4.1 Weekly Page - Excel-like Table
**Priority:** High
**Effort:** 4-5 hours

**Table Columns:**
| # | Column | Type | Details |
|---|--------|------|---------|
| 1 | Activity | Text Input | Free text description |
| 2 | Due Day | Date Picker | Select day of week or specific date |
| 3 | Dependency | Text Input | What this depends on |
| 4 | Accountability Partner | Dropdown | Select from team members |
| 5 | Relevant Monthly Goal | Dropdown | Select from monthly goals OR "None" |
| 6 | Status | Dropdown | Done ✓, Delayed ⏰, Deprioritised ✗ |

**Interactions:**
| Action | Behavior |
|--------|----------|
| Add Row | Click "+" at bottom → New empty row |
| Edit Cell | Click cell → Inline edit |
| Delete Row | Hover → Show delete icon → Click → Remove |
| Save | Auto-save on blur OR explicit save button |
| Filter | Filter by status, accountability partner, goal |

**Database Schema:**
```sql
weeklyActivities: id, userId, weekNumber, year, activity, dueDate, dependency, accountabilityPartnerId, monthlyGoalId, status, createdAt, updatedAt
```

---

## Phase 5: Engine (Operations Hub)

### 5.1 Engine Modal Structure
**Priority:** High
**Effort:** 8-10 hours

**Layout:** Bottom sheet modal with 6 navigation tiles (2x3 grid)

| Tile | Icon | Destination |
|------|------|-------------|
| BD Pipeline | 📈 | Kanban board for deals |
| Ventures | 🚀 | Venture tracking table |
| Studio | 🎨 | Project tracking |
| Delivery | 👥 | Client delivery tracking |
| Finance | 💰 | Financial overview |
| Admin | ⚙️ | Administrative functions |

### 5.2 BD Pipeline (Kanban)
**Stages:** Lead → Discovery → Proposal → Negotiation → Contracting → Won/Lost

**Card Content:**
| Field | Details |
|-------|---------|
| Client Name | Company name |
| Deal Value | R amount |
| Contact Person | Primary contact |
| Next Action | What needs to happen |
| Days in Stage | Auto-calculated |
| Owner | Team member responsible |

### 5.3 Ventures Tracking
**Per-Project Row:**
| Column | Details |
|--------|---------|
| Venture Name | e.g., "Mntase Communities" |
| Current Stage | Ideation → Validation → MVP → Growth → Scale |
| Burn Rate | R/month actual vs target |
| Days to First Revenue | Countdown or "Achieved" |
| Runway | Months remaining |
| Key Metrics | Custom per venture |

### 5.4 Studio Tracking
**Per-Project Row:**
| Column | Details |
|--------|---------|
| Project Name | e.g., "FNB Mobile App Redesign" |
| Client | Client name |
| Billing vs Target | R billed / R target (%) |
| Timeline Status | On Track 🟢, At Risk 🟡, Delayed 🔴 |
| Planned End Date | Date |
| Actual Progress | % complete |

### 5.5 KPI Flow to Dashboard
**Important:** KPIs from Engine sections should:
1. Update the "Actual" values in Monthly Targets
2. Roll up to YTD figures in Dashboard
3. Trigger performance indicators (green/amber/red)

---

## Phase 6: Dashboard Redesign

### 6.1 Layout Requirements
**Priority:** High
**Effort:** 5-6 hours

**Constraints:**
- Must fit on laptop screen without scrolling
- Mobile should be optimized separately
- Order follows Strategic Objectives from Settings

### 6.2 Dashboard Sections (Top to Bottom)

#### Row 1: Key Metrics Summary
| Metric | Display |
|--------|---------|
| Team Health | Circular progress + % |
| Revenue YTD | Bar: 0 ←→ R24M, current position marked, "should be" line |
| Cash Reserves | Bar: 0 ←→ R1M (Dec target), current position |
| Tax Liability | Bar: Total liability → 0 target |

#### Row 2: BD Pipeline (Full Width)
| Stage | Lead | Discovery | Proposal | Negotiation | Contracting | Won | Lost |
|-------|------|-----------|----------|-------------|-------------|-----|------|
| Count | 2 | 1 | 2 | 1 | 0 | 1 | 0 |
| Value | R500K | R400K | R1.47M | R400K | R0 | R1.2M | R0 |

Show all stages in one row with counts and values.

#### Row 3: Operations Cards
| Card | Content |
|------|---------|
| Ventures | Count, Burn rate summary, Days to revenue |
| Studio | Active projects, Billing %, Timeline status |
| Clients | Cards for each relationship type (even if 0), showing count + value at stake |
| Finance | Pending items count |

#### Row 4: Alerts & Actions
Keep the current alerts section - user loves it!
- "X client(s) at risk" → View button
- "X pending finance item(s)" → View button

### 6.3 Client Relationship Types
Show cards for ALL types even if count is 0:
| Type | Example |
|------|---------|
| Strategic Partner | Gates Foundation |
| Active Client | Vodacom |
| At Risk | (flagged clients) |
| Prospect | (potential clients) |

Each card shows: Count + Total Value at Stake

---

## Phase 7: Data Integration

### 7.1 KPI Cascade
```
Annual Goal (Settings)
    ↓
Monthly Targets (Monthly Page)
    ↓
Engine Actuals (BD, Ventures, Studio, etc.)
    ↓
Dashboard YTD Summary
```

### 7.2 Automatic Updates
| Source | Updates |
|--------|---------|
| BD Pipeline "Won" | Revenue Actual |
| Studio Billing | Revenue Actual |
| Venture Burn | Cash Reserves |
| Invoice Payments | Cash Reserves |

---

## Implementation Order

### Sprint 1 (Week 1): Foundation
1. ✅ Replace logo with new branding
2. ✅ Fix Team Management (edit, delete, invite, job titles)
3. ✅ Make Company Info editable
4. ✅ Add Annual Goals section to Settings

### Sprint 2 (Week 2): Monthly & Weekly
5. Build Monthly KPI Targets page
6. Implement auto-generation of monthly targets
7. Add performance indicators (green/amber/red)
8. Build Weekly Activity tracker (Excel-like table)

### Sprint 3 (Week 3): Engine
9. Create Engine modal with 6 tiles
10. Build BD Pipeline Kanban
11. Build Ventures tracking table
12. Build Studio tracking table
13. Build Delivery tracking
14. Build Finance overview

### Sprint 4 (Week 4): Dashboard & Integration
15. Redesign Dashboard layout
16. Add finance bars (Revenue, Cash, Tax)
17. Expand BD Pipeline to full row
18. Add Client relationship cards
19. Connect Engine KPIs to Monthly Actuals
20. Connect Monthly to Dashboard YTD

---

## Database Schema Summary

### New Tables Needed:
1. `companySettings` - Company info storage
2. `monthlyTargets` - Monthly KPI targets and actuals
3. `weeklyActivities` - Weekly task tracking
4. `ventures` - Venture project tracking
5. `studioProjects` - Studio project tracking
6. `clients` - Client relationship management
7. `clientRelationshipTypes` - Relationship type definitions

### Existing Tables to Modify:
1. `users` - Add `jobTitle` ✓
2. `annualGoals` - Already exists, may need updates
3. `pipelineCards` - Already exists for BD Pipeline

---

## Success Metrics

| Feature | Success Criteria |
|---------|------------------|
| Settings | All sections editable, data persists |
| Monthly | Auto-generates targets, locks after 5th, shows performance |
| Weekly | Excel-like UX, all dropdowns work, status tracking |
| Engine | All 6 areas accessible, Kanbans functional |
| Dashboard | Fits laptop screen, all metrics visible, alerts work |

---

*Document Version: 1.0*
*Last Updated: February 1, 2026*
