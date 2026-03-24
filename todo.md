# Growth Farm Operating System - TODO

## Phase 1: Database Schema & Foundation
- [x] Design complete database schema for all features
- [x] Create tables for team health tracking
- [x] Create tables for weekly priorities
- [x] Create tables for celebrations feed
- [x] Create tables for six pipeline categories (BD, Ventures, Studio, Clients, Finance, Admin)
- [x] Create tables for annual goals and monthly cascade
- [x] Create tables for trend analysis and performance snapshots
- [x] Create tables for activity logging
- [x] Push database schema with `pnpm db:push`

## Phase 2: Core Backend Infrastructure
- [x] Implement user authentication queries
- [x] Create tRPC procedures for team health management
- [x] Create tRPC procedures for weekly priorities
- [x] Create tRPC procedures for celebrations
- [x] Create tRPC procedures for pipeline management (all 6 categories)
- [x] Create tRPC procedures for annual goals and monthly cascade
- [x] Create tRPC procedures for trend analysis
- [x] Create tRPC procedures for activity logging
- [x] Implement role-based access control (admin/user)

## Phase 3: Team Health Homepage
- [x] Design and implement homepage layout
- [x] Build team health pulse component with overall score
- [x] Build individual health score cards with emoji indicators
- [x] Implement energy level tracking (High/Med/Low)
- [x] Create quick check-in functionality
- [x] Build weekly priorities section (max 5 per person)
- [x] Implement priority management (add, edit, complete)
- [x] Build celebrations feed component
- [x] Implement add celebration functionality
- [x] Create quick snapshot metrics component

## Phase 4: Optimized Dashboard
- [x] Design compact single-screen layout
- [x] Build company health score display (compact version)
- [x] Create inline BD pipeline summary
- [ ] Build ventures overview component
- [ ] Create client health buckets display
- [ ] Build condensed finance metrics bars
- [ ] Create admin alerts summary
- [ ] Optimize spacing and eliminate whitespace
- [ ] Ensure fits on 1920x1080 screen without scrolling

## Phase 5: Strategic Monthly KPI Cascade
- [ ] Design monthly cascade algorithm with seasonality
- [ ] Build cascade configuration interface
- [ ] Implement custom weight assignment
- [ ] Create rationale documentation fields
- [ ] Build distribution strategy selector (Linear, Custom, Historical, Milestone)
- [ ] Implement monthly target calculation
- [ ] Create progress tracking against monthly targets
- [ ] Build month-over-month comparison views

## Phase 6: Trend Analysis
- [ ] Design trend analysis layout
- [ ] Build time period selector
- [ ] Create metric selector
- [ ] Implement trend visualization charts
- [ ] Build automated insights generation
- [ ] Create "What's Working" section
- [ ] Create "Challenges" section
- [ ] Create "Recommendations" section
- [ ] Build comparative analysis tables
- [ ] Implement drill-down functionality
- [ ] Add export functionality for reports

## Phase 7: Interactive Kanban Boards
- [ ] Install and configure @dnd-kit/core for drag-and-drop
- [ ] Build Kanban board layout component
- [ ] Create BD pipeline Kanban with stages
- [ ] Create Ventures pipeline Kanban
- [ ] Create Studio pipeline Kanban
- [ ] Create Clients pipeline Kanban
- [ ] Create Finance pipeline Kanban
- [ ] Create Admin pipeline Kanban
- [ ] Implement drag-and-drop functionality
- [ ] Add visual feedback during drag
- [ ] Implement automatic stage update on drop
- [ ] Add card detail modals
- [ ] Implement add card functionality for each pipeline

## Phase 8: Monthly Targets View
- [ ] Design monthly targets page layout
- [ ] Build current month overview
- [ ] Display monthly KPI targets from cascade
- [ ] Implement progress tracking visualization
- [ ] Create month-over-month comparison charts
- [ ] Build target vs actual displays
- [ ] Add navigation between months

## Phase 9: Tabular Settings Interface
- [ ] Design settings page with tabs
- [ ] Build annual goals table with sortable columns
- [ ] Implement inline editing for goals
- [ ] Add bulk operations (select multiple, edit, delete)
- [ ] Implement CSV import functionality
- [ ] Implement CSV export functionality
- [ ] Build monthly cascade configuration table
- [ ] Create team management table
- [ ] Add filtering and search functionality
- [ ] Implement system configuration settings

## Phase 10: Real-time Activity Logging
- [ ] Design activity logging schema
- [ ] Implement activity capture for pipeline movements
- [ ] Implement activity capture for priority updates
- [ ] Implement activity capture for health check-ins
- [ ] Build activity feed component
- [ ] Add WebSocket support for real-time updates
- [ ] Implement optimistic UI updates
- [ ] Add activity filtering and search

## Phase 11: Mobile PWA Optimization
- [ ] Design mobile-first responsive layouts
- [ ] Implement bottom tab navigation for mobile
- [ ] Create swipeable card components
- [ ] Build collapsible sections for mobile
- [ ] Optimize touch targets (min 44x44px)
- [ ] Configure PWA manifest for iPhone installation
- [ ] Add custom app icon
- [ ] Create splash screen
- [ ] Implement service worker for offline capability
- [ ] Add IndexedDB for local storage
- [ ] Test on iPhone devices
- [ ] Optimize performance for mobile networks

## Phase 12: Testing & Deployment
- [ ] Write vitest tests for critical tRPC procedures
- [ ] Test authentication flow
- [ ] Test all CRUD operations
- [ ] Test drag-and-drop functionality
- [ ] Test mobile responsiveness on multiple devices
- [ ] Test PWA installation on iPhone
- [ ] Test offline functionality
- [ ] Performance optimization
- [ ] Create deployment checkpoint
- [ ] Document any known issues or future enhancements


## Farmstead Homepage Enhancements (New Requirements)
- [x] Fix nested anchor tag error
- [x] Add top 3 priorities to each member card with strategic objective icons
- [x] Check-in button only on logged-in user's card
- [x] Remove Med/High/Low badges, keep percentage only
- [x] Add low wellbeing notification (<60% triggers CEO meeting message)
- [x] Update celebrations section with description text
- [x] Remove separate "This Week's Priorities" section (priorities now on cards)
- [x] Create icons for 5 strategic objectives (Community Growth, Impact Delivery, New Frontiers, Stewardship, Purpose & Platform)
- [x] Weekly goals dropdown to select strategic objective
- [ ] Icon appears next to activity once saved


## Farmstead Homepage Refinements (User Feedback Round 2)
- [x] Replace emojis with one-word wellbeing descriptors (Thriving, Steady, Struggling)
- [x] Remove "Add Priority" button (priorities come from week sheet)
- [x] Add strategic objective icons at end of each activity/priority name
- [x] Update celebrations to show poster's name
- [x] Add celebrator emoji reactions to celebrations


## Homepage Changes (User Feedback Round 3)
- [x] Remove Quick Snapshot section
- [x] Add "Top of Mind from CEO this Week" section (replaces snapshot)
- [x] CEO can post weekly reflection (max 10 lines, editable)
- [x] Save button disappears after saving reflection


## UI Refinements (User Feedback Round 4)
- [x] Reduce "Add Celebration" button size, change text to "Add Yours"
- [x] Add Monthly button to bottom navigation bar
- [x] Add Weekly button to bottom navigation bar
- [x] Build Settings page with real data entry forms
- [x] Settings: Team members management
- [x] Settings: Strategic objectives configuration
- [x] Settings: Company info and branding


## Settings Page Fixes (User Feedback Round 5)
- [x] Fix bottom navigation: Home, Dashboard, Engine, Monthly, Weekly, Settings (6 buttons)
- [x] Strategic objectives: Add edit modal with Excel-like goal table
- [x] Goal table columns: Goal Name, Annual Target (unit e.g. %, $), EXCO Owner
- [x] Goal table: 3 empty rows + "Add More" button same width as table
- [x] Add "Add Strategic Objective" button aligned to heading
- [x] Make Business Units/Departments editable
- [x] Add ability to add new departments


## Bug Fix (User Feedback)
- [x] Fix nested anchor tag error on Dashboard page


## Settings Team Management (User Feedback)
- [ ] Fix invite team member functionality (make it actually work)
- [ ] Add edit capability for team members (name, email, role, job title)
- [ ] Add delete capability for team members
- [ ] Populate job titles for existing team members
- [ ] Add job title field to users table


## Sprint 1 & 2 - Today (Feb 1, 2026)

### Sprint 1: Foundation
- [x] Fix TypeScript errors (ceoReflections, Engine.tsx)
- [x] Replace logo with new GFlogov1.jpg branding
- [x] Team Management: Add extended profile fields (birthplace, life purpose, personal goal, skill mastering)
- [x] Team Management: Edit/delete/invite functionality working
- [x] Company Info: Editable with database persistence
- [x] Annual Goals: New section in Settings with CRUD

### Sprint 2: Monthly & Weekly
- [ ] Monthly KPI Targets page with tabs by strategic objective
- [ ] Auto-generate monthly targets from annual goals
- [ ] Performance indicators (green/amber/red) after 5th of month
- [ ] Lock previous month after 5th
- [ ] Weekly Activity tracker: Excel-like table
- [ ] Weekly columns: Activity, Due Day, Dependency (multi-select), Accountability Partner, Monthly Goal, Status


## Sprint 3 - Engine Pages (Feb 2)
- [x] Engine modal with 6 tiles (BD Pipeline, Ventures, Studio, Delivery, Finance, Admin)
- [x] BD Pipeline Kanban (Lead → Qualified → Proposal → Negotiation → Closed Won/Lost)
- [x] Ventures Kanban (Ideation → Validation → MVP → Scale → Exit)
- [x] Studio: Project cards with billing vs target, timeline status
- [x] Delivery: Active projects table with progress, milestones, deadlines
- [x] Finance: Revenue bars, cash flow, invoices, expenses
- [x] Admin: Team overview, compliance, documents, key dates


## Dashboard Redesign (Feb 2)
- [x] Compact single-screen layout (no scrolling on laptop)
- [x] BD Pipeline details in one row with all stages
- [x] Finance bars: YTD Revenue (0→R24M), Cash Reserves (0→R1M), Tax Liability
- [x] Client relationship cards (show all types even if count is 0)
- [x] Ventures metrics: burn rate, days to revenue, current stage
- [x] Studio: billing vs target, timeline status
- [x] Keep Alerts section


## Monthly & Weekly Pages (Feb 2)
### Monthly Page
- [x] Break down annual goals into 12 monthly targets automatically
- [x] Group KPIs by strategic objective (tabs)
- [x] Grey background for target values (read-only)
- [x] Editable actual value boxes with small save icon
- [x] Performance dots: green (≥75%), amber (60-74%), red (<60%)
- [x] Lock previous month after 5th of current month
- [x] Show YTD progress for each KPI

### Weekly Page
- [x] Excel-like activity tracker table
- [x] Columns: Activity Name, Due Day, Dependency, Accountability Partner
- [x] Monthly Goal dropdown (link to monthly KPIs)
- [x] Status dropdown: Done, Delayed, Deprioritised
- [x] Add new activity row functionality
- [x] Edit and delete activities
- [x] Filter by week
- [x] Connect completed activities to monthly actuals


## Bug Fix (Feb 2)
- [x] Fix SelectItem empty value error on Weekly page


## Weekly Tracker Redesign (Feb 2)
- [x] Table-based input with 5 rows by default
- [x] Add Row button to add more input rows
- [x] Columns: Activity, Due, Accountability Partner, Dependency, Impacted Monthly Goal, Status
- [x] Smaller status dropdown
- [x] Archive view for completed activities
- [ ] ROADMAP: Pop-up for result capture when activity marked done


## Settings Annual Goals Redesign (Feb 2)
- [x] Rename "Strategic Objectives" tab to "Annual Goals"
- [x] Create Excel-like KPI tracker table view
- [x] Add weightings column (all objectives total 100%)
- [x] 5 KPIs per strategic objective with fake data
- [x] All fields editable inline
- [x] Progress circle at end of each row showing monthly completion
- [x] Compact layout fitting on one page with minimal scrolling


## Engine Tiles Redesign (Feb 2)
- [x] BD → Community Engagement (add roadmap: partnerships management, marketing, reach & relevance)
- [x] Studio + Delivery → Impact Delivery with hierarchy: Client → Projects → Team Members
- [x] Impact Delivery: billing plan (6 months), cost plan, margin tracking (red if <20%)
- [x] Impact Delivery: project timeline performance status (overperforming, on track, issues)
- [x] Ventures → New Frontiers with dual bars: stage gates with car icon + burn rate bar
- [x] Finance → Stewardship (keep current structure)
- [x] Admin → Purpose & Platform with subcards: Admin (complete), HR, IT, Legal (coming soon)


## Weekly Page Compact Redesign (Feb 2)
- [x] Make table much more compact - activity column takes most width
- [x] Add priority radio buttons (max 3 selections per person)
- [x] Selected priorities propagate to EXCO member cards on Home page
- [x] Show priorities on Home page member tiles (replaces "No priorities set")


## Weekly Page Dual-Mode UX (Feb 2)
- [x] Create View mode: clean to-do list on lined paper aesthetic
- [x] Add pencil icon at top right of view mode to switch to edit
- [x] Create Data Entry mode: table with Save button at top
- [x] Save button saves changes and switches back to view mode
- [x] Pencil icon pre-fills entry table with current activities
- [x] Maintain priority star functionality in both modes


## Weekly View Mode Redesign (Feb 2)
- [x] Clean white paper background (remove lined paper effect)
- [x] Much more compact layout for up to 15 activities
- [x] Group activities by strategic objective (from linked monthly goal)
- [x] Subsection headers for each strategic objective
- [x] Minimal elegant styling


## Bug Fix: Weekly Goal Dropdown (Feb 2)
- [x] Fix Goal dropdown to pull from Annual Goals in Settings (populated database with goal names)
- [x] Ensure activities can be linked to goals
- [x] Verify grouping by strategic objective works correctly


## MVP Launch Sprint (Feb 2) - COMPLETED

### Annual Goals Redesign
- [x] Remove months from view, show Strategic Objective boxes
- [x] Display weighting next to strategic objective title
- [x] KPIs listed under each objective with progress wheels
- [x] Wheel shows full target in center, fills based on YTD actual
- [x] Color changes based on meeting YTD target (green/amber/red)
- [x] Units in brackets next to KPI name (%, ZAR, qty)
- [x] Editable KPI names and targets

### Monthly Page Redesign
- [x] Use same template as Annual Goals
- [x] Monthly targets inside grey wheels (auto-split from annual)
- [x] Editable monthly actuals that update wheels
- [x] YTD wheel at end using same color rules

### App Branding & Launch
- [x] Rename app to "Mpumi"
- [x] Update all branding references
- [x] Create shareable link (via Publish button in UI)
- [x] Email invitation system for team members (notification to owner)
- [x] Colleagues receive email with login link (via owner notification)
- [x] Full user access upon email invite acceptance


## Bug Fix: Missing Bottom Navigation (Feb 2)
- [x] Bottom nav bar not showing on published site (laptop) - removed md:hidden class
- [x] Ensure navigation is visible on all screen sizes
- [x] Added padding-bottom to main content to prevent overlap


## Final Launch Branding (Feb 2)
- [x] Mpumi name only on login screen and mobile app icon
- [x] Growth Farm name everywhere else in the app
- [x] Replace logo with text "Growth Farm" with pink "F"
- [x] Update PWA manifest for mobile shortcut to show "Mpumi"


## Final MVP Navigation Fixes (Feb 2)
- [x] Navigation bar visible on ALL pages (not just homepage)
- [x] Move nav items to header row (same row as Growth Farm logo)
- [x] Active nav item turns pink (both icon and text)
- [x] Create shared AppHeader component for consistency


## Team Invitation & Onboarding System (Feb 2)
- [x] Invitation dialog with shareable link (share manually via WhatsApp/email)
- [x] New users see onboarding page on first login
- [x] Onboarding asks: birthplace, life purpose, personal goal, skill mastering
- [x] After onboarding completion, user can access full site
- [x] Role-based access: Members can view everything but cannot edit Settings
- [x] Only Admins can edit team members, annual goals, and company info


## Bug Fixes (Feb 2)
- [x] Onboarding: "Let's Go" button now redirects to home properly (using window.location.href)
- [x] Onboarding: Removed "Skip for now" button, only "Let's Go" remains
- [x] Home: Removed duplicate Brian Dube record from database

## Bug Fixes (Feb 2 - Part 2)
- [x] Remove duplicate Tumi record (same person as Boitumelo Mokgotho)
- [x] Add email lookup on OAuth login to link invited users to their real account
- [x] Add updateUserOpenId function to update invited user's openId when they log in

## Collaborative Task Assignment Feature (Feb 2)
- [x] Add "Role" column to activity entry (Partner or Helper option)
- [x] Update database schema with partnerRole field
- [x] When assigned as Partner: Show "Encourage [Creator] to [activity]" in assignee's Weekly
- [x] When assigned as Helper: Show "Call [Creator] to find out help needed with [activity]" in assignee's Weekly
- [x] Assigned tasks appear in indigo highlight color (distinguish from self-created)
- [x] Assigned users can view all activity details but cannot edit (read-only)
- [x] Only original creator can edit the activity

## User Profile Indicator (Feb 2)
- [x] Add user name and avatar/initials to header
- [x] Show who is currently logged in
- [x] Add dropdown menu with profile settings and logout options

## Duplicate Users Bug Fix (Feb 2 - Part 3)
- [x] Remove duplicate Brian and Albert records from database
- [x] Restrict OAuth login to only allow emails that exist in the users table (invited team members)
- [x] Prevent new user creation during OAuth - only link to existing invited users
- [x] Show friendly "Access Denied" page for unauthorized emails

## Strategic Objectives Editing (Feb 2)
- [x] Allow editing strategic objective name
- [x] Allow editing strategic objective weighting
- [x] Allow adding new strategic objectives
- [x] Allow deleting strategic objectives
- [x] Ensure weightings total 100% (indicator shows warning if not)

## Mobile Quick-Add Activity Button (Feb 2)
- [x] Add floating action button at bottom-right corner (mobile only)
- [x] Button shows "shesha" text in pink (matching Growth Farm "F" color)
- [x] Clicking opens quick-add dialog
- [x] Dialog fields: Activity Name, Due Day, Partner Type (dropdown: Partner or Helper)
- [x] Quick-add creates activity in user's weekly planner
- [x] If partner assigned, activity also appears in partner's weekly planner
- [x] Remaining details (dependency, monthly goal, status) can be filled later via full edit

## Monthly Tab Redesign (Feb 2)
- [x] Create low-fidelity mockup of proposed layout
- [x] Implement spreadsheet-style layout grouped by strategic objective
- [x] Use same section background colors from Annual Goals
- [x] Show year (2026) in top-left corner instead of page title
- [x] Each KPI row: KPI name | Owner | Status indicator | 12 monthly circles | YTD circle
- [x] Monthly circles: Small wheels (32px) with target inside + filled progress
- [x] YTD circle: Larger (44px) than monthly circles
- [x] Status indicators: OK (green), Check (amber), Save (red)
- [x] Status calculation: Green if activity linked in past 2 weeks, Amber if in past 4 weeks, Red if 4+ weeks
- [x] Optimize spacing to fit all content on single laptop screen
- [x] Backend: Calculate KPI status based on weekly activity linkage

## Monthly Tab Fixes & Export (Feb 2 - Part 2)
- [x] Fix target values not fitting inside progress circles (format large numbers as M/K)
- [x] Add units of measure column next to each KPI in pink color
- [x] Format money units with short forms (ZAR for rands, # for counts, % for percentages)
- [x] Add Excel export button to download Monthly view as CSV spreadsheet

## Monthly Inline Editing (Feb 2 - Part 3)
- [x] Add click handler to monthly progress circles
- [x] Limit editing to current month (Feb) and previous month (Jan) only
- [x] Show popup dialog with white number input field
- [x] Pre-fill unit of measure from KPI's pink unit column
- [x] Add Save button to submit changes
- [x] Update backend to save actual values to monthlyTargets table
- [x] Refresh progress circles after save

## Data Cleanup (Feb 2)
- [x] Remove all dummy celebration data from home page
- [x] Remove test activities (generic proposals, reviews, presentations)
- [x] Clear any other placeholder/test data

## Bug Fixes (Feb 26 - Production Deployment)
- [x] Fix incorrect post attribution in celebrations (now shows real user names)
- [x] Implement CEO Remarks feature ("Top of Mind from CEO this Week")
- [x] Add TypeScript type safety (CelebrationWithUser type)
- [x] Run database migration for ceoReflections table
- [x] All tests passing (21/21)
