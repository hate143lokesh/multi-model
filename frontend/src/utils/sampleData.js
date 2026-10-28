// Creates simulated high-contrast construction inspection images as File objects for 1-click demos

function createSVGImageFile(svgString, fileName) {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  return new File([blob], fileName, { type: 'image/jpeg' });
}

export const SAMPLE_IMAGES = {
  safetyHazard: {
    title: "Scaffold Edge & Missing Hardhats",
    category: "Safety & PPE",
    description: "Multi-story cantilever staging with perimeter guardrail deficiency and unhelmeted personnel.",
    generateFile: () => {
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#1e293b"/>
        <!-- Building Frame -->
        <rect x="50" y="80" width="700" height="480" fill="#334155" stroke="#64748b" stroke-width="4"/>
        <line x1="50" y1="240" x2="750" y2="240" stroke="#94a3b8" stroke-width="6"/>
        <line x1="50" y1="400" x2="750" y2="400" stroke="#94a3b8" stroke-width="6"/>
        <!-- Columns -->
        <rect x="180" y="80" width="40" height="480" fill="#475569"/>
        <rect x="420" y="80" width="40" height="480" fill="#475569"/>
        <rect x="620" y="80" width="40" height="480" fill="#475569"/>
        <!-- Scaffolding Frame -->
        <line x1="280" y1="120" x2="280" y2="400" stroke="#f59e0b" stroke-width="4"/>
        <line x1="380" y1="120" x2="380" y2="400" stroke="#f59e0b" stroke-width="4"/>
        <line x1="280" y1="180" x2="380" y2="280" stroke="#f59e0b" stroke-width="2"/>
        <line x1="280" y1="280" x2="380" y2="180" stroke="#f59e0b" stroke-width="2"/>
        <!-- Edge without guardrail indicator -->
        <rect x="50" y="230" width="130" height="10" fill="#ef4444"/>
        <text x="60" y="220" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="bold">MISSING EDGE RAIL</text>
        <!-- Workers -->
        <circle cx="320" cy="210" r="14" fill="#f97316"/> <!-- Worker 1 with helmet -->
        <rect x="312" y="225" width="16" height="30" fill="#3b82f6"/>
        <circle cx="540" cy="370" r="14" fill="#e2e8f0"/> <!-- Worker 2 NO helmet -->
        <rect x="532" y="385" width="16" height="30" fill="#10b981"/>
        <text x="490" y="355" fill="#ef4444" font-family="sans-serif" font-size="12" font-weight="bold">NO HARDHAT</text>
        <!-- Title Banner -->
        <rect x="0" y="0" width="800" height="45" fill="#0f172a"/>
        <text x="20" y="28" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">CONSTRUCTAI AUDIT CAM #04 - SECTOR 7 SLAB POUR</text>
      </svg>`;
      return createSVGImageFile(svg, "site_inspection_deck4.jpg");
    }
  },

  structuralCrack: {
    title: "Concrete Beam 45° Shear Crack",
    category: "Structural Forensic",
    description: "Reinforced concrete transfer beam web exhibiting diagonal shear displacement.",
    generateFile: () => {
      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#64748b"/>
        <!-- Concrete Texture Lines -->
        <rect x="40" y="100" width="720" height="400" fill="#94a3b8" stroke="#475569" stroke-width="4"/>
        <!-- Rebar exposed shadow -->
        <line x1="60" y1="460" x2="740" y2="460" stroke="#334155" stroke-dasharray="8,8" stroke-width="6"/>
        <!-- 45-degree diagonal shear crack -->
        <path d="M 280 440 Q 340 360 410 290 T 520 160" fill="none" stroke="#0f172a" stroke-width="5"/>
        <path d="M 330 370 Q 370 340 400 350" fill="none" stroke="#0f172a" stroke-width="2.5"/>
        <!-- Scale Reference Coin/Marker -->
        <circle cx="230" cy="420" r="22" fill="#d97706" stroke="#b45309" stroke-width="2"/>
        <text x="216" y="425" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold">SCALE</text>
        <!-- Annotation text -->
        <rect x="430" y="240" width="220" height="50" rx="6" fill="#1e293b" opacity="0.9"/>
        <text x="445" y="262" fill="#ef4444" font-family="sans-serif" font-size="13" font-weight="bold">DIAGONAL SHEAR CRACK</text>
        <text x="445" y="280" fill="#cbd5e1" font-family="sans-serif" font-size="11">Angle: ~45 deg | Width: ~1.4mm</text>
        <!-- Title Banner -->
        <rect x="0" y="0" width="800" height="45" fill="#0f172a"/>
        <text x="20" y="28" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="bold">CONSTRUCTAI FORENSIC SCAN - BEAM B-102</text>
      </svg>`;
      return createSVGImageFile(svg, "structural_beam_crack_b102.jpg");
    }
  }
};
