import React from 'react'
import type { CharacterKey } from '../types'

void React

// === Per-character SVG portraits ===
// Each character gets a hand-tuned vector portrait with distinct hair, face,
// outfit, accessories and weapon. Drawn at viewBox 100×140 (3:4 fits the card).

// If a real portrait image exists at /portraits/{key}.png (or .webp/.jpg) it's used
// instead of the SVG silhouette below. Drop AI-generated art there to upgrade the look.
const PORTRAIT_URL: Partial<Record<CharacterKey, string>> = {
  chan_ho_nam: '/portraits/chan_ho_nam.png',
  shan_gai: '/portraits/shan_gai.png',
  wu_ngaa_player: '/portraits/wu_ngaa.png',
  liang_kun: '/portraits/liang_kun.png',
  tai_tin_yi: '/portraits/tai_tin_yi.png',
  wong_mou_fu: '/portraits/wong_mou_fu.png',
  siu_min_fu: '/portraits/siu_min_fu.png',
  taai_zi: '/portraits/taai_zi.png',
  daai_lou_b: '/portraits/daai_lou_b.png',
  fung_wan: '/portraits/fung_wan.png',
}

// Module-level cache: once an image 404s, stop trying to load it on subsequent renders.
const failedUrls: Set<string> = new Set()

export function Portrait({ characterKey, locked = false }: { characterKey: CharacterKey; locked?: boolean }) {
  const url = PORTRAIT_URL[characterKey]
  const [failed, setFailed] = React.useState<boolean>(url ? failedUrls.has(url) : true)

  if (url && !failed) {
    // Portraits ship with transparent backgrounds (post BG-removal), so just
    // contain-fit them inside the card portrait area.
    return (
      <img
        src={url}
        alt=""
        onError={() => { if (url) failedUrls.add(url); setFailed(true) }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center bottom',
          display: 'block',
          opacity: locked ? 0.32 : 1,
          filter: locked ? 'grayscale(0.6)' : 'none',
        }}
        draggable={false}
      />
    )
  }

  return (
    <svg
      viewBox="0 0 100 140"
      width="92%"
      height="92%"
      style={{ opacity: locked ? 0.32 : 1, filter: locked ? 'grayscale(0.6)' : 'none' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5c89a" />
          <stop offset="100%" stopColor="#a87454" />
        </linearGradient>
        <linearGradient id="skin-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8a778" />
          <stop offset="100%" stopColor="#8e5a3e" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="134" rx="22" ry="3" fill="#000" opacity="0.5" />

      {renderByKey(characterKey)}
    </svg>
  )
}

function renderByKey(key: CharacterKey): React.ReactNode {
  switch (key) {
    case 'chan_ho_nam': return ChanHoNam()
    case 'shan_gai': return ShanGai()
    case 'wu_ngaa_player': return WuNgaa()
    case 'liang_kun': return LiangKun()
    case 'tai_tin_yi': return TaiTinYi()
    case 'wong_mou_fu': return WongMouFu()
    case 'siu_min_fu': return SiuMinFu()
    case 'taai_zi': return TaaiZi()
    case 'daai_lou_b': return DaaiLouB()
    case 'fung_wan': return FungWan()
  }
}

// ---- shared parts ----
function Legs({ pants = '#1c1a26', shoes = '#0a0810' }: { pants?: string; shoes?: string }) {
  return (
    <g>
      <rect x="40" y="86" width="8" height="40" rx="3" fill={pants} />
      <rect x="52" y="86" width="8" height="40" rx="3" fill={pants} />
      <rect x="38" y="124" width="12" height="6" rx="1" fill={shoes} />
      <rect x="50" y="124" width="12" height="6" rx="1" fill={shoes} />
    </g>
  )
}

function Eyes({ cx1 = 46, cx2 = 54, cy = 36, color = '#0a0810', squint = false }) {
  if (squint) {
    return (
      <>
        <path d={`M${cx1 - 2} ${cy} Q${cx1} ${cy - 1.5} ${cx1 + 2} ${cy}`} stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d={`M${cx2 - 2} ${cy} Q${cx2} ${cy - 1.5} ${cx2 + 2} ${cy}`} stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </>
    )
  }
  return (
    <>
      <ellipse cx={cx1} cy={cy} rx="1" ry="1.5" fill={color} />
      <ellipse cx={cx2} cy={cy} rx="1" ry="1.5" fill={color} />
    </>
  )
}

// =========================================================================
// 陳浩南 — 銅鑼灣揸 fit 人，斯文裝 + 西瓜刀，冷酷
// =========================================================================
function ChanHoNam() {
  return (
    <g>
      <Legs pants="#1c1a26" />
      {/* coat */}
      <path d="M28 50 Q50 44 72 50 L74 92 Q50 98 26 92 Z" fill="#1a1620" stroke="#0a0810" strokeWidth="1" />
      <path d="M50 50 L46 92 M50 50 L54 92" stroke="#3a3548" strokeWidth="1" />
      {/* white shirt + red tie */}
      <path d="M44 52 L50 60 L56 52 L56 80 L44 80 Z" fill="#f4eede" />
      <path d="M48 56 L52 56 L51 78 L49 78 Z" fill="#c41a2a" />
      {/* arms */}
      <rect x="22" y="50" width="9" height="38" rx="3" fill="#1a1620" />
      <rect x="69" y="50" width="9" height="38" rx="3" fill="#1a1620" />
      <circle cx="26.5" cy="92" r="4" fill="url(#skin)" />
      <circle cx="73.5" cy="92" r="4" fill="url(#skin)" />
      {/* head + slick black hair */}
      <circle cx="50" cy="36" r="11.5" fill="url(#skin)" />
      <path d="M38 31 Q40 18 50 18 Q60 18 62 31 Q60 26 50 24 Q40 26 38 31 Z" fill="#0a0810" />
      <path d="M40 30 L46 27 L52 30 L58 27 L60 30" stroke="#222" strokeWidth="0.8" fill="none" />
      <Eyes cy={37} />
      <path d="M46 41 L54 41" stroke="#0a0810" strokeWidth="1.2" strokeLinecap="round" />
      {/* 西瓜刀 in right hand */}
      <g transform="translate(73.5, 95) rotate(-12)">
        <rect x="-2" y="-26" width="4" height="26" fill="#cfd8e0" stroke="#0a0810" strokeWidth="0.6" />
        <rect x="-3" y="-2" width="6" height="5" fill="#7a1a08" stroke="#0a0810" strokeWidth="0.6" />
        <rect x="-1.5" y="-25" width="3" height="22" fill="#f0f4fa" />
      </g>
    </g>
  )
}

// =========================================================================
// 山雞 — 龐克頭、皮褸、雙刀、咧嘴笑
// =========================================================================
function ShanGai() {
  return (
    <g>
      <Legs pants="#3a2a1a" />
      {/* leather jacket */}
      <path d="M28 50 Q50 44 72 50 L74 92 Q50 98 26 92 Z" fill="#2a2018" stroke="#0a0810" strokeWidth="1" />
      <path d="M40 50 L48 60 L40 92 Z" fill="#1a1208" />
      <path d="M60 50 L52 60 L60 92 Z" fill="#1a1208" />
      <path d="M48 60 L52 60 L51 86 L49 86 Z" fill="#f4eede" />
      {/* arms */}
      <rect x="20" y="50" width="9" height="40" rx="3" fill="#2a2018" />
      <rect x="71" y="50" width="9" height="40" rx="3" fill="#2a2018" />
      <circle cx="24.5" cy="94" r="4" fill="url(#skin)" />
      <circle cx="75.5" cy="94" r="4" fill="url(#skin)" />
      {/* head with spiky bleached top */}
      <circle cx="50" cy="36" r="11.5" fill="url(#skin)" />
      <path d="M38 28 L40 14 L44 22 L48 12 L51 22 L55 13 L59 22 L62 16 L62 28 Z"
            fill="#f4d24a" stroke="#0a0810" strokeWidth="0.6" />
      <path d="M42 28 L60 28" stroke="#3a2a1a" strokeWidth="0.6" />
      <Eyes cy={37} />
      <path d="M44 41 Q50 45 56 41" stroke="#0a0810" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* twin daggers in both hands */}
      <g transform="translate(24.5, 96) rotate(20)">
        <rect x="-1.4" y="-18" width="2.8" height="14" fill="#cfd8e0" stroke="#0a0810" strokeWidth="0.4" />
        <rect x="-2" y="-4" width="4" height="3" fill="#7a1a08" />
      </g>
      <g transform="translate(75.5, 96) rotate(-20)">
        <rect x="-1.4" y="-18" width="2.8" height="14" fill="#cfd8e0" stroke="#0a0810" strokeWidth="0.4" />
        <rect x="-2" y="-4" width="4" height="3" fill="#7a1a08" />
      </g>
      {/* earring */}
      <circle cx="61" cy="38" r="1" fill="#ffd16a" />
    </g>
  )
}

// =========================================================================
// 烏鴉 — 黑長褸、墨鏡、面色蒼白、握飛刀
// =========================================================================
function WuNgaa() {
  return (
    <g>
      <Legs pants="#0d0814" shoes="#000" />
      {/* long black coat */}
      <path d="M24 48 Q50 42 76 48 L78 110 Q50 116 22 110 Z" fill="#0e0a18" stroke="#000" strokeWidth="1" />
      <path d="M50 48 L48 110 M50 48 L52 110" stroke="#1f1a2e" strokeWidth="1" />
      {/* purple shirt accent */}
      <path d="M44 52 L50 60 L56 52 L56 80 L44 80 Z" fill="#3a1a52" />
      {/* arms */}
      <rect x="20" y="48" width="9" height="42" rx="3" fill="#0e0a18" />
      <rect x="71" y="48" width="9" height="42" rx="3" fill="#0e0a18" />
      <circle cx="24.5" cy="94" r="4" fill="#ddc0a0" />
      <circle cx="75.5" cy="94" r="4" fill="#ddc0a0" />
      {/* pale head */}
      <circle cx="50" cy="36" r="11.5" fill="#ecd2b5" />
      {/* slicked dark hair with widow peak */}
      <path d="M38 30 Q40 18 50 18 Q60 18 62 30 L58 26 L54 32 L50 24 L46 32 L42 26 Z"
            fill="#1a1018" />
      {/* sunglasses */}
      <rect x="40" y="33" width="20" height="5" rx="1.5" fill="#0a0810" />
      <rect x="40" y="33" width="20" height="2" rx="1" fill="#3a3548" />
      {/* sinister smile */}
      <path d="M44 42 Q50 46 56 41" stroke="#7a1a08" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* throwing knives fanned */}
      <g transform="translate(75.5, 96)">
        {[-25, -10, 5].map((deg, i) => (
          <g key={i} transform={`rotate(${deg})`}>
            <rect x="-1" y="-16" width="2" height="14" fill="#cfd8e0" stroke="#0a0810" strokeWidth="0.3" />
          </g>
        ))}
      </g>
    </g>
  )
}

// =========================================================================
// 靚坤 — 光頭、袒露肌肉、紋身、棍棒、兇狠
// =========================================================================
function LiangKun() {
  return (
    <g>
      <Legs pants="#3a2618" />
      {/* bare muscular torso */}
      <path d="M28 48 Q50 42 72 48 L72 90 Q50 96 28 90 Z" fill="#d8a778" stroke="#5a3a26" strokeWidth="1" />
      {/* tattoos on chest */}
      <path d="M40 56 Q50 60 60 56 M42 64 Q50 68 58 64" stroke="#1a1018" strokeWidth="1" fill="none" />
      <circle cx="42" cy="58" r="2" fill="none" stroke="#1a1018" strokeWidth="0.6" />
      <circle cx="58" cy="58" r="2" fill="none" stroke="#1a1018" strokeWidth="0.6" />
      {/* arms - bulky */}
      <rect x="18" y="48" width="11" height="40" rx="4" fill="url(#skin-dark)" />
      <rect x="71" y="48" width="11" height="40" rx="4" fill="url(#skin-dark)" />
      <path d="M22 64 Q24 60 26 64" stroke="#1a1018" strokeWidth="0.6" fill="none" />
      <path d="M74 64 Q76 60 78 64" stroke="#1a1018" strokeWidth="0.6" fill="none" />
      <circle cx="23.5" cy="92" r="4.5" fill="url(#skin-dark)" />
      <circle cx="76.5" cy="92" r="4.5" fill="url(#skin-dark)" />
      {/* shaved head */}
      <circle cx="50" cy="36" r="12" fill="url(#skin-dark)" />
      <path d="M40 28 Q50 26 60 28" stroke="#3a2018" strokeWidth="0.6" fill="none" />
      {/* scar across face */}
      <path d="M40 32 L52 39" stroke="#5a1a18" strokeWidth="1" />
      <Eyes cy={36} squint />
      <path d="M44 43 Q50 41 56 43" stroke="#3a1818" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* big chopper */}
      <g transform="translate(76.5, 94) rotate(-22)">
        <rect x="-3" y="-30" width="6" height="28" fill="#cfd8e0" stroke="#0a0810" strokeWidth="0.6" />
        <rect x="-4" y="0" width="8" height="6" fill="#7a3a18" stroke="#0a0810" strokeWidth="0.6" />
        <path d="M-3 -30 L 0 -34 L 3 -30" fill="#cfd8e0" stroke="#0a0810" strokeWidth="0.5" />
      </g>
    </g>
  )
}

// =========================================================================
// 大天二 — 戴頭巾、tank top、bare-knuckle、tattoo
// =========================================================================
function TaiTinYi() {
  return (
    <g>
      <Legs pants="#1a1a2e" />
      {/* grey tank top with red accent */}
      <path d="M28 48 Q50 42 72 48 L72 90 Q50 96 28 90 Z" fill="#d8a778" />
      <path d="M34 50 L40 56 L40 90 L34 90 Z" fill="#3a3a44" />
      <path d="M66 50 L60 56 L60 90 L66 90 Z" fill="#3a3a44" />
      <path d="M40 56 L60 56 L60 70 L40 70 Z" fill="#7a1a08" opacity="0.6" />
      {/* dragon tat */}
      <path d="M44 76 Q50 80 56 76 L52 82 L48 82 Z" fill="none" stroke="#1a1018" strokeWidth="0.8" />
      {/* arms */}
      <rect x="18" y="48" width="11" height="38" rx="4" fill="url(#skin-dark)" />
      <rect x="71" y="48" width="11" height="38" rx="4" fill="url(#skin-dark)" />
      <circle cx="23.5" cy="90" r="4.5" fill="url(#skin-dark)" />
      <circle cx="76.5" cy="90" r="4.5" fill="url(#skin-dark)" />
      {/* head with red headband */}
      <circle cx="50" cy="36" r="11.5" fill="url(#skin-dark)" />
      <path d="M38 28 Q50 22 62 28 L62 30 Q50 26 38 30 Z" fill="#1a1018" />
      <rect x="38" y="30" width="24" height="3" fill="#c41a2a" />
      <path d="M61 31 L66 36 L62 32 Z" fill="#c41a2a" />
      <Eyes cy={37} />
      <path d="M44 42 Q50 45 56 42" stroke="#1a1018" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* fists with brass-knuckle glint */}
      <circle cx="23.5" cy="90" r="6" fill="none" stroke="#ffd16a" strokeWidth="1" />
      <circle cx="76.5" cy="90" r="6" fill="none" stroke="#ffd16a" strokeWidth="1" />
    </g>
  )
}

// =========================================================================
// 黃毛虎 — 黃毛、條子衫、棒球棍
// =========================================================================
function WongMouFu() {
  return (
    <g>
      <Legs pants="#1a3a52" />
      {/* striped shirt */}
      <path d="M30 50 Q50 44 70 50 L72 92 Q50 98 28 92 Z" fill="#f4eede" stroke="#0a0810" strokeWidth="0.8" />
      <path d="M30 56 L72 56 M30 62 L72 62 M30 68 L72 68 M30 74 L72 74 M30 80 L72 80 M30 86 L72 86"
            stroke="#3a4a52" strokeWidth="1.4" />
      {/* arms */}
      <rect x="22" y="50" width="9" height="38" rx="3" fill="#f4eede" />
      <rect x="69" y="50" width="9" height="38" rx="3" fill="#f4eede" />
      <path d="M22 56 L31 56 M22 62 L31 62 M69 56 L78 56 M69 62 L78 62" stroke="#3a4a52" strokeWidth="1.2" />
      <circle cx="26.5" cy="92" r="4" fill="url(#skin)" />
      <circle cx="73.5" cy="92" r="4" fill="url(#skin)" />
      {/* head with bright yellow spiky hair */}
      <circle cx="50" cy="36" r="11.5" fill="url(#skin)" />
      <path d="M38 30 L40 16 L46 24 L50 14 L54 24 L60 16 L62 30 Z" fill="#ffd84a" stroke="#7a4a08" strokeWidth="0.6" />
      <Eyes cy={37} />
      <path d="M44 42 Q50 45 56 42" stroke="#0a0810" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* baseball bat */}
      <g transform="translate(73.5, 94) rotate(-12)">
        <rect x="-1.6" y="-30" width="3.2" height="30" fill="#a8763a" />
        <rect x="-2.6" y="-30" width="5.2" height="6" fill="#7a5226" />
        <rect x="-1.4" y="-2" width="2.8" height="3" fill="#3a2a1a" />
      </g>
    </g>
  )
}

// =========================================================================
// 笑面虎 — 大隻、咧嘴笑、開卡其衫、鐵尺
// =========================================================================
function SiuMinFu() {
  return (
    <g>
      <Legs pants="#3a2a1a" />
      {/* khaki open shirt */}
      <path d="M28 48 Q50 42 72 48 L72 92 Q50 98 28 92 Z" fill="#b6915c" stroke="#5a4022" strokeWidth="1" />
      <path d="M44 50 L42 92 M56 50 L58 92" stroke="#7a5a3a" strokeWidth="1" />
      {/* white tank under */}
      <path d="M44 52 L56 52 L56 92 L44 92 Z" fill="#f4eede" />
      <path d="M44 52 L50 60 L56 52" fill="#f4eede" stroke="#7a5a3a" strokeWidth="0.6" />
      {/* arms - thick */}
      <rect x="20" y="50" width="10" height="38" rx="3.5" fill="#b6915c" />
      <rect x="70" y="50" width="10" height="38" rx="3.5" fill="#b6915c" />
      <circle cx="25" cy="92" r="4.5" fill="url(#skin)" />
      <circle cx="75" cy="92" r="4.5" fill="url(#skin)" />
      {/* head - round, smiling */}
      <circle cx="50" cy="36" r="12" fill="url(#skin)" />
      <path d="M38 30 Q50 22 62 30 Q60 26 50 24 Q40 26 38 30 Z" fill="#3a2a1a" />
      {/* big smile + crinkly eyes */}
      <Eyes cy={36} squint />
      <path d="M42 41 Q50 48 58 41" stroke="#0a0810" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M44 43 Q50 47 56 43" fill="#7a1a08" />
      {/* iron ruler / 鐵尺 */}
      <g transform="translate(75, 94) rotate(-14)">
        <rect x="-1.4" y="-22" width="2.8" height="22" fill="#9aa4ae" stroke="#0a0810" strokeWidth="0.3" />
        <rect x="-1" y="-22" width="0.6" height="22" fill="#cfd8e0" />
      </g>
    </g>
  )
}

// =========================================================================
// 太子 — 西裝、硬朗、拳套
// =========================================================================
function TaaiZi() {
  return (
    <g>
      <Legs pants="#1c1a26" />
      {/* navy suit */}
      <path d="M28 50 Q50 44 72 50 L74 92 Q50 98 26 92 Z" fill="#0d2a4f" stroke="#0a0810" strokeWidth="1" />
      <path d="M50 50 L46 92 M50 50 L54 92" stroke="#1a4f8e" strokeWidth="1" />
      {/* white shirt + black tie */}
      <path d="M44 52 L50 60 L56 52 L56 80 L44 80 Z" fill="#f4eede" />
      <path d="M48 56 L52 56 L51 78 L49 78 Z" fill="#0a0810" />
      {/* arms */}
      <rect x="22" y="50" width="9" height="40" rx="3" fill="#0d2a4f" />
      <rect x="69" y="50" width="9" height="40" rx="3" fill="#0d2a4f" />
      <circle cx="26.5" cy="94" r="4" fill="url(#skin)" />
      <circle cx="73.5" cy="94" r="4" fill="url(#skin)" />
      {/* head with neat side-part */}
      <circle cx="50" cy="36" r="11.5" fill="url(#skin)" />
      <path d="M38 30 Q42 20 50 20 Q58 20 62 30 L60 26 L52 24 L42 26 Z" fill="#1a1018" />
      <Eyes cy={37} />
      <path d="M46 42 L54 42" stroke="#0a0810" strokeWidth="1.2" strokeLinecap="round" />
      {/* boxing wrap on right hand */}
      <circle cx="73.5" cy="94" r="5" fill="#f4eede" stroke="#0a0810" strokeWidth="0.6" />
      <path d="M70 92 L77 92 M70 95 L77 95" stroke="#9a8a7a" strokeWidth="0.6" />
    </g>
  )
}

// =========================================================================
// 大佬B — 中年、紋身、煙頭、大刀
// =========================================================================
function DaaiLouB() {
  return (
    <g>
      <Legs pants="#1c1a26" />
      {/* open black shirt */}
      <path d="M28 50 Q50 44 72 50 L72 92 Q50 98 28 92 Z" fill="#0e0a14" stroke="#0a0810" strokeWidth="1" />
      <path d="M44 52 L42 92 M56 52 L58 92" stroke="#3a3548" strokeWidth="1" />
      {/* bare chest with dragon tat */}
      <path d="M44 52 L56 52 L56 92 L44 92 Z" fill="url(#skin-dark)" />
      <path d="M46 60 Q50 56 54 60 Q52 64 50 62 Q48 64 46 60 Z M46 70 Q50 66 54 70 Q52 74 50 72 Q48 74 46 70 Z M48 78 Q50 80 52 78"
            stroke="#1a1018" strokeWidth="0.6" fill="none" />
      {/* arms */}
      <rect x="20" y="50" width="11" height="40" rx="4" fill="#0e0a14" />
      <rect x="69" y="50" width="11" height="40" rx="4" fill="#0e0a14" />
      <circle cx="25.5" cy="94" r="4.5" fill="url(#skin-dark)" />
      <circle cx="74.5" cy="94" r="4.5" fill="url(#skin-dark)" />
      {/* head — older, slicked grey */}
      <circle cx="50" cy="36" r="12" fill="url(#skin-dark)" />
      <path d="M38 30 Q42 22 50 22 Q58 22 62 30 L60 26 L50 24 L40 26 Z" fill="#7a7a82" />
      {/* furrowed brows */}
      <path d="M43 33 L48 34 M52 34 L57 33" stroke="#1a1018" strokeWidth="1" strokeLinecap="round" />
      <Eyes cy={37} squint />
      <path d="M44 43 L48 43 L51 44 L56 43" stroke="#1a1018" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* cigarette */}
      <rect x="56" y="44" width="9" height="1.4" fill="#f4eede" />
      <circle cx="65" cy="44.7" r="0.9" fill="#ff7d3a" />
      <path d="M64 44 Q66 42 64 40" stroke="#aaa" strokeWidth="0.5" fill="none" opacity="0.6" />
      {/* big sword over shoulder */}
      <g transform="translate(74.5, 94) rotate(-22)">
        <rect x="-2.4" y="-32" width="4.8" height="30" fill="#cfd8e0" stroke="#0a0810" strokeWidth="0.5" />
        <rect x="-3.4" y="-2" width="6.8" height="5" fill="#5a3a18" stroke="#0a0810" strokeWidth="0.5" />
      </g>
    </g>
  )
}

// =========================================================================
// 風雲 — 紅毛、皮褸、雙手刀、爆炸感
// =========================================================================
function FungWan() {
  return (
    <g>
      <Legs pants="#1a0d0a" />
      {/* leather coat with red accents */}
      <path d="M28 48 Q50 42 72 48 L74 92 Q50 98 26 92 Z" fill="#1a1010" stroke="#0a0810" strokeWidth="1" />
      <path d="M40 50 L48 60 L40 92 Z" fill="#3a0a0a" />
      <path d="M60 50 L52 60 L60 92 Z" fill="#3a0a0a" />
      <path d="M48 60 L52 60 L51 86 L49 86 Z" fill="#7a1a08" />
      {/* arms */}
      <rect x="20" y="48" width="9" height="40" rx="3" fill="#1a1010" />
      <rect x="71" y="48" width="9" height="40" rx="3" fill="#1a1010" />
      <circle cx="24.5" cy="92" r="4" fill="url(#skin)" />
      <circle cx="75.5" cy="92" r="4" fill="url(#skin)" />
      {/* head with fiery red spiky hair */}
      <circle cx="50" cy="36" r="11.5" fill="url(#skin)" />
      <path d="M37 30 L36 14 L42 22 L46 10 L50 22 L54 10 L58 22 L64 14 L63 30 Z"
            fill="#e84a2a" stroke="#5a0a0a" strokeWidth="0.6" />
      <path d="M40 16 L42 22 L46 14" stroke="#ffd16a" strokeWidth="0.4" fill="none" />
      {/* fierce eyes + scar */}
      <path d="M40 32 L48 36" stroke="#5a1a18" strokeWidth="0.8" />
      <Eyes cy={37} />
      <path d="M44 41 Q50 45 56 41" stroke="#0a0810" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* twin hand axes */}
      <g transform="translate(24.5, 94) rotate(20)">
        <rect x="-1.2" y="-20" width="2.4" height="20" fill="#5a3a1a" />
        <path d="M-4 -20 L 4 -20 L 3 -14 L -3 -14 Z" fill="#cfd8e0" stroke="#0a0810" strokeWidth="0.5" />
      </g>
      <g transform="translate(75.5, 94) rotate(-20)">
        <rect x="-1.2" y="-20" width="2.4" height="20" fill="#5a3a1a" />
        <path d="M-4 -20 L 4 -20 L 3 -14 L -3 -14 Z" fill="#cfd8e0" stroke="#0a0810" strokeWidth="0.5" />
      </g>
      {/* aura sparks */}
      <g opacity="0.8">
        <circle cx="22" cy="30" r="1.2" fill="#ffd16a" />
        <circle cx="78" cy="32" r="1" fill="#ffd16a" />
        <circle cx="20" cy="60" r="0.8" fill="#e84a2a" />
        <circle cx="82" cy="58" r="1" fill="#e84a2a" />
      </g>
    </g>
  )
}
