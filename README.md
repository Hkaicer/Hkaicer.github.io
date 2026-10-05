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
├── 404.html              # not-found page, served by GitHub Pages for any missing URL
├── css/style.css         # design system, light + dark themes, motion styles
├── js/i18n.js            # EN/FR dictionary, single source of truth for all text
├── js/main.js            # language and theme toggles, typing, reveals, filters, nav, contact form
├── js/motion.js          # decorative motion layer (see Motion below)
├── js/diagram.js         # interactive architecture maps on the case studies
├── assets/               # favicons + social preview images (assets/og/, 1200 x 630)
├── robots.txt
├── sitemap.xml
├── .nojekyll             # GitHub Pages serves the files as they are, no Jekyll build
└── README.md
```

## Preview locally

```powershell
cd chemin/vers/portfolio
python -m http.server 8201
# visit http://localhost:8201
```

## Motion

`js/motion.js` adds a quiet motion layer on top of the content:

- a slow node network behind the dark hero, with packets travelling along its links
- headings that rise word by word, section kickers that decode like a terminal line
- a profile card that tilts toward the cursor while its rows cascade in
- capability icons that draw their own outline, a soft light that follows the cursor on project cards
- a timeline that fills as you scroll, case-study diagrams that build up from left to right
- a circular reveal from the toggle when switching theme, and a short cross-fade between pages (Chromium browsers)

All of it is decorative. With "reduce motion" turned on in the system, or if the file fails to load,
the site shows exactly the same content, only still. Every hidden starting state is scoped to
`html.motion`, a class that only this file sets.

## Interactive maps

Each case study has an architecture map driven by `js/diagram.js`:

- data travels along the links and changes shape as it is processed (events, 5-minute windows,
  scored windows, alerts on the detection pipeline, status checks and alerts on the monitoring one)
- a guided run plays one full cycle stage by stage. The BBRS map runs a simulated access-point
  failure, from the drop to the on-site fix.
- every stage is linked both ways to its bullet under the map, by hover, click or tap
- captions reuse the bullets from `js/i18n.js`, so the map never states anything the page does not

Stages are declared in the SVG with `data-stage`, links with `data-from`, `data-to` and `data-kind`.
The steps of each guided run live in the `CONFIG` object at the top of `js/diagram.js`.

## Content rules baked in

- Evidence badges on every project (production-confirmed, deployed, lab-validated, academic, personal).
- No unverified metrics. 10K EPS is environment context. 1000+ APs and the SOC-confirmed F5 finding are documented.
- Validation wording: replayed Active Directory attacks (lab) + a finding on the operator's F5 firewall logs confirmed by the SOC team.
- No em-dash in prose. Allowed only in structural labels (dates, org lines, title separators).
- Architecture diagrams are theme-aware SVG maps with animated flows. Telemetry stays generic (no agent names).

## Theme

Light and dark, toggled from the nav. The choice persists in localStorage, and a first visit follows
the system preference. A tiny inline script in each page's head applies the theme before first paint.

## Publishing

- Canonical URLs, Open Graph and Twitter cards point at `https://hkaicer.github.io/`. If the site
  moves, update them in the three pages, in `robots.txt` and in `sitemap.xml`.
- The resume button stays hidden until `assets/cv/CV_Houssam_Kaicer_EN.pdf` and
  `assets/cv/CV_Houssam_Kaicer_FR.pdf` are online. Drop them in and the button appears, in the
  visitor's language.
- Project cards without a dedicated repository link to the GitHub profile for now. Point each
  `GitHub →` link at its repository once that repository is public.

## Contact form

The form posts to Formspree in the background, so a recruiter never leaves the page. Both case
studies end with the same form, its subject line prefilled with the project and translated. The endpoint
is `FORMSPREE_ENDPOINT` near the contact form section of `js/main.js`. If it is ever reset to the
`YOUR_FORM_ID` placeholder, the form falls back to opening the visitor's mail app, so it is never broken.

Notes:

- The free plan allows 50 submissions per month, which is plenty for a portfolio.
- Submissions transit through formspree.io, a third party. Apart from Google Fonts, nothing else on
  the site talks to an external service.
- A hidden honeypot field (`_gotcha`) is included. Formspree drops any submission that fills it.
- If the request fails, the visitor keeps their text and sees the fallback email address.

All wording lives in `js/i18n.js`, both languages. The text in the HTML files is only the English
fallback shown before JavaScript loads. Keep the two in sync when editing.
