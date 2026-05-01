# Map Assets

Drop AI-generated images here. The game auto-loads them based on filename.
**Style: chibi anime / manhua game art** to match the character portraits.
Same workflow as `public/portraits/`: generate → rename → drop in → refresh dev server.

## Folder layout

```
public/maps/
├── floors/                # seamless tileable ground (1024×1024)
│   ├── mong_kok.png
│   ├── causeway_bay.png
│   ├── yau_ma_tei.png
│   └── temple_street.png
├── walls/                 # transparent-bg cover obstacles (256×256)
│   ├── crates.png
│   ├── bin.png
│   ├── stall.png
│   ├── mahjong.png
│   └── vending.png
└── bosses/                # full-bleed boss arena backdrop (16:9)
    ├── mong_kok_boss.png
    ├── causeway_bay_boss.png
    ├── yau_ma_tei_boss.png
    └── temple_street_boss.png
```

If a file is missing, falls back to procedural Canvas2D drawing.

---

## Style anchor (paste at start of every prompt)

```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, no realism, cartoon
```

The character portraits use the same style — keeping the maps in this aesthetic
makes everything feel like one game instead of a collage.

---

## 1. Floor textures (seamless tile, 1024×1024)

**Style: 半真實 painted manhua**（似古惑仔2 嗰種畫風）— **top-down view**（俯視角，唔係側面）。地面係實實在在嘅街道有細節（瀝青、斑馬線、井蓋、霓虹反光），painted illustration 風格，唔係 photo-real，亦唔係 abstract pattern。

### floors/mong_kok.png — 旺角（霓虹粉紫）
```
top-down overhead view of street ground only, semi-realistic painted manhua illustration, hand-painted hong kong street game art, dark wet asphalt with white painted crosswalk stripes and lane markings, scattered manhole covers and drain grates, small puddles reflecting magenta pink and cyan neon glow, slight rain wet sheen on surface, atmospheric moody lighting, seamless tileable repeating pattern, 1024x1024, no buildings no characters no people no vehicles, flat overhead view, no perspective, ground surface only
```

### floors/causeway_bay.png — 銅鑼灣（青藍）
```
top-down overhead view of polished plaza ground only, semi-realistic painted manhua illustration, hand-painted hong kong shopping district game art, dark glossy tile pavement with rectangular grid lines, slight wet reflections of cyan and blue neon storefront glow, scattered cigarette butts and small shop signs reflected on ground, atmospheric lighting, seamless tileable repeating pattern, 1024x1024, no buildings no characters no people no vehicles, flat overhead view, no perspective, ground surface only
```

### floors/yau_ma_tei.png — 油麻地（廟石灰紅）
```
top-down overhead view of temple courtyard ground only, semi-realistic painted manhua illustration, hand-painted old hong kong temple game art, weathered dark grey stone tile floor with simple cracks, scattered burnt incense ash patches, faint warm red lantern glow reflected on wet stones, atmospheric moody lighting, seamless tileable repeating pattern, 1024x1024, no buildings no characters no people no vehicles, flat overhead view, no perspective, ground surface only
```

### floors/temple_street.png — 廟街（暖木金綠）
```
top-down overhead view of night market wood plank ground only, semi-realistic painted manhua illustration, hand-painted hong kong night market game art, warm brown wooden planks stained with grease and beer puddles, scattered cigarette butts and broken tiles, small puddles reflecting green and gold neon stall glow, atmospheric night lighting, seamless tileable repeating pattern, 1024x1024, no buildings no characters no people no vehicles, flat overhead view, no perspective, ground surface only
```

**重點**：呢輪 prompt 用 `top-down overhead view of street ground only` 開頭，加 `semi-realistic painted manhua illustration`。
- `painted manhua` = 半真實手繪，似你 reference 嗰啲 illustration
- `top-down overhead view of XXX ground only` = 鎖死「俯視 + 只畫地面」
- 加返細節：crosswalks、manhole covers、wet puddles、neon reflections
- 每條尾都有 `no buildings no characters no people no vehicles, flat overhead view, no perspective, ground surface only` 防止 DALL·E 畫成街景

注意：呢個半真實 painted 風格同 chibi 角色立繪會有少少**質感差**（角色係 cartoon，地面係 painted）— 但呢種對比反而 OK，似 reference 嗰種「painted bg + cartoon character」嘅遊戲混合。

---

## 2. Wall obstacles (transparent BG, 256×256)

Single chibi-style object centered on white BG (we'll BG-remove). Not photoreal.

### walls/crates.png
```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, no realism, cartoon, top-down view game asset, cute stylized stack of beer crates and cardboard boxes, plain white background, isolated single object, 256x256, no text, no characters
```

### walls/bin.png
```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, cartoon, top-down view game asset, cute stylized Hong Kong street recycle bin overflowing with garbage bags, plain white background, isolated single object, 256x256, no text, no characters
```

### walls/stall.png
```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, cartoon, top-down view game asset, cute stylized smashed market stall debris with wooden planks and scattered round fruits, plain white background, isolated single object, 256x256, no text, no characters
```

### walls/mahjong.png
```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, cartoon, top-down view game asset, cute stylized flipped mahjong table with scattered green tiles and small chairs, plain white background, isolated single object, 256x256, no text, no characters
```

### walls/vending.png
```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, cartoon, top-down view game asset, cute stylized smashed vending machine on its side with broken glass shards, slight blue glow, plain white background, isolated single object, 256x256, no text, no characters
```

---

## 3. Boss arena backdrops (16:9, 1920×1080)

Full-bleed background — atmospheric **but stylized**, no photo realism.

### bosses/mong_kok_boss.png — 旺角大飛
```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, no realism, cartoon, top-down view boss arena, Hong Kong Mong Kok stylized rooftop, dense pink red cyan cartoon neon signs of mahjong parlors framing edges, simple painted concrete floor in center, dramatic moody lighting, 16:9 full bleed background, no characters, no text
```

### bosses/causeway_bay_boss.png — 銅鑼灣老闆
```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, cartoon, top-down view boss arena, Hong Kong Causeway Bay stylized nightclub interior, glossy black floor with painted cyan and blue laser streaks, cartoon neon liquor signs on edges, smoke haze, dramatic lighting, 16:9 full bleed background, no characters, no text
```

### bosses/yau_ma_tei_boss.png — 油麻地廟祝
```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, cartoon, top-down view boss arena, Hong Kong Yau Ma Tei stylized old temple courtyard, cartoon red lanterns burning at corners, golden incense smoke swirling, weathered stone tiles with carved dragon patterns, dramatic moody lighting, 16:9 full bleed background, no characters, no text
```

### bosses/temple_street_boss.png — 廟街大天二（最終）
```
chibi anime gacha game art style, cell-shaded vibrant flat colors, thick black outlines, hand-drawn manhua illustration, cartoon, top-down view final boss arena, Hong Kong Temple Street stylized night market, fortune teller stalls and cartoon market booths framing edges, golden lanterns and red banner cloths, gritty wet wood floor center, dramatic climactic red and gold rim lighting, 16:9 full bleed background, no characters, no text
```

---

## Why this style change

The character portraits (in `public/portraits/`) use **chibi anime gacha game art** — big head small body, cell-shaded, thick outlines, vibrant flat colors. If the maps used photoreal textures, the contrast would feel like collaging two different games together. Locking everything to one style anchor keeps the visual cohesion.

## How to bulk-generate (Bing Image Creator)

1. <https://www.bing.com/images/create>
2. Paste prompt → generate → 揀張靚 → download
3. Rename to the exact filename shown
4. Drop into right subfolder
5. Wall sprites: pass through [photoroom.com](https://www.photoroom.com/tools/background-remover) for transparent BG
6. Refresh `localhost:5173/#/hkroguelike`

Tell me when assets are dropped and I'll wire them into `render/draw.ts`.
