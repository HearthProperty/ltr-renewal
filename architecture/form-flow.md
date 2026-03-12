# Form Flow SOP — Renewal Uplift Planner

## Overview
Multi-step form that collects 12 inputs across 4 logical steps. The form is designed for minimum friction and maximum conversion.

## Form Steps

### Step 1: Contact Info
- Owner Name (text, required)
- Email (email, required)
- Phone (tel, required)

### Step 2: Property & Rent
- Property Address (text, required)
- Current Monthly Rent (number, required)
- Lease End Date (date, required)

### Step 3: Tenant & History
- Tenant Tenure (select: < 1 year, 1-2 years, 2-3 years, 3+ years)
- Last Rent Increase (select: < 6 months, 6-12 months, 12-18 months, 18+ months, never)
- Recent Late Payments (radio: yes/no)
- Recent Maintenance Issues (radio: yes/no)

### Step 4: Situation
- Management Situation (radio: Self-managed, Have a PM)
- Target Outcome (radio: Renew, Unsure, Replace)

## Validation Rules
- All fields required
- Email must be valid format
- Phone must be 7+ characters
- Rent must be positive number
- Lease end date must be valid date

## Submission Flow
1. Client validates all fields via Zod
2. Client POSTs to `/api/submit`
3. Server validates → scores → generates all outputs → creates Close lead → sends Discord alert
4. Server responds with full result payload
5. Client redirects to results page with base64-encoded data in query param

## UX Notes
- Progress indicator (Step 1 of 4)
- Back button on all steps except first
- Submit button only on final step
- Loading state during submission
- Error display for validation failures
