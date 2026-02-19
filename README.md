# Investment Deal Summary Builder

Frontend-only web application for creating structured investment deal summaries and exporting an investor-ready PDF memo.

## Overview
This project simulates how investment teams prepare deal summaries for internal stakeholders, partners, and potential investors.

The app provides:
- Structured data capture across deal sections
- Real-time validation and calculations
- Dynamic list management (founders, allocations, milestones)
- PDF preview and downloadable PDF generation from the same render source

## Tech Stack
- React 18 + TypeScript
- Vite 5
- Tailwind CSS
- shadcn/ui primitives (Dialog, etc.)
- jsPDF + jspdf-autotable (PDF document generation)
- Vitest (basic test setup)

## Product Approach

### 1. Single source of truth for deal data
All form data is modeled in `DealData` and managed in page state:
- `src/types/deal.ts`
- `src/pages/Index.tsx`

### 2. Component-driven section architecture
Each assignment section is isolated into a component:
- `DealInformation`
- `FoundersSection`
- `FinancialHighlights`
- `InvestmentStructure`
- `RiskAssessment`
- `MilestonesSection`
- `NotesSection`

This keeps logic and UI modular while preserving a unified validation/export flow.

### 3. Validation + export gating
Validation is computed centrally and PDF export is disabled until required conditions are satisfied:
- Required core deal fields
- Positive numeric checks for financial and investment fields
- Fund allocation total must be exactly `100%`
- Risk fields must be selected
- Founder `name` and `role` required
- Milestone title required

### 4. Real-time calculations
- Runway: `availableCash / monthlyBurnRate`
- Risk score: `(marketRisk + productRisk + teamRisk) / 3`
- Allocation total and status feedback

### 5. PDF strategy (preview = download)
The app uses one shared PDF builder:
- `buildInvestmentPDF(data)` creates the document object
- Preview modal renders this same PDF blob in an iframe
- Download uses the same builder via `generatePDF(data)`

This ensures preview and downloaded output stay aligned.

## Implemented Assignment Features
- Deal info capture (company, industry, stage, ask, valuation)
- Dynamic founders (add/remove)
- Financial highlights + runway calculation
- Investment structure + allocation visualization + 100% validation
- Risk assessment scoring and classification
- Dynamic milestones + timeline rendering
- Notes section
- Investor-style downloadable PDF memo

## PDF Design Notes
The PDF includes:
- Deal snapshot
- Analytics snapshot (runway, risk posture, allocation readiness, founder profile count)
- Founder profiles with multiline/background handling
- Financial table
- Investment structure + allocation bars
- Risk table + risk band visualization
- Milestone timeline (chronologically sorted where timeline is parseable)
- Notes with wrapped long-form content

Long text in founder background and notes is wrapped with page-safe rendering and spacing-aware section flow.

## Run Locally
```bash
npm install
npm run dev
