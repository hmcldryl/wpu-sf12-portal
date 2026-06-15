# Claude Code Prompt — WPU SF-12 Portal
### Western Philippines University Faculty and Staff Conference

---

You are helping me build a web app called the **WPU SF-12 Portal** for the Western Philippines University (WPU) Faculty and Staff Conference. Respondents visit the app, input their personal details, answer the SF-12 questionnaire, and immediately receive a scored health assessment.

The reference implementation to match: https://orthotoolkit.com/sf-12/
This uses **SF-12 Version 1.0** (non-proprietary, 1994 US population norms).

---

## Citations and Attribution

The following sources govern the instrument, scoring algorithm, and implementation used in this project. These must be cited in the app's footer, results page disclaimer, and `README.md`.

### Primary Instrument Citation
> Ware, J. E., Kosinski, M., & Keller, S. D. (1996). A 12-Item Short-Form Health Survey: Construction of scales and preliminary tests of reliability and validity. *Medical Care, 34*(3), 220–233. https://doi.org/10.1097/00005650-199603000-00003

This is the original publication defining the SF-12 v1.0 questions, scoring algorithm, lookup coefficients, and population norms (mean = 50, SD = 10) used in this app.

### Cross-validation Citation
> Gandek, B., Ware, J. E., Aaronson, N. K., Apolone, G., Bjorner, J. B., Brazier, J. E., Bullinger, M., Kaasa, S., Leplege, A., Prieto, L., & Sullivan, M. (1998). Cross-validation of item selection and scoring for the SF-12 Health Survey in nine countries: Results from the IQOLA Project. *Journal of Clinical Epidemiology, 51*(11), 1171–1178. https://doi.org/10.1016/S0895-4356(98)00109-7

Validates the SF-12 scoring approach across populations, supporting its use in non-US institutional settings such as WPU.

### Reference Implementation
> OrthoToolKit. (n.d.). *Free online SF-12 score calculator*. Retrieved from https://orthotoolkit.com/sf-12/

The scoring constants (PCS constant = 56.57706, MCS constant = 60.75781) and lookup table values in this project match those used by OrthoToolKit, which implements SF-12 v1.0.

### Version Note
This project uses **SF-12 Version 1.0**, which is non-proprietary and freely available for research and institutional use. SF-12 Version 2 is proprietary (owned by Optum/QualityMetric) and requires a commercial license — it is **not** used here.

---

## Tech Stack

- **Frontend/Backend:** Next.js 14+ (App Router, TypeScript)
- **Database:** Firebase Firestore
- **Data Export:** Google Apps Script Web App → Google Sheets
- **Styling:** Tailwind CSS

---

## SF-12 SCORING ALGORITHM (implement exactly)

### Overview

The SF-12 produces two summary scores:

- **PCS-12** — Physical Component Summary
- **MCS-12** — Mental Component Summary

Both are norm-based: US population mean = 50, SD = 10.
Scores above 50 = above-average health; below 50 = below-average health.

### Step 1 — Validate

All 12 questions must be answered. If any is missing, scores cannot be computed.

### Step 2 — Convert each response to Physical and Mental Standardized Values

Use the lookup table below. Values are from the original SF-12 v1.0 publication (Ware, Kosinski, & Keller, 1996) and verified against the OrthoToolKit reference implementation:

```typescript
// lib/sf12Scoring.ts
// SF-12 v1.0 Standardized Score Lookup Table
// Source: Ware, J.E., Kosinski, M., & Keller, S.D. (1996).
//   A 12-Item Short-Form Health Survey. Medical Care, 34(3), 220–233.
//   https://doi.org/10.1097/00005650-199603000-00003
// Verified against: https://orthotoolkit.com/sf-12/
// Format: [physicalValue, mentalValue]

const SF12_LOOKUP: Record<string, Record<number, [number, number]>> = {
  // Q1: General Health (1=Excellent, 2=Very Good, 3=Good, 4=Fair, 5=Poor)
  Q1: {
    1: [0,         0        ],
    2: [-1.31872,  -0.06064 ],
    3: [-3.02396,   0.03482 ],
    4: [-5.56461,  -0.16891 ],
    5: [-8.37399,  -1.71175 ],
  },
  // Q2: Moderate Activities (1=Limited a lot, 2=Limited a little, 3=Not limited)
  Q2: {
    1: [-7.23216,  3.93115],
    2: [-3.45555,  1.86840],
    3: [0,         0      ],
  },
  // Q3: Climbing Stairs (1=Limited a lot, 2=Limited a little, 3=Not limited)
  Q3: {
    1: [-6.24397,  2.68282],
    2: [-2.73557,  1.43103],
    3: [0,         0      ],
  },
  // Q4: Accomplished less due to physical health (1=Yes, 2=No)
  Q4: {
    1: [-4.61617,  1.44060],
    2: [0,         0      ],
  },
  // Q5: Limited in kind of work due to physical health (1=Yes, 2=No)
  Q5: {
    1: [-5.51747,  1.66968],
    2: [0,         0      ],
  },
  // Q6: Accomplished less due to emotional problems (1=Yes, 2=No)
  Q6: {
    1: [3.04365,  -6.82672],
    2: [0,         0      ],
  },
  // Q7: Didn't do work as carefully due to emotional problems (1=Yes, 2=No)
  Q7: {
    1: [2.32091,  -5.69921],
    2: [0,         0      ],
  },
  // Q8: Pain interfered with work (1=Not at all … 5=Extremely)
  Q8: {
    1: [0,         0        ],
    2: [-1.22480,  -0.13697 ],
    3: [-2.37408,  -0.55033 ],
    4: [-3.80130,  -0.79952 ],
    5: [-6.50522,  -3.01750 ],
  },
  // Q9: Felt calm and peaceful (1=All of the time … 5=None of the time)
  Q9: {
    1: [4.61446,  -16.15384],
    2: [3.41593,  -10.77911],
    3: [2.34247,   -8.09914],
    4: [1.28044,   -4.59055],
    5: [0,          0      ],
  },
  // Q10: Had a lot of energy (1=All of the time … 5=None of the time)
  Q10: {
    1: [-6.29724,  3.93610],
    2: [-4.88962,  2.32031],
    3: [-3.29805,  1.56766],
    4: [-1.65178,  0.63738],
    5: [0,         0      ],
  },
  // Q11: Felt downhearted and blue (1=All of the time … 5=None of the time)
  Q11: {
    1: [1.22268,  -18.19420],
    2: [0.91578,  -12.15879],
    3: [0.56495,   -9.47281],
    4: [0.29241,   -4.61217],
    5: [0,          0      ],
  },
  // Q12: Social activities interfered (1=All of the time … 5=None of the time)
  Q12: {
    1: [-6.19825,   2.32585],
    2: [-3.62993,   0.73479],
    3: [-2.26540,  -0.27545],
    4: [-0.73654,  -0.13193],
    5: [0,          0      ],
  },
};

const PCS_CONSTANT = 56.57706;
const MCS_CONSTANT = 60.75781;

export function computeSF12Scores(responses: Record<string, number>) {
  let pcsSum = 0;
  let mcsSum = 0;

  for (const [q, response] of Object.entries(responses)) {
    const [pVal, mVal] = SF12_LOOKUP[q][response];
    pcsSum += pVal;
    mcsSum += mVal;
  }

  return {
    pcs12: parseFloat((pcsSum + PCS_CONSTANT).toFixed(2)),
    mcs12: parseFloat((mcsSum + MCS_CONSTANT).toFixed(2)),
  };
}
```

### Step 3 — Validation Test

Write a self-test inside `sf12Scoring.ts` that verifies correctness on load (development only).
When all 12 responses = 1, all lookup values are 0, so:
- Expected PCS = 56.57706
- Expected MCS = 60.75781

### Score Interpretation Bands

| PCS or MCS Value | Label          | Color  |
|-----------------|----------------|--------|
| ≥ 55            | Above Average  | Green  |
| 45–54.9         | Average        | Amber  |
| < 45            | Below Average  | Red    |

Population reference: mean = 50, SD = 10.

---

## SF-12 Questions (exact wording to display)

### Q1 — General Health
> "In general, would you say your health is:"

1. Excellent
2. Very Good
3. Good
4. Fair
5. Poor

---

### Q2 — Moderate Activities
> "Does your health now **limit you** in moderate activities, such as moving a table, pushing a vacuum cleaner, bowling, or playing golf?"

1. Yes, limited a lot
2. Yes, limited a little
3. No, not limited at all

---

### Q3 — Climbing Stairs
> "Does your health now **limit you** in climbing *several* flights of stairs?"

1. Yes, limited a lot
2. Yes, limited a little
3. No, not limited at all

---

### Q4 & Q5 — Role-Physical (display together, Yes/No each)

**Preamble:** *"During the past 4 weeks, have you had any of the following problems with your work or other regular daily activities **as a result of your physical health**?"*

- **Q4:** Accomplished **less** than you would like? → Yes (1) / No (2)
- **Q5:** Were limited in the **kind** of work or other activities? → Yes (1) / No (2)

---

### Q6 & Q7 — Role-Emotional (display together, Yes/No each)

**Preamble:** *"During the past 4 weeks, have you had any of the following problems with your work or other regular daily activities **as a result of any emotional problems** (such as feeling depressed or anxious)?"*

- **Q6:** Accomplished **less** than you would like? → Yes (1) / No (2)
- **Q7:** Didn't do work or other activities as **carefully** as usual? → Yes (1) / No (2)

---

### Q8 — Bodily Pain
> "During the past 4 weeks, how much did **pain** interfere with your normal work (including both work outside the home and housework)?"

1. Not at all
2. A little bit
3. Moderately
4. Quite a bit
5. Extremely

---

### Q9 — Mental Health (Calm)
> "How much of the time during the past 4 weeks have you felt **calm and peaceful**?"

1. All of the time
2. Most of the time
3. Some of the time
4. A little of the time
5. None of the time

---

### Q10 — Vitality (Energy)
> "How much of the time during the past 4 weeks did you have a **lot of energy**?"

1. All of the time
2. Most of the time
3. Some of the time
4. A little of the time
5. None of the time

---

### Q11 — Mental Health (Downhearted)
> "How much of the time during the past 4 weeks have you felt **downhearted and blue**?"

1. All of the time
2. Most of the time
3. Some of the time
4. A little of the time
5. None of the time

---

### Q12 — Social Functioning
> "During the past 4 weeks, how much of the time has your **physical health or emotional problems interfered** with your social activities (like visiting with friends, relatives, etc.)?"

1. All of the time
2. Most of the time
3. Some of the time
4. A little of the time
5. None of the time

---

## Project Structure

```
wpu-sf12-portal/
├── app/
│   ├── page.tsx                        # Landing / intro page
│   ├── assessment/
│   │   └── page.tsx                    # Multi-step SF-12 form
│   ├── results/
│   │   └── page.tsx                    # PCS / MCS results display
│   ├── dashboard/
│   │   ├── page.tsx                    # Dashboard (password-gated)
│   │   └── login/
│   │       └── page.tsx                # Simple dashboard login page
│   └── api/
│       ├── submit/
│       │   └── route.ts                # Saves to Firestore + POSTs to GAS
│       ├── dashboard/
│       │   └── responses/
│       │       └── route.ts            # Fetches all responses from Firestore
│       └── export/
│           ├── csv/
│           │   └── route.ts            # Streams CSV download
│           └── pdf/
│               └── route.ts            # Generates PDF summary report
├── components/
│   ├── AssessmentForm.tsx              # Step navigator + state management
│   ├── QuestionCard.tsx                # Single question renderer
│   ├── ScoreGauge.tsx                  # Animated SVG arc gauge for PCS / MCS
│   ├── ProgressBar.tsx                 # Visual step progress indicator
│   └── dashboard/
│       ├── StatCard.tsx                # Single KPI card (total, avg PCS, avg MCS)
│       ├── ScoreDistributionChart.tsx  # Bar chart — score band breakdown
│       ├── DepartmentBreakdown.tsx     # Avg PCS/MCS grouped by department
│       ├── ResponsesTable.tsx          # Searchable, filterable respondent table
│       └── ExportButtons.tsx           # CSV and PDF export triggers
├── lib/
│   ├── firebase.ts                     # Firebase client config
│   ├── firebaseAdmin.ts                # Firebase Admin SDK (server-side)
│   ├── sf12Scoring.ts                  # Lookup table + computeSF12Scores()
│   ├── dashboardUtils.ts               # Aggregate/stats helper functions
│   └── types.ts                        # TypeScript interfaces
├── gas/
│   └── Code.gs                         # Google Apps Script — Sheets logger
├── .env.local.example
└── README.md
```

---

## Feature Specifications

### Landing Page (`/`)

- WPU branding: deep navy `#1a3a5c` and gold `#c8a951`
- Project name: **WPU SF-12 Portal**
- University name: **Western Philippines University**
- Brief description: health survey, ~2 minutes, 12 questions
- "Start Assessment" CTA button
- Footer with attribution: *"Based on the SF-12v1 Health Survey (Ware, Kosinski & Keller, 1996). This tool is for wellness awareness only and does not constitute a clinical diagnosis."*

---

### Respondent Details Form (Step 0, before Q1)

Collect these fields before the SF-12 questions begin:

| Field | Type | Required |
|---|---|---|
| Full Name | Text | Yes |
| Employee ID | Text | No |
| Department / College | Text | Yes |
| Employment Type | Select: Faculty / Staff | Yes |
| Age | Number | Yes |
| Sex | Select: Male / Female / Prefer not to say | Yes |

---

### Assessment Form (`/assessment`)

- Multi-step layout: one screen per question (Q4+Q5 grouped, Q6+Q7 grouped)
- Step indicator: "Question 3 of 12" + progress bar at top
- Back / Next navigation buttons
- All answers stored in React state; nothing submitted until the final question
- Validate each step before allowing Next
- Smooth transition animation between steps

**Step grouping:**

| Screen | Content |
|---|---|
| 0 | Respondent details |
| 1 | Q1 General Health |
| 2 | Q2 Moderate Activities |
| 3 | Q3 Climbing Stairs |
| 4 | Q4 + Q5 Role-Physical (with shared preamble) |
| 5 | Q6 + Q7 Role-Emotional (with shared preamble) |
| 6 | Q8 Bodily Pain |
| 7 | Q9 Calm and Peaceful |
| 8 | Q10 Lot of Energy |
| 9 | Q11 Downhearted and Blue |
| 10 | Q12 Social Functioning |
| 11 | Review + Submit |

---

### Results Page (`/results`)

Display after successful submission:

- Respondent name and department
- **PCS-12 Score** with SVG arc gauge and color-coded band
- **MCS-12 Score** with SVG arc gauge and color-coded band
- For each score, display:
  - Numeric value (e.g., `56.58`)
  - Difference from US average 50 (e.g., `+6.58 above average`)
  - Interpretation label (Above Average / Average / Below Average)
- Plain-language summary:
  - PCS: describes physical health (activities, pain, energy)
  - MCS: describes mental/emotional health (mood, calm, social)
- Health recommendations section based on score bands
- "Print / Save Results" button (`window.print()`)
- "Submit Another Response" link back to `/`
- Citation footer on results page: *"SF-12v1 Health Survey © Ware, Kosinski & Keller (1996). Scores are norm-based relative to the US general population (mean = 50, SD = 10)."*

**ScoreGauge component spec:**
- SVG arc from 0 to 100
- Needle or filled arc up to the score
- Color zones: red (0–44), amber (45–54), green (55–100)
- Animate on mount
- No external charting libraries — pure SVG + CSS

---

## Data Storage

### Firestore Collection: `sf12_responses`

```json
{
  "timestamp": "2025-07-15T08:30:00.000Z",
  "name": "Juan dela Cruz",
  "employeeId": "WPU-001",
  "department": "College of Engineering",
  "employmentType": "Faculty",
  "age": 38,
  "sex": "Male",
  "rawResponses": {
    "Q1": 2, "Q2": 3, "Q3": 3,
    "Q4": 2, "Q5": 2, "Q6": 2, "Q7": 2,
    "Q8": 1, "Q9": 2, "Q10": 2,
    "Q11": 4, "Q12": 5
  },
  "pcs12": 54.21,
  "mcs12": 48.93
}
```

### API Route (`/api/submit/route.ts`)

1. Receive JSON body: `{ respondentInfo, rawResponses, pcs12, mcs12 }`
2. Save document to Firestore using Firebase Admin SDK
3. POST same payload to `process.env.GAS_WEBHOOK_URL`
4. Return `{ success: true, pcs12, mcs12 }`

Handle errors gracefully — if GAS POST fails, still save to Firestore and return success.

---

## Google Apps Script (`gas/Code.gs`)

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Write header row on first submission
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Name', 'Employee ID', 'Department', 'Employment Type',
        'Age', 'Sex',
        'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7',
        'Q8', 'Q9', 'Q10', 'Q11', 'Q12',
        'PCS-12', 'MCS-12',
        'PCS Interpretation', 'MCS Interpretation'
      ]);
    }

    const r = data.rawResponses;

    function interpret(score) {
      if (score >= 55) return 'Above Average';
      if (score >= 45) return 'Average';
      return 'Below Average';
    }

    sheet.appendRow([
      data.timestamp,
      data.name,
      data.employeeId || '',
      data.department,
      data.employmentType,
      data.age,
      data.sex,
      r.Q1, r.Q2, r.Q3, r.Q4, r.Q5, r.Q6, r.Q7,
      r.Q8, r.Q9, r.Q10, r.Q11, r.Q12,
      data.pcs12,
      data.mcs12,
      interpret(data.pcs12),
      interpret(data.mcs12)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

Deploy this as a Web App in Google Apps Script:
- Execute as: **Me**
- Who has access: **Anyone**
- Copy the deployment URL into `.env.local` as `GAS_WEBHOOK_URL`

---

## Environment Variables

Create `.env.local` (copy from `.env.local.example`):

```env
# Firebase Client (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (server-side only)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Google Apps Script Web App URL
GAS_WEBHOOK_URL=

# Dashboard password (shared among admins — keep this secret)
DASHBOARD_PASSWORD=
```

Get `FIREBASE_ADMIN_*` values from Firebase Console → Project Settings → Service Accounts → Generate new private key.

`DASHBOARD_PASSWORD` is a plain string set by you (e.g. `wpu2025conf`). It is checked server-side only — never exposed to the client.

---

---

## Dashboard (`/dashboard`)

### Authentication — Simple Password Gate

- `/dashboard/login` — a single password input page
- On submit, POST the password to `/api/dashboard/auth` which compares it to `process.env.DASHBOARD_PASSWORD` (server-side only, never sent to client)
- On success, set an `httpOnly` cookie named `dashboard_session` with a signed token (use `jose` or a simple HMAC of the password + a secret)
- Protect `/dashboard` and all `/api/dashboard/*` and `/api/export/*` routes by checking for the valid cookie in middleware (`middleware.ts`)
- No Firebase Auth required — cookie-based session only
- Session expires after 8 hours
- "Log out" button clears the cookie and redirects to `/dashboard/login`

**`middleware.ts` route protection:**
```typescript
// Protect these paths — redirect to /dashboard/login if no valid session cookie
const PROTECTED = ['/dashboard', '/api/dashboard', '/api/export'];
```

---

### Dashboard Layout (`/dashboard`)

Full-width layout with a top nav bar showing:
- WPU logo / name on the left
- "WPU SF-12 Portal — Admin Dashboard" title
- "Export CSV" and "Export PDF" buttons on the right
- "Log out" link

---

### Section 1 — Summary KPI Cards

Display four stat cards in a responsive grid (2×2 on mobile, 4×1 on desktop):

| Card | Value | Detail |
|---|---|---|
| Total Responses | Count of all documents in `sf12_responses` | — |
| Avg PCS-12 | Mean of all `pcs12` values | ±SD shown below |
| Avg MCS-12 | Mean of all `mcs12` values | ±SD shown below |
| Below Average (either) | Count where `pcs12 < 45` OR `mcs12 < 45` | As % of total |

---

### Section 2 — Score Distribution Charts

Two side-by-side bar charts (one for PCS-12, one for MCS-12):

**Bands for each chart:**
- Below Average: score < 45
- Average: 45–54.9
- Above Average: ≥ 55

Show count and percentage for each band. Color-code bars: red / amber / green.

Use **Recharts** for all charts (`npm install recharts`).

---

### Section 3 — Breakdown by Group

Two grouped bar charts or a combined table showing **average PCS-12 and MCS-12** broken down by:

- **By Department / College** — list all departments, sorted by avg PCS descending
- **By Employment Type** — Faculty vs Staff side-by-side
- **By Sex** — Male / Female / Prefer not to say

Display as both a chart and a summary table below it.

---

### Section 4 — Individual Responses Table

A full searchable, filterable, sortable table of all responses:

**Columns:**
| # | Timestamp | Name | Employee ID | Department | Type | Age | Sex | PCS-12 | MCS-12 | PCS Band | MCS Band |

**Features:**
- Search box: filters by name, employee ID, or department (client-side, instant)
- Filter dropdowns: Employment Type, Sex, PCS Band, MCS Band
- Sort by clicking column headers (default: newest first)
- Pagination: 20 rows per page
- Row color coding: red row if either PCS or MCS < 45
- Clicking a row expands it to show individual Q1–Q12 responses

**Data source:** fetched from `/api/dashboard/responses` (server-side, Firestore, requires valid session cookie)

---

### Export — CSV (`/api/export/csv`)

- Protected route (requires dashboard session cookie)
- Fetches all documents from Firestore `sf12_responses`
- Streams a `.csv` file download with headers:

```
Timestamp, Name, Employee ID, Department, Employment Type, Age, Sex,
Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10, Q11, Q12,
PCS-12, MCS-12, PCS Band, MCS Band
```

- File name: `wpu-sf12-responses-YYYY-MM-DD.csv`
- Use Node's built-in stream or a simple string join — no external CSV library needed

---

### Export — PDF (`/api/export/pdf`)

- Protected route (requires dashboard session cookie)
- Generates a **summary report PDF** (not a raw data dump — that's what CSV is for)
- Use **`@react-pdf/renderer`** (`npm install @react-pdf/renderer`)
- File name: `wpu-sf12-summary-report-YYYY-MM-DD.pdf`

**PDF report contents:**

```
Page 1 — Cover
  WPU SF-12 Portal
  Western Philippines University Faculty and Staff Conference
  Report generated: [date]
  Total respondents: [n]

Page 2 — Executive Summary
  Average PCS-12: XX.XX (±SD)
  Average MCS-12: XX.XX (±SD)
  Respondents below average on PCS: n (%)
  Respondents below average on MCS: n (%)
  Respondents below average on either: n (%)

Page 3 — Score Distribution
  PCS-12 band breakdown table (Below / Average / Above — count + %)
  MCS-12 band breakdown table

Page 4 — Breakdown by Group
  Table: avg PCS and MCS by Department
  Table: avg PCS and MCS by Employment Type
  Table: avg PCS and MCS by Sex

Page 5 — Citation & Disclaimer
  "Based on the SF-12v1 Health Survey..."
  Full citations (Ware et al. 1996; Gandek et al. 1998)
  "This report is for institutional wellness awareness only
   and does not constitute clinical diagnosis or medical advice."
```

---

### `lib/dashboardUtils.ts`

Implement these helper functions for computing dashboard stats from the Firestore response array:

```typescript
// Types
interface SF12Response {
  id: string;
  timestamp: string;
  name: string;
  employeeId?: string;
  department: string;
  employmentType: 'Faculty' | 'Staff';
  age: number;
  sex: string;
  rawResponses: Record<string, number>;
  pcs12: number;
  mcs12: number;
}

type ScoreBand = 'Above Average' | 'Average' | 'Below Average';

// Functions to implement:
function getScoreBand(score: number): ScoreBand
function computeSummaryStats(responses: SF12Response[])
  // returns: { total, avgPCS, sdPCS, avgMCS, sdMCS, belowAverageCount, belowAveragePct }

function getScoreDistribution(responses: SF12Response[], field: 'pcs12' | 'mcs12')
  // returns: { belowAverage: { count, pct }, average: { count, pct }, aboveAverage: { count, pct } }

function groupByField(responses: SF12Response[], field: keyof SF12Response)
  // returns: Record<string, { count, avgPCS, avgMCS }>

function formatForCSV(responses: SF12Response[]): string
  // returns full CSV string including header row
```



- **Project name:** WPU SF-12 Portal
- **University:** Western Philippines University
- **Primary color:** Deep navy `#1a3a5c`
- **Accent color:** Gold `#c8a951`
- **Background:** White `#ffffff`
- **Font:** Inter (Google Fonts)
- **Border radius:** Moderate (8–12px cards, 6px buttons)
- **Mobile-first**, fully responsive down to 375px
- Loading spinner on form submission
- No authentication — anyone with the link can respond
- Print stylesheet for results page (hide nav, center scores)

---

## README Content to Generate

Include a `README.md` with these sections:

1. **Project Overview** — WPU SF-12 Portal, what it is and who it's for
2. **Prerequisites** — Node 18+, Firebase CLI, Google account
3. **Firebase Setup** — create project, enable Firestore, get credentials
4. **Google Apps Script Setup** — create spreadsheet, paste `Code.gs`, deploy as Web App, copy URL
5. **Local Development** — clone, install, fill `.env.local`, `npm run dev`
6. **Dashboard Access** — navigate to `/dashboard`, enter the password set in `DASHBOARD_PASSWORD`; explain CSV and PDF export
7. **Deployment** — Vercel (recommended) or Firebase Hosting; note that `DASHBOARD_PASSWORD` must be set as an environment variable in the deployment platform
8. **License** — MIT License (instrument attribution to Ware et al. 1996 separately noted)
9. **References** — include all three citations below, verbatim:

```
Ware, J. E., Kosinski, M., & Keller, S. D. (1996). A 12-Item Short-Form Health Survey:
Construction of scales and preliminary tests of reliability and validity.
Medical Care, 34(3), 220–233. https://doi.org/10.1097/00005650-199603000-00003

Gandek, B., Ware, J. E., Aaronson, N. K., Apolone, G., Bjorner, J. B., Brazier, J. E.,
Bullinger, M., Kaasa, S., Leplege, A., Prieto, L., & Sullivan, M. (1998).
Cross-validation of item selection and scoring for the SF-12 Health Survey in nine countries:
Results from the IQOLA Project. Journal of Clinical Epidemiology, 51(11), 1171–1178.
https://doi.org/10.1016/S0895-4356(98)00109-7

OrthoToolKit. (n.d.). Free online SF-12 score calculator. https://orthotoolkit.com/sf-12/
```

---

## Build Order

Build in this sequence to catch issues early:

1. Scaffold: `npx create-next-app@latest wpu-sf12-portal --typescript --tailwind --app`
2. Install dependencies: `npm install firebase firebase-admin recharts @react-pdf/renderer jose`
3. Implement `lib/sf12Scoring.ts` with lookup table and self-test
4. Implement `lib/dashboardUtils.ts` with all stat helper functions
5. Build `components/QuestionCard.tsx` and `components/ProgressBar.tsx`
6. Build `components/ScoreGauge.tsx` (SVG arc, no external libs)
7. Build `app/assessment/page.tsx` with full step flow
8. Build `app/results/page.tsx`
9. Build `app/api/submit/route.ts`
10. Build `app/page.tsx` (landing)
11. Configure Firebase client (`lib/firebase.ts`) and Admin SDK (`lib/firebaseAdmin.ts`)
12. Build `middleware.ts` for dashboard route protection
13. Build `app/dashboard/login/page.tsx` and `/api/dashboard/auth` route
14. Build `/api/dashboard/responses` route (Firestore fetch, cookie-protected)
15. Build dashboard components: `StatCard`, `ScoreDistributionChart`, `DepartmentBreakdown`, `ResponsesTable`, `ExportButtons`
16. Build `app/dashboard/page.tsx` composing all dashboard components
17. Build `/api/export/csv/route.ts`
18. Build `/api/export/pdf/route.ts` using `@react-pdf/renderer`
19. Write `gas/Code.gs`
20. Write `.env.local.example` and `README.md`

> **Scoring accuracy is critical.** After implementing `sf12Scoring.ts`, run the built-in self-test:
> all responses = 1 → PCS must equal exactly **56.57706**, MCS must equal exactly **60.75781**.
> These are the same values shown on the OrthoToolKit reference site for that input combination.

> **Dashboard security note:** `DASHBOARD_PASSWORD` and `FIREBASE_ADMIN_PRIVATE_KEY` must never appear in client-side code. All dashboard data routes must check for the session cookie before querying Firestore.
