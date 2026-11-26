/**
 * ============================================================================
 * SITE CONTENT CONFIGURATION — LOUIS PERRY ACADEMIC PORTFOLIO (7-PAGE SITE)
 * ============================================================================
 * Edit this file to update your bio, IQE experience bullets, contact links,
 * skills, education, or future research without touching HTML or CSS.
 *
 * Quick checklist before publishing to GitHub Pages:
 *   1. Drop your background portrait for Home into:  assets/hero-bg.jpg
 *   2. Drop your headshot portrait for About into:   assets/headshot.jpg
 *   3. Drop your updated public CV PDF into:         assets/Louis_Perry_CV.pdf
 *   4. Update `profile.email` and `profile.github` below.
 *   5. Replace the placeholder bullets in `experience[0]` (IQE) with your
 *      post-graduation responsibilities and set `isPlaceholder: false`.
 * ============================================================================
 */

window.SITE_DATA = {
  nav: [
    { id: "home", label: "Home", href: "index.html" },
    { id: "research", label: "Research", href: "research.html" },
    { id: "experience", label: "Experience", href: "experience.html" },
    { id: "education", label: "Education", href: "education.html" },
    { id: "skills", label: "Skills", href: "skills.html" },
    { id: "about", label: "About", href: "about.html" },
    { id: "contact", label: "Contact", href: "contact.html" }
  ],

  profile: {
    name: "Louis Perry",
    fullName: "Louis Thomas Hunter Perry",
    kicker: "Chemistry Graduate · Swansea University",
    positioning: "Organic Synthesis | Nanomaterials & Drug Delivery | Prospective 2027 PhD Researcher",
    shortPositioning: "Organic Synthesis, Nanomaterials & Drug Delivery",
    location: "United Kingdom",

    // Home full-bleed hero background photo (falls back cleanly to hero-bg-fallback.svg)
    heroBg: "assets/hero-bg.jpg?v=19",
    heroBgFallback: "assets/hero-bg-fallback.svg",

    // Portrait headshot for About Me page (falls back cleanly to headshot-placeholder.svg)
    headshot: "assets/headshot.jpg?v=22",
    headshotFallback: "assets/headshot-placeholder.svg",
    headshotAlt: "Graduation portrait of Louis Perry",

    email: "louis.tomh.perry@gmail.com",
    emailIsPlaceholder: false,

    // Pre-filled from your CV
    linkedin: "https://www.linkedin.com/in/louis-perry-chem",
    linkedinHandle: "linkedin.com/in/louis-perry-chem",

    // TODO: Replace with your GitHub profile URL (or set to "" to hide)
    github: "https://github.com/louisperry",
    githubHandle: "github.com/louisperry",
    githubIsPlaceholder: true,

    // Drop your updated academic/post-IQE CV PDF at assets/Louis_Perry_CV.pdf
    cvPath: "assets/Louis_Perry_CV.pdf",

    heroIntro:
      "BSc (Hons) Chemistry graduate from Swansea University (2:1 / 66%, 84% dissertation) focused on multi-step organic synthesis, polymeric nanocarriers, and analytical troubleshooting—targeting 2027 UK PhD opportunities and pharmaceutical R&D.",

    highlightBadge: {
      lead: "2027 PhD Candidate (Prospective)",
      detail: "BSc (Hons) Chemistry (2:1, 66%) · 84% Dissertation (95% Lab) · Manuscript in Preparation"
    },

    bioParagraphs: [
      "I am a BSc (Hons) Chemistry graduate from Swansea University (Upper Second-Class Honours, 2:1 / 66%), where my final-year research project on hollow dendritic polyglycidol (dPG / HPG) nanocapsules for targeted drug delivery earned 84% overall and 95% for laboratory proficiency.",
      "My experimental background spans multi-step organic and polymer synthesis, size-controlled sol-gel nanoparticle templating, post-polymerisation functionalisation, and characterisation by 1D/2D NMR and dynamic light scattering—complemented by post-graduation industry experience in a compound semiconductor cleanroom environment at IQE.",
      "I am actively exploring 2027 UK PhD opportunities in medicinal chemistry, process chemistry, organic synthesis, or drug delivery and formulation, as well as pharmaceutical R&D roles focused on synthetic route optimisation and analytical problem-solving."
    ]
  },

  worldIntro: {
    heading: "Explore My World",
    lead: "Click any building or landmark below to wander through my research, experience, education, lab skills, and life beyond the bench."
  },

  featuredResearch: {
    sectionTitle: "Research",
    eyebrow: "BSc (Hons) Dissertation Spotlight · May 2026",
    title:
      "Synthesis and Swelling Responsiveness of Hollow dPG Nanocapsules and the Viability of Post-Polymerisation Functionalisation",
    supervisor: "Supervised by Dr. Sumati Bhatia · Faculty of Science & Engineering, Swansea University",
    badges: [
      { label: "Dissertation: 84% (First-Class)", tone: "accent" },
      { label: "Lab Proficiency: 95%", tone: "green" },
      { label: "Oral Defence: 73%", tone: "neutral" },
      { label: "Manuscript in Preparation", tone: "gold" }
    ],

    figure: {
      src: "assets/dissertation-scheme.png",
      alt: "Synthetic pathway for hollow dendritic polyglycidol (dPG) nanocapsules via Stöber silica templating, APTES grafting, ROMBP glycidol polymerisation, NaOH etching, and post-polymerisation functionalisation towards cationic sulphonium-amide pendant groups.",
      captionTitle: "Preparation of hollow dPG nanocapsules and post-polymerisation route.",
      captionBody:
        "Sacrificial silica core templating (SiNP) followed by surface amination, ring-opening multibranching polymerisation (ROMBP) of glycidol, and divergent pathways to unfunctionalised hollow dPG controls (4a) and cationic sulphonium-amide functionalised nanocarriers (4b–10).",
      conditions:
        "(1) EtOH, aq. NH3, TEOS, 40 °C, 24 h; (2) EtOH, APTES, rt, 24 h; (3) NMP, K+O-t-Bu, glycidol, 115 °C, 20 h; (4a) NaOH, 96 h; (4b) MsCl, DMF, TEA, 0 °C, N2, 40 h; (5) DMF, NaN3, TEA, 72 h; (6) THF, PPh3, H2O, 72 h; (7) acryloyl chloride, DMF, TEA, 0 °C, 12 h; (8) NaOH, 96 h; (9) ethanethiol, TEA, DMF, rt, 24 h; (10) MeI, DMF/MeOH, N2, dark, 48 h."
    },

    objective:
      "Fabricate soft-shell hollow dendritic/hyperbranched polyglycidol (dPG / HPG) nanocapsules within the 100–200 nm diameter window required to exploit the enhanced permeability and retention (EPR) effect—designed for polar aminoglycoside payloads such as tobramycin against Pseudomonas aeruginosa biofilms—while evaluating ionic-strength swelling behaviour and the synthetic viability of post-polymerisation functionalisation towards bactericidal cationic sulphonium-amide groups.",

    approachSteps: [
      {
        step: "01",
        title: "Stöber Template & APTES",
        detail:
          "Syringe-pump monomer-starved Stöber hydrolysis/condensation of TEOS to tune SiNP diameter (123.1 ± 12.8 nm preliminary; 215.0 ± 46.3 nm scaled-up), followed by APTES surface amination verified by zeta-potential charge reversal (−58.7 mV to +35.1 mV at pH 3)."
      },
      {
        step: "02",
        title: "ROMBP Shell Growth",
        detail:
          "Surface-initiated anionic ring-opening multibranching polymerisation of glycidol (K+O-t-Bu, anhydrous NMP, 115 °C, N2), quenched with HCl and purified via 2 kDa cellulose-acetate dialysis and lyophilisation (confirmed free of unbound dPG by DLS)."
      },
      {
        step: "03",
        title: "Alkaline Etching & Swelling",
        detail:
          "Mild hydrolytic silica removal (0.625–1.0 M NaOH, 35 °C, 4 days) yielding flexible hollow dPG nanocapsules (118.0 ± 35.9 nm; scaled-up 171.9 ± 24.7 nm), assayed across 0–100 mM PBS ionic strengths by DLS without sonication."
      },
      {
        step: "04",
        title: "Post-Polymerisation & NMR",
        detail:
          "Multi-step functional group interconversion on SiNP-dPG via mesylation (MsCl/TEA, DMF, 0 °C), SN2 azidation (NaN3), and Staudinger reduction (PPh3/H2O), tracked by 500 MHz 1H & 13C{1H} NMR (D2O, DMSO-d6, DMF-d7)."
      }
    ],

    metrics: [
      {
        value: "82–90%",
        label: "Mesylation Conversion",
        note: "Quantified by 1H NMR integration (90.1% backbone normalisation; 82% mesyl –CH3)"
      },
      {
        value: "118–172 nm",
        label: "Hollow dPG Diameter",
        note: "Within the 100–200 nm EPR targeting window (36% relaxation post-etching)"
      },
      {
        value: "18.9 nm",
        label: "Ionic Deswelling Span",
        note: "Reversible contraction across 12.5 → 50 mM PBS (203.1 nm to 184.2 nm)"
      }
    ],

    keyTakeaways: [
      "Validated the post-polymerisation functionalisation pathway through the amine intermediate SiNP-dPG(NH2), demonstrating 82–90% hydroxyl-to-mesylate conversion with a slight regiochemical preference for less hindered primary hydroxyls (52:48 vs. ~60:40 2°:1° baseline).",
      "Observed osmotic deswelling of neutral hollow dPG capsules across 12.5–50 mM PBS, while ion-induced aggregation at 0 mM and 100 mM PBS provided direct experimental justification for grafting permanent cationic sulphonium charges to improve colloidal stability and polyelectrolyte responsiveness.",
      "Diagnosed two critical process bottlenecks—centrifugation-induced silanol polycondensation during SiNP workup and pH-gradient silicate re-precipitation fouling cellulose-acetate dialysis membranes during etching—and proposed alkaline-matched dialysate and centrifugal ultrafiltration protocols now feeding into a manuscript in preparation."
    ],

    // Optional: set documentUrl to e.g. "assets/Louis_Perry_Dissertation.pdf" once ready to publish
    documentUrl: "",
    documentLabel: "Download Dissertation PDF",
    requestNote: "Full dissertation PDF (12,818 words) and analytical spectra available on request."
  },

  experience: [
    {
      waypoint: "X",
      tag: "Industry",
      role: "Production Technician",
      organisation: "IQE",
      location: "Newport, UK",
      period: "2026",
      isPlaceholder: false,
      bullets: [
        "Operated within an ISO-regulated cleanroom environment, adhering to strict gowning and contamination controls.",
        "Trained in the operation and management of metrology and inspection instruments (Surfscan, RPM, and Camtek).",
        "Gained exposure to epitaxial multi-layer deposition reactors and subsequent etching techniques for quality testing.",
        "Utilised MES (manufacturing execution system) software to track complex workflows and coordinated tasks across cross-functional departmental teams."
      ]
    },
    {
      waypoint: "06",
      tag: "Research Lab",
      role: "Final-Year Undergraduate Researcher (Lab 403)",
      organisation: "Swansea University — Dr. Sumati Bhatia Group",
      location: "Swansea, UK",
      period: "2025 – 2026",
      isPlaceholder: false,
      photo: "assets/lab-bench.jpg?v=24",
      bullets: [
        "Executed multi-step Stöber silica templating, APTES amination, ROMBP glycidol polymerisation, NaOH etching, and post-polymerisation functionalisation independently (95% Supervisor Laboratory Proficiency grade).",
        "Diagnosed colloidal aggregation and dialysis membrane fouling bottlenecks through systematic 1H/13C NMR and DLS/zeta-potential troubleshooting; experimental data and frameworks are being incorporated into a peer-reviewed manuscript in preparation."
      ],
      link: { label: "Explore full dissertation spotlight →", href: "research.html" }
    },
    {
      waypoint: "05",
      tag: "Semiconductors",
      role: "Technical Facility Visits & Industry Workshops",
      organisation: "Centre for Integrative Semiconductor Materials (CISM)",
      location: "Swansea Bay Campus",
      period: "2025",
      isPlaceholder: false,
      bullets: [
        "Participated in technical facility visits and interactive workshops observing industry-standard semiconductor manufacturing, cleanroom environments, health and safety protocols, and advanced material processing firsthand."
      ]
    },
    {
      waypoint: "04",
      tag: "Outreach & Teaching",
      role: "Chemistry Outreach Demonstrator",
      organisation: "Swansea University",
      location: "Swansea, UK",
      period: "2023 – 2024",
      isPlaceholder: false,
      bullets: [
        "Supported Year 8–13 pupils in university chemistry teaching laboratories, supervising hands-on experiments, maintaining laboratory safety, and explaining core chemical principles.",
        "Assisted at major regional outreach events, including the Royal Society of Chemistry's South Wales West Top of the Bench Competition attended by 20 schools."
      ]
    },
    {
      waypoint: "03",
      tag: "Operations & Outreach",
      role: "Assistant to Constituency Manager",
      organisation: "Chippenham Lib Dem Constituency Office",
      location: "Chippenham, UK",
      period: "2022",
      isPlaceholder: false,
      photo: "assets/lib-dem-canvas.jpg?v=28",
      bullets: [
        "Worked in a core team of four organising a canvassing event in Melksham.",
        "Deployed database management and constituency mapping tools for local canvassing.",
        "Interacted with volunteers and residents, handling public-facing communication.",
        "Collaborated closely with Sarah Gibson (elected MP for Chippenham constituency)."
      ]
    },
    {
      waypoint: "02",
      tag: "Mentoring",
      role: "Mentoring",
      organisation: "Sheldon Secondary School",
      location: "Chippenham, UK",
      period: "2021",
      isPlaceholder: false,
      bullets: [
        "Selected to mentor a Year 7 student to support integration into secondary school."
      ]
    },
    {
      waypoint: "01",
      tag: "Customer Service",
      role: "General Assistant",
      organisation: "Langley Nurseries Garden Centre",
      location: "Wiltshire, UK",
      period: "2019",
      isPlaceholder: false,
      bullets: [
        "Interacted with customers, building communication and team collaboration capabilities."
      ]
    }
  ],

  education: [
    {
      degree: "BSc (Hons) Chemistry",
      institution: "Swansea University",
      period: "2023 – 2026",
      grade: "Upper Second-Class Honours (2:1 · 66%)",
      accreditation:
        "Accredited by the Royal Society of Chemistry (RSC) and recognised under the ACS Global Recognition program.",
      modules: [
        "Advanced Physical Chemistry",
        "Polymers & Materials",
        "Advanced Topics in Semiconductors"
      ],
      highlights: [
        "Final-Year Dissertation: 84% (First-Class) — commended by evaluators as 'outstanding' in communicating scientific methods, with results discussed 'with rigour and in depth'.",
        "Laboratory Proficiency & Synthesis: 95% (Supervisor Grade) — evaluated as highly proactive and 'very independent' in the lab, with 'high potential to be a good researcher'.",
        "Scientific Communication & Viva Presentation: 73% — commended for clarity and handling advanced panel questions.",
        "Research Co-authorship: experimental data, methodologies, and troubleshooting frameworks currently being incorporated into a peer-reviewed manuscript in preparation."
      ]
    },
    {
      degree: "A-Levels & AS-Level",
      institution: "Sheldon School",
      period: "2021 – 2023",
      grade: "Chemistry (B), Biology (C), Economics (D) · AS Core Mathematics (B)",
      accreditation: "Sixth Form qualification at Sheldon School, Chippenham.",
      modules: [],
      highlights: [
        "Awarded a Bronze Medal in the 2022 UK Chemistry Olympiad (UKChO)."
      ]
    },
    {
      degree: "GCSEs",
      institution: "Sheldon School",
      period: "June 2021",
      grade: "Higher Maths (8 / A*), Chemistry (7 / A), Biology (7 / A), Physics (7 / A), Fine Art (7 / A)",
      accreditation:
        "GCSE England · 10 GCSEs including Design & Technology (Resistant Materials), Drama, Geography, English Literature, and English Language.",
      modules: [],
      highlights: []
    }
  ],

  membershipsAndAwards: [
    {
      title: "Student Member — Royal Society of Chemistry (RSC)",
      period: "2022 – 2027",
      detail: "Active connection to the UK chemical sciences community and current literature."
    },
    {
      title: "UK Chemistry Olympiad (UKChO) — Bronze Medal",
      period: "2022",
      detail: "National RSC problem-solving competition testing advanced chemistry reasoning."
    },
    {
      title: "Swansea University Chemistry Society",
      period: "2023 – 2026",
      detail: "Departmental academic and student chemistry community."
    }
  ],

  skillGroups: [
    {
      category: "Synthesis & Polymer Chemistry",
      summary: "Multi-step bench synthesis, air-sensitive handling, and nanoscale polymeric architectures.",
      items: [
        "Size-controlled Stöber silica nanoparticle synthesis (TEOS hydrolysis/condensation)",
        "APTES silane surface functionalisation",
        "Ring-opening multibranching polymerisation (ROMBP) of glycidol",
        "Post-polymerisation modification (mesylation, SN2 azidation, Staudinger reduction)",
        "Alkaline sacrificial-template etching (NaOH) for hollow nanocapsules",
        "Inert-atmosphere (N2) & syringe-pump controlled reagent addition",
        "Dialysis purification (cellulose-acetate, MWCO 2 kDa), centrifugation & lyophilisation"
      ]
    },
    {
      category: "Analytical & Characterisation",
      summary: "Spectroscopic structural elucidation and colloidal stability analysis.",
      items: [
        "1D NMR (1H, 13C) & 2D NMR (COSY, NOESY, HSQC, HMBC; Bruker Avance III 500 MHz)",
        "Dynamic Light Scattering (DLS) & Zeta Potential (Malvern Zetasizer Nano ZS)",
        "Chromatography & Mass Spectrometry (GC-MS, LC-MS, HPLC)",
        "Infrared (IR) & UV/Vis Spectroscopy",
        "X-Ray Diffraction (XRD)",
        "Colloidal stability & ionic-strength osmotic swelling assays"
      ]
    },
    {
      category: "Computational, Software & Lab Operations",
      summary: "Spectral processing, data visualisation, molecular modelling, and industrial standards.",
      items: [
        "Data analysis & plotting: OriginLab, Python",
        "NMR spectral processing & integration: MestreNova",
        "Chemical drawing & modelling: ChemDraw / ChemDoodle, ChimeraX, VMD (GTO/STOs), ORCA",
        "Cleanroom & epitaxial reactor environments (IQE / CISM)",
        "Laboratory instrumentation: Hettich Universal 320 centrifuge, Martin Christ Alpha 1-2 lyophiliser",
        "Academic lab safety, quality testing & undergraduate outreach demonstrating"
      ]
    }
  ],

  aboutBeyondLab: [
    {
      title: "Mountaineering, Hiking & Wild Camping",
      photos: ["assets/activity-mountaineering.jpg?v=24", "assets/activity-travel.jpg?v=24"],
      detail: "Solo and group mountain expeditions—the inspiration for the alpine summit and topographic trails across this site."
    },
    {
      title: "Caving & Mine Exploration",
      photos: ["assets/activity-caving.jpg?v=24"],
      detail: "Member of Southwest Caving Club (SWCC, Penwyllt, 2025–present): ropework, underground navigation, teamwork, and strict safety protocols."
    },
    {
      title: "Competitive Swimming & Athletics",
      detail: "ASA Level 10 (UK's highest swimming qualification), Wiltshire County Bronze medallist, Swansea University Swimming Club (2024–2026), and running."
    },
    {
      title: "Music & Community",
      sidePhoto: "assets/activity-guitar.jpg?v=24",
      detail: "10+ years playing guitar plus clawhammer banjo; personally raised over £4,000 for Médecins Sans Frontières; former RAF Air Cadets (1304 Squadron) and 3rd Kup ITF Taekwon-Do."
    }
  ],

  contact: {
    heading: "Contact",
    lead: "Prospective 2027 PhD Supervisors, Collaborators & Pharma R&D Recruiters",
    photo: "assets/activity-summit.jpg?v=24",
    body: "I welcome enquiries regarding 2027 UK PhD studentships in medicinal chemistry, process chemistry, organic synthesis, or drug delivery and formulation, as well as pharmaceutical R&D roles and research collaborations."
  }
};
