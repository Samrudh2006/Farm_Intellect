const svgDataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

const roleCardSvg = ({
  title,
  subtitle,
  sky,
  ground,
  accent,
  figure,
}: {
  title: string;
  subtitle: string;
  sky: string;
  ground: string;
  accent: string;
  figure: string;
}) => svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="${title}">
  <defs>
    <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${sky}"/>
      <stop offset="1" stop-color="#fef3c7"/>
    </linearGradient>
    <linearGradient id="field" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${ground}"/>
      <stop offset="1" stop-color="#14532d"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#052e16" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="1200" height="800" fill="url(#sky)"/>
  <circle cx="1010" cy="150" r="82" fill="#fbbf24" opacity="0.92"/>
  <path d="M0 480 C170 410 310 455 455 430 C625 400 760 300 1200 385 L1200 800 L0 800 Z" fill="url(#field)"/>
  <path d="M0 570 C220 505 385 565 575 520 C760 476 930 518 1200 455 L1200 800 L0 800 Z" fill="#22c55e" opacity="0.72"/>
  <g opacity="0.34" stroke="#ecfccb" stroke-width="8">
    <path d="M95 760 C250 650 375 600 560 540"/>
    <path d="M315 800 C455 672 590 595 790 515"/>
    <path d="M655 800 C745 660 880 575 1115 505"/>
  </g>
  ${figure}
  <g filter="url(#shadow)">
    <rect x="72" y="68" width="510" height="174" rx="34" fill="#052e16" opacity="0.82"/>
    <text x="110" y="145" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="800" fill="#ffffff">${title}</text>
    <text x="112" y="200" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="600" fill="#d9f99d">${subtitle}</text>
  </g>
  <rect x="0" y="0" width="1200" height="800" fill="none" stroke="${accent}" stroke-width="18" opacity="0.45"/>
</svg>`);

export const farmerRoleImage = roleCardSvg({
  title: "Farmer Portal",
  subtitle: "Fields • crops • advisory",
  sky: "#bfdbfe",
  ground: "#65a30d",
  accent: "#16a34a",
  figure: `
  <g transform="translate(670 265)" filter="url(#shadow)">
    <ellipse cx="180" cy="390" rx="190" ry="36" fill="#052e16" opacity="0.28"/>
    <path d="M80 155 L305 155 L248 94 C212 52 137 52 82 95 Z" fill="#f59e0b"/>
    <path d="M108 166 C145 198 247 198 285 166" fill="none" stroke="#92400e" stroke-width="18" stroke-linecap="round"/>
    <circle cx="190" cy="205" r="72" fill="#b45309"/>
    <path d="M130 190 C160 152 229 150 264 192" fill="#422006" opacity="0.72"/>
    <path d="M106 306 C132 255 280 252 316 305 L342 468 L70 468 Z" fill="#166534"/>
    <path d="M104 323 L18 412" stroke="#7c2d12" stroke-width="34" stroke-linecap="round"/>
    <path d="M308 323 L404 400" stroke="#7c2d12" stroke-width="34" stroke-linecap="round"/>
    <path d="M117 468 L88 610" stroke="#1f2937" stroke-width="46" stroke-linecap="round"/>
    <path d="M282 468 L322 610" stroke="#1f2937" stroke-width="46" stroke-linecap="round"/>
  </g>`,
});

export const merchantRoleImage = roleCardSvg({
  title: "Merchant Hub",
  subtitle: "Markets • orders • partners",
  sky: "#fed7aa",
  ground: "#84cc16",
  accent: "#f97316",
  figure: `
  <g transform="translate(655 255)" filter="url(#shadow)">
    <ellipse cx="210" cy="405" rx="220" ry="42" fill="#052e16" opacity="0.25"/>
    <rect x="70" y="190" width="355" height="265" rx="28" fill="#fff7ed"/>
    <path d="M72 192 L112 100 H385 L426 192 Z" fill="#fb923c"/>
    <path d="M118 100 L92 192 M180 100 L170 192 M250 100 L250 192 M320 100 L338 192 M385 100 L426 192" stroke="#9a3412" stroke-width="10" opacity="0.45"/>
    <rect x="115" y="250" width="105" height="132" rx="12" fill="#16a34a"/>
    <rect x="270" y="250" width="100" height="76" rx="12" fill="#fde68a"/>
    <circle cx="123" cy="124" r="44" fill="#facc15"/>
    <path d="M56 455 H455" stroke="#7c2d12" stroke-width="28" stroke-linecap="round"/>
    <circle cx="145" cy="492" r="30" fill="#1f2937"/>
    <circle cx="355" cy="492" r="30" fill="#1f2937"/>
  </g>`,
});

export const adminRoleImage = roleCardSvg({
  title: "Admin Control",
  subtitle: "Users • insights • security",
  sky: "#dbeafe",
  ground: "#22c55e",
  accent: "#2563eb",
  figure: `
  <g transform="translate(675 210)" filter="url(#shadow)">
    <ellipse cx="190" cy="455" rx="205" ry="42" fill="#052e16" opacity="0.25"/>
    <rect x="20" y="130" width="390" height="278" rx="32" fill="#eff6ff"/>
    <rect x="54" y="172" width="322" height="188" rx="18" fill="#1e3a8a"/>
    <path d="M215 74 L330 124 V234 C330 318 277 372 215 396 C153 372 100 318 100 234 V124 Z" fill="#2563eb"/>
    <path d="M160 230 L203 274 L286 176" fill="none" stroke="#dcfce7" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M125 455 H300" stroke="#1f2937" stroke-width="34" stroke-linecap="round"/>
    <path d="M214 408 V455" stroke="#1f2937" stroke-width="34" stroke-linecap="round"/>
  </g>`,
});

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
