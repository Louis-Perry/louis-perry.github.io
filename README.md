# Louis Perry — 7-Page Interactive Academic Portfolio

Lightweight, zero-build static academic portfolio built for prospective UK Chemistry PhD supervisors (2027 entry) and pharmaceutical R&D recruiters—featuring an atmospheric background-photo Home hero, a bespoke interactive 3D-style isometric world map, a miniature bottom-right Snow Globe navigator on every subpage, and a topographical treasure-map Experience page.

## Pages & Interactive Map Landmarks

| Page | File | Isometric Map Landmark |
| :--- | :--- | :--- |
| **1. Home** | `index.html` | Cosy Home Cottage *(+ full-bleed world map below hero)* |
| **2. Research** | `research.html` | Modern Chemistry Research Lab |
| **3. Experience** | `experience.html` | Semiconductor Cleanroom Fab *(topographical treasure-map trail)* |
| **4. Education** | `education.html` | Swansea University Hall |
| **5. Skills** | `skills.html` | Analytical & NMR Instrument Pavilion |
| **6. About Me** | `about.html` | Alpine Summit Refuge & Cell Tower |
| **7. Contact** | `contact.html` | Classic British Telephone Box |
| *Bonus* | `assets/Louis_Perry_CV.pdf` | Coastal CV Noticeboard |

Every subpage (pages 2–7) displays a compact, unobtrusive **miniature Snow Globe** at the bottom-right. Clicking it lifts the glass dome open and enlarges the full interactive world map over the page (with a **"You are here"** golden pin) for effortless navigation.

## Quick Updates (No HTML/CSS Required)

All text, links, and structured entries live in **`js/site-data.js`**:
1. Drop your Home background photo at `assets/hero-bg.jpg` and your About portrait at `assets/headshot.jpg`.
2. Drop your updated public CV PDF at `assets/Louis_Perry_CV.pdf`.
3. Update `profile.email`, `profile.github`, and `experience[0]` (IQE placeholder bullets) in `js/site-data.js`.

## Preview Locally & Deploy on GitHub Pages

```bash
python3 -m http.server 8000
```

Push to `<username>.github.io` and enable **Settings → Pages → Source: GitHub Actions** (`.github/workflows/pages.yml` is ready to go).
