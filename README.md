# Houssam Kaicer portfolio

Bilingual (EN/FR) portfolio with light and dark themes.
Pure HTML + CSS + JS. No build step, no frameworks, no trackers. Deploys to GitHub Pages as is.

Positioning: **Cybersecurity Engineer specializing in AI for Security Operations.**

## Structure

```
portfolio/
├── index.html            # home: hero + profile card, proof points, capabilities,
│                         #   filterable projects, timeline, about, contact (info + form)
├── case-study.html       # flagship case study (Maroc Telecom PFE) with architecture map
├── case-study-bbrs.html  # BBRS case study (proactive wireless monitoring) with architecture map
├── css/style.css         # design system, light + dark themes
├── js/i18n.js            # EN/FR dictionary, single source of truth for all text
├── js/main.js            # language toggle, theme toggle, typing, reveals, filters, contact form
├── assets/favicon.svg
└── README.md
```

## Preview locally

```powershell
cd chemin/vers/portfolio
python -m http.server 8201
# visit http://localhost:8201
```

## Content rules baked in

- Evidence badges on every project (production-confirmed, deployed, lab-validated, academic, personal).
- No unverified metrics. 10K EPS is environment context. 1000+ APs and the SOC-confirmed F5 finding are documented.
- Validation wording: replayed Active Directory attacks (lab) + a finding on the operator's F5 firewall logs confirmed by the SOC team.
- No em-dash in prose. Allowed only in structural labels (dates, org lines, title separators).
- Architecture diagrams are theme-aware SVG maps with animated flows. Telemetry stays generic (no agent names).

## Theme

Light and dark, toggled from the nav. The choice persists in localStorage, and a first visit follows the
system preference. A tiny inline script in each page's head applies the theme before first paint.

## Contact form

The form posts to Formspree in the background, so a recruiter never leaves the page. Until the
endpoint is configured it falls back to opening the visitor's mail app, so it is never broken.

To activate it:

1. Create a free account on https://formspree.io and add a new form, pointing it at
   `hkaicer11@gmail.com`.
2. Formspree gives you an endpoint that looks like `https://formspree.io/f/abcdwxyz`.
3. Open `js/main.js`, find `FORMSPREE_ENDPOINT` near the contact form section, and replace
   `YOUR_FORM_ID` with your own id.
4. Send yourself one test message. Formspree asks you to confirm the address on the first
   submission, and nothing arrives until you do.

Notes:

- The free plan allows 50 submissions per month, which is plenty for a portfolio.
- Submissions transit through formspree.io, a third party. Nothing else on the site talks to an
  external service.
- A hidden honeypot field (`_gotcha`) is included. Formspree drops any submission that fills it.
- If the request fails, the visitor keeps their text and sees the fallback email address.

## Before publishing

1. Drop the CVs at `assets/cv/CV_Houssam_Kaicer_EN.pdf` and `assets/cv/CV_Houssam_Kaicer_FR.pdf`.
2. Search the HTML for `TODO`: point project GitHub links at their dedicated repos
   (the BBRS card already points to `aruba-network-toolkit`).
3. Confirm the contact email (currently `hkaicer11@gmail.com`).

All wording lives in `js/i18n.js`, both languages. The text in the HTML files is only the English
fallback shown before JavaScript loads. Keep the two in sync when editing.
