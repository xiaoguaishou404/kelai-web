import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = join(root, "public/brand");
const coverDir = join(root, "public/resources/covers/zjkg");
mkdirSync(brandDir, { recursive: true });
mkdirSync(coverDir, { recursive: true });

const blue = {
  deep: "#0a2c52",
  ink: "#123a66",
  mid: "#1668a8",
  line: "#2f7fbd",
  ice: "#dbeaf8",
  pale: "#eef5fb",
  accent: "#e28a3d",
};

const write = (path, svg) => writeFileSync(path, `${svg.trim()}\n`, "utf8");

/* ---------------------------------------------------------------- logo mark */
write(
  join(brandDir, "zjkg-mark.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="中建科工">
  <defs>
    <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f5c9f"/>
      <stop offset="1" stop-color="#082c54"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="10" fill="url(#m)"/>
  <g fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="square" opacity=".94">
    <path d="M13 49V22l19-9 19 9v27"/>
    <path d="M13 22l19 10 19-10M32 32v20M13 49l19-9 19 9"/>
    <path d="M22 26.5v18M42 26.5v18" stroke-width="1.6" opacity=".55"/>
  </g>
  <circle cx="32" cy="32" r="3.4" fill="${blue.accent}"/>
  <path d="M13 49h38" stroke="#ffffff" stroke-width="1.4" opacity=".4"/>
</svg>`,
);

/* --------------------------------------------------------------- hero visual */
write(
  join(brandDir, "zjkg-hero.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1000" role="img" aria-label="钢结构与智能建造工程场景">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6fafe"/>
      <stop offset=".52" stop-color="#eaf3fb"/>
      <stop offset="1" stop-color="#dcebf8"/>
    </linearGradient>
    <linearGradient id="tower" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a6ba9" stop-opacity=".2"/>
      <stop offset="1" stop-color="#0b3a69" stop-opacity=".4"/>
    </linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2c83c4" stop-opacity=".08"/>
      <stop offset="1" stop-color="#2c83c4" stop-opacity=".34"/>
    </linearGradient>
    <radialGradient id="glow" cx=".72" cy=".4" r=".55">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".9"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0v56" fill="none" stroke="#2f7fbd" stroke-opacity=".13" stroke-width="1"/>
    </pattern>
    <pattern id="fine" width="14" height="14" patternUnits="userSpaceOnUse">
      <path d="M14 0H0v14" fill="none" stroke="#2f7fbd" stroke-opacity=".06" stroke-width=".7"/>
    </pattern>
  </defs>
  <rect width="2000" height="1000" fill="url(#sky)"/>
  <rect width="2000" height="1000" fill="url(#fine)"/>
  <rect x="760" width="1240" height="1000" fill="url(#grid)" mask="url(#fade)"/>
  <mask id="fade">
    <rect x="760" width="1240" height="1000" fill="#fff"/>
    <rect x="760" width="1240" height="1000" fill="url(#glow)"/>
  </mask>
  <rect width="2000" height="1000" fill="url(#glow)"/>

  <!-- isometric steel tower cluster -->
  <g stroke="${blue.ink}" fill="none" stroke-linejoin="round" stroke-linecap="round">
    <!-- main high-rise -->
    <path d="M1268 726V228l220-104 220 104v498l-220 96z" fill="url(#tower)" stroke-width="2.6" stroke-opacity=".55"/>
    <path d="M1268 228l220 104 220-104M1488 332v490M1268 726l220-96 220 96" stroke-width="2.4" stroke-opacity=".5"/>
    <g stroke-width="1.6" stroke-opacity=".38">
      <path d="M1310 250v470M1354 271v452M1398 292v434M1442 313v416M1534 313v416M1578 292v434M1622 271v452M1666 250v470"/>
      <path d="M1268 350l440 208M1268 440l440 208M1268 530l440 208M1268 620l440 208" stroke-opacity=".22"/>
      <path d="M1488 140v192M1488 822v-490" stroke-opacity=".3"/>
    </g>
    <!-- diagrid crown -->
    <path d="M1268 228l110 52 110-52 110 52 110-52M1330 594l158-74 158 74" stroke-width="2" stroke-opacity=".42"/>
    <!-- secondary low-rise -->
    <path d="M1062 780V526l132-62 132 62v254l-132 58z" fill="#2f7fbd" fill-opacity=".06" stroke-width="2.2" stroke-opacity=".4"/>
    <path d="M1062 526l132 62 132-62M1194 588v256M1062 780l132-58 132 58" stroke-width="2" stroke-opacity=".34"/>
    <!-- long-span roof -->
    <path d="M1690 720c54-128 148-194 280-202v112c-92 6-156 48-202 128z" fill="url(#beam)" stroke-width="2.2" stroke-opacity=".42"/>
    <path d="M1690 720c54-128 148-194 280-202M1690 758c54-128 148-194 280-202" stroke-width="1.8" stroke-opacity=".28"/>
    <path d="M1738 612l232-78M1774 660l196-88M1814 702l156-92" stroke-width="1.2" stroke-opacity=".22"/>
    <!-- cranes / masts -->
    <path d="M1000 760V330M1000 330l-96 62M1000 330l96 62M1000 330v-84M940 372l-42 18M1060 372l42 18" stroke-width="2" stroke-opacity=".38"/>
    <path d="M904 748h192" stroke-width="1.6" stroke-opacity=".24"/>
  </g>

  <!-- dimension and annotation lines -->
  <g stroke="${blue.line}" stroke-opacity=".38" fill="none" stroke-width="1.2">
    <path d="M1240 860h496M1240 850v20M1736 850v20"/>
    <path d="M1180 180v546M1170 180h20M1170 726h20"/>
    <circle cx="1488" cy="332" r="7"/>
    <circle cx="1488" cy="332" r="24" stroke-dasharray="3 7" stroke-opacity=".24"/>
  </g>
  <g fill="${blue.line}" font-family="Arial, sans-serif" font-size="18" letter-spacing="2" opacity=".64">
    <text x="1400" y="890">SPAN · 496</text>
    <text x="1150" y="470" transform="rotate(-90 1150 470)">HEIGHT · 546</text>
  </g>

  <!-- measurement dots and accent nodes -->
  <g fill="${blue.accent}">
    <circle cx="1488" cy="332" r="4.4"/>
    <circle cx="1272" cy="726" r="4.4"/>
    <circle cx="1704" cy="726" r="4.4"/>
    <circle cx="1194" cy="588" r="3.4"/>
  </g>
  <g stroke="${blue.accent}" stroke-opacity=".7" stroke-width="1.2" fill="none">
    <path d="M1488 332l96-58M1272 726l-74 42M1704 726l76 34"/>
  </g>

  <!-- soft foreground haze -->
  <rect y="820" width="2000" height="180" fill="url(#sky)" opacity=".55"/>
</svg>`,
);

/* ------------------------------------------------------------ company visual */
write(
  join(brandDir, "zjkg-company.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="钢结构节点与装配式建筑">
  <defs>
    <linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f4f9fe"/>
      <stop offset="1" stop-color="#dfeefb"/>
    </linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b6cab" stop-opacity=".24"/>
      <stop offset="1" stop-color="#0a325c" stop-opacity=".46"/>
    </linearGradient>
    <pattern id="cgrid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0v48" fill="none" stroke="#2f7fbd" stroke-opacity=".14" stroke-width="1"/>
    </pattern>
    <radialGradient id="cglow" cx=".42" cy=".36" r=".6">
      <stop offset="0" stop-color="#fff" stop-opacity=".88"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#cbg)"/>
  <rect width="1200" height="900" fill="url(#cgrid)"/>
  <rect width="1200" height="900" fill="url(#cglow)"/>

  <g stroke="${blue.ink}" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- modular boxes stack -->
    <g stroke-width="2.4" stroke-opacity=".56">
      <path d="M214 594l232-114 232 114-232 116z" fill="url(#steel)"/>
      <path d="M214 594v168l232 116 232-116V594M446 710v168" stroke-width="2.2" stroke-opacity=".44"/>
      <path d="M214 650l232 116 232-116M214 706l232 116 232-116" stroke-opacity=".26"/>
      <path d="M500 406l196-96 196 96-196 98z" fill="#2f7fbd" fill-opacity=".08"/>
      <path d="M500 406v142l196 98 196-98V406M696 504v142" stroke-width="2" stroke-opacity=".38"/>
      <path d="M500 454l196 98 196-98" stroke-opacity=".22"/>
    </g>
    <!-- large truss -->
    <g stroke-width="2" stroke-opacity=".4">
      <path d="M92 250h420M92 250v96M512 250v96M92 346h420"/>
      <path d="M92 250l52 48 52-48 52 48 52-48 52 48 52-48 52 48 56-48"/>
      <path d="M144 298v48M248 298v48M352 298v48M456 298v48"/>
    </g>
    <!-- node detail -->
    <g transform="translate(790 250)" stroke-width="2.2" stroke-opacity=".5">
      <circle cx="0" cy="0" r="58"/>
      <path d="M-82 -58L0 0M82 -58L0 0M-82 58L0 0M82 58L0 0M0 0v86"/>
      <circle cx="0" cy="0" r="12" fill="${blue.accent}" fill-opacity=".85" stroke="none"/>
      <circle cx="0" cy="0" r="26" stroke-dasharray="3 8" stroke-opacity=".3"/>
    </g>
  </g>

  <g stroke="${blue.line}" stroke-opacity=".34" stroke-width="1.2" fill="none">
    <path d="M180 800h476M180 790v20M656 790v20"/>
    <path d="M86 210v580h26"/>
  </g>
  <g fill="${blue.line}" font-family="Arial, sans-serif" font-size="16" letter-spacing="1.6" opacity=".5">
    <text x="350" y="836">MODULAR GRID · 476</text>
    <text x="46" y="520" transform="rotate(-90 46 520)">PRE-FAB · 580</text>
  </g>
</svg>`,
);

/* ------------------------------------------------------------------- covers */
const coverBase = ({ id, body }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" role="img" aria-label="">
  <defs>
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0c3d6d"/>
      <stop offset=".55" stop-color="#125c98"/>
      <stop offset="1" stop-color="#1f7ab3"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx=".72" cy=".24" r=".8">
      <stop offset="0" stop-color="#8ecbf0" stop-opacity=".34"/>
      <stop offset="1" stop-color="#8ecbf0" stop-opacity="0"/>
    </radialGradient>
    <pattern id="${id}-grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0v40" fill="none" stroke="#d7ebfb" stroke-opacity=".09" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="520" fill="url(#${id}-bg)"/>
  <rect width="800" height="520" fill="url(#${id}-grid)"/>
  <rect width="800" height="520" fill="url(#${id}-glow)"/>
  <g stroke="#eaf5ff" fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${body}
  </g>
  <g fill="#f0a65f">
    <circle cx="654" cy="112" r="3.6" opacity=".9"/>
    <circle cx="702" cy="150" r="2.4" opacity=".55"/>
  </g>
</svg>`;

const covers = {
  highrise: `<g stroke-width="2.2" stroke-opacity=".82">
      <path d="M276 424V168l142-64 142 64v256l-142 60z" fill="#dff1ff" fill-opacity=".05"/>
      <path d="M276 168l142 64 142-64M418 232v316M276 424l142-60 142 60" stroke-opacity=".7"/>
      <g stroke-width="1.3" stroke-opacity=".34">
        <path d="M304 184v226M342 201v210M380 219v194M456 219v194M494 201v210M532 184v226"/>
        <path d="M276 272l284 130M276 344l284 130" stroke-opacity=".2"/>
      </g>
      <path d="M276 168l71 32 71-32 71 32 71-32" stroke-width="1.8" stroke-opacity=".55"/>
      <path d="M188 454V300l86-38 86 38v154" stroke-opacity=".45"/>
      <path d="M188 300l86 38 86-38M274 338v116" stroke-opacity=".35"/>
    </g>
    <g stroke="#f0a65f" stroke-width="1.2" stroke-opacity=".7">
      <path d="M418 112v-38M398 92h40"/>
    </g>`,
  venue: `<g stroke-width="2.2" stroke-opacity=".8">
      <path d="M128 384c64-150 176-226 336-236 160-10 268 54 336 180-92-74-206-110-342-108-136 2-250 56-330 164z" fill="#dff1ff" fill-opacity=".06"/>
      <path d="M128 384c80-108 194-162 330-164 136-2 250 34 342 108" stroke-opacity=".72"/>
      <path d="M144 410c82-94 188-140 318-138 130 2 238 42 322 120" stroke-opacity=".4"/>
      <path d="M232 292l-8 96M328 250l-6 112M440 226l-2 122M552 228l2 122M664 252l6 110M752 300l10 88" stroke-width="1.4" stroke-opacity=".35"/>
      <path d="M224 388l-74 40M752 388l76 38" stroke-opacity=".28"/>
    </g>`,
  modular: `<g stroke-width="2.2" stroke-opacity=".8">
      <path d="M250 300l150-74 150 74-150 76z" fill="#dff1ff" fill-opacity=".07"/>
      <path d="M250 300v126l150 76 150-76V300M400 376v126" stroke-opacity=".7"/>
      <path d="M250 345l150 76 150-76M250 388l150 76 150-76" stroke-width="1.4" stroke-opacity=".3"/>
      <path d="M470 208l112-54 112 54-112 56z" fill="#dff1ff" fill-opacity=".05"/>
      <path d="M470 208v94l112 56 112-56v-94M582 264v94" stroke-opacity=".5"/>
      <path d="M94 430l104-50 104 50-104 52z" stroke-opacity=".35"/>
      <path d="M94 430v54l104 52 104-52v-54" stroke-opacity=".28"/>
    </g>
    <g stroke="#f0a65f" stroke-width="1.4" stroke-opacity=".75" stroke-dasharray="4 7">
      <path d="M400 116v132M250 300L400 116l150 184"/>
    </g>`,
  factory: `<g stroke-width="2.2" stroke-opacity=".8">
      <path d="M118 412V270l200-86 200 86v142l-200 82z" fill="#dff1ff" fill-opacity=".05"/>
      <path d="M118 270l200 82 200-82M318 352v142M118 412l200-82 200 82" stroke-opacity=".65"/>
      <path d="M154 418V306h74v88M262 434V322h74v88M370 434V322h74v88" stroke-width="1.4" stroke-opacity=".35"/>
      <g stroke-width="2" stroke-opacity=".7">
        <path d="M494 392V248h40v144M534 392h92M626 392v-70M584 248l84 50"/>
        <path d="M568 260v68M624 288v54" stroke-width="1.2" stroke-opacity=".4"/>
      </g>
      <path d="M150 458h500" stroke-width="1.2" stroke-opacity=".3"/>
      <path d="M170 200h190M170 184v32M360 184v32" stroke-width="1.2" stroke-opacity=".32"/>
    </g>
    <g stroke="#f0a65f" stroke-width="1.6" stroke-opacity=".7">
      <path d="M494 392l-34 36M626 322l-28 30"/>
    </g>`,
  renewal: `<g stroke-width="2.2" stroke-opacity=".8">
      <path d="M112 418V276l120-54 120 54v142l-120 52z" fill="#dff1ff" fill-opacity=".04"/>
      <path d="M112 276l120 54 120-54M232 330v140M112 418l120-52 120 52" stroke-opacity=".55"/>
      <path d="M158 302v96h44v-76M258 314v84h44v-62" stroke-width="1.3" stroke-opacity=".35"/>
      <path d="M418 418V232l126-56 126 56v186l-126 54z" fill="#dff1ff" fill-opacity=".07"/>
      <path d="M418 232l126 56 126-56M544 288v184M418 418l126-54 126 54" stroke-opacity=".72"/>
      <g stroke-width="1.3" stroke-opacity=".34">
        <path d="M448 248v142M486 266v134M580 266v134M618 248v142"/>
        <path d="M418 316l252 108M418 374l252-108" stroke-opacity=".16"/>
      </g>
      <path d="M462 456c36-48 92-70 168-66" stroke-width="1.4" stroke-opacity=".4"/>
      <path d="M558 446l-18-16 20-10" stroke-width="1.4" stroke-opacity=".4"/>
    </g>
    <g stroke="#f0a65f" stroke-width="1.4" stroke-opacity=".7">
      <path d="M280 170c44-30 96-34 156-12M300 156l-16 14 20 8" stroke-width="1.3"/>
    </g>`,
  retrofit: `<g stroke-width="2.2" stroke-opacity=".8">
      <path d="M206 430V222l166-70 166 70v208l-166 68z" fill="#dff1ff" fill-opacity=".05"/>
      <path d="M206 222l166 70 166-70M372 292v276M206 430l166-68 166 68" stroke-opacity=".66"/>
      <g stroke-width="1.3" stroke-opacity=".34">
        <path d="M246 238v164M296 258v146M448 258v146M498 238v164"/>
        <path d="M206 318l332 134M206 376l332-134" stroke-opacity=".16"/>
      </g>
      <path d="M172 456c60-40 122-48 188-24 68 24 130 18 190-18" stroke-width="1.6" stroke-opacity=".45"/>
      <g stroke-dasharray="5 7" stroke-width="1.3" stroke-opacity=".45">
        <circle cx="372" cy="384" r="70"/>
        <path d="M372 314v140M302 384h140"/>
      </g>
    </g>
    <g stroke="#f0a65f" stroke-width="1.6" stroke-opacity=".8">
      <circle cx="372" cy="384" r="8" fill="#f0a65f" fill-opacity=".2"/>
      <path d="M372 384l92-64M464 320h34"/>
    </g>`,
  site: `<g stroke-width="2.2" stroke-opacity=".8">
      <path d="M132 430V318l186-80 186 80v112" stroke-opacity=".45"/>
      <path d="M132 318l186 80 186-80M318 398v32M132 430l186-80 186 80" stroke-opacity=".35"/>
      <path d="M214 344v86M278 372v58M358 372v58M422 344v86" stroke-width="1.2" stroke-opacity=".25"/>
      <path d="M318 238V120M318 120l-92 58M318 120l92 58M318 120V70M226 178l-34 14M410 178l34 14" stroke-width="2" stroke-opacity=".6"/>
      <path d="M196 452h244" stroke-width="1.4" stroke-opacity=".4"/>
      <path d="M470 460V330h144l44 44v86z" stroke-opacity=".38"/>
      <path d="M524 330v174M614 330v174" stroke-width="1.1" stroke-opacity=".22"/>
      <g stroke-dasharray="4 6" stroke-width="1.2" stroke-opacity=".35">
        <path d="M470 480h232M318 238h152M318 120h152"/>
      </g>
    </g>
    <g stroke="#f0a65f" stroke-width="1.5" stroke-opacity=".75">
      <path d="M318 70v-24M308 56h20"/>
      <circle cx="318" cy="238" r="4.6" fill="#f0a65f"/>
    </g>`,
  bridge: `<g stroke-width="2.2" stroke-opacity=".8">
      <path d="M78 390h644" stroke-width="3" stroke-opacity=".7"/>
      <path d="M78 366c120-108 244-162 372-162s252 54 372 162" stroke-opacity=".55"/>
      <path d="M78 390v-24M722 390v-24" stroke-opacity=".5"/>
      <g stroke-width="1.4" stroke-opacity=".4">
        <path d="M178 390V300M278 390V252M378 390V224M478 390V224M578 390V252M678 390V300"/>
        <path d="M178 316l100-48M278 276l100-44M378 246l100-22M478 246l100 22M578 276l100 44" stroke-opacity=".26"/>
      </g>
      <path d="M112 448h580M112 434v28M692 434v28" stroke-width="1.2" stroke-opacity=".3"/>
      <path d="M112 416c92 36 192 54 300 54s208-18 300-54" stroke-width="1.1" stroke-opacity=".24"/>
    </g>
    <g stroke="#f0a65f" stroke-width="1.4" stroke-opacity=".7">
      <path d="M400 224v-52M382 190h36"/>
    </g>`,
};

for (const [id, body] of Object.entries(covers)) {
  write(join(coverDir, `${id}.svg`), coverBase({ id, body }));
}

console.log("generated brand assets");
