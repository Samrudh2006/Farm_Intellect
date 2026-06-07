const svgDataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const roleSceneSvg = (label: string, scene: string) => svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="warmSky" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fef3c7"/>
      <stop offset="0.58" stop-color="#fbbf24"/>
      <stop offset="1" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="fieldGreen" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#bef264"/>
      <stop offset="0.52" stop-color="#65a30d"/>
      <stop offset="1" stop-color="#166534"/>
    </linearGradient>
    <linearGradient id="grainGold" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fef08a"/>
      <stop offset="1" stop-color="#ca8a04"/>
    </linearGradient>
    <linearGradient id="shopGlow" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#fff7ed"/>
      <stop offset="0.5" stop-color="#fed7aa"/>
      <stop offset="1" stop-color="#9a3412"/>
    </linearGradient>
    <linearGradient id="officeWall" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#92400e"/>
      <stop offset="0.48" stop-color="#f3e8d3"/>
      <stop offset="1" stop-color="#7c2d12"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#111827" flood-opacity="0.25"/>
    </filter>
    <filter id="photoWarmth">
      <feColorMatrix type="matrix" values="1.08 0.04 0 0 0.02 0.02 1.03 0 0 0.01 0 0.03 0.9 0 0 0 0 0 1 0"/>
    </filter>
  </defs>
  <rect width="640" height="512" fill="#fef3c7"/>
  <g filter="url(#photoWarmth)">
    ${scene}
  </g>
</svg>`);

export const farmerRoleImage = roleSceneSvg("Indian farmer standing in a green crop field at sunset", `
  <rect width="640" height="512" fill="url(#warmSky)"/>
  <circle cx="520" cy="72" r="58" fill="#f59e0b" opacity="0.86"/>
  <g opacity="0.38" fill="#365314">
    <rect x="12" y="96" width="14" height="88" rx="7"/>
    <path d="M18 98 C-18 124 -10 158 18 144 C52 128 52 108 18 98 Z"/>
    <rect x="590" y="74" width="12" height="104" rx="6"/>
    <path d="M596 77 C550 98 552 132 594 122 C638 112 636 84 596 77 Z"/>
    <path d="M420 125 h72 v44 h-72z" opacity="0.5"/>
  </g>
  <path d="M0 190 C135 150 215 176 326 156 C445 135 540 150 640 118 L640 512 L0 512 Z" fill="url(#fieldGreen)"/>
  <path d="M0 260 C138 230 225 266 342 238 C454 211 556 236 640 206 L640 512 L0 512 Z" fill="#84cc16" opacity="0.82"/>
  <g stroke="#d9f99d" stroke-width="3" opacity="0.72">
    <path d="M18 512 C90 374 145 288 222 205"/><path d="M90 512 C154 382 214 292 292 198"/>
    <path d="M178 512 C234 376 294 284 382 184"/><path d="M285 512 C334 382 410 288 520 168"/>
    <path d="M412 512 C452 392 518 292 626 194"/><path d="M535 512 C556 405 594 316 640 250"/>
  </g>
  <g stroke="#eab308" stroke-width="4" opacity="0.75">
    <path d="M31 506 v-78"/><path d="M48 506 v-96"/><path d="M570 506 v-112"/><path d="M604 506 v-126"/>
    <path d="M33 430 c-16-12-17-28-4-43 c19 11 23 27 4 43Z" fill="url(#grainGold)"/>
    <path d="M572 395 c-21-14-22-35-4-54 c24 15 27 35 4 54Z" fill="url(#grainGold)"/>
    <path d="M606 382 c-20-17-18-38 2-55 c23 18 23 40-2 55Z" fill="url(#grainGold)"/>
  </g>
  <g transform="translate(220 94)" filter="url(#softShadow)">
    <ellipse cx="88" cy="385" rx="90" ry="18" fill="#052e16" opacity="0.24"/>
    <path d="M51 34 C82-2 143 2 166 42 C124 56 86 55 51 34Z" fill="#fef3c7"/>
    <path d="M45 46 C74 22 123 15 172 38 C147 67 76 74 45 46Z" fill="#fde68a"/>
    <path d="M60 46 C95 35 124 34 160 43" stroke="#b45309" stroke-width="5" fill="none"/>
    <circle cx="111" cy="92" r="42" fill="#92400e"/>
    <path d="M76 87 C92 62 132 59 151 86" fill="#422006" opacity="0.62"/>
    <path d="M91 107 C104 118 120 118 133 107" stroke="#3f1d0b" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M68 143 C92 120 137 120 158 144 L181 319 C146 342 72 341 38 319 Z" fill="#b89b68"/>
    <path d="M73 144 C91 165 130 164 153 144" stroke="#7c2d12" stroke-width="5" opacity="0.35"/>
    <path d="M50 179 L12 270" stroke="#7c2d12" stroke-width="19" stroke-linecap="round"/>
    <path d="M154 176 L210 247" stroke="#7c2d12" stroke-width="19" stroke-linecap="round"/>
    <path d="M56 320 L42 384" stroke="#6b4f31" stroke-width="25" stroke-linecap="round"/>
    <path d="M145 320 L158 384" stroke="#6b4f31" stroke-width="25" stroke-linecap="round"/>
    <g transform="translate(-8 131) rotate(-21)">
      <path d="M36 26 L120 266" stroke="#7c4a1a" stroke-width="8" stroke-linecap="round"/>
      <g stroke="#facc15" stroke-width="3" stroke-linecap="round">
        <path d="M31 20 L0 0"/><path d="M35 18 L12 -13"/><path d="M39 17 L31 -18"/><path d="M43 17 L52 -16"/>
        <path d="M47 19 L76 -6"/><path d="M51 22 L90 12"/><path d="M54 26 L92 35"/><path d="M56 31 L83 57"/>
      </g>
    </g>
  </g>
`);

export const merchantRoleImage = roleSceneSvg("Grain merchant weighing produce inside a warm market shop", `
  <rect width="640" height="512" fill="url(#shopGlow)"/>
  <path d="M0 0 H640 V92 C470 54 220 44 0 92 Z" fill="#7c2d12" opacity="0.48"/>
  <path d="M0 58 C155 20 315 50 640 16 V92 C420 76 185 88 0 132 Z" fill="#fde68a" opacity="0.68"/>
  <g fill="#fef3c7" stroke="#9a3412" stroke-width="3" opacity="0.96">
    <ellipse cx="76" cy="358" rx="92" ry="32"/><rect x="10" y="318" width="132" height="54" rx="25"/>
    <ellipse cx="91" cy="270" rx="100" ry="30"/><rect x="25" y="233" width="132" height="52" rx="24"/>
    <ellipse cx="93" cy="184" rx="96" ry="29"/><rect x="31" y="148" width="128" height="50" rx="24"/>
    <ellipse cx="552" cy="368" rx="100" ry="34"/><rect x="477" y="326" width="147" height="60" rx="28" fill="#facc15"/>
    <ellipse cx="546" cy="273" rx="95" ry="31"/><rect x="479" y="235" width="134" height="54" rx="26" fill="#fed7aa"/>
    <ellipse cx="548" cy="179" rx="90" ry="28"/><rect x="487" y="144" width="121" height="50" rx="24"/>
  </g>
  <g opacity="0.52">
    <path d="M392 34 h22 v118 h-22z" fill="#7c2d12"/><path d="M432 36 h20 v104 h-20z" fill="#7c2d12"/>
    <path d="M412 38 c40 27 42 67 0 92 c-38-27-38-65 0-92Z" fill="#dc2626"/>
  </g>
  <g transform="translate(214 100)" filter="url(#softShadow)">
    <ellipse cx="114" cy="364" rx="120" ry="20" fill="#111827" opacity="0.22"/>
    <circle cx="121" cy="58" r="44" fill="#78350f"/>
    <path d="M84 48 C98 20 142 20 160 49" fill="#2b1607" opacity="0.75"/>
    <path d="M98 76 C114 88 130 88 145 75" stroke="#2b1607" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M64 116 C96 94 151 94 178 118 L202 264 C158 286 70 285 29 264 Z" fill="#d6d3d1"/>
    <path d="M72 115 C94 143 151 140 173 115" stroke="#57534e" stroke-width="8" fill="none"/>
    <path d="M55 151 L20 246" stroke="#78350f" stroke-width="20" stroke-linecap="round"/>
    <path d="M176 150 L219 245" stroke="#78350f" stroke-width="20" stroke-linecap="round"/>
    <g transform="translate(2 178)">
      <rect x="38" y="96" width="156" height="38" rx="4" fill="#1f2937"/>
      <rect x="58" y="0" width="116" height="105" rx="5" fill="#334155"/>
      <circle cx="116" cy="55" r="48" fill="#e5e7eb" stroke="#111827" stroke-width="8"/>
      <path d="M116 55 L132 27" stroke="#dc2626" stroke-width="5" stroke-linecap="round"/>
      <path d="M116 55 L98 45" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
      <g stroke="#64748b" stroke-width="2"><path d="M116 12 v10"/><path d="M116 88 v10"/><path d="M73 55 h10"/><path d="M149 55 h10"/></g>
      <path d="M54 0 C70-42 162-42 178 0 C150 14 83 14 54 0Z" fill="url(#grainGold)"/>
      <g fill="#d97706" opacity="0.75">
        <circle cx="82" cy="-5" r="3"/><circle cx="103" cy="-16" r="3"/><circle cx="128" cy="-12" r="3"/><circle cx="153" cy="-2" r="3"/>
      </g>
    </g>
  </g>
  <g fill="#ca8a04" opacity="0.74">
    <ellipse cx="143" cy="431" rx="92" ry="18"/><ellipse cx="145" cy="420" rx="80" ry="16" fill="#facc15"/>
    <ellipse cx="500" cy="437" rx="85" ry="18"/><ellipse cx="501" cy="426" rx="75" ry="15" fill="#facc15"/>
  </g>
`);

export const adminRoleImage = roleSceneSvg("Agriculture administrator reviewing dashboards at a desk with the Indian flag", `
  <rect width="640" height="512" fill="url(#officeWall)"/>
  <rect x="256" y="0" width="384" height="512" fill="#f1eadf" opacity="0.74"/>
  <g opacity="0.55">
    <rect x="13" y="0" width="22" height="512" fill="#7c2d12"/><rect x="59" y="0" width="14" height="512" fill="#7c2d12"/>
    <rect x="105" y="0" width="18" height="512" fill="#7c2d12"/><rect x="153" y="0" width="12" height="512" fill="#7c2d12"/>
  </g>
  <g transform="translate(50 95)" filter="url(#softShadow)">
    <rect x="0" y="0" width="230" height="158" rx="10" fill="#0f172a"/>
    <rect x="14" y="14" width="94" height="56" rx="4" fill="#e0f2fe"/>
    <rect x="122" y="14" width="92" height="56" rx="4" fill="#1d4ed8"/>
    <rect x="14" y="86" width="94" height="58" rx="4" fill="#111827"/>
    <rect x="122" y="86" width="92" height="58" rx="4" fill="#f8fafc"/>
    <path d="M25 54 C43 43 62 47 78 31 C88 21 95 29 101 24" stroke="#16a34a" stroke-width="4" fill="none"/>
    <g fill="#22c55e"><rect x="136" y="51" width="10" height="12"/><rect x="153" y="39" width="10" height="24"/><rect x="170" y="27" width="10" height="36"/><rect x="187" y="19" width="10" height="44"/></g>
    <path d="M25 127 C42 112 56 134 72 106 C85 82 96 100 102 92" stroke="#facc15" stroke-width="3" fill="none"/>
    <g stroke="#22c55e" stroke-width="3"><path d="M134 124 h16"/><path d="M156 116 h17"/><path d="M178 129 h18"/></g>
    <rect x="93" y="158" width="42" height="48" fill="#334155"/><rect x="56" y="203" width="116" height="14" rx="7" fill="#1f2937"/>
  </g>
  <g transform="translate(286 64)">
    <rect x="0" y="0" width="11" height="245" fill="#475569"/>
    <path d="M11 0 h86 v31 h-86z" fill="#f97316"/><path d="M11 31 h86 v31 h-86z" fill="#ffffff"/><path d="M11 62 h86 v31 h-86z" fill="#16a34a"/>
    <circle cx="54" cy="47" r="12" fill="none" stroke="#1d4ed8" stroke-width="3"/>
    <g stroke="#1d4ed8" stroke-width="1.2"><path d="M54 35 v24"/><path d="M42 47 h24"/><path d="M46 39 l17 17"/><path d="M63 39 l-17 17"/></g>
  </g>
  <g transform="translate(407 132)" opacity="0.78">
    <rect x="0" y="0" width="168" height="102" rx="5" fill="#dbeafe" stroke="#92400e" stroke-width="8"/>
    <path d="M9 70 C45 30 83 58 109 20 C129-7 151 29 160 14 V94 H9Z" fill="#84cc16"/>
    <path d="M92 20 c-8 18-8 46 0 72" stroke="#7c2d12" stroke-width="6"/><path d="M92 32 c-24-20-48-11-59 5" stroke="#365314" stroke-width="5" fill="none"/>
  </g>
  <rect x="0" y="391" width="640" height="121" fill="#b45309"/>
  <rect x="60" y="374" width="520" height="36" rx="18" fill="#d97706"/>
  <g transform="translate(342 145)" filter="url(#softShadow)">
    <ellipse cx="102" cy="260" rx="100" ry="18" fill="#111827" opacity="0.2"/>
    <circle cx="96" cy="54" r="42" fill="#a16207"/>
    <path d="M56 45 C75 12 119 13 139 42 C123 26 84 30 56 45Z" fill="#111827"/>
    <rect x="112" y="43" width="38" height="13" rx="6" fill="none" stroke="#111827" stroke-width="5"/><rect x="72" y="43" width="36" height="13" rx="6" fill="none" stroke="#111827" stroke-width="5"/>
    <path d="M108 49 h8" stroke="#111827" stroke-width="4"/><path d="M79 78 C93 88 109 87 124 77" stroke="#3f1d0b" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M50 113 C78 91 132 92 158 116 L183 255 C144 276 66 276 30 255 Z" fill="#bfdbfe"/>
    <path d="M42 145 L2 232" stroke="#a16207" stroke-width="18" stroke-linecap="round"/><path d="M158 145 L214 225" stroke="#a16207" stroke-width="18" stroke-linecap="round"/>
    <path d="M56 255 L51 303" stroke="#1e293b" stroke-width="24" stroke-linecap="round"/><path d="M141 255 L153 303" stroke="#1e293b" stroke-width="24" stroke-linecap="round"/>
  </g>
  <g transform="translate(144 278)">
    <rect x="0" y="0" width="170" height="108" rx="6" fill="#0f172a"/>
    <rect x="10" y="10" width="150" height="88" rx="4" fill="#e0f2fe"/>
    <path d="M22 76 C41 58 55 80 76 43 C91 17 109 37 137 21" stroke="#22c55e" stroke-width="4" fill="none"/>
    <g fill="#2563eb"><rect x="31" y="60" width="13" height="22"/><rect x="54" y="48" width="13" height="34"/><rect x="77" y="66" width="13" height="16"/><rect x="100" y="38" width="13" height="44"/></g>
  </g>
`);

export const appLogoImage = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Farm Intellect logo">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#16a34a"/>
      <stop offset="0.55" stop-color="#22c55e"/>
      <stop offset="1" stop-color="#f97316"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="56" fill="#052e16"/>
  <circle cx="128" cy="128" r="96" fill="url(#g)"/>
  <path d="M58 151 C92 96 147 78 209 75 C199 141 163 188 95 202 C104 168 130 136 168 111 C122 125 89 146 58 151 Z" fill="#ecfccb"/>
  <path d="M71 183 C104 148 138 126 181 105" fill="none" stroke="#14532d" stroke-width="12" stroke-linecap="round"/>
  <circle cx="83" cy="78" r="24" fill="#facc15"/>
</svg>`);

export const krishiAiAvatarImage = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Farm Intellect AI avatar">
  <defs>
    <linearGradient id="a" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#22c55e"/>
      <stop offset="0.6" stop-color="#14b8a6"/>
      <stop offset="1" stop-color="#2563eb"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="128" fill="#052e16"/>
  <circle cx="128" cy="128" r="106" fill="url(#a)"/>
  <rect x="63" y="82" width="130" height="100" rx="35" fill="#f0fdf4"/>
  <circle cx="100" cy="130" r="13" fill="#14532d"/>
  <circle cx="156" cy="130" r="13" fill="#14532d"/>
  <path d="M99 158 C119 174 142 174 162 158" fill="none" stroke="#14532d" stroke-width="9" stroke-linecap="round"/>
  <path d="M128 82 V51" stroke="#facc15" stroke-width="12" stroke-linecap="round"/>
  <circle cx="128" cy="42" r="13" fill="#facc15"/>
  <path d="M49 133 H29 M227 133 H207" stroke="#dcfce7" stroke-width="14" stroke-linecap="round"/>
</svg>`);

export const krishiAiLogoImage = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Farm Intellect AI logo">
  <rect width="512" height="512" rx="112" fill="#052e16"/>
  <circle cx="256" cy="230" r="150" fill="#16a34a"/>
  <path d="M150 270 C195 195 282 156 390 152 C365 283 288 363 174 382 C191 325 238 268 314 218 C240 239 191 269 150 270 Z" fill="#ecfccb"/>
  <path d="M184 334 C232 284 283 245 351 210" fill="none" stroke="#14532d" stroke-width="22" stroke-linecap="round"/>
  <text x="256" y="458" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="74" font-weight="900" fill="#facc15">AI</text>
</svg>`);

export const doctorAvatarImage = svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Expert avatar">
  <rect width="256" height="256" rx="128" fill="#0f172a"/>
  <circle cx="128" cy="120" r="86" fill="#dbeafe"/>
  <circle cx="128" cy="96" r="46" fill="#b45309"/>
  <path d="M61 225 C70 170 96 148 128 148 C160 148 186 170 195 225 Z" fill="#f8fafc"/>
  <path d="M88 178 H156" stroke="#2563eb" stroke-width="13" stroke-linecap="round"/>
  <path d="M128 170 V224" stroke="#2563eb" stroke-width="10" stroke-linecap="round"/>
  <circle cx="106" cy="96" r="6" fill="#111827"/>
  <circle cx="150" cy="96" r="6" fill="#111827"/>
  <path d="M110 119 C124 130 140 130 154 119" fill="none" stroke="#111827" stroke-width="7" stroke-linecap="round"/>
</svg>`);
