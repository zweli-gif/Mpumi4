# Growth Farm App Design Specification

## Source: Growth_Farm_App_Screens.pdf (45 pages)

## Design System (Pages 6-8)
- **Primary Brown**: #5D4037 (dark brown)
- **Accent Pink**: #D4A5A5 (soft pink)
- **Base Cream**: #F5F5F0 (off-white/cream)
- **Status Colors**: Green (success), Yellow (warning), Red (error), Blue (info)
- **Typography**: Playfair Display Semibold (headings), Inter Regular (body)
- **Font Sizes**: 700 weight for headings

## UI Components (Page 8)
- Strategic Objective selector with 4 icons: Design, Brain, Team, Settings
- Strategic Goal Selector dropdown: "Revenue Milestone 2024"
- Kanban Card Template with status badge, description, avatars, date
- Family Mood Board Avatars (circular with names)
- Accountability Nudge component (pink alert with "NUDGE" button)

## Account & Goals Setup (Page 10)
- Team section with "Add Member" button
- Team members: Zweli (Managing Director), Naledi (Operations Manager)
- Annual Goals 2026:
  - Target Revenue (FY): R 24,000,000
  - Target Cash Reserves: R 6,000,000
- Monthly Goals (January):
  - Revenue Target: R 2,000,000
  - Tax Provision Rate: 27%
  - Operational Expense Budget: R 850,000

## Strategy & Goal Configuration (Page 11)
- Annual Business Goals with auto-distribute toggle
- Areas: Business Dev (R12M), Ventures (R6M), Studio (R4M), Retained Clients (R2M)
- Monthly Targets Override with "Set Seasonality" option
- Finance & Admin Config: Tax Provision 27%, Admin Reserve 10%
- Monthly Opex Ceiling: R 850,000

## Executive Dashboard (Pages 13-14)
- Header: Growth Farm logo, notification bell, profile avatar
- Family Mood Board: Row of circular avatars with names (Sarah, Mike, Alex, Jordan, Casey)
- Company Health Score: Large donut chart showing 84 WEIGHTED
  - BD (25%), Ventures (15%), Ops (40%), Other (20%)
- Financial Progress:
  - YTD Revenue: $1.2M (Target: $1.5M) with progress bar
  - Cash Reserves: $450K
- Quick Alerts section (red background):
  - Admin: 2 Contractor Agreements Overdue [Action]
  - Finance: 1 Pending Invoice Approval [Review]
- BD Pipeline section with kanban stages
- Venture Status / Client Health tables

## Operations Menu (Page 15)
- Bottom sheet modal titled "Growth Operations"
- Subtitle: "Executive Dashboard Navigation"
- 6 navigation cards in 3x2 grid:
  1. BD PIPELINE (chart icon, brown background - active)
  2. VENTURES (rocket icon)
  3. STUDIO (palette icon)
  4. DELIVERY (team icon)
  5. FINANCE (wallet icon)
  6. ADMIN (settings icon)
- "CLOSE MENU" button at bottom

## Bottom Navigation Bar
- Icons: Dashboard, Ops, Weekly, Monthly, Setup, Team

## Key UI Patterns
- Dark brown header with cream/white content areas
- Cards with subtle shadows and rounded corners
- Pink accent for primary actions
- Red for alerts and urgent items
- Donut charts for health scores
- Progress bars for financial metrics
- Avatar rows for team mood boards


## Weekly Planner (Page 21)
- Title: "Weekly Alignment Planner"
- Date range: "Jan 12 — Jan 18"
- Sections by department: BD, Ventures, Studio, Admin
- Each section has:
  - Activity Description (text input)
  - Monthly Goal (Required) dropdown
  - "+ ADD MORE [DEPT] ACTIVITY" button
- Bottom: "SAVE PLAN" button with navigation tabs

## Add Weekly Activity Modal (Page 22)
- Fields:
  - ACTIVITY DESCRIPTION* (textarea)
  - FOCUS AREA* (dropdown)
  - MONTHLY GOAL ALIGNMENT (dropdown)
  - DUE DAY (M T W T F S S buttons)
  - OWNER (avatar + name dropdown)
  - STATUS (Planned dropdown)
- Save button (brown/pink)

## BD Pipeline - Kanban (Pages 24-25)
- Header: GROWTH FARM + Jan 2026 badge
- Tabs: BD | Ventures | Studio | Clients | Finance
- Kanban columns: Lead, Discovery, Proposal, Negotiation, Closed
- Cards show:
  - Company name (Acme Corp)
  - Value (R100K in pink)
  - Owner avatar + name
  - Days ago
- Bottom bar: TOTAL WEIGHTED PIPELINE R2.1M
- Bottom nav: Dashboard | Pipelines | Weekly | Setup

## Ventures Pipeline - Kanban (Pages 27-28)
- Tabs: IDEA DUMP | CONCEPT | DISCOVERY | MVP BUILD
- Cards show:
  - Priority badge (HIGH PRIORITY, NORMAL, DUE)
  - Venture name (Briansfomo, GreenLink, Mntase, BioPulse)
  - Description
  - Days in stage
  - "DETAILS >" link

## Studio Pipeline - Kanban (Page 30)
- Tabs: Studio | Sales | Delivery | Analytics
- Columns: SCOPING | CONTRACTED
- Cards show:
  - Project name (Website Redesign, SEO Strategy)
  - Client name (Artemis Group, Horizon Tech)
  - Hours progress (HOURS: 12/40, 30%)
  - Margin percentage (42% Margin in green)

## Finance Pipeline - Entry View (Page 35)
- Tabs: Overview | Finance | Operations
- Current Performance section with progress bar
- Finance Data Entry form:
  - YTD Revenue
  - Cash Reserves
  - Tax Debt Outstanding
  - Monthly Paid (Payroll/Direct)
- "Update Financial Position" button

## Admin Compliance Pipeline (Pages 37-38)
- Stats: COMPLIANT 85% +2% | PENDING 15% -2%
- Compliance Checklist with items:
  - Contractor Agreements (red dot, Renew button)
  - VAT Returns Q3 (green dot, View button)
  - Client MSAs (yellow dot, Finalize button)
  - Insurance Certificates (green dot, Review button)
  - Board Resolutions (red dot, Upload button)
- Buttons: "Remind Team" | "+ Add Item"

## Team & Family (Pages 39-40)
- Daily Check-in section with mood buttons: Inspired, Busy, Reflective, Growing
- Executive Council section with profile cards
- Our Family list with team members and roles

## Family Conversations & Nudges (Page 41)
- Accountability Nudges row with avatars
- Family Conversations list with messages
- Bottom nav: INBOX | PLANNER | FAMILY

## Accountability Partner - Send Nudge (Page 43)
- Modal with partner avatar
- Message Script textarea
- "Send Nudge" button

## Celebration Notification (Page 44)
- Popup: "Celebration! Sarah Chen has just completed her weekly activity: 'Sunrise Yoga Flow'"
- Buttons: "Send High-Five" | "View Details"
