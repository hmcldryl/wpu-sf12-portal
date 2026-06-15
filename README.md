# WPU SF-12 Portal

## 1. Project Overview

The **WPU SF-12 Portal** is a web app for the Western Philippines University (WPU)
Faculty and Staff Conference. Respondents enter their personal details, answer the
12-item SF-12 health questionnaire (v1.0), and immediately receive a scored health
assessment — Physical Component Summary (PCS-12) and Mental Component Summary
(MCS-12) — norm-based against the US general population (mean = 50, SD = 10).

An admin dashboard provides aggregate statistics, score distributions, group
breakdowns, and CSV/PDF exports of all responses.

## 2. Prerequisites

- Node.js 18+
- npm
- A Firebase project (Firestore enabled)
- A Google account (for Google Apps Script + Sheets export)

## 3. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** (production or test mode).
3. Go to **Project Settings → General** and register a web app to get the
   `NEXT_PUBLIC_FIREBASE_*` config values.
4. Go to **Project Settings → Service Accounts → Generate new private key** to get
   the `FIREBASE_ADMIN_*` values (project ID, client email, private key).

## 4. Google Apps Script Setup

1. Create a new Google Sheet to receive responses.
2. Open **Extensions → Apps Script** and paste the contents of `gas/Code.gs`.
3. Click **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the deployment URL into `.env.local` as `GAS_WEBHOOK_URL`.

## 5. Local Development

```bash
git clone <repo-url>
cd wpu-sf12-portal
npm install
cp .env.local.example .env.local
# fill in .env.local with your Firebase + GAS + dashboard password values
npm run dev
```

Visit `http://localhost:3000`.

## 6. Dashboard Access

Navigate to `/dashboard` (you'll be redirected to `/dashboard/login`). Enter the
password set as `DASHBOARD_PASSWORD` in your environment. The session lasts 8 hours
and is stored in an `httpOnly` cookie.

From the dashboard you can:
- View KPI summary cards (total responses, average PCS/MCS, below-average counts)
- View score distribution charts and group breakdowns (department, employment type, sex)
- Search, filter, sort, and paginate individual responses
- **Export CSV** — raw data dump of all responses
- **Export PDF** — a multi-page summary report

## 7. Deployment

**Vercel (recommended)**

1. Push this repo to GitHub and import it into [Vercel](https://vercel.com/).
2. Add all variables from `.env.local` as Environment Variables in the Vercel project
   settings, including `DASHBOARD_PASSWORD` and `FIREBASE_ADMIN_PRIVATE_KEY`.
3. Deploy.

**Firebase Hosting** is also supported via the Next.js Firebase Hosting integration.

> `DASHBOARD_PASSWORD` and `FIREBASE_ADMIN_PRIVATE_KEY` must be set as environment
> variables on your deployment platform and must never be exposed client-side.

## 8. License

This project is licensed under the [MIT License](LICENSE).

The SF-12v1 instrument itself is attributed separately to Ware, Kosinski & Keller
(1996) — see References below. SF-12 v1.0 is non-proprietary and freely available
for research and institutional use. SF-12 Version 2 is proprietary
(Optum/QualityMetric) and is **not** used in this project.

## 9. References

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
