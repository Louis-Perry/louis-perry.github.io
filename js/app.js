/**
 * ============================================================================
 * SHARED PAGE ENGINE — LOUIS PERRY 7-PAGE ACADEMIC PORTFOLIO
 * ============================================================================
 * Renders the shared navbar, footer, page-specific content (from window.SITE_DATA),
 * the dynamic weaving treasure-map SVG trail on experience.html, the Scheme 1
 * lightbox on research.html, and the miniature Snow Globe on pages 2–7.
 * ============================================================================
 */

(function () {
  "use strict";

  const data = window.SITE_DATA;
  if (!data) return;

  const pageId = document.body.getAttribute("data-page") || "home";

  const ICONS = {
    linkedin:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>',
    github:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>',
    email:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    download:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    copy:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    compass:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    arrowDown:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatChem(str) {
    let s = escapeHtml(str);
    const rules = [
      [/\b1H\b/g, "<sup>1</sup>H"],
      [/\b13C\{1H\}/g, "<sup>13</sup>C{<sup>1</sup>H}"],
      [/\b13C\b/g, "<sup>13</sup>C"],
      [/\bSN2\b/g, "S<sub>N</sub>2"],
      [/\bPseudomonas aeruginosa\b/g, "<em>Pseudomonas aeruginosa</em>"],
      [/\bK\+O-t-Bu\b/g, "K<sup>+</sup>O<em>t</em>-Bu"],
      [/\bNH3\b/g, "NH<sub>3</sub>"],
      [/\bNH2\b/g, "NH<sub>2</sub>"],
      [/\bNaN3\b/g, "NaN<sub>3</sub>"],
      [/\bPPh3\b/g, "PPh<sub>3</sub>"],
      [/\bH2O\b/g, "H<sub>2</sub>O"],
      [/\bD2O\b/g, "D<sub>2</sub>O"],
      [/\bDMSO-d6\b/g, "DMSO-<em>d</em><sub>6</sub>"],
      [/\bDMF-d7\b/g, "DMF-<em>d</em><sub>7</sub>"],
      [/\bN2\b/g, "N<sub>2</sub>"],
      [/–CH3\b/g, "–CH<sub>3</sub>"]
    ];
    for (const [pattern, replacement] of rules) {
      s = s.replace(pattern, replacement);
    }
    return s;
  }

  /* ==========================================================================
     Shared Header, Mobile Drawer & Footer
     ========================================================================== */
  function renderChrome() {
    const { profile, nav } = data;
    const isHome = pageId === "home";

    const navItemsHtml = nav
      .map(
        (item) =>
          `<li><a href="${escapeHtml(item.href)}" class="${
            item.id === pageId ? "is-active" : ""
          }">${escapeHtml(item.label)}</a></li>`
      )
      .join("");

    const socialIcons = [
      profile.linkedin
        ? `<a class="nav-icon-link" href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">${ICONS.linkedin}</a>`
        : "",
      profile.github
        ? `<a class="nav-icon-link" href="${escapeHtml(profile.github)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">${ICONS.github}</a>`
        : "",
      profile.email
        ? `<a class="nav-icon-link" href="mailto:${escapeHtml(profile.email)}" aria-label="Email" title="Email">${ICONS.email}</a>`
        : ""
    ]
      .filter(Boolean)
      .join("");

    const headerMount = document.getElementById("site-header-mount");
    if (headerMount) {
      headerMount.innerHTML = `
        <a class="skip-link" href="#main-content">Skip to content</a>
        <header class="site-header${isHome ? " site-header--hero" : ""}" id="site-header">
          <div class="nav-inner">
            <div class="nav-left">
              <a class="brand" href="index.html">${escapeHtml(profile.name)}</a>
              <nav aria-label="Primary navigation">
                <ul class="nav-links">${navItemsHtml}</ul>
              </nav>
            </div>
            <div class="nav-icons" aria-label="External profiles">${socialIcons}</div>
            <button
              class="nav-toggle"
              id="nav-toggle"
              type="button"
              aria-expanded="false"
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>
        <div class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation">
          <ul>${navItemsHtml}</ul>
          <div class="mobile-menu-icons">${socialIcons}</div>
        </div>
      `;
    }

    const footerMount = document.getElementById("site-footer-mount");
    if (footerMount) {
      const year = new Date().getFullYear();
      footerMount.innerHTML = `
        <footer class="site-footer">
          <div class="container footer-inner">
            <span>&copy; ${year} ${escapeHtml(profile.name)} · ${escapeHtml(profile.location)}</span>
            <span class="footer-links">
              <a href="index.html">Home</a>
              <span aria-hidden="true">·</span>
              <a href="research.html">Research</a>
              <span aria-hidden="true">·</span>
              <a href="experience.html">Experience</a>
              <span aria-hidden="true">·</span>
              <a href="contact.html">Contact</a>
            </span>
          </div>
        </footer>
      `;
    }

    // Mobile menu toggle
    const toggleBtn = document.getElementById("nav-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
    if (toggleBtn && mobileMenu) {
      toggleBtn.addEventListener("click", () => {
        const isOpen = mobileMenu.classList.toggle("is-open");
        toggleBtn.setAttribute("aria-expanded", String(isOpen));
      });
      mobileMenu.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => {
          mobileMenu.classList.remove("is-open");
          toggleBtn.setAttribute("aria-expanded", "false");
        });
      });
    }

    // Navbar scroll behaviour:
    // - On Home: transparent over full-bleed hero -> transitions to warm ochre on scroll
    // - On subpages: warm ochre with headroom auto-hide on downward scroll
    const header = document.getElementById("site-header");
    let lastY = window.scrollY;
    function updateHeader() {
      const y = window.scrollY;
      const mobileOpen = mobileMenu?.classList.contains("is-open");
      if (isHome) {
        header?.classList.toggle("is-scrolled", y > 60);
        if (!mobileOpen && y > 420 && y > lastY + 5) {
          header?.classList.add("is-hidden");
        } else if (y < lastY - 5 || y <= 360) {
          header?.classList.remove("is-hidden");
        }
      } else {
        if (!mobileOpen && y > 110 && y > lastY + 5) {
          header?.classList.add("is-hidden");
        } else if (y < lastY - 5 || y <= 80) {
          header?.classList.remove("is-hidden");
        }
      }
      lastY = y;
    }
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  /* ==========================================================================
     Page 1: Home (Full-Bleed Hero with Subtle Linear Scroll-Down Parallax)
     ========================================================================== */
  function renderHomePage() {
    const { profile, worldIntro } = data;
    const mount = document.getElementById("page-content");
    if (!mount) return;

    mount.innerHTML = `
      <section class="home-hero" id="home-hero" aria-labelledby="home-hero-name">
        <div class="home-hero-media" aria-hidden="true">
          <img
            class="home-hero-fallback"
            src="${escapeHtml(profile.heroBgFallback)}"
            alt=""
          />
          <img
            class="home-hero-photo"
            id="home-hero-photo"
            src="${escapeHtml(profile.heroBg)}"
            alt=""
          />
          <div class="home-hero-overlay"></div>
        </div>

        <div class="home-hero-inner">
          <p class="home-hero-kicker">${escapeHtml(profile.kicker)}</p>
          <h1 class="home-hero-title" id="home-hero-name">${escapeHtml(profile.name)}</h1>
          <p class="home-hero-subtitle">${escapeHtml(profile.positioning)}</p>
          <p class="home-hero-intro">${formatChem(profile.heroIntro)}</p>

          <div class="home-hero-actions">
            <a class="hero-btn hero-btn--primary" href="#explore-world">
              ${ICONS.compass}
              <span>Explore My World</span>
            </a>
            <a class="hero-btn hero-btn--outline" href="${escapeHtml(profile.cvPath)}" target="_blank" rel="noopener noreferrer" download="Louis_Perry_CV.pdf">
              ${ICONS.download}
              <span>Download CV</span>
            </a>
            <a class="hero-btn hero-btn--ghost" href="contact.html">
              ${ICONS.email}
              <span>Get in Touch</span>
            </a>
          </div>
        </div>

        <a class="hero-scroll-cue" href="#explore-world" aria-label="Scroll down to interactive world map">
          <span class="hero-scroll-mouse" aria-hidden="true"></span>
          <span class="hero-scroll-label">Scroll to explore</span>
        </a>
      </section>

      <section class="home-intro-band">
        <div class="container">
          <div class="academic-strip academic-strip--centered" role="note">
            <span class="academic-strip-lead">${escapeHtml(profile.highlightBadge.lead)}</span>
            <span>${escapeHtml(profile.highlightBadge.detail)}</span>
          </div>
        </div>
      </section>

      <section class="world-section" id="explore-world" aria-labelledby="world-heading">
        <div class="container">
          <h2 id="world-heading">${escapeHtml(worldIntro.heading)}</h2>
          <p class="world-lead">${escapeHtml(worldIntro.lead)}</p>
        </div>

        <div class="world-bleed" id="home-world-map"></div>
      </section>
    `;

    const heroEl = document.getElementById("home-hero");
    const heroPhoto = document.getElementById("home-hero-photo");
    if (heroPhoto) {
      if (heroPhoto.complete && heroPhoto.naturalWidth > 0) {
        heroPhoto.classList.add("is-loaded");
      } else {
        heroPhoto.addEventListener("load", () => {
          heroPhoto.classList.add("is-loaded");
        });
        heroPhoto.addEventListener("error", () => {
          heroPhoto.style.display = "none";
        });
      }

      // Subtle constant-rate downward parallax as the user scrolls down past the hero
      function updateSubtleParallax() {
        const heroH = (heroEl && heroEl.offsetHeight) || 860;
        const maxShift = heroH * 0.19; // Strictly within the -20% top headroom -> zero blank edges!
        const y = Math.max(0, window.scrollY);
        const shift = Math.min(maxShift, y * 0.22);
        heroPhoto.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
      }

      let rafPending = false;
      window.addEventListener(
        "scroll",
        () => {
          if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(() => {
              rafPending = false;
              updateSubtleParallax();
            });
          }
        },
        { passive: true }
      );
      window.addEventListener("resize", updateSubtleParallax, { passive: true });
      updateSubtleParallax();
    }

    if (window.WorldMap) {
      window.WorldMap.renderWorldMap("home-world-map", "home");
    }
  }

  /* ==========================================================================
     Page 2: Research (Dissertation Spotlight)
     ========================================================================== */
  function renderResearchPage() {
    const r = data.featuredResearch;
    const mount = document.getElementById("page-content");
    if (!mount || !r) return;

    const pillsHtml = r.badges
      .map((b) => `<span class="pill pill--${escapeHtml(b.tone)}">${escapeHtml(b.label)}</span>`)
      .join("");

    const metricsHtml = r.metrics
      .map(
        (m) => `
          <div class="metric-card">
            <div class="metric-value">${formatChem(m.value)}</div>
            <div class="metric-label">${escapeHtml(m.label)}</div>
            <div class="metric-note">${formatChem(m.note)}</div>
          </div>
        `
      )
      .join("");

    const stepsHtml = r.approachSteps
      .map(
        (s) => `
          <div class="step-card">
            <div class="step-header">
              <span class="step-num">${escapeHtml(s.step)}</span>
              <span class="step-title">${escapeHtml(s.title)}</span>
            </div>
            <p>${formatChem(s.detail)}</p>
          </div>
        `
      )
      .join("");

    const takeawaysHtml = r.keyTakeaways.map((t) => `<li>${formatChem(t)}</li>`).join("");

    const docActionHtml = r.documentUrl
      ? `<a class="btn btn-secondary" href="${escapeHtml(r.documentUrl)}" target="_blank" rel="noopener noreferrer">${ICONS.download}<span>${escapeHtml(r.documentLabel || "View Dissertation")}</span></a>`
      : `<a class="prose-link" href="contact.html">Request full thesis PDF &rarr;</a>`;

    mount.innerHTML = `
      <div class="container page-body">
        <header class="page-header">
          <p class="page-kicker">${escapeHtml(r.eyebrow)}</p>
          <h1>${escapeHtml(r.sectionTitle)}</h1>
        </header>

        <section class="section">
          <h2 class="research-title research-title--standalone">${escapeHtml(r.title)}</h2>
          <p class="research-meta">${escapeHtml(r.supervisor)}</p>
          <div class="pill-row">${pillsHtml}</div>

          <figure class="figure-card">
            <button class="figure-image-btn" id="open-lightbox-btn" type="button" aria-label="Click to enlarge synthetic pathway diagram">
              <img src="${escapeHtml(r.figure.src)}" alt="${escapeHtml(r.figure.alt)}" />
            </button>
            <figcaption class="figure-caption">
              <div class="figure-caption-header">
                <strong>${escapeHtml(r.figure.captionTitle)}</strong>
                <span class="figure-zoom-inline" aria-hidden="true">Click scheme to enlarge</span>
              </div>
              <span>${formatChem(r.figure.captionBody)}</span>
              <div class="figure-conditions">${formatChem(r.figure.conditions)}</div>
            </figcaption>
          </figure>

          <div class="editorial-callout">
            <div class="editorial-callout-label">Research Objective</div>
            <p>${formatChem(r.objective)}</p>
          </div>

          <div class="metrics-grid">${metricsHtml}</div>

          <h3 class="subhead-mono">Synthetic &amp; Characterisation Approach</h3>
          <div class="steps-grid">${stepsHtml}</div>

          <h3 class="subhead-mono">Key Findings &amp; Takeaways</h3>
          <ul class="findings-list">${takeawaysHtml}</ul>

          <div class="research-footer">
            <span>${escapeHtml(r.requestNote)}</span>
            ${docActionHtml}
          </div>
        </section>
      </div>

      <div class="lightbox" id="figure-lightbox" role="dialog" aria-modal="true" aria-label="Enlarged research figure">
        <div class="lightbox-content">
          <button class="lightbox-close" id="lightbox-close" type="button" aria-label="Close enlarged figure">Close &times;</button>
          <img id="lightbox-img" src="" alt="" />
        </div>
      </div>
    `;

    // Wire lightbox
    const lightbox = document.getElementById("figure-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const openBtn = document.getElementById("open-lightbox-btn");
    const closeBtn = document.getElementById("lightbox-close");

    function closeLightbox() {
      lightbox?.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    openBtn?.addEventListener("click", () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = r.figure.src;
      lightboxImg.alt = r.figure.alt;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn?.focus();
    });
    closeBtn?.addEventListener("click", closeLightbox);
    lightbox?.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox?.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ==========================================================================
     Page 3: Experience (Topographical Map Background + Weaving Treasure Trail)
     ========================================================================== */
  function renderExperiencePage() {
    const mount = document.getElementById("page-content");
    if (!mount) return;

    const itemsHtml = data.experience
      .map((item, idx) => {
        const side = idx % 2 === 0 ? "left" : "right";
        const isX = item.waypoint === "X";
        const cardCls = item.isPlaceholder
          ? "trail-card trail-card--placeholder"
          : "trail-card";
        const tag = item.isPlaceholder
          ? `<div class="placeholder-tag">${escapeHtml(item.placeholderLabel)}</div>`
          : `<div class="trail-kicker">${escapeHtml(item.tag || "Milestone")}</div>`;
        const summary = item.summary
          ? `<p class="timeline-summary">${escapeHtml(item.summary)}</p>`
          : "";
        const bullets = item.bullets.map((b) => `<li>${formatChem(b)}</li>`).join("");
        const link = item.link
          ? `<p class="trail-card-link"><a class="prose-link" href="${escapeHtml(item.link.href)}">${escapeHtml(item.link.label)}</a></p>`
          : "";
        const note =
          item.isPlaceholder && item.note
            ? `<div class="placeholder-hint">${escapeHtml(item.note)}</div>`
            : "";
        const sidePhotoHtml = item.photo
          ? `
            <button class="trail-side-photo" type="button" data-lightbox-src="${escapeHtml(item.photo)}" aria-label="Enlarge photograph">
              <img src="${escapeHtml(item.photo)}" alt="" loading="lazy" />
            </button>
          `
          : "";

        return `
          <div class="trail-row trail-row--${side}${item.photo ? " trail-row--has-photo" : ""}">
            ${sidePhotoHtml}
            <div class="trail-node-wrap">
              <div class="trail-node${isX ? " trail-node--x" : ""}" data-trail-node="${idx}" aria-hidden="true">
                ${
                  isX
                    ? `<svg viewBox="0 0 28 28" width="22" height="22"><path d="M6 6 L22 22 M22 6 L6 22" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/></svg>`
                    : `<span>${escapeHtml(item.waypoint)}</span>`
                }
              </div>
            </div>

            <article class="${cardCls}">
              ${tag}
              <div class="timeline-top">
                <h2 class="timeline-role">${escapeHtml(item.role)}</h2>
                <span class="timeline-period">${escapeHtml(item.period)}</span>
              </div>
              <div class="timeline-org">${escapeHtml(item.organisation)} · ${escapeHtml(item.location)}</div>
              ${summary}
              <ul class="timeline-bullets">${bullets}</ul>
              ${link}
              ${note}
            </article>
          </div>
        `;
      })
      .join("");

    mount.innerHTML = `
      <div class="topo-canvas">
        <!-- Decorative Compass Rose Watermark -->
        <svg class="topo-compass" viewBox="0 0 180 180" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="1.2">
            <circle cx="90" cy="90" r="68" stroke-dasharray="3 4" />
            <circle cx="90" cy="90" r="54" />
            <path d="M90 12 L100 80 L90 90 L80 80 Z" fill="currentColor" fill-opacity="0.22" />
            <path d="M90 168 L100 100 L90 90 L80 100 Z" />
            <path d="M12 90 L80 80 L90 90 L80 100 Z" />
            <path d="M168 90 L100 80 L90 90 L100 100 Z" />
            <circle cx="90" cy="90" r="6" fill="currentColor" />
          </g>
          <text x="90" y="8" text-anchor="middle" font-family="'Roboto Mono', monospace" font-size="11" font-weight="700" fill="currentColor">N</text>
          <text x="90" y="179" text-anchor="middle" font-family="'Roboto Mono', monospace" font-size="10" fill="currentColor">S</text>
          <text x="4" y="94" text-anchor="middle" font-family="'Roboto Mono', monospace" font-size="10" fill="currentColor">W</text>
          <text x="176" y="94" text-anchor="middle" font-family="'Roboto Mono', monospace" font-size="10" fill="currentColor">E</text>
        </svg>

        <div class="container container--wide page-body">
          <header class="page-header page-header--centered">
            <p class="page-kicker">Field &amp; Industry Expedition Log</p>
            <h1>Experience</h1>
            <p class="page-subtitle">Follow the trail from undergraduate teaching and research labs into semiconductor materials manufacturing.</p>
          </header>

          <div class="treasure-trail" id="treasure-trail">
            <svg class="treasure-trail-svg" id="treasure-trail-svg" aria-hidden="true"></svg>
            <div class="treasure-trail-items">
              ${itemsHtml}
            </div>
          </div>
        </div>
      </div>

      <div class="lightbox" id="photo-lightbox" role="dialog" aria-modal="true" aria-label="Enlarged photograph">
        <div class="lightbox-content lightbox-content--photo">
          <button class="lightbox-close" id="photo-lightbox-close" type="button" aria-label="Close photograph">Close &times;</button>
          <img id="photo-lightbox-img" src="" alt="" />
        </div>
      </div>
    `;

    drawTreasureTrail();
    bindGalleryLightbox(mount);
  }

  /**
   * Dynamically computes a smooth weaving cubic-Bézier treasure-map dotted path
   * connecting every waypoint dot on experience.html (re-computes cleanly on resize!).
   */
  function drawTreasureTrail() {
    const container = document.getElementById("treasure-trail");
    const svg = document.getElementById("treasure-trail-svg");
    if (!container || !svg) return;

    function updatePath() {
      const rect = container.getBoundingClientRect();
      const nodes = Array.from(container.querySelectorAll("[data-trail-node]"));
      if (nodes.length < 2 || rect.width === 0) return;

      const points = nodes.map((node) => {
        const r = node.getBoundingClientRect();
        return {
          x: r.left - rect.left + r.width / 2,
          y: r.top - rect.top + r.height / 2
        };
      });

      const isMobile = rect.width < 760;
      const sway = isMobile ? 16 : Math.min(72, rect.width * 0.085);

      let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const dy = p2.y - p1.y;
        const dir = i % 2 === 0 ? 1 : -1;
        const c1x = p1.x + dir * sway;
        const c1y = p1.y + dy * 0.34;
        const c2x = p2.x - dir * sway;
        const c2y = p2.y - dy * 0.34;
        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }

      svg.setAttribute("viewBox", `0 0 ${rect.width.toFixed(0)} ${rect.height.toFixed(0)}`);
      svg.setAttribute("width", String(Math.round(rect.width)));
      svg.setAttribute("height", String(Math.round(rect.height)));

      svg.innerHTML = `
        <path d="${d}" fill="none" stroke="rgba(251, 244, 236, 0.85)" stroke-width="8" stroke-linecap="round" />
        <path d="${d}" fill="none" stroke="#a04a0d" stroke-width="3.2" stroke-dasharray="2 12" stroke-linecap="round" />
        <path d="${d}" fill="none" stroke="rgba(16, 91, 9, 0.22)" stroke-width="1.2" stroke-dasharray="6 14" stroke-dashoffset="6" stroke-linecap="round" />
      `;
    }

    updatePath();
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(updatePath);
      ro.observe(container);
    } else {
      window.addEventListener("resize", updatePath);
    }
    window.addEventListener("load", updatePath);
  }

  /* ==========================================================================
     Page 4: Education
     ========================================================================== */
  function renderEducationPage() {
    const mount = document.getElementById("page-content");
    if (!mount) return;

    const eduHtml = data.education
      .map((edu) => {
        const modules =
          edu.modules && edu.modules.length
            ? `<div class="module-tags" aria-label="Relevant modules">${edu.modules
                .map((m) => `<span class="module-tag">${escapeHtml(m)}</span>`)
                .join("")}</div>`
            : "";
        const highlights = edu.highlights.map((h) => `<li>${formatChem(h)}</li>`).join("");

        return `
          <article class="timeline-item">
            <div class="timeline-top">
              <h2 class="timeline-role">${escapeHtml(edu.degree)}</h2>
              <span class="timeline-period">${escapeHtml(edu.period)}</span>
            </div>
            <div class="timeline-org">${escapeHtml(edu.institution)}</div>
            <div class="edu-grade-line">${escapeHtml(edu.grade)}</div>
            <p class="edu-accred">${escapeHtml(edu.accreditation)}</p>
            ${modules}
            <ul class="timeline-bullets">${highlights}</ul>
          </article>
        `;
      })
      .join("");

    mount.innerHTML = `
      <div class="container page-body">
        <header class="page-header">
          <p class="page-kicker">Academic Background · Swansea University</p>
          <h1>Education</h1>
          <p class="page-subtitle">RSC-accredited undergraduate chemistry training grounded in physical chemistry, polymers, and semiconductor materials.</p>
        </header>

        <section class="section">
          <h2 class="subsection-heading">Qualifications</h2>
          <div class="timeline">${eduHtml}</div>
        </section>
      </div>
    `;
  }

  function bindGalleryLightbox(mount) {
    const lightbox = mount.querySelector("#photo-lightbox");
    const lightboxImg = mount.querySelector("#photo-lightbox-img");
    const closeBtn = mount.querySelector("#photo-lightbox-close");
    if (!lightbox || !lightboxImg) return;

    function closeLb() {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    mount.querySelectorAll("[data-lightbox-src]").forEach((btn) => {
      btn.addEventListener("click", () => {
        lightboxImg.src = btn.getAttribute("data-lightbox-src") || "";
        lightboxImg.alt = "";
        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
        closeBtn?.focus();
      });
    });

    closeBtn?.addEventListener("click", closeLb);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLb();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLb();
    });
  }

  /* ==========================================================================
     Page 5: Skills
     ========================================================================== */
  function renderSkillsPage() {
    const mount = document.getElementById("page-content");
    if (!mount) return;

    const groupsHtml = data.skillGroups
      .map(
        (group) => `
          <article class="skill-card">
            <h2>${escapeHtml(group.category)}</h2>
            ${group.summary ? `<p class="skill-summary">${escapeHtml(group.summary)}</p>` : ""}
            <ul class="skill-list">
              ${group.items.map((item) => `<li>${formatChem(item)}</li>`).join("")}
            </ul>
          </article>
        `
      )
      .join("");

    mount.innerHTML = `
      <div class="container page-body">
        <header class="page-header">
          <p class="page-kicker">Laboratory &amp; Analytical Capabilities</p>
          <h1>Technical &amp; Lab Skills</h1>
          <p class="page-subtitle">Practical synthetic methods, spectroscopic characterisation, and computational analysis developed across academic research and cleanroom industry.</p>
        </header>

        <section class="section">
          <div class="skills-grid">${groupsHtml}</div>
        </section>
      </div>
    `;
  }

  /* ==========================================================================
     Page 6: About Me (Alpine Summit Page)
     ========================================================================== */
  function renderAboutPage() {
    const { profile, aboutBeyondLab, membershipsAndAwards } = data;
    const mount = document.getElementById("page-content");
    if (!mount) return;

    const bioHtml = profile.bioParagraphs.map((p) => `<p>${formatChem(p)}</p>`).join("");
    const membershipsHtml = (membershipsAndAwards || [])
      .map(
        (c) => `
          <article class="beyond-card">
            <div class="beyond-card-top">
              <h3>${escapeHtml(c.title)}</h3>
              <span class="beyond-card-period">${escapeHtml(c.period)}</span>
            </div>
            <p>${escapeHtml(c.detail)}</p>
          </article>
        `
      )
      .join("");
    const beyondHtml = aboutBeyondLab
      .map((item) => {
        if (item.photos && item.photos.length) {
          const stripCls =
            item.photos.length > 1
              ? "beyond-card-photos beyond-card-photos--split"
              : "beyond-card-photos";
          const imgsHtml = item.photos
            .map(
              (src) => `
                <button class="beyond-photo-btn" type="button" data-lightbox-src="${escapeHtml(src)}" aria-label="Enlarge photograph">
                  <img src="${escapeHtml(src)}" alt="" loading="lazy" />
                </button>
              `
            )
            .join("");
          return `
            <article class="beyond-card beyond-card--has-media">
              <div class="${stripCls}">${imgsHtml}</div>
              <div class="beyond-card-body">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.detail)}</p>
              </div>
            </article>
          `;
        }
        if (item.sidePhoto) {
          return `
            <article class="beyond-card beyond-card--side-media">
              <div class="beyond-card-side-text">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.detail)}</p>
              </div>
              <button class="beyond-side-photo-btn" type="button" data-lightbox-src="${escapeHtml(item.sidePhoto)}" aria-label="Enlarge photograph">
                <img src="${escapeHtml(item.sidePhoto)}" alt="" loading="lazy" />
              </button>
            </article>
          `;
        }
        return `
          <article class="beyond-card">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.detail)}</p>
          </article>
        `;
      })
      .join("");

    mount.innerHTML = `
      <div class="container page-body">
        <header class="page-header">
          <p class="page-kicker">Alpine Summit · Personal Profile</p>
          <h1>About Me</h1>
          <p class="page-subtitle">${escapeHtml(profile.shortPositioning)}</p>
        </header>

        <section class="section">
          <div class="hero-grid">
            <div class="headshot-wrap">
              <div class="headshot-frame">
                <img
                  id="about-headshot"
                  src="${escapeHtml(profile.headshot)}"
                  alt="${escapeHtml(profile.headshotAlt)}"
                  width="180"
                  height="180"
                />
              </div>
            </div>

            <div class="hero-bio">
              ${bioHtml}
              <div class="hero-actions">
                <a class="btn btn-primary" href="${escapeHtml(profile.cvPath)}" target="_blank" rel="noopener noreferrer" download="Louis_Perry_CV.pdf">
                  ${ICONS.download}<span>Download CV</span>
                </a>
                <a class="btn btn-secondary" href="research.html">
                  <span>View Dissertation</span>
                </a>
                <a class="btn btn-secondary" href="contact.html">
                  ${ICONS.email}<span>Contact</span>
                </a>
              </div>
            </div>
          </div>

          <div class="academic-strip" role="note">
            <span class="academic-strip-lead">${escapeHtml(profile.highlightBadge.lead)}</span>
            <span>${escapeHtml(profile.highlightBadge.detail)}</span>
          </div>
        </section>

        <section class="section">
          <h2>Memberships &amp; Recognition</h2>
          <div class="beyond-grid beyond-grid--single">${membershipsHtml}</div>
        </section>

        <section class="section">
          <h2>Beyond the Lab</h2>
          <div class="beyond-grid">${beyondHtml}</div>
        </section>
      </div>

      <div class="lightbox" id="photo-lightbox" role="dialog" aria-modal="true" aria-label="Enlarged photograph">
        <div class="lightbox-content lightbox-content--photo">
          <button class="lightbox-close" id="photo-lightbox-close" type="button" aria-label="Close photograph">Close &times;</button>
          <img id="photo-lightbox-img" src="" alt="" />
        </div>
      </div>
    `;

    bindGalleryLightbox(mount);

    const img = document.getElementById("about-headshot");
    if (img && profile.headshotFallback) {
      img.addEventListener(
        "error",
        () => {
          if (img.getAttribute("src") !== profile.headshotFallback) {
            img.setAttribute("src", profile.headshotFallback);
          }
        },
        { once: true }
      );
    }
  }

  /* ==========================================================================
     Page 7: Contact
     ========================================================================== */
  function renderContactPage() {
    const { profile, contact } = data;
    const mount = document.getElementById("page-content");
    if (!mount) return;

    const placeholderItems = [];
    if (profile.emailIsPlaceholder) placeholderItems.push("personal email");
    if (profile.githubIsPlaceholder) placeholderItems.push("GitHub URL");
    const placeholderNote = placeholderItems.length
      ? `<p class="placeholder-inline-note">Note: Update your ${placeholderItems.join(" and ")} in <code>js/site-data.js</code> before deploying.</p>`
      : "";

    mount.innerHTML = `
      <div class="container page-body">
        <header class="page-header">
          <p class="page-kicker">Telephone Box · Direct Enquiries</p>
          <h1>${escapeHtml(contact.heading)}</h1>
          <p class="page-subtitle">${escapeHtml(contact.lead)}</p>
        </header>

        <section class="section">
          <div class="${contact.photo ? "contact-split" : ""}">
            <div class="contact-box">
            <p>${escapeHtml(contact.body)}</p>
            <div class="contact-actions">
              <a class="btn btn-primary" href="mailto:${escapeHtml(profile.email)}">
                ${ICONS.email}<span>${escapeHtml(profile.email)}</span>
              </a>
              <button class="btn btn-secondary" type="button" id="copy-email-btn">
                ${ICONS.copy}<span>Copy Email</span>
              </button>
              <a class="btn btn-secondary" href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noopener noreferrer">
                ${ICONS.linkedin}<span>LinkedIn</span>
              </a>
              ${
                profile.github
                  ? `<a class="btn btn-secondary" href="${escapeHtml(profile.github)}" target="_blank" rel="noopener noreferrer">${ICONS.github}<span>GitHub</span></a>`
                  : ""
              }
              <a class="btn btn-secondary" href="${escapeHtml(profile.cvPath)}" target="_blank" rel="noopener noreferrer" download="Louis_Perry_CV.pdf">
                ${ICONS.download}<span>Download CV</span>
              </a>
              <span class="copy-feedback" id="copy-feedback" role="status" aria-live="polite">Copied!</span>
            </div>
            ${placeholderNote}
            </div>
            ${
              contact.photo
                ? `<button class="contact-side-photo" type="button" data-lightbox-src="${escapeHtml(contact.photo)}" aria-label="Enlarge photograph"><img src="${escapeHtml(contact.photo)}" alt="" loading="lazy" /></button>`
                : ""
            }
          </div>
        </section>
      </div>

      <div class="lightbox" id="photo-lightbox" role="dialog" aria-modal="true" aria-label="Enlarged photograph">
        <div class="lightbox-content lightbox-content--photo">
          <button class="lightbox-close" id="photo-lightbox-close" type="button" aria-label="Close photograph">Close &times;</button>
          <img id="photo-lightbox-img" src="" alt="" />
        </div>
      </div>
    `;

    bindGalleryLightbox(mount);

    const copyBtn = document.getElementById("copy-email-btn");
    const feedback = document.getElementById("copy-feedback");
    if (copyBtn && feedback && navigator.clipboard) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(profile.email).then(() => {
          feedback.classList.add("is-visible");
          setTimeout(() => feedback.classList.remove("is-visible"), 2000);
        });
      });
    }
  }

  /* ==========================================================================
     Bootstrap Current Page
     ========================================================================== */
  renderChrome();

  const renderers = {
    home: renderHomePage,
    research: renderResearchPage,
    experience: renderExperiencePage,
    education: renderEducationPage,
    skills: renderSkillsPage,
    about: renderAboutPage,
    contact: renderContactPage
  };

  if (renderers[pageId]) {
    renderers[pageId]();
  }

  // Mount miniature Snow Globe navigator on pages 2–7
  if (pageId !== "home" && window.WorldMap) {
    window.WorldMap.mountSnowGlobe(pageId);
  }
})();
