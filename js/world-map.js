/**
 * ============================================================================
 * INTERACTIVE ISOMETRIC WORLD MAP & SNOW GLOBE NAVIGATOR (18x18 REFINED)
 * ============================================================================
 * True 2:1 isometric projection throughout:
 *   - Full-span wavy coastline + 3D timber beach pier/groyne extending into sea,
 *     full-depth water on bottom-left & diagonal sloping seabed wedge on bottom-right.
 *   - Mountain peak with natural rock cutouts cradling the Alpine Lodge & Tower,
 *     3D winding mountain switchback trail, and 3D recessed rock cave mouth.
 *   - Proper bottom-to-top tiered brick walls on Education Clock Tower (zero clipping).
 *   - Clean classic Stone & Clapboard Home Cottage (faithful to reference photo).
 *   - Warmly illuminated windows across buildings with miniature interior vignettes
 *     (cat on windowsill, classroom chalkboard & desks, bookshelves, tables & chairs, lab).
 *   - Properly scaled postbox & K6 telephone box, aligned car-park vehicles,
 *     and audited back-to-front tree placement with zero building clipping.
 * ============================================================================
 */

(function () {
  "use strict";

  const OX = 800;
  const OY = 162;
  const S = 44; // Isometric grid unit
  const COS = 0.8660254;
  const SIN = 0.5;
  const ISO_SLOPE = SIN / COS; // 0.5773503 (exact tan 30 deg for isometric wall skew)

  let svgInstanceCounter = 0;

  function iso(u, v, z = 0) {
    return [
      +(OX + (u - v) * S * COS).toFixed(1),
      +(OY + (u + v) * S * SIN - z).toFixed(1)
    ];
  }

  function pts(list) {
    return list.map(([u, v, z = 0]) => iso(u, v, z).join(",")).join(" ");
  }

  function poly(list, fill, stroke = "none", strokeWidth = 0, extra = "") {
    return `<polygon points="${pts(list)}" fill="${fill}"${
      stroke !== "none" ? ` stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round"` : ""
    }${extra ? " " + extra : ""} />`;
  }

  function lineIso(p1, p2, stroke, width = 1.5, extra = "") {
    const [x1, y1] = iso(p1[0], p1[1], p1[2] || 0);
    const [x2, y2] = iso(p2[0], p2[1], p2[2] || 0);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"${
      extra ? " " + extra : ""
    } />`;
  }

  function isoBox(u, v, z, du, dv, dz, topCol, leftCol, rightCol, stroke = "rgba(15,43,7,0.2)") {
    const top = [
      [u, v, z + dz],
      [u + du, v, z + dz],
      [u + du, v + dv, z + dz],
      [u, v + dv, z + dz]
    ];
    const left = [
      [u, v + dv, z],
      [u + du, v + dv, z],
      [u + du, v + dv, z + dz],
      [u, v + dv, z + dz]
    ];
    const right = [
      [u + du, v, z],
      [u + du, v + dv, z],
      [u + du, v + dv, z + dz],
      [u + du, v, z + dz]
    ];
    return [
      poly(left, leftCol, stroke, 0.75),
      poly(right, rightCol, stroke, 0.75),
      poly(top, topCol, stroke, 0.75)
    ].join("");
  }

  function isoRoofU(u, v, z, du, dv, peakH, slopeLeft, slopeRight, gableCol, hideRightGable = false) {
    const vMid = v + dv / 2;
    const fSlope = [
      [u, v + dv, z],
      [u + du, v + dv, z],
      [u + du, vMid, z + peakH],
      [u, vMid, z + peakH]
    ];
    const bSlope = [
      [u, v, z],
      [u + du, v, z],
      [u + du, vMid, z + peakH],
      [u, vMid, z + peakH]
    ];
    const gableRight = [
      [u + du, v, z],
      [u + du, v + dv, z],
      [u + du, vMid, z + peakH]
    ];
    return [
      poly(bSlope, slopeRight, "rgba(15,43,7,0.22)", 0.75),
      poly(fSlope, slopeLeft, "rgba(15,43,7,0.22)", 0.75),
      hideRightGable ? "" : poly(gableRight, gableCol, "rgba(15,43,7,0.22)", 0.75)
    ].join("");
  }

  function isoRoofV(u, v, z, du, dv, peakH, slopeFront, slopeBack, gableCol) {
    const uMid = u + du / 2;
    const frontSlope = [
      [u + du, v, z],
      [u + du, v + dv, z],
      [uMid, v + dv, z + peakH],
      [uMid, v, z + peakH]
    ];
    const backSlope = [
      [u, v, z],
      [u, v + dv, z],
      [uMid, v + dv, z + peakH],
      [uMid, v, z + peakH]
    ];
    const gableLeft = [
      [u, v + dv, z],
      [u + du, v + dv, z],
      [uMid, v + dv, z + peakH]
    ];
    return [
      poly(backSlope, slopeBack, "rgba(15,43,7,0.22)", 0.75),
      poly(frontSlope, slopeFront, "rgba(15,43,7,0.22)", 0.75),
      poly(gableLeft, gableCol, "rgba(15,43,7,0.22)", 0.75)
    ].join("");
  }

  function isoOctagonPrism(cu, cv, z, r, dz, topCol, faceCols, stroke = "rgba(15,43,7,0.22)") {
    const n = 8;
    const ring = [];
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n + Math.PI / 8;
      ring.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
    }
    const faces = [];
    for (let i = 0; i < n; i++) {
      const p1 = ring[i];
      const p2 = ring[(i + 1) % n];
      const depth = (p1[0] + p1[1] + p2[0] + p2[1]) / 2;
      faces.push({ i, p1, p2, depth });
    }
    faces.sort((a, b) => a.depth - b.depth);

    let out = "";
    faces.forEach((f, idx) => {
      const col = faceCols[idx % faceCols.length];
      out += poly(
        [
          [f.p1[0], f.p1[1], z],
          [f.p2[0], f.p2[1], z],
          [f.p2[0], f.p2[1], z + dz],
          [f.p1[0], f.p1[1], z + dz]
        ],
        col,
        stroke,
        0.7
      );
    });
    out += poly(
      ring.map(([u, v]) => [u, v, z + dz]),
      topCol,
      stroke,
      0.75
    );
    return out;
  }

  /* ==========================================================================
     ISOMETRIC WINDOWS WITH WARM INTERIOR LIGHTING & MINIATURE VIGNETTES
     Renders windows projected cleanly onto SW (u-spanning) or SE (v-spanning)
     walls using exact isometric shear matrices:
       - "cat"         : Warm lit room + sitting cat silhouette on windowsill
       - "classroom"   : Warm lit classroom + chalkboard & student desks/chairs
       - "bookshelves" : Warm lit room + tiered bookshelves & reading table/chairs
       - "tableChairs" : Warm lit room + pendant lamp, table & chairs
       - "lampBooks"   : Warm lit room + table lamp & small bookcase
       - "lab"         : Bright warm lab + lab bench, monitor, flasks & stool
       - "unlit"       : Cool reflective blue-slate glass with mullions
     ========================================================================== */
  function renderWindowInterior(w, h, scene, frameCol, mullionMode, isRightWall) {
    const f = (n) => +n.toFixed(1);
    const sil = "#2b1c12";
    const silSoft = "#523520";
    let inner = "";

    if (scene === "unlit") {
      const baseGlass = isRightWall ? "#5594b3" : "#74bddb";
      const deepGlass = isRightWall ? "#3e7691" : "#5aa3c2";
      inner += `<rect x="0" y="0" width="${f(w)}" height="${f(h)}" fill="${baseGlass}" />`;
      inner += `<rect x="0" y="0" width="${f(w)}" height="${f(h * 0.22)}" fill="${deepGlass}" opacity="0.65" />`;
      inner += `<polygon points="${f(w * 0.14)},${f(h)} ${f(w * 0.52)},0 ${f(w * 0.74)},0 ${f(w * 0.36)},${f(h)}" fill="#ffffff" opacity="0.28" />`;
    } else {
      // Warm illuminated interior room with 3D inner wall depth reveal
      const wallCol = scene === "lab" ? "#fff3bf" : "#ffe799";
      const sideCol = scene === "lab" ? "#f5d77f" : "#f0bd59";
      const floorCol = "#d99b38";
      const revealW = Math.min(3.2, w * 0.18);
      inner += `<rect x="0" y="0" width="${f(w)}" height="${f(h)}" fill="${wallCol}" />`;
      if (isRightWall) {
        inner += `<rect x="${f(w - revealW)}" y="0" width="${f(revealW)}" height="${f(h)}" fill="${sideCol}" />`;
      } else {
        inner += `<rect x="0" y="0" width="${f(revealW)}" height="${f(h)}" fill="${sideCol}" />`;
      }
      inner += `<rect x="0" y="${f(h * 0.82)}" width="${f(w)}" height="${f(h * 0.18)}" fill="${floorCol}" opacity="0.55" />`;
      // Subtle warm ceiling glow
      inner += `<ellipse cx="${f(w * 0.5)}" cy="${f(h * 0.14)}" rx="${f(w * 0.36)}" ry="${f(h * 0.14)}" fill="#fffdf2" opacity="0.7" />`;

      if (scene === "cat") {
        // Sitting cat silhouette perched on the windowsill (body + head + 2 pointed ears + curved tail!)
        const cx = w * 0.54;
        const sy = h * 0.92;
        inner += `
          <!-- Soft curtain drape on left -->
          <path d="M0,0 L${f(w * 0.24)},0 Q${f(w * 0.2)},${f(h * 0.48)} ${f(w * 0.08)},${f(h * 0.88)} L0,${f(h * 0.88)} Z" fill="#d97b38" opacity="0.45" />
          <!-- Cat body & haunches -->
          <ellipse cx="${f(cx)}" cy="${f(sy - h * 0.22)}" rx="${f(w * 0.15)}" ry="${f(h * 0.21)}" fill="${sil}" />
          <!-- Cat head -->
          <circle cx="${f(cx - w * 0.02)}" cy="${f(sy - h * 0.48)}" r="${f(Math.min(w * 0.12, h * 0.14))}" fill="${sil}" />
          <!-- Left & right pointed cat ears -->
          <polygon points="${f(cx - w * 0.12)},${f(sy - h * 0.54)} ${f(cx - w * 0.09)},${f(sy - h * 0.72)} ${f(cx - w * 0.02)},${f(sy - h * 0.58)}" fill="${sil}" />
          <polygon points="${f(cx - w * 0.01)},${f(sy - h * 0.58)} ${f(cx + w * 0.06)},${f(sy - h * 0.72)} ${f(cx + w * 0.09)},${f(sy - h * 0.54)}" fill="${sil}" />
          <!-- Curled cat tail -->
          <path d="M${f(cx + w * 0.11)},${f(sy - h * 0.08)} C${f(cx + w * 0.28)},${f(sy - h * 0.1)} ${f(cx + w * 0.28)},${f(sy - h * 0.42)} ${f(cx + w * 0.19)},${f(sy - h * 0.45)}"
            fill="none" stroke="${sil}" stroke-width="1.45" stroke-linecap="round" />
        `;
      } else if (scene === "classroom") {
        // Classroom green/slate chalkboard on back wall + two student desks & chairs!
        inner += `
          <!-- Classroom chalkboard with wooden chalkledge -->
          <rect x="${f(w * 0.16)}" y="${f(h * 0.16)}" width="${f(w * 0.68)}" height="${f(h * 0.36)}" rx="0.6" fill="#274f3a" stroke="#7d4e27" stroke-width="0.8" />
          <line x1="${f(w * 0.24)}" y1="${f(h * 0.28)}" x2="${f(w * 0.62)}" y2="${f(h * 0.28)}" stroke="#d9f0e1" stroke-width="0.65" opacity="0.8" />
          <line x1="${f(w * 0.24)}" y1="${f(h * 0.38)}" x2="${f(w * 0.5)}" y2="${f(h * 0.38)}" stroke="#d9f0e1" stroke-width="0.65" opacity="0.7" />
          <!-- Student desks & chair silhouettes in foreground -->
          <rect x="${f(w * 0.14)}" y="${f(h * 0.68)}" width="${f(w * 0.3)}" height="${f(h * 0.08)}" fill="${sil}" />
          <line x1="${f(w * 0.2)}" y1="${f(h * 0.76)}" x2="${f(w * 0.2)}" y2="${f(h * 0.94)}" stroke="${sil}" stroke-width="1.0" />
          <line x1="${f(w * 0.38)}" y1="${f(h * 0.76)}" x2="${f(w * 0.38)}" y2="${f(h * 0.94)}" stroke="${sil}" stroke-width="1.0" />
          <path d="M${f(w * 0.09)},${f(h * 0.58)} L${f(w * 0.09)},${f(h * 0.92)} M${f(w * 0.09)},${f(h * 0.77)} L${f(w * 0.2)},${f(h * 0.77)}" stroke="${silSoft}" stroke-width="1.0" fill="none" />

          <rect x="${f(w * 0.56)}" y="${f(h * 0.68)}" width="${f(w * 0.3)}" height="${f(h * 0.08)}" fill="${sil}" />
          <line x1="${f(w * 0.62)}" y1="${f(h * 0.76)}" x2="${f(w * 0.62)}" y2="${f(h * 0.94)}" stroke="${sil}" stroke-width="1.0" />
          <line x1="${f(w * 0.8)}" y1="${f(h * 0.76)}" x2="${f(w * 0.8)}" y2="${f(h * 0.94)}" stroke="${sil}" stroke-width="1.0" />
          <path d="M${f(w * 0.51)},${f(h * 0.58)} L${f(w * 0.51)},${f(h * 0.92)} M${f(w * 0.51)},${f(h * 0.77)} L${f(w * 0.62)},${f(h * 0.77)}" stroke="${silSoft}" stroke-width="1.0" fill="none" />
        `;
      } else if (scene === "bookshelves") {
        // Tiered library bookshelves with vertical book spines + reading table & chairs below!
        const shelfW = w * 0.74;
        const sx = w * 0.13;
        inner += `
          <rect x="${f(sx)}" y="${f(h * 0.12)}" width="${f(shelfW)}" height="${f(h * 0.54)}" fill="#8c5428" opacity="0.38" />
          <line x1="${f(sx)}" y1="${f(h * 0.28)}" x2="${f(sx + shelfW)}" y2="${f(h * 0.28)}" stroke="#5c3416" stroke-width="1.0" />
          <line x1="${f(sx)}" y1="${f(h * 0.45)}" x2="${f(sx + shelfW)}" y2="${f(h * 0.45)}" stroke="#5c3416" stroke-width="1.0" />
          <line x1="${f(sx)}" y1="${f(h * 0.62)}" x2="${f(sx + shelfW)}" y2="${f(h * 0.62)}" stroke="#5c3416" stroke-width="1.0" />
          <!-- Miniature book spines on shelves -->
          <rect x="${f(sx + 1.2)}" y="${f(h * 0.15)}" width="1.8" height="${f(h * 0.12)}" fill="#9c2f1c" />
          <rect x="${f(sx + 3.4)}" y="${f(h * 0.17)}" width="1.6" height="${f(h * 0.1)}" fill="#25546b" />
          <rect x="${f(sx + 5.4)}" y="${f(h * 0.14)}" width="2.0" height="${f(h * 0.13)}" fill="#3d2412" />
          <rect x="${f(sx + shelfW - 4.8)}" y="${f(h * 0.16)}" width="1.8" height="${f(h * 0.11)}" fill="#3a6b24" />
          <rect x="${f(sx + 1.5)}" y="${f(h * 0.32)}" width="2.0" height="${f(h * 0.12)}" fill="#25546b" />
          <rect x="${f(sx + 4.0)}" y="${f(h * 0.34)}" width="1.7" height="${f(h * 0.1)}" fill="#9c2f1c" />
          <rect x="${f(sx + 6.3)}" y="${f(h * 0.31)}" width="1.9" height="${f(h * 0.13)}" fill="#3d2412" />
          <rect x="${f(sx + 2.0)}" y="${f(h * 0.49)}" width="2.2" height="${f(h * 0.12)}" fill="#5c3416" />
          <rect x="${f(sx + 4.8)}" y="${f(h * 0.5)}" width="1.8" height="${f(h * 0.11)}" fill="#9c2f1c" />
          <!-- Foreground study table & two chairs -->
          <rect x="${f(w * 0.26)}" y="${f(h * 0.75)}" width="${f(w * 0.48)}" height="${f(h * 0.07)}" fill="${sil}" />
          <line x1="${f(w * 0.33)}" y1="${f(h * 0.82)}" x2="${f(w * 0.33)}" y2="${f(h * 0.96)}" stroke="${sil}" stroke-width="1.0" />
          <line x1="${f(w * 0.67)}" y1="${f(h * 0.82)}" x2="${f(w * 0.67)}" y2="${f(h * 0.96)}" stroke="${sil}" stroke-width="1.0" />
          <path d="M${f(w * 0.16)},${f(h * 0.65)} L${f(w * 0.16)},${f(h * 0.95)} M${f(w * 0.16)},${f(h * 0.82)} L${f(w * 0.29)},${f(h * 0.82)}" stroke="${sil}" stroke-width="1.05" fill="none" />
          <path d="M${f(w * 0.84)},${f(h * 0.65)} L${f(w * 0.84)},${f(h * 0.95)} M${f(w * 0.71)},${f(h * 0.82)} L${f(w * 0.84)},${f(h * 0.82)}" stroke="${sil}" stroke-width="1.05" fill="none" />
        `;
      } else if (scene === "tableChairs") {
        // Warm pendant ceiling lamp + dining/study table & two chairs facing each other!
        inner += `
          <line x1="${f(w * 0.5)}" y1="0" x2="${f(w * 0.5)}" y2="${f(h * 0.24)}" stroke="${silSoft}" stroke-width="0.8" />
          <polygon points="${f(w * 0.36)},${f(h * 0.28)} ${f(w * 0.64)},${f(h * 0.28)} ${f(w * 0.56)},${f(h * 0.19)} ${f(w * 0.44)},${f(h * 0.19)}" fill="#d46b1f" />
          <!-- Table -->
          <rect x="${f(w * 0.26)}" y="${f(h * 0.68)}" width="${f(w * 0.48)}" height="${f(h * 0.08)}" fill="${sil}" />
          <line x1="${f(w * 0.34)}" y1="${f(h * 0.76)}" x2="${f(w * 0.34)}" y2="${f(h * 0.95)}" stroke="${sil}" stroke-width="1.0" />
          <line x1="${f(w * 0.66)}" y1="${f(h * 0.76)}" x2="${f(w * 0.66)}" y2="${f(h * 0.95)}" stroke="${sil}" stroke-width="1.0" />
          <!-- Left & Right Chairs -->
          <path d="M${f(w * 0.15)},${f(h * 0.54)} L${f(w * 0.15)},${f(h * 0.95)} M${f(w * 0.15)},${f(h * 0.77)} L${f(w * 0.28)},${f(h * 0.77)} L${f(w * 0.28)},${f(h * 0.95)}" stroke="${sil}" stroke-width="1.1" fill="none" />
          <path d="M${f(w * 0.85)},${f(h * 0.54)} L${f(w * 0.85)},${f(h * 0.95)} M${f(w * 0.85)},${f(h * 0.77)} L${f(w * 0.72)},${f(h * 0.77)} L${f(w * 0.72)},${f(h * 0.95)}" stroke="${sil}" stroke-width="1.1" fill="none" />
        `;
      } else if (scene === "lampBooks") {
        // Cozy side table with glowing lampshade + side bookshelf
        inner += `
          <line x1="${f(w * 0.14)}" y1="${f(h * 0.32)}" x2="${f(w * 0.48)}" y2="${f(h * 0.32)}" stroke="${silSoft}" stroke-width="1.0" />
          <line x1="${f(w * 0.14)}" y1="${f(h * 0.52)}" x2="${f(w * 0.48)}" y2="${f(h * 0.52)}" stroke="${silSoft}" stroke-width="1.0" />
          <rect x="${f(w * 0.18)}" y="${f(h * 0.19)}" width="1.8" height="${f(h * 0.12)}" fill="#9c2f1c" />
          <rect x="${f(w * 0.31)}" y="${f(h * 0.21)}" width="1.8" height="${f(h * 0.1)}" fill="#25546b" />
          <rect x="${f(w * 0.2)}" y="${f(h * 0.39)}" width="2.2" height="${f(h * 0.12)}" fill="${sil}" />
          <!-- Table lamp -->
          <polygon points="${f(w * 0.58)},${f(h * 0.56)} ${f(w * 0.84)},${f(h * 0.56)} ${f(w * 0.78)},${f(h * 0.38)} ${f(w * 0.64)},${f(h * 0.38)}" fill="#e07428" />
          <line x1="${f(w * 0.71)}" y1="${f(h * 0.56)}" x2="${f(w * 0.71)}" y2="${f(h * 0.72)}" stroke="${sil}" stroke-width="1.1" />
          <rect x="${f(w * 0.56)}" y="${f(h * 0.72)}" width="${f(w * 0.3)}" height="${f(h * 0.22)}" fill="${sil}" />
        `;
      } else if (scene === "lab") {
        // Chemistry / R&D lab interior: overhead task light, benchtop, monitor, Erlenmeyer flask & lab stool!
        inner += `
          <rect x="${f(w * 0.2)}" y="${f(h * 0.14)}" width="${f(w * 0.6)}" height="1.6" rx="0.7" fill="#ffffff" stroke="#8a99a3" stroke-width="0.4" />
          <!-- Lab benchtop -->
          <rect x="${f(w * 0.08)}" y="${f(h * 0.68)}" width="${f(w * 0.84)}" height="${f(h * 0.09)}" fill="#37444d" />
          <rect x="${f(w * 0.12)}" y="${f(h * 0.77)}" width="${f(w * 0.24)}" height="${f(h * 0.2)}" fill="#5c6c78" />
          <!-- Monitor silhouette on left -->
          <rect x="${f(w * 0.16)}" y="${f(h * 0.42)}" width="${f(w * 0.22)}" height="${f(h * 0.2)}" rx="0.8" fill="#233038" />
          <line x1="${f(w * 0.27)}" y1="${f(h * 0.62)}" x2="${f(w * 0.27)}" y2="${f(h * 0.68)}" stroke="#233038" stroke-width="1.2" />
          <!-- Conical flask & reagent bottle silhouettes on right -->
          <polygon points="${f(w * 0.62)},${f(h * 0.68)} ${f(w * 0.76)},${f(h * 0.68)} ${f(w * 0.71)},${f(h * 0.52)} ${f(w * 0.71)},${f(h * 0.45)} ${f(w * 0.67)},${f(h * 0.45)} ${f(w * 0.67)},${f(h * 0.52)}" fill="#1e7d8c" opacity="0.88" />
          <rect x="${f(w * 0.8)}" y="${f(h * 0.51)}" width="${f(w * 0.08)}" height="${f(h * 0.17)}" rx="0.6" fill="#bd5620" opacity="0.85" />
          <!-- Lab stool silhouette -->
          <rect x="${f(w * 0.44)}" y="${f(h * 0.76)}" width="${f(w * 0.15)}" height="1.8" rx="0.7" fill="#1e272e" />
          <line x1="${f(w * 0.515)}" y1="${f(h * 0.78)}" x2="${f(w * 0.515)}" y2="${f(h * 0.96)}" stroke="#1e272e" stroke-width="1.2" />
        `;
      }
    }

    // Window mullions + outer frame
    let mullions = "";
    if (mullionMode === "cross") {
      mullions = `
        <line x1="${f(w * 0.5)}" y1="0" x2="${f(w * 0.5)}" y2="${f(h)}" stroke="${frameCol}" stroke-width="0.85" opacity="0.9" />
        <line x1="0" y1="${f(h * 0.48)}" x2="${f(w)}" y2="${f(h * 0.48)}" stroke="${frameCol}" stroke-width="0.8" opacity="0.9" />
      `;
    } else if (mullionMode === "tallGrid") {
      mullions = `
        <line x1="${f(w * 0.5)}" y1="0" x2="${f(w * 0.5)}" y2="${f(h)}" stroke="${frameCol}" stroke-width="0.85" opacity="0.9" />
        <line x1="0" y1="${f(h * 0.34)}" x2="${f(w)}" y2="${f(h * 0.34)}" stroke="${frameCol}" stroke-width="0.75" opacity="0.88" />
        <line x1="0" y1="${f(h * 0.67)}" x2="${f(w)}" y2="${f(h * 0.67)}" stroke="${frameCol}" stroke-width="0.75" opacity="0.88" />
      `;
    } else if (mullionMode === "wideLab") {
      mullions = `
        <line x1="${f(w * 0.34)}" y1="0" x2="${f(w * 0.34)}" y2="${f(h)}" stroke="${frameCol}" stroke-width="0.9" opacity="0.85" />
        <line x1="${f(w * 0.68)}" y1="0" x2="${f(w * 0.68)}" y2="${f(h)}" stroke="${frameCol}" stroke-width="0.9" opacity="0.85" />
      `;
    }

    const outerFrame = `<rect x="0" y="0" width="${f(w)}" height="${f(h)}" fill="none" stroke="${frameCol}" stroke-width="1.05" />`;
    const sill = `<line x1="-0.8" y1="${f(h)}" x2="${f(w + 0.8)}" y2="${f(h)}" stroke="${frameCol}" stroke-width="1.4" stroke-linecap="round" />`;
    return `${inner}${mullions}${outerFrame}${sill}`;
  }

  // Window on a SW-facing wall (constant v, spanning u .. u + du, z .. z + dz)
  function isoWindowU(u, v, z, du, dz, scene = "unlit", frameCol = "#fffaf0", mullionMode = "cross") {
    const [wx, wy] = iso(u, v, z + dz);
    const w = du * S * COS;
    const h = dz;
    return `<g transform="translate(${wx.toFixed(1)}, ${wy.toFixed(1)}) matrix(1, ${ISO_SLOPE.toFixed(5)}, 0, 1, 0, 0)">${renderWindowInterior(
      w,
      h,
      scene,
      frameCol,
      mullionMode,
      false
    )}</g>`;
  }

  // Window on an SE-facing wall (constant u, spanning v .. v + dv, z .. z + dz)
  function isoWindowV(u, v, z, dv, dz, scene = "unlit", frameCol = "#f7e3c4", mullionMode = "cross") {
    const [wx, wy] = iso(u, v + dv, z + dz);
    const w = dv * S * COS;
    const h = dz;
    return `<g transform="translate(${wx.toFixed(1)}, ${wy.toFixed(1)}) matrix(1, ${(-ISO_SLOPE).toFixed(5)}, 0, 1, 0, 0)">${renderWindowInterior(
      w,
      h,
      scene,
      frameCol,
      mullionMode,
      true
    )}</g>`;
  }

  /* ==========================================================================
     UNIFIED BOTANICAL TREE & SHRUB ILLUSTRATION FAMILY
     ========================================================================== */
  function canopyTree(u, v, z = 0, scale = 1, variant = 0) {
    const [x, y] = iso(u, v, z);
    const palettes = [
      { dark: "#2a7a1c", mid: "#3f9c2c", hi: "#78cf52" },
      { dark: "#236b18", mid: "#358c25", hi: "#6bc447" },
      { dark: "#33821f", mid: "#4ca832", hi: "#88db5e" }
    ];
    const pal = palettes[variant % palettes.length];
    const s = scale;
    return `
      <g class="map-prop">
        <ellipse cx="${(x + 3.5 * s).toFixed(1)}" cy="${(y + 1.8 * s).toFixed(1)}" rx="${(13 * s).toFixed(1)}" ry="${(6.8 * s).toFixed(1)}" fill="rgba(15,43,7,0.2)" />
        <rect x="${(x - 2.2 * s).toFixed(1)}" y="${(y - 14 * s).toFixed(1)}" width="${(4.4 * s).toFixed(1)}" height="${(14.5 * s).toFixed(1)}" rx="1.6" fill="#78451e" stroke="rgba(15,43,7,0.25)" stroke-width="0.6" />
        <circle cx="${(x + 5.5 * s).toFixed(1)}" cy="${(y - 18.5 * s).toFixed(1)}" r="${(8.8 * s).toFixed(1)}" fill="${pal.dark}" stroke="rgba(15,43,7,0.22)" stroke-width="0.7" />
        <circle cx="${(x - 5.5 * s).toFixed(1)}" cy="${(y - 19.5 * s).toFixed(1)}" r="${(9.2 * s).toFixed(1)}" fill="${pal.mid}" stroke="rgba(15,43,7,0.22)" stroke-width="0.7" />
        <circle cx="${x.toFixed(1)}" cy="${(y - 25 * s).toFixed(1)}" r="${(10.5 * s).toFixed(1)}" fill="${pal.mid}" stroke="rgba(15,43,7,0.22)" stroke-width="0.7" />
        <circle cx="${(x - 3.2 * s).toFixed(1)}" cy="${(y - 27.5 * s).toFixed(1)}" r="${(6.2 * s).toFixed(1)}" fill="${pal.hi}" opacity="0.65" />
      </g>
    `;
  }

  function tallParkTree(u, v, z = 0, scale = 1) {
    const [x, y] = iso(u, v, z);
    const s = scale;
    return `
      <g class="map-prop">
        <ellipse cx="${(x + 3 * s).toFixed(1)}" cy="${(y + 1.5 * s).toFixed(1)}" rx="${(9 * s).toFixed(1)}" ry="${(4.8 * s).toFixed(1)}" fill="rgba(15,43,7,0.2)" />
        <rect x="${(x - 1.9 * s).toFixed(1)}" y="${(y - 10 * s).toFixed(1)}" width="${(3.8 * s).toFixed(1)}" height="${(10.5 * s).toFixed(1)}" rx="1.4" fill="#73411b" stroke="rgba(15,43,7,0.25)" stroke-width="0.6" />
        <circle cx="${x.toFixed(1)}" cy="${(y - 15 * s).toFixed(1)}" r="${(8.5 * s).toFixed(1)}" fill="#2b7d1d" stroke="rgba(15,43,7,0.22)" stroke-width="0.7" />
        <circle cx="${x.toFixed(1)}" cy="${(y - 23 * s).toFixed(1)}" r="${(7.4 * s).toFixed(1)}" fill="#3c9629" stroke="rgba(15,43,7,0.22)" stroke-width="0.7" />
        <circle cx="${x.toFixed(1)}" cy="${(y - 30 * s).toFixed(1)}" r="${(5.6 * s).toFixed(1)}" fill="#4ca834" stroke="rgba(15,43,7,0.22)" stroke-width="0.7" />
        <circle cx="${(x - 2 * s).toFixed(1)}" cy="${(y - 31.5 * s).toFixed(1)}" r="${(3.2 * s).toFixed(1)}" fill="#82d959" opacity="0.65" />
      </g>
    `;
  }

  function alpineSpruce(u, v, z = 0, scale = 1) {
    const [x, y] = iso(u, v, z);
    const s = scale;
    return `
      <g class="map-prop">
        <ellipse cx="${(x + 2 * s).toFixed(1)}" cy="${(y + 1.2 * s).toFixed(1)}" rx="${(9.5 * s).toFixed(1)}" ry="${(4.6 * s).toFixed(1)}" fill="rgba(15,43,7,0.22)" />
        <rect x="${(x - 1.7 * s).toFixed(1)}" y="${(y - 6.5 * s).toFixed(1)}" width="${(3.4 * s).toFixed(1)}" height="${(7 * s).toFixed(1)}" rx="1.2" fill="#693a17" />
        <path d="M${x} ${(y - 19 * s).toFixed(1)} C${(x - 6 * s).toFixed(1)} ${(y - 14 * s).toFixed(1)} ${(x - 10.5 * s).toFixed(1)} ${(y - 8 * s).toFixed(1)} ${(x - 9.5 * s).toFixed(1)} ${(y - 5.5 * s).toFixed(1)} Q${x} ${(y - 2.5 * s).toFixed(1)} ${(x + 9.5 * s).toFixed(1)} ${(y - 5.5 * s).toFixed(1)} C${(x + 10.5 * s).toFixed(1)} ${(y - 8 * s).toFixed(1)} ${(x + 6 * s).toFixed(1)} ${(y - 14 * s).toFixed(1)} ${x} ${(y - 19 * s).toFixed(1)} Z"
          fill="#1f6619" stroke="rgba(15,43,7,0.24)" stroke-width="0.7" />
        <path d="M${x} ${(y - 25 * s).toFixed(1)} C${(x - 5 * s).toFixed(1)} ${(y - 20 * s).toFixed(1)} ${(x - 8.5 * s).toFixed(1)} ${(y - 14.5 * s).toFixed(1)} ${(x - 7.8 * s).toFixed(1)} ${(y - 12.2 * s).toFixed(1)} Q${x} ${(y - 9.5 * s).toFixed(1)} ${(x + 7.8 * s).toFixed(1)} ${(y - 12.2 * s).toFixed(1)} C${(x + 8.5 * s).toFixed(1)} ${(y - 14.5 * s).toFixed(1)} ${(x + 5 * s).toFixed(1)} ${(y - 20 * s).toFixed(1)} ${x} ${(y - 25 * s).toFixed(1)} Z"
          fill="#2c8022" stroke="rgba(15,43,7,0.24)" stroke-width="0.7" />
        <path d="M${x} ${(y - 30.5 * s).toFixed(1)} C${(x - 3.6 * s).toFixed(1)} ${(y - 26.5 * s).toFixed(1)} ${(x - 6.2 * s).toFixed(1)} ${(y - 21.5 * s).toFixed(1)} ${(x - 5.5 * s).toFixed(1)} ${(y - 19.5 * s).toFixed(1)} Q${x} ${(y - 17.5 * s).toFixed(1)} ${(x + 5.5 * s).toFixed(1)} ${(y - 19.5 * s).toFixed(1)} C${(x + 6.2 * s).toFixed(1)} ${(y - 21.5 * s).toFixed(1)} ${(x + 3.6 * s).toFixed(1)} ${(y - 26.5 * s).toFixed(1)} ${x} ${(y - 30.5 * s).toFixed(1)} Z"
          fill="#3d9c2e" stroke="rgba(15,43,7,0.24)" stroke-width="0.7" />
        <ellipse cx="${(x - 1.5 * s).toFixed(1)}" cy="${(y - 24 * s).toFixed(1)}" rx="${(2 * s).toFixed(1)}" ry="${(3.2 * s).toFixed(1)}" fill="#7ad450" opacity="0.45" />
      </g>
    `;
  }

  function bush(u, v, z = 0, r = 6.5, col = "#449e2b") {
    const [x, y] = iso(u, v, z);
    return `
      <g class="map-prop">
        <ellipse cx="${(x + 1.5).toFixed(1)}" cy="${(y + 1.5).toFixed(1)}" rx="${(r * 1.1).toFixed(1)}" ry="${(r * 0.55).toFixed(1)}" fill="rgba(15,43,7,0.18)" />
        <circle cx="${(x - r * 0.35).toFixed(1)}" cy="${(y - r * 0.45).toFixed(1)}" r="${(r * 0.78).toFixed(1)}" fill="${col}" stroke="rgba(15,43,7,0.22)" stroke-width="0.6" />
        <circle cx="${(x + r * 0.38).toFixed(1)}" cy="${(y - r * 0.42).toFixed(1)}" r="${(r * 0.72).toFixed(1)}" fill="#2e7d1d" stroke="rgba(15,43,7,0.22)" stroke-width="0.6" />
        <circle cx="${x.toFixed(1)}" cy="${(y - r * 0.72).toFixed(1)}" r="${(r * 0.85).toFixed(1)}" fill="${col}" stroke="rgba(15,43,7,0.22)" stroke-width="0.6" />
        <circle cx="${(x - r * 0.22).toFixed(1)}" cy="${(y - r * 0.95).toFixed(1)}" r="${(r * 0.45).toFixed(1)}" fill="#84db5c" opacity="0.6" />
      </g>
    `;
  }

  function beachUmbrella3D(u, v, colA = "#dc3418", colB = "#fffaf0", towelCol = "#ffbe2e") {
    const [sx, sy] = iso(u, v, 0);
    const apex = [u, v, 23];
    const r = 0.52;
    const zRim = 15.5;
    const gores = [];
    const n = 6;
    for (let i = 0; i < n; i++) {
      const a1 = (i * 2 * Math.PI) / n + 0.25;
      const a2 = ((i + 1) * 2 * Math.PI) / n + 0.25;
      const p1 = [u + r * Math.cos(a1), v + r * Math.sin(a1), zRim];
      const p2 = [u + r * Math.cos(a2), v + r * Math.sin(a2), zRim];
      const depth = (p1[0] + p1[1] + p2[0] + p2[1]) / 2;
      gores.push({ i, p1, p2, depth });
    }
    gores.sort((a, b) => a.depth - b.depth);

    return `
      <g class="map-prop">
        ${isoBox(u - 0.62, v + 0.08, 0, 0.52, 0.28, 2.2, towelCol, "#c98c24", "#9e6a14", "rgba(15,43,7,0.22)")}
        ${poly([[u - 0.62, v + 0.08, 2.3], [u - 0.46, v + 0.08, 5.5], [u - 0.46, v + 0.36, 5.5], [u - 0.62, v + 0.36, 2.3]], "#fffaf0", "rgba(15,43,7,0.22)", 0.6)}
        <ellipse cx="${(sx + 3).toFixed(1)}" cy="${(sy + 2).toFixed(1)}" rx="17" ry="9" fill="rgba(15,43,7,0.2)" />
        ${lineIso([u, v, 0], [u, v, 22], "#5c3314", 2.3, 'stroke-linecap="round"')}
        ${gores
          .map((g) => {
            const baseCol = g.i % 2 === 0 ? colA : colB;
            return poly([g.p1, g.p2, apex], baseCol, "rgba(15,43,7,0.26)", 0.7);
          })
          .join("")}
        ${(() => {
          const [ax, ay] = iso(u, v, 23.5);
          return `<circle cx="${ax}" cy="${ay}" r="1.8" fill="#ffbe2e" stroke="#5c3314" stroke-width="0.6" />`;
        })()}
      </g>
    `;
  }

  /**
   * True 3D Isometric Timber Beach Pier / Coastal Groyne extending from dry sand
   * partially out into the turquoise water!
   */
  function beachPier3D(u0 = 7.2) {
    const du = 0.68;
    const vStart = 15.96;
    const vEnd = 17.34;
    const dv = vEnd - vStart;
    const pileVs = [16.06, 16.38, 16.72, 17.04, 17.3];

    // Water ripples around outer submerged timber pilings
    let ripples = "";
    [16.72, 17.04, 17.3].forEach((pv) => {
      [u0 + 0.06, u0 + du - 0.06].forEach((pu) => {
        const [rx, ry] = iso(pu, pv, 0.2);
        ripples += `<ellipse cx="${rx}" cy="${ry}" rx="6.5" ry="3.2" fill="none" stroke="#c4f7fc" stroke-width="1.1" opacity="0.82" />`;
      });
    });

    // Soft cast shadow on sand & water under pier deck
    const pierShadow = poly(
      [
        [u0 + 0.06, vStart, 0.2],
        [u0 + du + 0.14, vStart, 0.2],
        [u0 + du + 0.14, vEnd + 0.04, 0.2],
        [u0 + 0.06, vEnd + 0.04, 0.2]
      ],
      "rgba(12, 45, 54, 0.24)"
    );

    // 3D Vertical wooden groyne/pier pilings descending into sand & sea
    let lowerPiles = "";
    pileVs.forEach((pv) => {
      const inSea = pv > 16.52;
      const pLeft = inSea ? "#4a2c14" : "#6b411f";
      const pRight = inSea ? "#331c0b" : "#4d2d14";
      lowerPiles += isoBox(u0 + 0.02, pv - 0.05, 0.2, 0.1, 0.1, 5.2, "#7d4e27", pLeft, pRight, "rgba(15,43,7,0.25)");
      lowerPiles += isoBox(u0 + du - 0.12, pv - 0.05, 0.2, 0.1, 0.1, 5.2, "#7d4e27", pLeft, pRight, "rgba(15,43,7,0.25)");
    });

    // Sloped wooden approach ramp from coastal promenade onto pier deck
    const ramp =
      poly(
        [
          [u0, 15.68, 0.4],
          [u0 + du, 15.68, 0.4],
          [u0 + du, vStart, 6.2],
          [u0, vStart, 6.2]
        ],
        "#cfa065",
        "#825728",
        0.75
      ) +
      poly(
        [
          [u0 + du, 15.68, 0.4],
          [u0 + du, vStart, 0.4],
          [u0 + du, vStart, 6.2]
        ],
        "#875a29",
        "rgba(15,43,7,0.22)",
        0.65
      );

    // 3D Planked Timber Deck
    const deck = isoBox(u0, vStart, 4.4, du, dv, 1.8, "#d9a668", "#b37f44", "#855a2b", "rgba(15,43,7,0.26)");
    let planks = "";
    for (let pv = vStart + 0.14; pv < vEnd - 0.06; pv += 0.15) {
      planks += lineIso([u0 + 0.03, pv, 6.25], [u0 + du - 0.03, pv, 6.25], "#8f6130", 0.85);
    }

    // Upper timber mooring bollards & low side rails sorted back-to-front
    const bollardVs = [16.04, 16.66, 17.28];
    let bollards = "";
    bollardVs.forEach((bv) => {
      bollards += isoBox(u0 + 0.01, bv - 0.05, 6.2, 0.1, 0.1, 4.2, "#ebd7be", "#9e6b36", "#6e471f", "rgba(15,43,7,0.25)");
      bollards += isoBox(u0 + du - 0.11, bv - 0.05, 6.2, 0.1, 0.1, 4.2, "#ebd7be", "#9e6b36", "#6e471f", "rgba(15,43,7,0.25)");
    });
    const rails =
      lineIso([u0 + 0.06, 16.04, 9.2], [u0 + 0.06, 17.28, 9.2], "#b88449", 1.5) +
      lineIso([u0 + du - 0.06, 16.04, 9.2], [u0 + du - 0.06, 17.28, 9.2], "#8f6230", 1.5);

    // Classic seaside red-and-white lifebuoy mounted at seaward pier end
    const [lx, ly] = iso(u0 + du * 0.5, vEnd, 7.6);
    const lifebuoy = `
      <circle cx="${lx}" cy="${ly}" r="3.4" fill="none" stroke="#ffffff" stroke-width="1.8" />
      <circle cx="${lx}" cy="${ly}" r="3.4" fill="none" stroke="#dc3418" stroke-width="1.8" stroke-dasharray="3.2 3.2" />
    `;

    return `<g class="map-prop">${ripples}${pierShadow}${lowerPiles}${ramp}${deck}${planks}${rails}${bollards}${lifebuoy}</g>`;
  }

  function streetLamp(u, v, z = 0, armDir = 1) {
    const [x, y] = iso(u, v, z);
    const tipX = x + armDir * 7;
    return `
      <g class="map-prop">
        <ellipse cx="${x}" cy="${y}" rx="3.5" ry="1.8" fill="rgba(15,43,7,0.22)" />
        <path d="M${x} ${y} L${x} ${y - 28} L${tipX} ${y - 31}" fill="none" stroke="#2c352d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <ellipse cx="${tipX}" cy="${y - 30.5}" rx="3.5" ry="2" fill="#ffcf4a" stroke="#b84309" stroke-width="0.7" />
      </g>
    `;
  }

  function benchU(u, v, z = 0) {
    return (
      isoBox(u, v, z, 0.48, 0.18, 4, "#d48a46", "#b56e2d", "#8c511c") +
      isoBox(u, v, z + 4, 0.48, 0.05, 4.5, "#e09852", "#c47b35", "#995c22")
    );
  }

  function benchV(u, v, z = 0) {
    return (
      isoBox(u, v, z, 0.18, 0.48, 4, "#d48a46", "#b56e2d", "#8c511c") +
      isoBox(u, v, z + 4, 0.05, 0.48, 4.5, "#e09852", "#c47b35", "#995c22")
    );
  }

  function trafficLight(u, v, z = 0) {
    const [x, y] = iso(u, v, z);
    return `
      <g class="map-prop">
        <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 27}" stroke="#232b24" stroke-width="2.2" />
        <rect x="${x - 3.2}" y="${y - 31}" width="6.4" height="13" rx="1.8" fill="#1e261f" stroke="#fffaf0" stroke-width="0.5" />
        <circle cx="${x}" cy="${y - 28}" r="1.4" fill="#eb3b1e" />
        <circle cx="${x}" cy="${y - 24.5}" r="1.4" fill="#ffbe2e" />
        <circle cx="${x}" cy="${y - 21}" r="1.4" fill="#29cc44" />
      </g>
    `;
  }

  function crosswalkAcrossU(uPos, vStart, vEnd, count = 5) {
    let out = "";
    const span = vEnd - vStart;
    const step = span / (count * 2 - 1);
    for (let i = 0; i < count; i++) {
      const va = vStart + i * 2 * step;
      const vb = va + step * 1.05;
      out += poly([[uPos, va, 0], [uPos + 0.48, va, 0], [uPos + 0.48, vb, 0], [uPos, vb, 0]], "#fffaf0", "none", 0, 'opacity="0.92"');
    }
    return out;
  }

  function crosswalkAcrossV(uStart, uEnd, vPos, count = 5) {
    let out = "";
    const span = uEnd - uStart;
    const step = span / (count * 2 - 1);
    for (let i = 0; i < count; i++) {
      const ua = uStart + i * 2 * step;
      const ub = ua + step * 1.05;
      out += poly([[ua, vPos, 0], [ub, vPos, 0], [ub, vPos + 0.48, 0], [ua, vPos + 0.48, 0]], "#fffaf0", "none", 0, 'opacity="0.92"');
    }
    return out;
  }

  function isoVehicleU(u, v, dir, bodyTop, bodyLeft, bodyRight, roofTop, isVan = false, zBase = 0) {
    const len = isVan ? 0.88 : 0.76;
    const wid = 0.42;
    const u0 = u - len / 2;
    const v0 = v - wid / 2;
    const [w1x, w1y] = iso(u0 + 0.18, v0 + wid, zBase + 2.5);
    const [w2x, w2y] = iso(u0 + len - 0.18, v0 + wid, zBase + 2.5);

    const shadow = poly(
      [[u0 - 0.04, v0 + 0.04, zBase], [u0 + len + 0.04, v0 + 0.04, zBase], [u0 + len + 0.04, v0 + wid + 0.06, zBase], [u0 - 0.04, v0 + wid + 0.06, zBase]],
      "rgba(15,43,7,0.26)"
    );
    const chassis = isoBox(u0, v0, zBase + 2, len, wid, isVan ? 8.5 : 6.5, bodyTop, bodyLeft, bodyRight, "rgba(15,43,7,0.28)");
    const cabinU = isVan ? u0 + 0.06 : dir > 0 ? u0 + 0.12 : u0 + 0.2;
    const cabinLen = isVan ? len - 0.12 : len * 0.56;
    const cabin = isoBox(
      cabinU,
      v0 + 0.04,
      zBase + (isVan ? 10.5 : 8.5),
      cabinLen,
      wid - 0.08,
      isVan ? 6.5 : 5.8,
      roofTop,
      "#274b59",
      "#1b3842",
      "rgba(15,43,7,0.28)"
    );
    const wheels = `
      <circle cx="${w1x}" cy="${w1y}" r="3.1" fill="#1b211c" stroke="#cfd6d1" stroke-width="0.8" />
      <circle cx="${w2x}" cy="${w2y}" r="3.1" fill="#1b211c" stroke="#cfd6d1" stroke-width="0.8" />
    `;
    const lightCol = dir > 0 ? "#fff3a1" : "#ff4429";
    const frontLights = poly(
      [[u0 + len + 0.01, v0 + 0.06, zBase + 4], [u0 + len + 0.01, v0 + 0.15, zBase + 4], [u0 + len + 0.01, v0 + 0.15, zBase + 6.5], [u0 + len + 0.01, v0 + 0.06, zBase + 6.5]],
      lightCol
    );
    return `<g class="map-prop">${shadow}${chassis}${cabin}${frontLights}${wheels}</g>`;
  }

  function isoVehicleV(u, v, dir, bodyTop, bodyLeft, bodyRight, roofTop, zBase = 0) {
    const wid = 0.4;
    const len = 0.74;
    const u0 = u - wid / 2;
    const v0 = v - len / 2;
    const [w1x, w1y] = iso(u0 + wid, v0 + 0.18, zBase + 2.5);
    const [w2x, w2y] = iso(u0 + wid, v0 + len - 0.18, zBase + 2.5);
    const shadow = poly(
      [[u0 + 0.04, v0 - 0.04, zBase], [u0 + wid + 0.06, v0 - 0.04, zBase], [u0 + wid + 0.06, v0 + len + 0.04, zBase], [u0 + 0.04, v0 + len + 0.04, zBase]],
      "rgba(15,43,7,0.26)"
    );
    const chassis = isoBox(u0, v0, zBase + 2, wid, len, 6.5, bodyTop, bodyLeft, bodyRight, "rgba(15,43,7,0.28)");
    const cabinV = dir > 0 ? v0 + 0.12 : v0 + 0.2;
    const cabin = isoBox(u0 + 0.04, cabinV, zBase + 8.5, wid - 0.08, len * 0.56, 5.8, roofTop, "#274b59", "#1b3842", "rgba(15,43,7,0.28)");
    const lightCol = dir > 0 ? "#fff3a1" : "#ff4429";
    const lights = poly(
      [[u0 + 0.06, v0 + len + 0.01, zBase + 4], [u0 + 0.15, v0 + len + 0.01, zBase + 4], [u0 + 0.15, v0 + len + 0.01, zBase + 6.3], [u0 + 0.06, v0 + len + 0.01, zBase + 6.3]],
      lightCol
    ) + poly(
      [[u0 + wid - 0.15, v0 + len + 0.01, zBase + 4], [u0 + wid - 0.06, v0 + len + 0.01, zBase + 4], [u0 + wid - 0.06, v0 + len + 0.01, zBase + 6.3], [u0 + wid - 0.15, v0 + len + 0.01, zBase + 6.3]],
      lightCol
    );
    const wheels = `
      <circle cx="${w1x}" cy="${w1y}" r="3.0" fill="#1b211c" stroke="#cfd6d1" stroke-width="0.8" />
      <circle cx="${w2x}" cy="${w2y}" r="3.0" fill="#1b211c" stroke="#cfd6d1" stroke-width="0.8" />
    `;
    return `<g class="map-prop">${shadow}${chassis}${cabin}${lights}${wheels}</g>`;
  }

  function speechBubble(x, y, title, isCurrent) {
    const w = Math.max(title.length * 10.6 + 34, 96);
    const h = 34;
    const rx = x - w / 2;
    const ry = y - h - 10;
    const badgeFill = isCurrent ? "#0d3816" : "#ffdfab";
    const titleFill = isCurrent ? "#fffaf0" : "#0f2b07";
    const strokeCol = isCurrent ? "#ffbe2e" : "#e5942e";

    return `
      <g class="landmark-label${isCurrent ? " is-current-label" : ""}">
        <rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${w.toFixed(1)}" height="${h}" rx="12"
          fill="${badgeFill}" stroke="${strokeCol}" stroke-width="1.8" filter="url(#labelShadow)" />
        <polygon points="${(x - 7).toFixed(1)},${(ry + h - 0.5).toFixed(1)} ${(x + 7).toFixed(1)},${(ry + h - 0.5).toFixed(1)} ${x.toFixed(1)},${(ry + h + 8).toFixed(1)}"
          fill="#ffbe2e" />
        <text x="${x.toFixed(1)}" y="${(ry + 22).toFixed(1)}" text-anchor="middle"
          font-family="'Roboto Mono', monospace" font-size="14" font-weight="700" fill="${titleFill}">${title}</text>
      </g>
    `;
  }

  function currentPin(x, y) {
    return `
      <g transform="translate(${x.toFixed(1)}, ${y.toFixed(1)})">
        <g class="you-are-here-pin">
          <path d="M0 0 C-7 -10 -12 -16 -12 -23 A12 12 0 1 1 12 -23 C12 -16 7 -10 0 0 Z"
            fill="#0d3816" stroke="#ffbe2e" stroke-width="2.2" />
          <circle cx="0" cy="-23" r="4.5" fill="#ffbe2e" />
        </g>
      </g>
    `;
  }

  function buildCoastCurvePoints(uStart, uEnd, steps, vFn) {
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const u = uStart + ((uEnd - uStart) * i) / steps;
      out.push([u, vFn(u), 0]);
    }
    return out;
  }

  function svgPathFromIsoPoints(isoTupleList, closePolygon = false) {
    const coords = isoTupleList.map(([u, v, z = 0]) => iso(u, v, z));
    let d = `M ${coords[0][0]} ${coords[0][1]}`;
    for (let i = 1; i < coords.length; i++) {
      d += ` L ${coords[i][0]} ${coords[i][1]}`;
    }
    if (closePolygon) d += " Z";
    return d;
  }

  /**
   * Samples a smooth Catmull-Rom spline in 3D isometric space (u, v, z) and builds
   * a true 3D perspective mountain trail ribbon with a shaded down-slope earthen bank!
   */
  function build3DWindingTrail(waypoints, halfWidth = 0.21, bankDrop = 3.0) {
    function catmull(p0, p1, p2, p3, t) {
      const t2 = t * t;
      const t3 = t2 * t;
      return [0, 1, 2].map(
        (k) =>
          0.5 *
          (2 * p1[k] +
            (-p0[k] + p2[k]) * t +
            (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
            (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
      );
    }

    const centers = [];
    const segSamples = 10;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p0 = waypoints[Math.max(0, i - 1)];
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const p3 = waypoints[Math.min(waypoints.length - 1, i + 2)];
      const limit = i === waypoints.length - 2 ? segSamples : segSamples - 1;
      for (let s = 0; s <= limit; s++) {
        centers.push(catmull(p0, p1, p2, p3, s / segSamples));
      }
    }

    const leftEdge = [];
    const rightEdge = [];
    for (let i = 0; i < centers.length; i++) {
      const prev = centers[Math.max(0, i - 1)];
      const next = centers[Math.min(centers.length - 1, i + 1)];
      let du = next[0] - prev[0];
      let dv = next[1] - prev[1];
      const len = Math.hypot(du, dv) || 1;
      du /= len;
      dv /= len;
      // Normal in (u, v) ground plane so horizontal turns Stay Wide and climbing legs Foreshorten naturally!
      const nu = -dv * halfWidth;
      const nv = du * halfWidth;
      const c = centers[i];
      leftEdge.push([c[0] + nu, c[1] + nv, c[2]]);
      rightEdge.push([c[0] - nu, c[1] - nv, c[2]]);
    }

    // Build 3D down-slope cut-bank quads along whichever side faces forward (+u + +v)
    let bankQuads = "";
    for (let i = 0; i < centers.length - 1; i++) {
      const l1 = leftEdge[i];
      const l2 = leftEdge[i + 1];
      const r1 = rightEdge[i];
      const r2 = rightEdge[i + 1];
      const useLeft = l1[0] + l1[1] >= r1[0] + r1[1];
      const e1 = useLeft ? l1 : r1;
      const e2 = useLeft ? l2 : r2;
      bankQuads += poly(
        [
          [e1[0], e1[1], e1[2]],
          [e2[0], e2[1], e2[2]],
          [e2[0], e2[1], Math.max(0, e2[2] - bankDrop)],
          [e1[0], e1[1], Math.max(0, e1[2] - bankDrop)]
        ],
        "#6e583b"
      );
    }

    const ribbonPts = [...leftEdge, ...rightEdge.slice().reverse()];
    const centerLineD = svgPathFromIsoPoints(centers, false);
    const leftKerbsD = svgPathFromIsoPoints(leftEdge, false);
    const rightKerbsD = svgPathFromIsoPoints(rightEdge, false);

    return `
      ${bankQuads}
      ${poly(ribbonPts, "#e3bf88", "#8f714a", 0.9)}
      <path d="${centerLineD}" fill="none" stroke="#cfa469" stroke-width="1.8" stroke-dasharray="4 3" opacity="0.78" />
      <path d="${leftKerbsD}" fill="none" stroke="#856843" stroke-width="1.0" opacity="0.8" />
      <path d="${rightKerbsD}" fill="none" stroke="#856843" stroke-width="1.0" opacity="0.8" />
    `;
  }

  /**
   * Builds the full 18x18 refined isometric world SVG.
   */
  function buildWorldSvg(options = {}) {
    const currentPage = options.currentPage || "";
    const showCurrent = Boolean(options.showCurrent);
    const uid = ++svgInstanceCounter;
    const coastClipId = `coastClip_${uid}`;
    const seaGradId = `seaGrad_${uid}`;
    const cvHref =
      (window.SITE_DATA && window.SITE_DATA.profile && window.SITE_DATA.profile.cvPath) ||
      "assets/Louis_Perry_CV.pdf";

    // --- 1. FULL-SPAN WAVY SHORELINE, SLOPING CROSS-SECTION & 3D BEACH PIER ---
    const vDune = (u) => 15.82 + 0.11 * Math.sin(u * 0.56 + 0.4);
    const vShore = (u) => 16.65 + 0.23 * Math.sin(u * 0.72 - 0.35) + 0.11 * Math.cos(u * 1.5 + 0.7);
    const vWet = (u) => vShore(u) - 0.24;
    const vSwell = (u) => Math.min(17.92, vShore(u) + 0.42 + 0.08 * Math.sin(u * 1.25));

    const vRightShore = vShore(18);
    const vRightSand = vDune(18);

    const dunePts = buildCoastCurvePoints(-0.2, 18.2, 50, vDune);
    const wetPts = buildCoastCurvePoints(-0.2, 18.2, 56, vWet);
    const shorePts = buildCoastCurvePoints(-0.2, 18.2, 60, vShore);
    const swellPts = buildCoastCurvePoints(-0.2, 18.2, 56, vSwell);

    const beachSandPath = svgPathFromIsoPoints([...dunePts, [18.2, 18.2, 0], [-0.2, 18.2, 0]], true);
    const wetSandPath = svgPathFromIsoPoints([...wetPts, [18.2, 18.2, 0], [-0.2, 18.2, 0]], true);
    const seaSurfacePath = svgPathFromIsoPoints([...shorePts, [18.2, 18.2, 0], [-0.2, 18.2, 0]], true);
    const foamLine1 = svgPathFromIsoPoints(shorePts, false);
    const foamLine2 = svgPathFromIsoPoints(swellPts, false);

    const groundAndCoast = [
      // Bottom-Right (SE, u = 18) cross-section face with diagonal sloping ocean wedge
      poly([[18, 0, 0], [18, 18, 0], [18, 18, -24], [18, 0, -24]], "#996030", "rgba(15,43,7,0.18)", 0.8),
      poly([[18, 0, -13], [18, 18, -13], [18, 18, -24], [18, 0, -24]], "#784820"),
      poly(
        [
          [18, vRightSand, 0],
          [18, vRightShore, 0],
          [18, 18, -24],
          [18, vRightShore - 0.18, -5]
        ],
        "#cfa04e"
      ),
      poly(
        [
          [18, vRightShore, 0],
          [18, 18, 0],
          [18, 18, -24]
        ],
        "#0d6a82"
      ),
      lineIso([18, vRightShore, 0], [18, 18, 0], "#7ae4f0", 1.1),

      // Bottom-Left (SW, v = 18) full-span ocean cross-section
      poly([[0, 18, 0], [18, 18, 0], [18, 18, -24], [0, 18, -24]], "#117a94", "rgba(15,43,7,0.18)", 0.8),
      poly([[0, 18, -12], [18, 18, -12], [18, 18, -24], [0, 18, -24]], "#0c6278"),
      lineIso([0, 18, 0], [18, 18, 0], "#8cf0fa", 1.2),

      // Main sunlit island grass surface
      poly([[0, 0, 0], [18, 0, 0], [18, 18, 0], [0, 18, 0]], "#64aa38", "#4b8c25", 1),
      poly([[0.2, 0.2, 0], [6.7, 0.2, 0], [6.7, 6.6, 0], [0.2, 6.6, 0]], "#54962c"),
      poly([[0.3, 8.2, 0], [6.7, 8.2, 0], [6.7, 14.2, 0], [0.3, 14.2, 0]], "#6cb33f"),
      poly([[13.6, 8.2, 0], [17.8, 8.2, 0], [17.8, 14.2, 0], [13.6, 14.2, 0]], "#6eb542"),

      // Static wavy beach sand & turquoise ocean
      `<g clip-path="url(#${coastClipId})">
        <path d="${beachSandPath}" fill="#f6c667" />
        <path d="${svgPathFromIsoPoints(dunePts, false)}" fill="none" stroke="#dda242" stroke-width="2.2" opacity="0.7" />
        <path d="${wetSandPath}" fill="#df9e3d" opacity="0.78" />
        <path d="${seaSurfacePath}" fill="url(#${seaGradId})" />
        <path d="${foamLine1}" fill="none" stroke="#ffffff" stroke-width="3.4" stroke-linecap="round" opacity="0.94" />
        <path d="${foamLine2}" fill="none" stroke="#bdf3f8" stroke-width="2.0" stroke-linecap="round" opacity="0.72" />
      </g>`,

      // 3D Timber Beach Pier / Groyne going partially into the ocean + 3D Beach Umbrellas!
      beachPier3D(7.2),
      beachUmbrella3D(3.25, 16.22, "#dc3418", "#fffaf0", "#ffbe2e"),
      beachUmbrella3D(12.35, 16.18, "#1b8ea6", "#fffaf0", "#eb5234")
    ].join("");

    // --- 2. RAISED SIDEWALKS, ASPHALT AVENUES, CROSSWALKS & ALIGNED PARKING BAYS ---
    const roadsAndSidewalks = [
      isoBox(8.2, 1.2, 0, 4.2, 5.5, 2.5, "#ebe1cf", "#cfc2aa", "#b8aa90"),
      isoBox(13.5, 1.2, 0, 4.2, 5.5, 2.5, "#e6dcc8", "#cbc0a8", "#b3a68c"),
      isoBox(0.5, 8.1, 0, 6.3, 6.2, 2.5, "#72ba44", "#cfc2aa", "#b8aa90"),
      poly([[0.5, 8.1, 2.6], [6.8, 8.1, 2.6], [6.8, 8.55, 2.6], [0.5, 8.55, 2.6]], "#ebe1cf"),
      poly([[6.35, 8.1, 2.6], [6.8, 8.1, 2.6], [6.8, 14.3, 2.6], [6.35, 14.3, 2.6]], "#ebe1cf"),
      poly([[0.5, 13.85, 2.6], [6.8, 13.85, 2.6], [6.8, 14.3, 2.6], [0.5, 14.3, 2.6]], "#ebe1cf"),
      isoBox(8.2, 8.1, 0, 4.2, 6.2, 2.5, "#ebe1cf", "#cfc2aa", "#b8aa90"),
      poly([[8.55, 8.45, 2.7], [12.05, 8.45, 2.7], [12.05, 12.65, 2.7], [8.55, 12.65, 2.7]], "#6eb840"),
      isoBox(13.5, 8.1, 0, 4.2, 6.2, 2.5, "#6fb842", "#cfc2aa", "#b8aa90"),
      poly([[13.5, 8.1, 2.6], [17.7, 8.1, 2.6], [17.7, 8.5, 2.6], [13.5, 8.5, 2.6]], "#ebe1cf"),
      poly([[13.5, 8.1, 2.6], [13.9, 8.1, 2.6], [13.9, 14.3, 2.6], [13.5, 14.3, 2.6]], "#ebe1cf"),
      poly([[13.5, 13.9, 2.6], [17.7, 13.9, 2.6], [17.7, 14.3, 2.6], [13.5, 14.3, 2.6]], "#ebe1cf"),

      // Asphalt Avenues
      poly([[0, 6.7, 0], [18, 6.7, 0], [18, 8.1, 0], [0, 8.1, 0]], "#585955"),
      poly([[0, 14.3, 0], [18, 14.3, 0], [18, 15.7, 0], [0, 15.7, 0]], "#5f605b"),
      poly([[6.8, 1.2, 0], [8.2, 1.2, 0], [8.2, 15.7, 0], [6.8, 15.7, 0]], "#585955"),
      poly([[12.4, 1.2, 0], [13.5, 1.2, 0], [13.5, 15.7, 0], [12.4, 15.7, 0]], "#5d5e59"),

      // 3-Bay Aligned Car Park behind Research Lab (bays run along v: u = 15.50..16.15..16.80..17.45)
      poly([[15.42, 1.4, 2.7], [17.56, 1.4, 2.7], [17.56, 3.35, 2.7], [15.42, 3.35, 2.7]], "#666863"),
      lineIso([15.5, 1.48, 2.8], [17.45, 1.48, 2.8], "#fffaf0", 1.4),
      lineIso([15.5, 1.48, 2.8], [15.5, 2.46, 2.8], "#fffaf0", 1.5),
      lineIso([16.15, 1.48, 2.8], [16.15, 2.46, 2.8], "#fffaf0", 1.5),
      lineIso([16.8, 1.48, 2.8], [16.8, 2.46, 2.8], "#fffaf0", 1.5),
      lineIso([17.45, 1.48, 2.8], [17.45, 2.46, 2.8], "#fffaf0", 1.5),
      poly([[15.54, 2.68, 2.8], [16.02, 2.68, 2.8], [16.02, 3.18, 2.8], [15.54, 3.18, 2.8]], "#2274b8", "#fffaf0", 0.7),
      (() => {
        const [px, py] = iso(15.45, 3.3, 2.8);
        return `
          <line x1="${px}" y1="${py}" x2="${px}" y2="${py - 18}" stroke="#2b332c" stroke-width="1.6" />
          <rect x="${px - 5.5}" y="${py - 27}" width="11" height="11" rx="2" fill="#2274b8" stroke="#fffaf0" stroke-width="0.9" />
          <text x="${px}" y="${py - 18.8}" text-anchor="middle" font-family="'Roboto Mono', monospace" font-size="8" font-weight="700" fill="#fffaf0">P</text>
        `;
      })(),

      // Dashed lane dividers
      (() => {
        let m = "";
        for (let u = 0.4; u <= 17.4; u += 0.85) {
          if ((u > 6.2 && u < 8.6) || (u > 11.8 && u < 13.9)) continue;
          m += lineIso([u, 7.4, 0.2], [u + 0.44, 7.4, 0.2], "#fff7e6", 1.7, 'opacity="0.88"');
          m += lineIso([u, 15.0, 0.2], [u + 0.44, 15.0, 0.2], "#fff7e6", 1.7, 'opacity="0.88"');
        }
        m += lineIso([0, 15.52, 0.2], [18, 15.52, 0.2], "#f5d78e", 1.1, 'stroke-dasharray="5 4" opacity="0.8"');
        for (let v = 1.6; v <= 13.6; v += 0.85) {
          if (v > 6.1 && v < 8.6) continue;
          m += lineIso([7.5, v, 0.2], [7.5, v + 0.44, 0.2], "#fff7e6", 1.7, 'opacity="0.88"');
          m += lineIso([12.95, v, 0.2], [12.95, v + 0.44, 0.2], "#fff7e6", 1.5, 'opacity="0.82"');
        }
        return m;
      })(),

      // Zebra Crosswalks
      crosswalkAcrossU(6.15, 6.82, 7.98, 5),
      crosswalkAcrossU(8.32, 6.82, 7.98, 5),
      crosswalkAcrossV(6.92, 8.08, 6.08, 5),
      crosswalkAcrossV(6.92, 8.08, 8.22, 5),
      crosswalkAcrossU(10.0, 6.82, 7.98, 5),
      crosswalkAcrossU(6.15, 14.42, 15.58, 5),
      crosswalkAcrossU(8.35, 14.42, 15.58, 5),
      crosswalkAcrossV(6.92, 8.08, 13.68, 5),
      crosswalkAcrossU(13.7, 6.82, 7.98, 5)
    ].join("");

    // --- 3. NORTH-WEST BLOCK: CRAGGY MOUNTAIN, 3D WINDING TRAIL & 3D ROCKY CAVE OUTCROP ---
    // Modelled on "Mountain hut.jpeg": wide S-curving 3D dirt trail with cut-bank edge,
    // 3D projecting rocky cave hood with recessed dark cavern & stepped stone threshold,
    // and strictly sorted foreground pines (ZERO trees behind the Lodge or clipped!).
    const caveMouthCenter = [4.72, 4.72, 23];
    const mountainAndCave = [
      // Back & NW shadowed craggy summit ridge rising to sharp peak at (2.85, 1.35, 152)
      poly([[0.45, 3.35, 0], [1.6, 0.55, 0], [2.85, 1.35, 152]], "#43573d", "rgba(15,43,7,0.24)", 0.8),
      poly([[1.6, 0.55, 0], [4.25, 0.45, 0], [2.85, 1.35, 152]], "#627353", "rgba(15,43,7,0.24)", 0.8),
      poly([[4.25, 0.45, 0], [6.15, 1.95, 0], [4.45, 2.05, 118], [2.85, 1.35, 152]], "#9c8b6e", "rgba(15,43,7,0.24)", 0.8),
      poly([[0.45, 3.35, 0], [1.15, 5.45, 0], [1.95, 3.35, 96], [2.85, 1.35, 152]], "#3f5239", "rgba(15,43,7,0.24)", 0.8),

      // Carved Rock Cutout Backwalls & Shelves cradling Lodge (z=96) and Tower (z=104)
      poly([[1.95, 2.0, 96], [3.2, 2.0, 96], [2.85, 1.35, 152]], "#58664c", "rgba(15,43,7,0.24)", 0.8),
      poly([[3.2, 2.0, 96], [4.45, 2.05, 118], [2.85, 1.35, 152]], "#8a7a5f", "rgba(15,43,7,0.24)", 0.8),
      poly([[1.95, 2.0, 96], [3.22, 2.0, 96], [3.22, 3.25, 96], [1.95, 3.25, 96]], "#8c7d65", "rgba(15,43,7,0.22)", 0.7),
      poly([[3.48, 1.95, 104], [4.38, 1.95, 104], [4.38, 2.78, 104], [3.48, 2.78, 104]], "#99886d", "rgba(15,43,7,0.22)", 0.7),
      poly([[3.48, 1.95, 96], [3.48, 2.78, 96], [3.48, 2.78, 104], [3.48, 1.95, 104]], "#6e614d"),

      // Faceted front mountain slopes & mossy grassy benches descending to valley floor
      poly([[1.15, 5.45, 0], [3.65, 6.18, 0], [3.22, 3.25, 96], [1.95, 3.25, 96]], "#7b6f57", "rgba(15,43,7,0.24)", 0.8),
      poly([[3.65, 6.18, 0], [6.25, 4.55, 0], [4.38, 2.78, 104], [3.22, 3.25, 96]], "#9c8767", "rgba(15,43,7,0.24)", 0.8),
      poly([[6.25, 4.55, 0], [6.15, 1.95, 0], [4.45, 2.05, 118], [4.38, 2.78, 104]], "#827157", "rgba(15,43,7,0.24)", 0.8),
      // Mossy/grassy lower alpine apron blending mountain toe into green valley (like Mountain hut.jpeg!)
      poly([[1.15, 5.45, 0], [2.45, 6.08, 0], [3.65, 6.18, 0], [3.15, 5.05, 24], [1.75, 4.78, 18]], "#5e8f38", "none"),
      // Craggy western rock shoulder & eastern rock rib
      poly([[1.35, 4.65, 18], [2.25, 4.82, 22], [2.25, 3.65, 72]], "#58634a", "rgba(15,43,7,0.22)", 0.7),
      poly([[2.25, 4.82, 22], [2.95, 4.52, 36], [2.25, 3.65, 72]], "#87775c", "rgba(15,43,7,0.22)", 0.7),
      poly([[5.12, 3.85, 42], [5.85, 3.7, 18], [5.35, 2.55, 42], [4.38, 2.78, 104]], "#70614a", "rgba(15,43,7,0.22)", 0.7),

      // 3D WINDING SWITCHBACK MOUNTAIN TRAIL (modelled directly on "Mountain hut.jpeg"!)
      // 1) Lower Cave Spur winding along the grassy eastern toe up to the Cave steps:
      build3DWindingTrail(
        [
          [2.95, 6.15, 1.5],
          [3.65, 6.28, 1.2],
          [4.45, 6.05, 2.0],
          [4.92, 5.62, 5.0],
          [4.86, 5.26, 8.2]
        ],
        0.2,
        2.2
      ),
      // 2) Main Winding Alpine Trail switchbacking in wide S-curves up the mountainside to Lodge steps:
      build3DWindingTrail(
        [
          [3.35, 6.62, 0.3],
          [2.85, 6.12, 1.8],
          [1.82, 5.52, 8.5],
          [1.68, 4.88, 20.0],
          [2.98, 4.56, 36.5],
          [3.38, 4.18, 50.0],
          [2.32, 3.92, 65.0],
          [2.92, 3.55, 79.0]
        ],
        0.21,
        3.2
      ),
      // Final 5 carved 3D stone steps climbing the steep rock notch from trail end (z=79) onto Lodge terrace (z=95)
      (() => {
        const lodgeSteps = [];
        for (let i = 0; i < 5; i++) {
          const t = i / 4;
          lodgeSteps.push({
            u: 2.72,
            v: 3.52 - t * 0.3,
            z: 79.5 + t * 14.0,
            du: 0.38,
            dv: 0.11,
            dz: 3.4
          });
        }
        lodgeSteps.sort((a, b) => a.u + a.v - (b.u + b.v));
        return lodgeSteps
          .map((s) => isoBox(s.u, s.v, s.z, s.du, s.dv, s.dz, "#ded6c8", "#bab0a0", "#8f8577", "rgba(15,43,7,0.24)"))
          .join("");
      })(),
      // Faceted craggy trailside boulders along the switchback bends (organic rock facets, not boxes!)
      poly([[1.46, 5.14, 13], [1.74, 5.18, 13], [1.68, 5.02, 18.5], [1.5, 4.98, 17.5]], "#7d705b", "rgba(15,43,7,0.24)", 0.65),
      poly([[1.68, 5.02, 18.5], [1.74, 5.18, 13], [1.82, 5.04, 14], [1.74, 4.94, 17.8]], "#5e5342", "rgba(15,43,7,0.24)", 0.65),
      poly([[3.44, 4.36, 44], [3.74, 4.38, 44], [3.68, 4.2, 50], [3.48, 4.18, 48.5]], "#857660", "rgba(15,43,7,0.24)", 0.65),
      poly([[3.68, 4.2, 50], [3.74, 4.38, 44], [3.82, 4.22, 45], [3.72, 4.12, 49]], "#635746", "rgba(15,43,7,0.24)", 0.65),
      bush(2.22, 5.18, 13, 4.4, "#4b9c2d"),
      bush(3.25, 4.78, 28, 4.0, "#3f8c24"),

      // TRUE 3D ISOMETRIC CRAGGY ROCKY CAVE OUTCROP & THRESHOLD STEPS (Modelled on "Mountain hut.jpeg"!)
      (() => {
        const [hitX, hitY] = iso(caveMouthCenter[0], caveMouthCenter[1], caveMouthCenter[2]);
        const caveSteps = [0, 1, 2, 3]
          .map((i) => {
            const sv = 4.86 + i * 0.12;
            const sz = 16.5 - i * 2.6;
            return isoBox(4.5, sv, sz, 0.54, 0.15, 2.8, "#d6cec0", "#b3aa9c", "#8c8376", "rgba(15,43,7,0.24)");
          })
          .join("");

        return `
          <g class="map-cave" data-cave-trigger="true" role="button" tabindex="0" aria-label="Mysterious mountain cave">
            <!-- Far-Right (SE/NE) Sloping Craggy Rock Buttress -->
            ${poly([[4.86, 4.54, 15], [5.42, 4.42, 12], [5.28, 4.05, 34], [4.76, 4.18, 42]], "#7a6b54", "rgba(15,43,7,0.25)", 0.75)}
            ${poly([[5.42, 4.42, 12], [5.52, 4.08, 16], [5.28, 4.05, 34]], "#594d3b", "rgba(15,43,7,0.24)", 0.7)}

            <!-- Recessed 3D Isometric Stone Cavern Floor & Pitch-Black Arched Tunnel Depth -->
            ${poly([[4.36, 4.35, 16.5], [5.04, 4.35, 16.5], [5.08, 4.92, 16.5], [4.4, 4.92, 16.5]], "#2b231a")}
            <!-- Shaded 3D inner right cavern wall receding into mountain -->
            ${poly([[4.88, 4.52, 36], [5.12, 4.46, 29], [5.08, 4.52, 16.5], [4.82, 4.42, 16.5]], "#3b3024")}
            <!-- Deep pitch-black arched cavern interior in 3D isometric perspective -->
            ${poly(
              [
                [4.42, 4.84, 16.5],
                [4.44, 4.82, 29.5],
                [4.58, 4.72, 36.5],
                [4.8, 4.58, 36.0],
                [4.98, 4.48, 28.5],
                [5.0, 4.48, 16.5]
              ],
              "#070906"
            )}
            <!-- Subtle dark rocky arch rim framing the blackness -->
            ${poly(
              [
                [4.38, 4.88, 28],
                [4.56, 4.75, 37.5],
                [4.84, 4.58, 37],
                [5.06, 4.46, 28],
                [4.98, 4.48, 28.5],
                [4.8, 4.58, 36],
                [4.58, 4.72, 36.5],
                [4.44, 4.82, 29.5]
              ],
              "#2e251b"
            )}

            <!-- Glowing Red Eyes angled naturally in isometric perspective inside the dark cavern! -->
            ${(() => {
              const [ex, ey] = iso(4.72, 4.65, 25.0);
              return `
                <g class="cave-eyes" filter="url(#redEyeGlow)" transform="translate(${ex.toFixed(1)}, ${ey.toFixed(1)}) rotate(-18)">
                  <ellipse class="cave-eye" cx="-3.6" cy="0" rx="2.2" ry="1.35" fill="#ff2e1f" />
                  <ellipse class="cave-eye" cx="3.6" cy="0" rx="2.2" ry="1.35" fill="#ff2e1f" />
                  <circle cx="-3.2" cy="-0.3" r="0.55" fill="#ffe0d9" />
                  <circle cx="4.0" cy="-0.3" r="0.55" fill="#ffe0d9" />
                </g>
              `;
            })()}

            <!-- Near-Left (SW) Craggy Faceted Rock Pillar framing foreground cheek of cave -->
            ${poly([[3.96, 4.92, 15], [4.44, 4.94, 16.5], [4.46, 4.78, 34], [4.08, 4.62, 38]], "#786952", "rgba(15,43,7,0.25)", 0.75)}
            ${poly([[4.44, 4.94, 16.5], [4.52, 4.76, 16.5], [4.54, 4.72, 34], [4.46, 4.78, 34]], "#4a3f30", "rgba(15,43,7,0.24)", 0.65)}

            <!-- Natural Faceted 3D Craggy Limestone Arch Hood tapering back into the mountain slope! -->
            ${poly([[4.08, 4.62, 38], [4.46, 4.78, 34], [4.72, 4.64, 39.5], [4.52, 4.22, 48], [4.02, 4.28, 44]], "#968468", "rgba(15,43,7,0.25)", 0.75)}
            ${poly([[4.72, 4.64, 39.5], [5.08, 4.46, 33], [5.28, 4.05, 34], [4.76, 4.18, 42], [4.52, 4.22, 48]], "#87765c", "rgba(15,43,7,0.25)", 0.75)}
            ${poly([[4.02, 4.28, 44], [4.52, 4.22, 48], [4.76, 4.18, 42], [4.38, 3.82, 54], [3.95, 4.02, 49]], "#ab987a", "rgba(15,43,7,0.24)", 0.7)}

            <!-- 4 Stepped 3D Stone Threshold Treads descending to trail -->
            ${caveSteps}

            <!-- Generous invisible hover/click target -->
            <circle cx="${hitX}" cy="${(hitY - 2).toFixed(1)}" r="28" fill="transparent" pointer-events="all" />
          </g>
        `;
      })(),

      // Strictly Back-to-Front Sorted Alpine Forest around visible grassy slopes & valley toe!
      // ZERO trees behind the mountain summit or beneath the Alpine Lodge!
      (() => {
        const pines = [
          // Left (West) visible valley margin (u <= 0.52 or v >= 3.55 — completely clear of mountain & Lodge!)
          { u: 0.48, v: 3.55, z: 1, s: 0.92 },
          { u: 0.52, v: 4.35, z: 1, s: 1.0 },
          { u: 0.88, v: 4.95, z: 2, s: 0.88 },
          { u: 0.58, v: 5.35, z: 0, s: 0.94 },
          { u: 1.15, v: 5.72, z: 1, s: 1.02 },
          { u: 0.72, v: 6.12, z: 0, s: 0.88 },
          { u: 1.72, v: 6.08, z: 0, s: 0.96 },
          { u: 2.32, v: 6.26, z: 0, s: 0.86 },
          // Mid-front small alpine pine between trail & cave (well below Lodge!)
          { u: 3.88, v: 5.55, z: 8, s: 0.82 },
          // Right (East) visible valley margin & lower toe (sorted cleanly in front of NE rock edge!)
          { u: 6.28, v: 2.25, z: 1, s: 0.9 },
          { u: 6.32, v: 3.15, z: 1, s: 0.98 },
          { u: 6.18, v: 4.05, z: 2, s: 0.92 },
          { u: 5.95, v: 4.88, z: 1, s: 1.0 },
          { u: 5.52, v: 5.55, z: 0, s: 0.94 },
          { u: 5.15, v: 6.12, z: 0, s: 0.86 }
        ];
        pines.sort((a, b) => a.u + a.v - (b.u + b.v));
        return pines.map((p) => alpineSpruce(p.u, p.v, p.z, p.s)).join("");
      })()
    ].join("");

    // --- 4. LANDMARK 1: ALPINE CHALET & CELL TOWER IN MOUNTAIN CUTOUTS -> ABOUT ME ---
    const [aboutLx, aboutLy] = iso(3.0, 2.35, 174);
    const aboutIsCurrent = showCurrent && currentPage === "about";
    const aboutLandmark = `
      <a class="map-landmark" data-landmark="about" href="about.html" aria-label="About Me">
        <g class="landmark-body">
          ${poly([[1.9, 1.85, 96], [4.4, 1.85, 104], [4.4, 3.3, 96], [1.9, 3.3, 96]], "transparent", "none", 0, 'pointer-events="all"')}
          <!-- Timber/Stone Terrace & Alpine Lodge nestled into z=96 cutout -->
          ${isoBox(2.02, 2.05, 96, 1.14, 1.12, 6, "#9c9282", "#7d7365", "#635a4e")}
          ${isoBox(2.08, 2.1, 102, 1.0, 0.92, 22, "#784c2a", "#633d20", "#4a2c15")}
          ${isoRoofU(1.98, 2.0, 124, 1.2, 1.12, 17, "#36485c", "#22303f", "#59361c")}
          ${isoBox(2.46, 2.56, 129, 0.34, 0.42, 8, "#36485c", "#f2e2c6", "#cbb694")}
          ${isoWindowU(2.51, 2.99, 130.5, 0.24, 5.2, "lampBooks", "#fffaf0", "none")}
          ${isoBox(2.26, 2.2, 133, 0.18, 0.18, 10, "#857c70", "#6e665b", "#544d44")}
          <!-- Warmly lit cabin window showing cozy table & chairs + timber cabin door -->
          ${isoWindowU(2.18, 3.03, 107, 0.34, 11.5, "tableChairs", "#f5dec0", "cross")}
          ${poly([[2.66, 3.03, 102], [2.9, 3.03, 102], [2.9, 3.03, 116], [2.66, 3.03, 116]], "#3b2312", "#d9be9b", 0.7)}
          ${isoWindowV(3.09, 2.35, 108, 0.36, 10.5, "lampBooks", "#ebd4b5", "cross")}
          ${poly([[1.92, 3.22, 92], [2.35, 3.28, 99], [2.62, 3.24, 95]], "#756852")}

          <!-- Tilted blue solar panel nestled on rock ledge -->
          ${poly([[3.52, 2.52, 105], [3.92, 2.52, 105], [3.92, 2.86, 101], [3.52, 2.86, 101]], "#1f669e", "#e8f4fc", 0.85)}

          <!-- Red-and-White Striped Lattice Radio/Cell Tower in z=104 cutout -->
          ${(() => {
            const [b1x, b1y] = iso(3.62, 2.02, 104);
            const [b2x, b2y] = iso(4.18, 2.02, 104);
            const [b3x, b3y] = iso(3.9, 2.46, 104);
            const [tx, ty] = iso(3.9, 2.2, 184);
            const lerp = (a, b, t) => +(a + (b - a) * t).toFixed(1);
            const underFrame = `
              <line x1="${b1x}" y1="${b1y}" x2="${tx}" y2="${ty}" stroke="#2b3036" stroke-width="3.4" stroke-linecap="round" />
              <line x1="${b2x}" y1="${b2y}" x2="${tx}" y2="${ty}" stroke="#2b3036" stroke-width="3.4" stroke-linecap="round" />
              <line x1="${b3x}" y1="${b3y}" x2="${tx}" y2="${ty}" stroke="#2b3036" stroke-width="3.0" stroke-linecap="round" />
            `;
            let bands = "";
            const colors = ["#dc3418", "#ffffff", "#dc3418", "#ffffff", "#dc3418"];
            for (let i = 0; i < 5; i++) {
              const t0 = i / 5;
              const t1 = (i + 1) / 5;
              const col = colors[i];
              bands += `
                <line x1="${lerp(b1x, tx, t0)}" y1="${lerp(b1y, ty, t0)}" x2="${lerp(b1x, tx, t1)}" y2="${lerp(b1y, ty, t1)}" stroke="${col}" stroke-width="2.1" />
                <line x1="${lerp(b2x, tx, t0)}" y1="${lerp(b2y, ty, t0)}" x2="${lerp(b2x, tx, t1)}" y2="${lerp(b2y, ty, t1)}" stroke="${col}" stroke-width="2.1" />
                <line x1="${lerp(b3x, tx, t0)}" y1="${lerp(b3y, ty, t0)}" x2="${lerp(b3x, tx, t1)}" y2="${lerp(b3y, ty, t1)}" stroke="${col}" stroke-width="1.8" />
                <line x1="${lerp(b1x, tx, t0)}" y1="${lerp(b1y, ty, t0)}" x2="${lerp(b2x, tx, t1)}" y2="${lerp(b2y, ty, t1)}" stroke="#3b424a" stroke-width="0.9" />
                <line x1="${lerp(b2x, tx, t0)}" y1="${lerp(b2y, ty, t0)}" x2="${lerp(b1x, tx, t1)}" y2="${lerp(b1y, ty, t1)}" stroke="#3b424a" stroke-width="0.9" />
              `;
            }
            const [r1x, r1y] = [lerp(b3x, tx, 0.52), lerp(b3y, ty, 0.52)];
            const [r2x, r2y] = [lerp(b3x, tx, 0.76), lerp(b3y, ty, 0.76)];
            return `
              <g>
                ${underFrame}
                ${bands}
                <ellipse cx="${r1x}" cy="${r1y}" rx="8" ry="3.4" fill="#d8dee3" stroke="#2b3036" stroke-width="1" />
                <ellipse cx="${r2x}" cy="${r2y}" rx="5.8" ry="2.5" fill="#d8dee3" stroke="#2b3036" stroke-width="1" />
                <line x1="${tx}" y1="${ty}" x2="${tx}" y2="${ty - 12}" stroke="#dc3418" stroke-width="2.4" />
                <circle cx="${tx}" cy="${ty - 12}" r="3.4" fill="#dc3418" stroke="#2b3036" stroke-width="0.8" />
                <circle class="tower-pulse" cx="${tx}" cy="${ty - 12}" r="9" fill="none" stroke="#ffbe2e" stroke-width="2" />
                <circle class="tower-pulse tower-pulse--delay" cx="${tx}" cy="${ty - 12}" r="16" fill="none" stroke="#f09c38" stroke-width="1.4" />
              </g>
            `;
          })()}
        </g>
        ${aboutIsCurrent ? currentPin(aboutLx, aboutLy + 6) : ""}
        ${speechBubble(aboutLx, aboutLy, "About Me", aboutIsCurrent)}
      </a>
    `;

    // --- 5. LANDMARK 2: COLUMNED BRICK & SKYLIGHT HALL -> EXPERIENCE ---
    // Warm lit library/study windows showing bookshelves & tables/chairs,
    // compact realistic postbox, and zero clipped background trees!
    const [expLx, expLy] = iso(10.35, 3.8, 86);
    const expIsCurrent = showCurrent && currentPage === "experience";
    const expLandmark = `
      <a class="map-landmark" data-landmark="experience" href="experience.html" aria-label="Experience">
        <polygon class="landmark-shadow" points="${pts([[8.9, 2.0, 2.6], [11.75, 2.0, 2.6], [11.75, 5.4, 2.6], [8.9, 5.4, 2.6]])}" fill="rgba(15,43,7,0.22)" />
        <g class="landmark-body">
          <!-- Building Plinth & Brick Hall (u: 8.95..11.65, v: 2.05..4.95) -->
          ${isoBox(8.95, 2.05, 2.5, 2.7, 2.9, 8, "#aba296", "#968c80", "#786f64")}
          ${isoBox(9.0, 2.1, 10.5, 2.6, 2.8, 34, "#e89a5e", "#d4663b", "#a84420")}
          ${isoBox(8.94, 2.04, 44.5, 2.72, 2.92, 6, "#f7efe2", "#cfc6b8", "#aba193")}
          ${poly([[9.12, 2.22, 50.6], [11.48, 2.22, 50.6], [11.48, 4.78, 50.6], [9.12, 4.78, 50.6]], "#e89858")}

          <!-- 3 Arched Barrel Skylights + 2 Rooftop HVAC Units -->
          ${[2.42, 3.02, 3.62].map((sv) =>
            isoBox(9.32, sv, 50.6, 1.08, 0.42, 7, "#6e565c", "#594349", "#f2e6d8")
          ).join("")}
          ${[2.52, 3.32].map((sv) => {
            const [fx, fy] = iso(10.92, sv + 0.25, 58.2);
            return (
              isoBox(10.68, sv, 50.6, 0.48, 0.48, 7.5, "#cfc6ba", "#b3a99c", "#8c8377") +
              `<ellipse cx="${fx}" cy="${fy}" rx="5.5" ry="2.8" fill="#4f4943" />`
            );
          }).join("")}

          <!-- Tall Warmly Lit Multi-Pane Windows showing Tiered Bookshelves & Study Tables/Chairs! -->
          ${isoWindowU(9.16, 4.91, 14.5, 0.46, 24, "bookshelves", "#f7efe2", "tallGrid")}
          ${isoWindowU(10.98, 4.91, 14.5, 0.46, 24, "bookshelves", "#f7efe2", "tallGrid")}
          <!-- SE Side Windows (one lit study room, two unlit reflective panes) -->
          ${isoWindowV(11.61, 2.42, 16, 0.52, 21, "unlit", "#f2e6d5", "tallGrid")}
          ${isoWindowV(11.61, 3.22, 16, 0.52, 21, "tableChairs", "#f2e6d5", "tallGrid")}
          ${isoWindowV(11.61, 4.02, 16, 0.52, 21, "unlit", "#f2e6d5", "tallGrid")}

          <!-- 4-Column Classical Portico & Steps -->
          ${isoBox(9.7, 4.9, 2.5, 1.2, 0.72, 8, "#d9d0c3", "#bfb5a6", "#a3998b")}
          ${poly([[9.86, 5.63, 2.5], [10.74, 5.63, 2.5], [10.74, 5.9, 0.5], [9.86, 5.9, 0.5]], "#cfc5b6", "#998f80", 0.6)}
          ${[9.8, 10.04, 10.54, 10.78].map((cu) =>
            isoBox(cu, 5.08, 10.5, 0.12, 0.12, 31, "#fffcf7", "#f2ece1", "#d6cec0")
          ).join("")}
          ${isoBox(9.68, 4.88, 41.5, 1.24, 0.42, 13, "#fffcf7", "#ebe3d5", "#c9bfb0")}

          <!-- Forecourt & Side Trees placed cleanly in open space (ZERO clipping behind building!) -->
          ${tallParkTree(8.5, 5.08, 2.6, 0.88)}
          ${tallParkTree(12.04, 2.55, 2.6, 0.92)}
          ${tallParkTree(12.04, 3.48, 2.6, 0.85)}
          ${bush(12.02, 4.38, 2.6, 6.0, "#449e2b")}

          <!-- Forecourt props: benches, neatly scaled postbox, parked bicycle & guardrails -->
          ${benchU(8.85, 5.45, 2.5)}
          ${benchU(11.3, 5.75, 2.5)}
          <!-- Compact, realistic British red pillar postbox (scaled down cleanly!) -->
          ${isoBox(11.02, 5.36, 2.5, 0.16, 0.16, 1.2, "#383431", "#2b2826", "#1f1d1b")}
          ${isoBox(11.03, 5.37, 3.7, 0.14, 0.14, 6.2, "#e04431", "#c7311f", "#962113")}
          ${isoBox(11.01, 5.35, 9.9, 0.18, 0.18, 1.1, "#eb503d", "#c7311f", "#962113")}
          ${lineIso([11.06, 5.52, 8.2], [11.15, 5.52, 8.2], "#1c1614", 1.1)}
          ${(() => {
            const [bx, by] = iso(9.48, 5.58, 2.8);
            return `
              <circle cx="${bx - 5}" cy="${by}" r="3.2" fill="none" stroke="#362e2b" stroke-width="1.1" />
              <circle cx="${bx + 4}" cy="${by + 2}" r="3.2" fill="none" stroke="#362e2b" stroke-width="1.1" />
              <path d="M${bx - 5} ${by} L${bx - 1} ${by - 4} L${bx + 4} ${by + 2}" fill="none" stroke="#b83227" stroke-width="1.2" />
            `;
          })()}
          ${lineIso([8.55, 6.48, 7], [9.55, 6.48, 7], "#8c857b", 1.5)}
          ${lineIso([8.55, 6.48, 2.6], [8.55, 6.48, 7.5], "#8c857b", 1.5)}
          ${lineIso([9.55, 6.48, 2.6], [9.55, 6.48, 7.5], "#8c857b", 1.5)}
          ${lineIso([10.95, 6.48, 7], [11.95, 6.48, 7], "#8c857b", 1.5)}
          ${lineIso([10.95, 6.48, 2.6], [10.95, 6.48, 7.5], "#8c857b", 1.5)}
          ${lineIso([11.95, 6.48, 2.6], [11.95, 6.48, 7.5], "#8c857b", 1.5)}
        </g>
        ${expIsCurrent ? currentPin(expLx, expLy + 6) : ""}
        ${speechBubble(expLx, expLy, "Experience", expIsCurrent)}
      </a>
    `;

    // --- 6. LANDMARK 3: HIGH-TECH VAULTED RESEARCH LAB -> RESEARCH ---
    const [resLx, resLy] = iso(15.45, 4.85, 92);
    const resIsCurrent = showCurrent && currentPage === "research";
    const resLandmark = `
      <a class="map-landmark" data-landmark="research" href="research.html" aria-label="Research">
        <polygon class="landmark-shadow" points="${pts([[13.85, 3.55, 2.6], [17.45, 3.55, 2.6], [17.45, 6.35, 2.6], [13.85, 6.35, 2.6]])}" fill="rgba(15,43,7,0.24)" />
        <g class="landmark-body">
          ${isoBox(13.85, 3.55, 2.5, 1.35, 1.45, 20, "#b8c2c7", "#95a0a6", "#758087")}
          ${isoWindowU(14.02, 5.01, 8, 0.36, 9.5, "unlit", "#47545c", "cross")}
          ${isoBox(14.35, 3.45, 2.5, 2.35, 1.55, 48, "#c5cfd4", "#9aa6ad", "#7b878f")}
          <!-- Illuminated Chemistry Lab Window unobstructed beside tower! -->
          ${isoWindowU(14.42, 5.01, 25, 0.48, 17, "lab", "#47545c", "cross")}

          ${isoBox(13.9, 5.15, 2.5, 0.85, 0.78, 17, "#b8c2c7", "#8f9ba3", "#6f7b82")}
          ${isoWindowU(14.08, 5.94, 7, 0.46, 8.5, "tableChairs", "#47545c", "cross")}
          ${lineIso([14.75, 5.55, 7], [15.2, 5.55, 7], "#e8af38", 2.4)}

          ${isoBox(14.95, 4.15, 2.5, 1.15, 1.35, 64, "#cfd8dc", "#a4b0b8", "#808c94")}
          <!-- Wide Warmly Lit Main Lab Observation Window on front of Central Lab Tower! -->
          ${isoWindowU(15.12, 5.51, 34, 0.78, 17, "lab", "#47545c", "wideLab")}
          ${isoWindowU(15.12, 5.51, 14, 0.34, 15, "unlit", "#47545c", "tallGrid")}
          ${isoWindowU(15.56, 5.51, 14, 0.34, 15, "bookshelves", "#47545c", "tallGrid")}
          ${isoBox(15.08, 4.28, 66.5, 0.88, 0.48, 6, "#b0bcc2", "#8b979e", "#6d7880")}
          ${isoBox(15.08, 4.86, 66.5, 0.88, 0.48, 6, "#b0bcc2", "#8b979e", "#6d7880")}

          ${isoBox(15.65, 4.35, 34, 1.45, 1.42, 24, "#c5cfd4", "#9aa6ad", "#7e8a91")}
          <!-- Upper cantilevered lab windows: one warmly lit showing lab equipment, one cool unlit glass -->
          ${isoWindowV(17.11, 4.5, 39, 0.48, 13, "lab", "#47545c", "cross")}
          ${isoWindowV(17.11, 5.14, 39, 0.48, 13, "unlit", "#47545c", "cross")}

          ${(() => {
            const [v1x, v1y] = iso(15.75, 6.15, 2.5);
            const [v2x, v2y] = iso(17.35, 6.15, 2.5);
            const [v3x, v3y] = iso(17.35, 4.55, 2.5);
            const [t1x, t1y] = iso(15.75, 6.15, 34);
            const [t2x, t2y] = iso(16.65, 6.15, 34);
            const [t3x, t3y] = iso(16.65, 4.55, 34);
            return `
              <path d="M${v1x},${v1y} L${v2x},${v2y} Q ${t2x + 14},${t2y + 8} ${t1x},${t1y} Z" fill="#8b979e" stroke="#364047" stroke-width="1" />
              <path d="M${t1x},${t1y} Q ${t2x + 14},${t2y + 8} ${v2x},${v2y} L${v3x},${v3y} Q ${t3x + 14},${t3y + 8} ${t3x},${t3y} Z" fill="#aebac2" stroke="#364047" stroke-width="1" />
              <path d="M${(t1x + t3x) / 2},${(t1y + t3y) / 2} Q ${(t2x + t3x) / 2 + 14},${(t2y + t3y) / 2 + 8} ${(v2x + v3x) / 2},${(v2y + v3y) / 2}" fill="none" stroke="#cfd8dc" stroke-width="4.5" />
              ${poly([[15.95, 6.16, 6], [16.55, 6.16, 6], [16.55, 6.16, 22], [15.95, 6.16, 22]], "#3b434a", "#67737a", 0.8)}
            `;
          })()}

          ${lineIso([14.88, 5.56, 58], [16.12, 5.56, 58], "#ebb238", 3.6, 'stroke-linecap="round"')}
          ${lineIso([16.12, 5.56, 58], [16.12, 4.2, 58], "#d49922", 3.4, 'stroke-linecap="round"')}
          ${lineIso([16.12, 4.45, 58], [16.85, 4.45, 58], "#ebb238", 3.0, 'stroke-linecap="round"')}
          ${lineIso([16.85, 4.45, 58], [16.85, 4.45, 48], "#d49922", 2.8, 'stroke-linecap="round"')}
          ${lineIso([15.55, 5.95, 2.5], [15.55, 5.95, 11], "#ebb238", 2.4)}
          ${lineIso([15.72, 5.95, 2.5], [15.72, 5.95, 11], "#ebb238", 2.4)}
        </g>
        ${resIsCurrent ? currentPin(resLx, resLy + 6) : ""}
        ${speechBubble(resLx, resLy, "Research", resIsCurrent)}
      </a>
    `;

    // --- 7. STATIC VEHICLES ON NORTH BLOCK & BOULEVARD B ---
    // Research car park cars parked cleanly along v inside Bay 1 (15.825) & Bay 3 (17.125) — ZERO overlap!
    const northBackTrees = [
      canopyTree(14.08, 1.72, 2.6, 0.9, 0),
      canopyTree(14.82, 1.58, 2.6, 0.82, 2)
    ].join("");

    const northAndBoulevardProps = [
      isoVehicleV(15.825, 1.96, 1, "#e8643a", "#c94922", "#9e3414", "#f7efe2", 2.6),
      isoVehicleV(17.125, 1.96, 1, "#2989b5", "#1c6c91", "#134e69", "#fffaf0", 2.6),
      isoVehicleU(4.65, 7.76, 1, "#ffbe2e", "#e59c15", "#b87809", "#fffaf0", false),
      isoVehicleU(11.35, 7.04, -1, "#dc381f", "#b82611", "#8c1908", "#fff5e6", false),
      isoVehicleV(7.15, 4.45, 1, "#fffaf0", "#ded5c5", "#bab09e", "#2b6b78"),
      streetLamp(8.45, 6.42, 2.6, 1),
      streetLamp(12.15, 6.42, 2.6, -1),
      streetLamp(13.8, 6.42, 2.6, 1),
      streetLamp(17.52, 3.55, 2.6, -1),
      trafficLight(6.65, 6.55, 0),
      trafficLight(8.35, 8.28, 2.6)
    ].join("");

    // --- 8. LANDMARK 4: L-SHAPED BRICK UNIVERSITY WITH SOLID TIERED CLOCK TOWER -> EDUCATION ---
    // Tower stacked strictly bottom-to-top so zero horizontal floor slabs ever clip its brick walls!
    // Mix of lit classroom/library windows (chalkboards, desks, bookshelves) & unlit sky-blue windows!
    const [eduLx, eduLy] = iso(4.12, 12.02, 130);
    const eduIsCurrent = showCurrent && currentPage === "education";
    const eduLandmark = `
      <a class="map-landmark" data-landmark="education" href="education.html" aria-label="Education">
        <polygon class="landmark-shadow" points="${pts([[1.2, 9.2, 2.6], [5.1, 9.2, 2.6], [5.1, 13.1, 2.6], [1.2, 13.1, 2.6]])}" fill="rgba(15,43,7,0.22)" />
        <g class="landmark-body">
          ${isoBox(1.15, 9.1, 2.5, 3.85, 3.85, 3, "#d9cfc0", "#bfb3a2", "#a69a88")}

          <!-- Left Wing (terminating cleanly inside the Corner Tower footprint) -->
          ${isoBox(1.35, 11.05, 5.5, 2.45, 1.6, 38, "#f2d8b3", "#e07448", "#8f321e")}
          ${lineIso([1.35, 12.66, 24], [3.6, 12.66, 24], "#f7e3c4", 2.4)}
          ${lineIso([1.35, 12.66, 43], [3.6, 12.66, 43], "#f5c26b", 2.4)}
          ${isoRoofU(1.28, 10.98, 43.5, 2.52, 1.74, 18.5, "#3e4e5e", "#26323d", "#e07448", true)}
          ${isoBox(1.92, 11.88, 48, 0.36, 0.55, 7.5, "#26323d", "#3e4e5e", "#9ecce0")}
          ${isoBox(2.72, 11.88, 48, 0.36, 0.55, 7.5, "#26323d", "#3e4e5e", "#9ecce0")}
          ${isoBox(2.22, 11.22, 54.5, 0.36, 0.32, 8.5, "#f0a875", "#d46a3f", "#8f321e")}

          <!-- Right Wing (terminating cleanly inside the Corner Tower footprint) -->
          ${isoBox(3.15, 9.25, 5.5, 1.6, 2.45, 38, "#f2d8b3", "#e07448", "#8f321e")}
          ${lineIso([4.76, 9.25, 24], [4.76, 11.5, 24], "#e0b779", 2.2)}
          ${lineIso([4.76, 9.25, 43], [4.76, 11.5, 43], "#d99d45", 2.2)}
          ${isoRoofV(3.08, 9.18, 43.5, 1.74, 2.52, 18.5, "#2a3845", "#465869", "#e07448")}
          ${isoBox(3.92, 9.98, 48, 0.55, 0.36, 7.5, "#26323d", "#9ecce0", "#26323d")}
          ${isoBox(3.55, 9.8, 54.5, 0.32, 0.36, 8.5, "#f0a875", "#d46a3f", "#8f321e")}

          <!-- 2-Storey Academic Windows on Left Wing (SW face: Classrooms, Library & Unlit Panes) -->
          ${isoWindowU(1.52, 12.67, 26.5, 0.42, 13, "unlit", "#fffaf0", "cross")}
          ${isoWindowU(2.14, 12.67, 26.5, 0.42, 13, "classroom", "#fffaf0", "cross")}
          ${isoWindowU(2.76, 12.67, 26.5, 0.42, 13, "bookshelves", "#fffaf0", "cross")}
          ${isoWindowU(1.52, 12.67, 9.5, 0.42, 13, "classroom", "#fffaf0", "cross")}
          ${isoWindowU(2.14, 12.67, 9.5, 0.42, 13, "unlit", "#fffaf0", "cross")}
          ${isoWindowU(2.76, 12.67, 9.5, 0.42, 13, "tableChairs", "#fffaf0", "cross")}

          <!-- 2-Storey Academic Windows on Right Wing (SE face: Seminar, Bookshelves & Unlit Panes) -->
          ${isoWindowV(4.77, 9.48, 26.5, 0.42, 13, "bookshelves", "#f7e3c4", "cross")}
          ${isoWindowV(4.77, 10.1, 26.5, 0.42, 13, "unlit", "#f7e3c4", "cross")}
          ${isoWindowV(4.77, 10.72, 26.5, 0.42, 13, "classroom", "#f7e3c4", "cross")}
          ${isoWindowV(4.77, 9.48, 9.5, 0.42, 13, "unlit", "#f7e3c4", "cross")}
          ${isoWindowV(4.77, 10.1, 9.5, 0.42, 13, "classroom", "#f7e3c4", "cross")}
          ${isoWindowV(4.77, 10.72, 9.5, 0.42, 13, "unlit", "#f7e3c4", "cross")}

          <!-- WATER-TIGHT TIERED CORNER CLOCK TOWER (stacked strictly bottom-to-top — ZERO floor clipping!) -->
          <!-- Tier 1: Lower Brick Tower Shaft (z = 5.5 -> 50.5, proud of wings so roofs tuck cleanly inside!) -->
          ${isoBox(3.42, 11.32, 5.5, 1.4, 1.4, 45, "#d96b3f", "#e3794b", "#9c3821")}
          ${lineIso([3.42, 12.73, 24], [4.82, 12.73, 24], "#f7e3c4", 2.2)}
          ${lineIso([4.83, 11.32, 24], [4.83, 12.72, 24], "#e0b779", 2.2)}
          <!-- Tower 2nd-floor windows & belfry louver slits (matching Education.png!) -->
          ${isoWindowU(3.9, 12.73, 26.5, 0.42, 11.5, "lampBooks", "#fffaf0", "cross")}
          ${isoWindowV(4.83, 11.8, 26.5, 0.42, 11.5, "unlit", "#f7e3c4", "cross")}
          ${isoWindowU(3.84, 12.73, 41, 0.54, 6.5, "unlit", "#f7e3c4", "wideLab")}
          ${isoWindowV(4.83, 11.74, 41, 0.54, 6.5, "unlit", "#e0b779", "wideLab")}

          <!-- Tier 2: Mid Sandstone Cornice Collar (z = 50.5 -> 54.5) -->
          ${isoBox(3.38, 11.28, 50.5, 1.48, 1.48, 4.0, "#f7e3c4", "#f5be58", "#c48425")}

          <!-- Tier 3: Upper Brick Clock Belfry Shaft (z = 54.5 -> 87.5, drawn AFTER mid cornice to cover its top!) -->
          ${isoBox(3.46, 11.36, 54.5, 1.32, 1.32, 33.0, "#d96b3f", "#e3794b", "#9c3821")}

          <!-- Twin Isometric Clock Faces on Tier 3 walls (at z = 71) -->
          ${(() => {
            const [c1x, c1y] = iso(4.12, 12.69, 71);
            const [c2x, c2y] = iso(4.79, 12.02, 71);
            return `
              <g transform="translate(${c1x}, ${c1y}) skewY(30)">
                <circle cx="0" cy="0" r="8.8" fill="#1e2a38" />
                <circle cx="0" cy="0" r="7.2" fill="#ffffff" stroke="#f5be58" stroke-width="1" />
                <line x1="0" y1="-6" x2="0" y2="-4.6" stroke="#1e2a38" stroke-width="1" />
                <line x1="0" y1="6" x2="0" y2="4.6" stroke="#1e2a38" stroke-width="1" />
                <line x1="-6" y1="0" x2="-4.6" y2="0" stroke="#1e2a38" stroke-width="1" />
                <line x1="6" y1="0" x2="4.6" y2="0" stroke="#1e2a38" stroke-width="1" />
                <line x1="0" y1="0" x2="0" y2="-4.5" stroke="#0f2b07" stroke-width="1.5" stroke-linecap="round" />
                <line x1="0" y1="0" x2="3.4" y2="1.4" stroke="#b84309" stroke-width="1.3" stroke-linecap="round" />
                <circle cx="0" cy="0" r="1.1" fill="#0f2b07" />
              </g>
              <g transform="translate(${c2x}, ${c2y}) skewY(-30)">
                <circle cx="0" cy="0" r="8.8" fill="#16202b" />
                <circle cx="0" cy="0" r="7.2" fill="#f7fbff" stroke="#d99d45" stroke-width="1" />
                <line x1="0" y1="-6" x2="0" y2="-4.6" stroke="#16202b" stroke-width="1" />
                <line x1="0" y1="6" x2="0" y2="4.6" stroke="#16202b" stroke-width="1" />
                <line x1="-6" y1="0" x2="-4.6" y2="0" stroke="#16202b" stroke-width="1" />
                <line x1="6" y1="0" x2="4.6" y2="0" stroke="#16202b" stroke-width="1" />
                <line x1="0" y1="0" x2="0" y2="-4.5" stroke="#0f2b07" stroke-width="1.5" stroke-linecap="round" />
                <line x1="0" y1="0" x2="3.4" y2="1.4" stroke="#b84309" stroke-width="1.3" stroke-linecap="round" />
                <circle cx="0" cy="0" r="1.1" fill="#0f2b07" />
              </g>
            `;
          })()}

          <!-- Tier 4: Upper Eaves Cornice Band (z = 87.5 -> 91.0) -->
          ${isoBox(3.4, 11.3, 87.5, 1.44, 1.44, 3.5, "#f7e3c4", "#f5be58", "#c48425")}

          <!-- Tier 5: 4-Sided Pyramidal Slate Spire + Finial (z = 91.0 -> 128, completely capping upper cornice!) -->
          ${(() => {
            const b1 = [3.36, 11.26, 91.0];
            const b2 = [4.88, 11.26, 91.0];
            const b3 = [4.88, 12.78, 91.0];
            const b4 = [3.36, 12.78, 91.0];
            const tip = [4.12, 12.02, 114];
            const spireTip = [4.12, 12.02, 128];
            return (
              poly([b1, b4, tip], "#4d5f73", "#1d2630", 0.8) +
              poly([b1, b2, tip], "#344352", "#1d2630", 0.8) +
              poly([b4, b3, tip], "#455669", "#1d2630", 0.8) +
              poly([b2, b3, tip], "#26323e", "#1d2630", 0.8) +
              poly([[3.99, 12.02, 112], [4.25, 12.02, 112], spireTip], "#1e2833", "#141b24", 0.7)
            );
          })()}

          <!-- Twin Arched Corner Entrances + Stone Steps -->
          ${poly([[3.86, 12.73, 5.5], [4.38, 12.73, 5.5], [4.38, 12.73, 21], [3.86, 12.73, 21]], "#2c3845", "#fffaf0", 1.2)}
          ${poly([[4.83, 11.76, 5.5], [4.83, 12.28, 5.5], [4.83, 12.28, 21], [4.83, 11.76, 21]], "#1e2833", "#fffaf0", 1.2)}
          ${poly([[3.82, 12.73, 5.5], [4.42, 12.73, 5.5], [4.42, 13.1, 2.6], [3.82, 13.1, 2.6]], "#b5aba0", "#736b62", 0.6)}
          ${poly([[4.83, 11.72, 5.5], [4.83, 12.32, 5.5], [5.2, 12.32, 2.6], [5.2, 11.72, 2.6]], "#9c9287", "#736b62", 0.6)}

          <!-- Unified botanical foundation shrubs -->
          ${bush(1.32, 12.82, 2.6, 6.2, "#449e2b")}
          ${bush(3.52, 12.9, 2.6, 5.2, "#4da632")}
          ${bush(5.02, 12.58, 2.6, 5.2, "#3c9428")}
          ${bush(5.02, 9.48, 2.6, 6.0, "#449e2b")}
        </g>
        ${eduIsCurrent ? currentPin(eduLx, eduLy + 6) : ""}
        ${speechBubble(eduLx, eduLy, "Education", eduIsCurrent)}
      </a>
    `;

    // West Quad footpaths & foreground trees (drawn AFTER eduLandmark in open lawn — ZERO clipping!)
    const westQuadPaths = [
      poly([[3.84, 13.1, 2.7], [4.4, 13.1, 2.7], [4.4, 14.25, 2.7], [3.84, 14.25, 2.7]], "#e3d4bc"),
      poly([[5.2, 11.74, 2.7], [6.4, 11.74, 2.7], [6.4, 12.28, 2.7], [5.2, 12.28, 2.7]], "#e3d4bc")
    ].join("");

    const westQuadForegroundProps = [
      canopyTree(0.82, 12.15, 2.6, 0.86, 2),
      canopyTree(5.68, 9.25, 2.6, 0.94, 1),
      canopyTree(5.88, 10.68, 2.6, 0.86, 2),
      canopyTree(1.22, 13.55, 2.6, 0.9, 0),
      canopyTree(5.65, 13.25, 2.6, 0.88, 0),
      benchU(2.55, 13.35, 2.6),
      streetLamp(6.48, 8.55, 2.6, -1),
      streetLamp(6.48, 13.85, 2.6, -1),
      streetLamp(0.85, 13.95, 2.6, 1)
    ].join("");

    // --- 9. LANDMARK 5: CLEAN CLASSIC STONE & CLAPBOARD COTTAGE -> HOME ---
    // Pink spheres & green squiggle removed! Clean cottage faithful to "Home building.png",
    // featuring a warmly glowing window with a sitting CAT silhouette on the windowsill!
    const [homeLx, homeLy] = iso(10.35, 10.4, 82);
    const homeIsCurrent = showCurrent && currentPage === "home";
    const homeLandmark = `
      <a class="map-landmark" data-landmark="home" href="index.html" aria-label="Home">
        <polygon class="landmark-shadow" points="${pts([[8.85, 9.1, 2.7], [11.82, 9.1, 2.7], [11.82, 11.75, 2.7], [8.85, 11.75, 2.7]])}" fill="rgba(15,43,7,0.2)" />
        <g class="landmark-body">
          <!-- Left Recessed Cream Clapboard Wing (u: 8.95..10.30, v: 9.35..10.90) -->
          ${isoBox(8.95, 9.35, 2.7, 1.35, 1.55, 28, "#fff9ed", "#f5ebd6", "#ded0b4")}
          ${lineIso([8.95, 10.91, 11], [10.22, 10.91, 11], "#e3d5bc", 0.8)}
          ${lineIso([8.95, 10.91, 16], [10.22, 10.91, 16], "#e3d5bc", 0.8)}
          ${lineIso([8.95, 10.91, 23], [10.22, 10.91, 23], "#e3d5bc", 0.8)}
          ${isoWindowU(9.28, 10.92, 20.5, 0.42, 8.2, "lampBooks", "#fffdf9", "cross")}
          ${isoRoofU(8.88, 9.28, 30.7, 1.48, 1.69, 16.5, "#45505b", "#2e3740", "#f5ebd6", true)}

          <!-- Clean Covered Front Porch (no floating pink spheres!) -->
          ${isoBox(8.98, 10.9, 2.7, 1.24, 0.56, 2.3, "#ded4c3", "#c4b8a4", "#a69b88")}
          ${isoWindowU(9.05, 10.92, 6.8, 0.34, 9.0, "unlit", "#fffdf9", "cross")}
          ${poly([[9.5, 10.92, 5.0], [9.88, 10.92, 5.0], [9.88, 10.92, 16.8], [9.5, 10.92, 16.8]], "#2f4f38", "#fffdf9", 0.95)}
          ${lineIso([9.06, 11.41, 5.0], [9.06, 11.41, 16.8], "#fffdf9", 2.2)}
          ${lineIso([10.14, 11.41, 5.0], [10.14, 11.41, 16.8], "#fffdf9", 2.2)}
          ${poly([[8.94, 10.88, 18.8], [10.24, 10.88, 18.8], [10.24, 11.5, 16.2], [8.94, 11.5, 16.2]], "#4e5a66", "#2e3740", 0.75)}

          <!-- Tall Textured Stone Chimney at the inner wing junction (like Home building.png!) -->
          ${isoBox(10.02, 9.42, 30.5, 0.38, 0.38, 24.5, "#a89d8e", "#bfb3a2", "#877d70")}
          ${isoBox(10.05, 9.45, 55.0, 0.32, 0.32, 2.5, "#2b3238", "#3b434a", "#1e2429")}

          <!-- Right Projecting Stone Gable Wing (u: 10.22..11.68, v: 9.20..11.48) -->
          ${isoBox(10.22, 9.2, 2.7, 1.46, 2.28, 31, "#e3d9c8", "#cfc3af", "#aba08e")}
          <!-- Subtle warm stone masonry accents on front gable wall -->
          ${lineIso([10.35, 11.49, 13], [10.52, 11.49, 13], "#b5a893", 1.2)}
          ${lineIso([11.38, 11.49, 16], [11.55, 11.49, 16], "#b5a893", 1.2)}
          ${lineIso([10.38, 11.49, 25], [10.55, 11.49, 25], "#b5a893", 1.2)}

          <!-- Steep Slate Gable Roof + Crisp White Cottage Bargeboards -->
          ${isoRoofV(10.15, 9.13, 33.7, 1.6, 2.42, 21.5, "#323c46", "#4a5763", "#cfc3af")}
          ${(() => {
            const gL = iso(10.15, 11.55, 33.7);
            const gT = iso(10.95, 11.55, 55.2);
            const gR = iso(11.75, 11.55, 33.7);
            return `<polyline points="${gL[0]},${gL[1]} ${gT[0]},${gT[1]} ${gR[0]},${gR[1]}" fill="none" stroke="#fffdf9" stroke-width="2.6" stroke-linejoin="round" />`;
          })()}

          <!-- Upstairs Triple-Pane Gable Window & Downstairs Warmly Lit CAT Window! -->
          ${isoWindowU(10.6, 11.5, 22.5, 0.2, 9.5, "unlit", "#fffdf9", "none")}
          ${isoWindowU(10.84, 11.5, 22.5, 0.24, 11.5, "lampBooks", "#fffdf9", "cross")}
          ${isoWindowU(11.12, 11.5, 22.5, 0.2, 9.5, "unlit", "#fffdf9", "none")}
          <!-- Ground-floor Cottage Window with Sitting Cat Silhouette on the windowsill! -->
          ${isoWindowU(10.58, 11.5, 7.2, 0.74, 12.2, "cat", "#fffdf9", "cross")}

          <!-- SE Side Cottage Windows (one cozy dining room with table & chairs, one unlit) -->
          ${isoWindowV(11.69, 9.65, 8.0, 0.52, 11.5, "unlit", "#fffdf9", "cross")}
          ${isoWindowV(11.69, 10.48, 8.0, 0.52, 11.5, "tableChairs", "#fffdf9", "cross")}

          <!-- Straight Flagstone Garden Path & Crisp White Picket Fence -->
          ${[11.58, 11.9, 12.22].map((sv) =>
            poly([[9.42, sv, 2.8], [9.88, sv, 2.8], [9.88, sv + 0.23, 2.8], [9.42, sv + 0.23, 2.8]], "#cfc4b2", "#9e9382", 0.5)
          ).join("")}
          ${(() => {
            let f = "";
            for (let u = 8.62; u <= 11.98; u += 0.19) {
              if (u > 9.32 && u < 9.94) continue;
              f += lineIso([u, 12.56, 2.8], [u, 12.56, 10.2], "#fffdf9", 1.8);
            }
            f += lineIso([8.62, 12.56, 8.0], [9.32, 12.56, 8.0], "#fffdf9", 1.3);
            f += lineIso([9.94, 12.56, 8.0], [11.98, 12.56, 8.0], "#fffdf9", 1.3);
            return f;
          })()}
          ${bush(8.85, 12.22, 2.8, 4.5, "#449e2b")}
          ${bush(10.35, 12.24, 2.8, 4.6, "#4da632")}
          ${bush(11.42, 12.2, 2.8, 4.5, "#3c9428")}
        </g>
        ${homeIsCurrent ? currentPin(homeLx, homeLy + 6) : ""}
        ${speechBubble(homeLx, homeLy, "Home", homeIsCurrent)}
      </a>
    `;

    // Foreground garden tree placed cleanly to the front-right of Home Cottage (ZERO clipping!)
    const homeForegroundProps = [canopyTree(11.88, 11.92, 2.8, 0.84, 1)].join("");

    // --- 10. SOUTH-EAST PARK: POND, WALKWAYS, BENCHES & TRUE-ISOMETRIC OBSERVATORY -> SKILLS ---
    const observatoryParkWalksAndPond = [
      poly([[15.05, 8.5, 2.7], [15.55, 8.5, 2.7], [15.55, 9.6, 2.7], [15.05, 9.6, 2.7]], "#e3d4bc", "#bfb097", 0.5),
      poly([[13.9, 11.05, 2.7], [14.95, 11.05, 2.7], [14.95, 11.55, 2.7], [13.9, 11.55, 2.7]], "#e3d4bc", "#bfb097", 0.5),
      poly([[15.05, 11.45, 2.7], [15.55, 11.45, 2.7], [15.55, 12.35, 2.7], [15.05, 12.35, 2.7]], "#e3d4bc", "#bfb097", 0.5),

      // Scenic Isometric Park Pond
      (() => {
        const outerRim = [
          [14.55, 12.2, 2.7],
          [15.95, 12.1, 2.7],
          [16.55, 12.55, 2.7],
          [16.45, 13.35, 2.7],
          [15.25, 13.65, 2.7],
          [14.35, 13.3, 2.7],
          [14.25, 12.65, 2.7]
        ];
        const innerWater = [
          [14.7, 12.35, 2.7],
          [15.88, 12.26, 2.7],
          [16.38, 12.64, 2.7],
          [16.28, 13.25, 2.7],
          [15.25, 13.5, 2.7],
          [14.5, 13.2, 2.7],
          [14.42, 12.7, 2.7]
        ];
        const deepWater = [
          [14.95, 12.55, 2.7],
          [15.75, 12.48, 2.7],
          [16.1, 12.78, 2.7],
          [15.98, 13.15, 2.7],
          [15.25, 13.3, 2.7],
          [14.75, 13.05, 2.7]
        ];
        const [l1x, l1y] = iso(15.05, 13.05, 2.8);
        const [l2x, l2y] = iso(15.85, 12.85, 2.8);
        const [rx, ry] = iso(16.25, 12.52, 2.8);
        return `
          <g class="map-prop">
            ${poly(outerRim, "#cfc2ab", "#9e9078", 0.9)}
            ${poly(innerWater, "#35b2c7", "#1b7c8f", 0.8)}
            ${poly(deepWater, "#1f8fa6")}
            ${lineIso([14.95, 12.68, 2.9], [15.55, 12.68, 2.9], "#aef2fc", 1.5, 'stroke-linecap="round" opacity="0.8"')}
            <ellipse cx="${l1x}" cy="${l1y}" rx="4.8" ry="2.5" fill="#46a832" stroke="#266919" stroke-width="0.6" />
            <circle cx="${(l1x + 1).toFixed(1)}" cy="${(l1y - 1).toFixed(1)}" r="1.5" fill="#f7a8c4" />
            <ellipse cx="${l2x}" cy="${l2y}" rx="4.2" ry="2.2" fill="#52b83b" stroke="#266919" stroke-width="0.6" />
            <line x1="${rx}" y1="${ry}" x2="${rx - 2}" y2="${ry - 9}" stroke="#357a24" stroke-width="1.3" />
            <line x1="${rx + 3}" y1="${ry + 1}" x2="${rx + 4}" y2="${ry - 8}" stroke="#357a24" stroke-width="1.3" />
          </g>
        `;
      })()
    ].join("");

    // TRUE-ISOMETRIC OCTAGONAL OBSERVATORY -> SKILLS (with lit study window!)
    const [skiLx, skiLy] = iso(15.65, 10.15, 92);
    const skiIsCurrent = showCurrent && currentPage === "skills";
    const skiLandmark = `
      <a class="map-landmark" data-landmark="skills" href="skills.html" aria-label="Skills">
        <g class="landmark-body">
          ${isoOctagonPrism(15.65, 10.15, 2.7, 1.18, 4.5, "#f5e2c1", ["#e6cea6", "#d9be93", "#c4a77a", "#b09266"])}
          ${isoOctagonPrism(15.65, 10.15, 7.2, 1.0, 4.0, "#faebd0", ["#ebd4ae", "#dec399", "#c9ab80", "#b5966b"])}

          ${isoOctagonPrism(15.65, 10.15, 11.2, 0.84, 28, "#f7e5c6", [
            "#e8d0ab",
            "#f5dfc0",
            "#edd5b2",
            "#d9be98",
            "#c2a67e",
            "#b3966e",
            "#d1b690",
            "#e3caa4"
          ])}

          <!-- Observatory Windows: left angled facet unlit sky-blue, front SW facet warmly lit with study desk & bookshelves! -->
          ${poly([[14.92, 10.52, 19], [15.22, 10.88, 19], [15.22, 10.88, 32], [14.92, 10.52, 32]], "#5eaad1", "#fffaf0", 0.9)}
          ${isoWindowU(15.42, 10.94, 18.5, 0.44, 13.5, "bookshelves", "#fffaf0", "cross")}

          ${isoBox(15.98, 10.35, 11.2, 0.55, 0.52, 18, "#faebd0", "#ebd4ae", "#bfa27a")}
          ${poly([[16.54, 10.48, 11.2], [16.54, 10.76, 11.2], [16.54, 10.76, 24], [16.54, 10.48, 24]], "#261f1b", "#fffaf0", 0.7)}

          ${isoOctagonPrism(15.65, 10.15, 39.2, 0.9, 4.3, "#9e7c56", ["#8c6b48", "#785a3a", "#63482d", "#8c6b48"])}

          ${(() => {
            const R = 0.84;
            const rx = +(R * S * 1.2247).toFixed(1);
            const ry = +(R * S * 0.7071).toFixed(1);
            const [dx, dy] = iso(15.65, 10.15, 43.5);
            const tBase = iso(15.85, 10.05, 59);
            const tTip = iso(16.56, 9.76, 78);
            const angleDeg = (Math.atan2(tTip[1] - tBase[1], tTip[0] - tBase[0]) * 180) / Math.PI;
            const barrelLen = Math.hypot(tTip[0] - tBase[0], tTip[1] - tBase[1]);
            return `
              <path d="M${(dx - rx).toFixed(1)} ${dy} A${rx} ${(rx * 0.92).toFixed(1)} 0 0 1 ${(dx + rx).toFixed(1)} ${dy} A${rx} ${ry} 0 0 1 ${(dx - rx).toFixed(1)} ${dy} Z"
                fill="#fae6c3" stroke="#7d5f3e" stroke-width="1" />
              <path d="M${(dx - rx).toFixed(1)} ${dy} A${rx} ${(rx * 0.92).toFixed(1)} 0 0 1 ${(dx - 4).toFixed(1)} ${(dy - rx * 0.9).toFixed(1)} A${(rx * 0.75).toFixed(1)} ${(rx * 0.88).toFixed(1)} 0 0 0 ${(dx - rx * 0.42).toFixed(1)} ${(dy + ry * 0.82).toFixed(1)} A${rx} ${ry} 0 0 1 ${(dx - rx).toFixed(1)} ${dy} Z"
                fill="#d9bc91" opacity="0.65" />
              <polygon points="${(dx + 2).toFixed(1)},${(dy - 34).toFixed(1)} ${(dx + 17).toFixed(1)},${(dy - 31).toFixed(1)} ${(dx + 25).toFixed(1)},${(dy - 8).toFixed(1)} ${(dx + 9).toFixed(1)},${(dy - 11).toFixed(1)}"
                fill="#241a20" stroke="#fff5e2" stroke-width="1.3" />
              <g transform="translate(${tBase[0]}, ${tBase[1]}) rotate(${angleDeg.toFixed(1)})">
                <rect x="0" y="-7.5" width="${barrelLen.toFixed(1)}" height="15" rx="2.5" fill="#f7ebd4" stroke="#6e4f30" stroke-width="1" />
                <rect x="${(barrelLen * 0.48).toFixed(1)}" y="-8.5" width="${(barrelLen * 0.52).toFixed(1)}" height="17" rx="2" fill="#b57d47" stroke="#5e3c1b" stroke-width="1" />
                <ellipse cx="${barrelLen.toFixed(1)}" cy="0" rx="4.2" ry="8.5" fill="#6ad0f0" stroke="#fffaf0" stroke-width="1.2" />
                <ellipse cx="${(barrelLen - 0.8).toFixed(1)}" cy="-2.2" rx="1.6" ry="3.6" fill="#ffffff" opacity="0.75" />
              </g>
            `;
          })()}
        </g>
        ${skiIsCurrent ? currentPin(skiLx, skiLy + 6) : ""}
        ${speechBubble(skiLx, skiLy, "Skills", skiIsCurrent)}
      </a>
    `;

    // Foreground Observatory Park Trees & Benches (drawn AFTER skiLandmark in open lawn — ZERO clipping!)
    const observatoryForegroundProps = [
      benchU(14.3, 11.75, 2.7),
      benchV(16.78, 12.55, 2.7),
      canopyTree(14.08, 10.35, 2.7, 0.86, 1),
      tallParkTree(17.18, 9.15, 2.7, 0.92),
      canopyTree(17.18, 11.45, 2.7, 0.9, 0),
      tallParkTree(17.1, 13.35, 2.7, 0.86),
      bush(16.65, 13.55, 2.7, 5.2, "#449e2b"),
      streetLamp(13.95, 13.75, 2.7, 1)
    ].join("");

    // --- 11. LANDMARK 7: PROPORTIONALLY SCALED BRITISH RED TELEPHONE BOX & POSTBOX -> CONTACT ---
    const [conLx, conLy] = iso(9.38, 13.48, 52);
    const conIsCurrent = showCurrent && currentPage === "contact";
    const conLandmark = `
      <a class="map-landmark" data-landmark="contact" href="contact.html" aria-label="Contact">
        <polygon class="landmark-shadow" points="${pts([[9.05, 13.18, 2.6], [9.82, 13.18, 2.6], [9.82, 13.85, 2.6], [9.05, 13.85, 2.6]])}" fill="rgba(15,43,7,0.22)" />
        <g class="landmark-body">
          <!-- Scaled-down human-proportioned British K6 Red Telephone Box -->
          ${isoBox(9.06, 13.16, 2.6, 0.64, 0.64, 2.6, "#d9be93", "#bf9f70", "#a38354")}
          ${isoBox(9.15, 13.25, 5.2, 0.46, 0.46, 29, "#dc3418", "#bd230b", "#8f1805", "#541003")}
          ${isoBox(9.12, 13.22, 34.2, 0.52, 0.52, 3.4, "#eb4426", "#bd230b", "#8f1805")}
          ${isoBox(9.19, 13.29, 37.6, 0.38, 0.38, 2.5, "#f55738", "#dc3418", "#9e1c07")}
          <!-- Warmly lit multi-pane K6 telephone kiosk glazing -->
          ${isoWindowU(9.21, 13.72, 11.5, 0.34, 19.5, "lampBooks", "#bd230b", "tallGrid")}
          ${isoWindowV(9.62, 13.31, 11.5, 0.34, 19.5, "unlit", "#8f1805", "tallGrid")}
          <!-- Petite Royal Mail red pillar postbox beside the kiosk (human-scale, NOT elephant-scale!) -->
          ${isoBox(9.8, 13.42, 2.6, 0.16, 0.16, 1.1, "#383431", "#2b2826", "#1f1d1b")}
          ${isoBox(9.81, 13.43, 3.7, 0.14, 0.14, 6.0, "#e03d28", "#c42b18", "#911c0d")}
          ${isoBox(9.79, 13.41, 9.7, 0.18, 0.18, 1.1, "#eb4a36", "#c42b18", "#911c0d")}
          ${lineIso([9.84, 13.58, 8.0], [9.93, 13.58, 8.0], "#1c1614", 1.1)}
          ${streetLamp(8.65, 13.88, 2.6, 1)}
          ${benchU(10.12, 13.65, 2.6)}
        </g>
        ${conIsCurrent ? currentPin(conLx, conLy + 6) : ""}
        ${speechBubble(conLx, conLy, "Contact", conIsCurrent)}
      </a>
    `;

    // --- 12. LANDMARK 8: PROMENADE CV NOTICEBOARD -> DOWNLOAD CV ---
    const [cvLx, cvLy] = iso(11.45, 13.55, 52);
    const cvLandmark = `
      <a class="map-landmark" data-landmark="cv" href="${cvHref}" target="_blank" rel="noopener noreferrer" download="Louis_Perry_CV.pdf" aria-label="Download CV">
        <polygon class="landmark-shadow" points="${pts([[11.1, 13.3, 2.6], [11.95, 13.3, 2.6], [11.95, 13.85, 2.6], [11.1, 13.85, 2.6]])}" fill="rgba(15,43,7,0.2)" />
        <g class="landmark-body">
          ${isoBox(11.18, 13.48, 2.6, 0.14, 0.14, 24, "#7a4419", "#613411", "#4a260b")}
          ${isoBox(11.68, 13.48, 2.6, 0.14, 0.14, 24, "#7a4419", "#613411", "#4a260b")}
          ${isoBox(11.1, 13.45, 14.6, 0.8, 0.2, 18, "#9e5922", "#7d4316", "#5e310e")}
          ${poly([[11.2, 13.66, 17.5], [11.8, 13.66, 17.5], [11.8, 13.66, 29.5], [11.2, 13.66, 29.5]], "#fffaf0", "#f09c38", 0.9)}
          ${isoRoofU(11.04, 13.35, 32.6, 0.92, 0.4, 8.5, "#15730c", "#0c4f06", "#15730c")}
        </g>
        ${speechBubble(cvLx, cvLy, "Download CV", false)}
      </a>
    `;

    // --- 13. STATIC VEHICLES & LAMPS ON COASTAL BOULEVARD C ---
    const coastalProps = [
      isoVehicleU(4.45, 15.26, 1, "#fffaf0", "#e3d8c4", "#bfb29b", "#1d8ca3", true),
      isoVehicleU(13.85, 14.62, -1, "#eb5234", "#c93b1e", "#9c2811", "#fffaf0", true),
      streetLamp(3.1, 14.18, 2.6, 1),
      streetLamp(12.1, 14.12, 2.6, -1)
    ].join("");

    // --- 14. CAVE EASTER EGG BAT SWARM ---
    const [caveFx, caveFy] = iso(caveMouthCenter[0], caveMouthCenter[1], caveMouthCenter[2] + 2);
    const batShape =
      '<path d="M0 -1.6 L-1.1 -3.8 L-2 -1.9 C-5 -6.5 -9.8 -4.8 -12.5 -1 C-9.2 -0.5 -7.2 1 -5.6 2.6 C-3.6 1 -2 1.3 -1 3.1 L0 4.1 L1 3.1 C2 1.3 3.6 1 5.6 2.6 C7.2 1 9.2 -0.5 12.5 -1 C9.8 -4.8 5 -6.5 2 -1.9 L1.1 -3.8 Z" fill="#11240b" stroke="#fff5e0" stroke-width="0.65" stroke-linejoin="round" />';
    const batsMarkup = Array.from({ length: 10 }, (_, i) => `
      <g class="cave-bat cave-bat--${i + 1}">
        <g class="bat-flap">${batShape}</g>
      </g>
    `).join("");

    const caveEffectsLayer = `
      <g class="cave-effects" data-cave-effects="true" pointer-events="none">
        <g class="cave-bats" transform="translate(${caveFx.toFixed(1)}, ${caveFy.toFixed(1)})">
          <circle class="cave-burst-ring" cx="0" cy="0" r="8" fill="none" stroke="#ff5a2e" stroke-width="2.4" />
          <circle class="cave-burst-puff cave-burst-puff--1" cx="-4" cy="-3" r="5.5" fill="#e8c796" />
          <circle class="cave-burst-puff cave-burst-puff--2" cx="4" cy="-2" r="6" fill="#f2d5a7" />
          ${batsMarkup}
        </g>
      </g>
    `;

    return `
      <svg class="world-map-svg" viewBox="80 12 1440 985" role="img" aria-label="Interactive isometric world map of Louis Perry's portfolio">
        <defs>
          <filter id="labelShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f2b07" flood-opacity="0.22" />
          </filter>
          <filter id="redEyeGlow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="${coastClipId}">
            <polygon points="${pts([[0, 15.68, 0], [18, 15.68, 0], [18, 18, 0], [0, 18, 0]])}" />
          </clipPath>
          <linearGradient id="${seaGradId}" x1="0%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stop-color="#3cd0df" />
            <stop offset="45%" stop-color="#1ca2ba" />
            <stop offset="100%" stop-color="#0f738a" />
          </linearGradient>
        </defs>

        <!-- Layer 1: Island Slab, Sloping Coast Cross-Section, Pier, Sidewalks, Roads & Markings -->
        ${groundAndCoast}
        ${roadsAndSidewalks}

        <!-- Layer 2: North Row (Mountain + Winding Trail + 3D Cave + About, Experience, Research) -->
        ${mountainAndCave}
        ${aboutLandmark}
        ${expLandmark}
        ${northBackTrees}
        ${resLandmark}
        ${northAndBoulevardProps}

        <!-- Layer 3: South Row (Education + Tiered Clock Tower, Home Cottage + Cat Window, Observatory + Pond Park, Contact, CV) -->
        ${westQuadPaths}
        ${eduLandmark}
        ${westQuadForegroundProps}
        ${homeLandmark}
        ${homeForegroundProps}
        ${observatoryParkWalksAndPond}
        ${skiLandmark}
        ${observatoryForegroundProps}
        ${cvLandmark}
        ${conLandmark}

        <!-- Layer 4: Static Coastal Vehicles & Lamps -->
        ${coastalProps}

        <!-- Layer 5: Cave Easter Egg Bat Swarm -->
        ${caveEffectsLayer}
      </svg>
    `;
  }

  function bindMapInteractions(container) {
    if (!container) return;
    const cave = container.querySelector('[data-cave-trigger="true"]');
    const effects = container.querySelector('[data-cave-effects="true"]');
    if (!cave || !effects) return;

    let resetTimer = null;

    function triggerCaveEasterEgg(e) {
      if (e) e.preventDefault();
      effects.classList.remove("is-triggered");
      void effects.getBoundingClientRect();
      effects.classList.add("is-triggered");

      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        effects.classList.remove("is-triggered");
      }, 2400);
    }

    cave.addEventListener("click", triggerCaveEasterEgg);
    cave.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        triggerCaveEasterEgg(e);
      }
    });
  }

  function renderWorldMap(targetId, currentPage) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.innerHTML = `
      <div class="world-stage">
        ${buildWorldSvg({ currentPage, showCurrent: false })}
      </div>
    `;
    bindMapInteractions(el);
  }

  /**
   * Builds the bespoke 3D isometric miniature island diorama rendered inside the
   * bottom-right crystal Snow Globe on subpages (with a live mini-pin on the active building!).
   */
  function buildMiniGlobeDioramaSvg(currentPage) {
    // Local mini isometric projection centered cleanly inside the crystal sphere (cy=59, r=51.5)
    const mOX = 70;
    const mOY = 36.5;
    const mS = 5.15;
    function mIso(u, v, z = 0) {
      return [
        +(mOX + (u - v) * mS * COS).toFixed(1),
        +(mOY + (u + v) * mS * SIN - z).toFixed(1)
      ];
    }
    function mPts(list) {
      return list.map(([u, v, z = 0]) => mIso(u, v, z).join(",")).join(" ");
    }
    function mPoly(list, fill, stroke = "none", sw = 0) {
      return `<polygon points="${mPts(list)}" fill="${fill}"${
        stroke !== "none" ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"` : ""
      } />`;
    }
    function mBox(u, v, z, du, dv, dz, topC, leftC, rightC) {
      return (
        mPoly([[u, v + dv, z], [u + du, v + dv, z], [u + du, v + dv, z + dz], [u, v + dv, z + dz]], leftC, "rgba(15,43,7,0.22)", 0.35) +
        mPoly([[u + du, v, z], [u + du, v + dv, z], [u + du, v + dv, z + dz], [u + du, v, z + dz]], rightC, "rgba(15,43,7,0.22)", 0.35) +
        mPoly([[u, v, z + dz], [u + du, v, z + dz], [u + du, v + dv, z + dz], [u, v + dv, z + dz]], topC, "rgba(15,43,7,0.22)", 0.35)
      );
    }
    function mTree(u, v, z = 0, r = 2.4) {
      const [tx, ty] = mIso(u, v, z);
      return `
        <circle cx="${(tx + 0.8).toFixed(1)}" cy="${(ty - r * 0.7).toFixed(1)}" r="${(r * 0.85).toFixed(1)}" fill="#267319" />
        <circle cx="${(tx - 0.6).toFixed(1)}" cy="${(ty - r * 1.05).toFixed(1)}" r="${r.toFixed(1)}" fill="#48a832" />
        <circle cx="${(tx - 1.0).toFixed(1)}" cy="${(ty - r * 1.3).toFixed(1)}" r="${(r * 0.52).toFixed(1)}" fill="#8be063" opacity="0.75" />
      `;
    }

    // Active landmark coordinates in 0..10 mini-grid for the glowing mini-pin
    const pinTargets = {
      about: [1.8, 1.5, 18.5],
      experience: [5.8, 2.1, 8.5],
      research: [8.4, 2.7, 9.0],
      education: [2.2, 6.4, 13.5],
      home: [5.8, 5.8, 8.0],
      skills: [8.5, 5.8, 9.5],
      contact: [5.2, 7.6, 6.5]
    };
    const pinCoord = pinTargets[currentPage];
    let miniPinMarkup = "";
    if (pinCoord) {
      const [px, py] = mIso(pinCoord[0], pinCoord[1], pinCoord[2]);
      miniPinMarkup = `
        <g transform="translate(${px}, ${py})">
          <g class="sg-active-pin">
            <circle cx="0" cy="-5.5" r="5.2" fill="#ffbe2e" opacity="0.35" />
            <path d="M0 0 C-2.6 -3.5 -4.2 -5.5 -4.2 -7.8 A4.2 4.2 0 1 1 4.2 -7.8 C4.2 -5.5 2.6 -3.5 0 0 Z" fill="#0d3816" stroke="#ffbe2e" stroke-width="1.1" />
            <circle cx="0" cy="-7.8" r="1.6" fill="#ffbe2e" />
          </g>
        </g>
      `;
    }

    const [obsX, obsY] = mIso(8.45, 5.85, 5.2);
    const [twBaseX, twBaseY] = mIso(2.35, 1.35, 11.5);
    const [caveX, caveY] = mIso(2.65, 2.65, 2.2);

    return `
      <!-- Soft cast shadow of floating island on inner globe floor -->
      <ellipse cx="70" cy="95" rx="41" ry="10.5" fill="rgba(15, 43, 7, 0.22)" />

      <!-- 3D Isometric Island Cutaway Slab (0..10 x 0..10) -->
      <!-- SE Soil & Sloping Water Cross-Section -->
      ${mPoly([[10, 0, 0], [10, 10, 0], [10, 10, -5.5], [10, 0, -5.5]], "#8c5528", "rgba(15,43,7,0.25)", 0.4)}
      ${mPoly([[10, 8.8, 0], [10, 10, 0], [10, 10, -5.5]], "#0d6a82")}
      <!-- SW Full-Span Ocean Cross-Section -->
      ${mPoly([[0, 10, 0], [10, 10, 0], [10, 10, -5.5], [0, 10, -5.5]], "#127e99", "rgba(15,43,7,0.25)", 0.4)}
      <!-- Main Green Island Top -->
      ${mPoly([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]], "#63ad37", "#468222", 0.5)}
      <!-- Golden Sandy Beach, Wavy Turquoise Sea & Mini Wooden Pier -->
      ${mPoly([[0, 8.55, 0], [10, 8.55, 0], [10, 10, 0], [0, 10, 0]], "#f6c667")}
      ${mPoly([[0, 9.05, 0], [3.2, 8.92, 0], [6.8, 9.15, 0], [10, 8.95, 0], [10, 10, 0], [0, 10, 0]], "#1da6bf")}
      <polyline points="${mPts([[0, 9.05, 0.1], [3.2, 8.92, 0.1], [6.8, 9.15, 0.1], [10, 8.95, 0.1]])}" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" opacity="0.92" />
      ${mBox(3.9, 8.7, 0.2, 0.55, 0.9, 0.8, "#d6a165", "#9e6d36", "#754d21")}

      <!-- Isometric Asphalt Cross-Roads -->
      ${mPoly([[0, 3.75, 0.05], [10, 3.75, 0.05], [10, 4.45, 0.05], [0, 4.45, 0.05]], "#575954")}
      ${mPoly([[0, 7.9, 0.05], [10, 7.9, 0.05], [10, 8.55, 0.05], [0, 8.55, 0.05]], "#5c5e59")}
      ${mPoly([[3.8, 0.5, 0.05], [4.5, 0.5, 0.05], [4.5, 8.55, 0.05], [3.8, 8.55, 0.05]], "#575954")}
      ${mPoly([[6.9, 0.5, 0.05], [7.5, 0.5, 0.05], [7.5, 8.55, 0.05], [6.9, 8.55, 0.05]], "#575954")}

      <!-- 1. NW Craggy 3D Mountain + Winding Trail + Cave + Lodge + Radio Tower -->
      ${mPoly([[0.3, 1.9, 0], [1.0, 0.3, 0], [1.65, 0.85, 17.5]], "#43573d")}
      ${mPoly([[1.0, 0.3, 0], [3.4, 0.9, 0], [1.65, 0.85, 17.5]], "#8f7e63")}
      ${mPoly([[0.3, 1.9, 0], [0.8, 3.3, 0], [2.1, 3.55, 0], [1.65, 0.85, 17.5]], "#6f644e")}
      ${mPoly([[2.1, 3.55, 0], [3.55, 2.7, 0], [3.4, 0.9, 0], [1.65, 0.85, 17.5]], "#9c896b")}
      <!-- Mini Winding Mountain Path & Cave -->
      <polyline points="${mPts([[1.85, 3.65, 0.2], [1.05, 3.05, 2.2], [1.85, 2.55, 5.2], [1.45, 2.1, 8.2], [1.75, 1.85, 10.5]])}" fill="none" stroke="#e6c38c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <ellipse cx="${caveX}" cy="${caveY}" rx="2.3" ry="1.8" fill="#14110d" stroke="#5e503e" stroke-width="0.6" />
      <!-- Mini Alpine Lodge & Red/White Tower -->
      ${mBox(1.2, 1.2, 10.8, 0.75, 0.7, 3.0, "#36485c", "#6e4323", "#4a2c15")}
      <line x1="${twBaseX}" y1="${twBaseY}" x2="${twBaseX}" y2="${(twBaseY - 8.5).toFixed(1)}" stroke="#dc3418" stroke-width="1.35" stroke-linecap="round" />
      <line x1="${twBaseX}" y1="${(twBaseY - 2.8).toFixed(1)}" x2="${twBaseX}" y2="${(twBaseY - 5.4).toFixed(1)}" stroke="#ffffff" stroke-width="1.35" />
      <circle cx="${twBaseX}" cy="${(twBaseY - 9.0).toFixed(1)}" r="1.3" fill="#ffbe2e" />

      <!-- 2. Experience Columned Brick Hall (North-Center) -->
      ${mBox(4.9, 1.2, 0.3, 1.65, 1.75, 4.8, "#f0a065", "#d4663b", "#a84420")}
      ${mBox(5.35, 2.85, 0.3, 0.75, 0.4, 4.5, "#fffcf7", "#ebe3d5", "#c9bfb0")}

      <!-- 3. Research Vaulted Silver Lab (North-East) -->
      ${mBox(7.8, 1.8, 0.3, 1.45, 1.35, 6.0, "#cfd8dc", "#9aa6ad", "#7b878f")}
      ${mBox(8.35, 2.45, 0.3, 1.05, 0.95, 3.8, "#b8c4ca", "#8b979e", "#6d7880")}

      <!-- 4. Education Brick University & Tall Clock Tower (South-West) -->
      ${mBox(0.85, 5.95, 0.3, 1.6, 0.95, 4.5, "#364654", "#e07448", "#9c3821")}
      ${mBox(1.75, 5.05, 0.3, 0.95, 1.6, 4.5, "#364654", "#e07448", "#9c3821")}
      ${mBox(1.88, 6.02, 0.3, 0.85, 0.85, 9.2, "#2c3b4a", "#e3794b", "#9c3821")}
      ${(() => {
        const [cx, cy] = mIso(2.3, 6.89, 6.8);
        const [tx, ty] = mIso(2.3, 6.45, 12.6);
        const [b1x, b1y] = mIso(1.85, 6.88, 9.5);
        const [b2x, b2y] = mIso(2.75, 6.88, 9.5);
        const [b3x, b3y] = mIso(2.75, 6.0, 9.5);
        return `
          <polygon points="${b1x},${b1y} ${b2x},${b2y} ${tx},${ty}" fill="#3b4d5e" />
          <polygon points="${b2x},${b2y} ${b3x},${b3y} ${tx},${ty}" fill="#24313d" />
          <circle cx="${cx}" cy="${cy}" r="1.3" fill="#ffffff" stroke="#1e2a38" stroke-width="0.4" />
        `;
      })()}

      <!-- 5. Home Stone & Clapboard Cottage + Red Phone Box (Center) -->
      ${mBox(4.95, 5.1, 0.3, 0.9, 1.0, 3.6, "#45505b", "#f5ebd6", "#ded0b4")}
      ${mBox(5.65, 5.05, 0.3, 0.95, 1.35, 4.2, "#323c46", "#cfc3af", "#aba08e")}
      ${mBox(5.05, 7.25, 0.3, 0.38, 0.38, 3.8, "#eb4426", "#dc3418", "#8f1805")}

      <!-- 6. Skills Observatory Dome & Turquoise Park Pond (South-East) -->
      ${mPoly([[7.8, 6.85, 0.3], [8.65, 6.8, 0.3], [8.85, 7.45, 0.3], [7.95, 7.55, 0.3]], "#2eb0c4", "#cfc2ab", 0.5)}
      ${mBox(8.0, 5.4, 0.3, 0.95, 0.95, 3.6, "#faebd0", "#e6cea6", "#bfa27a")}
      <path d="M${(obsX - 5.2).toFixed(1)} ${obsY} A5.2 4.8 0 0 1 ${(obsX + 5.2).toFixed(1)} ${obsY} Z" fill="#fae6c3" stroke="#7d5f3e" stroke-width="0.55" />
      <line x1="${(obsX + 1.5).toFixed(1)}" y1="${(obsY - 2.8).toFixed(1)}" x2="${(obsX + 6.2).toFixed(1)}" y2="${(obsY - 5.0).toFixed(1)}" stroke="#b57d47" stroke-width="1.6" stroke-linecap="round" />

      <!-- Lush Miniature Trees -->
      ${mTree(0.65, 2.95, 0.2, 2.0)}
      ${mTree(3.35, 3.25, 0.2, 1.9)}
      ${mTree(0.85, 7.35, 0.2, 2.2)}
      ${mTree(3.25, 5.25, 0.2, 2.1)}
      ${mTree(6.55, 6.65, 0.2, 2.0)}
      ${mTree(9.35, 6.45, 0.2, 2.1)}

      ${miniPinMarkup}
    `;
  }

  function mountSnowGlobe(currentPage) {
    if (!currentPage || currentPage === "home") return;

    const wrapper = document.createElement("div");
    wrapper.className = "snowglobe-root";
    wrapper.innerHTML = `
      <button
        class="snowglobe-trigger"
        id="snowglobe-trigger"
        type="button"
        aria-label="Open interactive world map navigator"
        aria-haspopup="dialog"
        aria-expanded="false"
      >
        <span class="snowglobe-tooltip" aria-hidden="true">Explore World Map</span>
        <svg class="snowglobe-svg" viewBox="0 0 140 158" aria-hidden="true">
          <defs>
            <!-- Warm sunlit atmospheric sky inside crystal sphere -->
            <radialGradient id="sgSky" cx="38%" cy="28%" r="70%">
              <stop offset="0%" stop-color="#fffef9" />
              <stop offset="48%" stop-color="#faecd2" />
              <stop offset="82%" stop-color="#ebd0a0" />
              <stop offset="100%" stop-color="#c99b5b" />
            </radialGradient>

            <!-- 3D Optical Glass Refraction & Edge Fresnel -->
            <radialGradient id="sgFresnel" cx="46%" cy="44%" r="54%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
              <stop offset="74%" stop-color="#fff8e8" stop-opacity="0.03" />
              <stop offset="90%" stop-color="#bfe8f2" stop-opacity="0.22" />
              <stop offset="97%" stop-color="#ffffff" stop-opacity="0.48" />
              <stop offset="100%" stop-color="#173812" stop-opacity="0.34" />
            </radialGradient>

            <!-- Soft specular highlight gradient -->
            <linearGradient id="sgSpec" x1="0%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.88" />
              <stop offset="55%" stop-color="#ffffff" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
            </linearGradient>

            <!-- Turned Walnut/Mahogany 3D Cylindrical Lathe Gradient -->
            <linearGradient id="sgWood" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#291105" />
              <stop offset="18%" stop-color="#5c280c" />
              <stop offset="36%" stop-color="#8c4117" />
              <stop offset="50%" stop-color="#6e300e" />
              <stop offset="76%" stop-color="#3d1906" />
              <stop offset="100%" stop-color="#1f0b02" />
            </linearGradient>

            <!-- Brushed Antiqued Brass Collar & Plaque Gradient -->
            <linearGradient id="sgBrass" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#6e4911" />
              <stop offset="26%" stop-color="#e3b14b" />
              <stop offset="44%" stop-color="#fff1b8" />
              <stop offset="68%" stop-color="#cfa53c" />
              <stop offset="100%" stop-color="#59390a" />
            </linearGradient>

            <clipPath id="sgInnerClip">
              <circle cx="70" cy="59.5" r="51.2" />
            </clipPath>
          </defs>

          <!-- Ambient ground shadow beneath pedestal -->
          <ellipse cx="70" cy="147" rx="46" ry="7.5" fill="rgba(15, 43, 7, 0.28)" />

          <!-- Back half of Brushed-Brass Cushion Ring -->
          <ellipse cx="70" cy="109.5" rx="37.5" ry="6.8" fill="#4a2f08" stroke="#362003" stroke-width="0.9" />

          <!-- Inner Crystal Sphere Backdrop & True 3D Isometric Miniature Island -->
          <g class="snowglobe-mini-world" clip-path="url(#sgInnerClip)">
            <circle cx="70" cy="59.5" r="51.8" fill="url(#sgSky)" />
            <!-- Soft horizon clouds -->
            <path d="M24,39 Q32,33 41,38 Q48,34 55,40 L24,40 Z" fill="#ffffff" opacity="0.62" />
            <path d="M88,33 Q95,28 103,32 Q109,30 114,35 L88,35 Z" fill="#ffffff" opacity="0.52" />

            ${buildMiniGlobeDioramaSvg(currentPage)}
          </g>

          <!-- Optical Crystal Glass Sphere (seated cleanly into the brass collar; lifts open on click!) -->
          <g class="snowglobe-dome">
            <circle cx="70" cy="59.5" r="51.4" fill="url(#sgFresnel)" stroke="rgba(255, 250, 235, 0.72)" stroke-width="1.3" />
            <circle cx="70" cy="59.5" r="51.8" fill="none" stroke="rgba(20, 48, 12, 0.34)" stroke-width="0.85" />

            <!-- Curved Tapered Specular Glass Reflection Crescent (Upper-Left) -->
            <path d="M28,50 A44,44 0 0 1 64,15 C50,20 37,32 32,51 Z" fill="url(#sgSpec)" />
            <ellipse cx="27.5" cy="59" rx="2.1" ry="4.3" transform="rotate(-14 27.5 59)" fill="#ffffff" opacity="0.58" />

            <!-- Subtle Rim Bounce-Light Arc (Lower-Right) -->
            <path d="M93,99 A45,45 0 0 0 114,69" fill="none" stroke="#fff6d6" stroke-width="1.5" stroke-linecap="round" opacity="0.42" />

            <!-- Drifting Golden Atmospheric Dust Motes -->
            <circle class="sg-mote sg-mote--1" cx="48" cy="38" r="1.5" fill="#fffdf2" />
            <circle class="sg-mote sg-mote--2" cx="92" cy="43" r="1.3" fill="#ffdf7d" />
            <circle class="sg-mote sg-mote--3" cx="67" cy="29" r="1.2" fill="#ffffff" />
          </g>

          <!-- Turned Mahogany & Brushed-Brass Collector's Pedestal Base (front collar cradles glass sphere!) -->
          <g class="snowglobe-pedestal">
            <!-- Bottom flared mahogany foot -->
            <ellipse cx="70" cy="142.5" rx="43" ry="8.2" fill="#210c02" stroke="#140700" stroke-width="1" />
            <path d="M28,136 C28,144 112,144 112,136 L112,141.5 C112,149.5 28,149.5 28,141.5 Z" fill="url(#sgWood)" stroke="#1c0a02" stroke-width="0.9" />
            <!-- Sculpted concave mahogany waist -->
            <path d="M34,109.5 C37,119.5 36,129 29,136.5 C46,143.5 94,143.5 111,136.5 C104,129 103,119.5 106,109.5 Z"
              fill="url(#sgWood)" stroke="#1f0b02" stroke-width="1" stroke-linejoin="round" />
            <path d="M31,135.5 Q70,143.5 109,135.5" fill="none" stroke="#b86830" stroke-width="0.9" opacity="0.55" />

            <!-- Front Brushed-Brass Collar Lip cleanly cradling the bottom of the crystal sphere! -->
            <path d="M32.5,109.5 A37.5,6.8 0 0 0 107.5,109.5 L107.5,112.5 A37.5,6.8 0 0 1 32.5,112.5 Z"
              fill="url(#sgBrass)" stroke="#472c06" stroke-width="0.95" stroke-linejoin="round" />
            <path d="M34,109.8 A36,6.3 0 0 0 106,109.8" fill="none" stroke="#fff7cf" stroke-width="0.7" opacity="0.85" />

            <!-- Curved Engraved Brass Nameplate with Rivets -->
            <path d="M44,121.5 Q70,127.5 96,121.5 L97.5,132.5 Q70,138.8 42.5,132.5 Z"
              fill="url(#sgBrass)" stroke="#3d2405" stroke-width="1" stroke-linejoin="round" />
            <path d="M45.8,123.3 Q70,128.9 94.2,123.3" fill="none" stroke="#fff9db" stroke-width="0.65" opacity="0.8" />
            <circle cx="46.5" cy="127.4" r="1.15" fill="#4a2e06" />
            <circle cx="93.5" cy="127.4" r="1.15" fill="#4a2e06" />
            <text x="70" y="132.0" text-anchor="middle" font-family="'Roboto Mono', monospace" font-size="7.6" font-weight="700" fill="#1b1204" letter-spacing="1.1">WORLD MAP</text>
          </g>
        </svg>
      </button>

      <div class="globe-modal" id="globe-modal" role="dialog" aria-modal="true" aria-labelledby="globe-modal-title">
        <div class="globe-modal-card">
          <div class="globe-modal-header">
            <div>
              <h2 id="globe-modal-title">Navigate the World</h2>
              <p>Click any building or landmark to jump to another page.</p>
            </div>
            <button class="globe-modal-close" id="globe-modal-close" type="button" aria-label="Close world map">Close &times;</button>
          </div>
          <div class="globe-modal-body" id="globe-modal-map"></div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);

    const trigger = document.getElementById("snowglobe-trigger");
    const modal = document.getElementById("globe-modal");
    const closeBtn = document.getElementById("globe-modal-close");
    const mapContainer = document.getElementById("globe-modal-map");

    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="world-stage world-stage--modal">
          ${buildWorldSvg({ currentPage, showCurrent: true })}
        </div>
      `;
      bindMapInteractions(mapContainer);
    }

    let openTimer = null;

    function openGlobe() {
      if (!trigger || !modal) return;
      trigger.classList.add("is-opening");
      trigger.setAttribute("aria-expanded", "true");
      clearTimeout(openTimer);
      openTimer = setTimeout(() => {
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
        closeBtn?.focus();
      }, 180);
    }

    function closeGlobe() {
      if (!trigger || !modal) return;
      clearTimeout(openTimer);
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(() => {
        trigger.classList.remove("is-opening");
        trigger.setAttribute("aria-expanded", "false");
        trigger.focus();
      }, 180);
    }

    trigger?.addEventListener("click", openGlobe);
    closeBtn?.addEventListener("click", closeGlobe);
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeGlobe();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("is-open")) {
        closeGlobe();
      }
    });
  }

  window.WorldMap = window.WORLD_MAP = {
    renderWorldMap,
    mountSnowGlobe,
    buildWorldSvg
  };
})();
