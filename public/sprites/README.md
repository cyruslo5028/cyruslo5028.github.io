# Sprites — chibi anime portraits (matching public/portraits/ style)

呢個 folder 放 in-game enemy + boss sprite。風格要跟 `public/portraits/` 入面
10 個角色一樣 — front-facing chibi anime portrait, 古惑仔手遊 mobile style。

**Player sprite 唔需要喺呢度** — code 直接由 `/portraits/{character_key}.png` load，
玩家揀邊個角色就 in-game 用邊個 portrait。

## 9 個 file 要整 (5 enemies + 4 bosses)

| Filename | 用途 | 特徵 |
| --- | --- | --- |
| `enemy_maa_zai.png` | 馬仔 | 1990s HK 街仔，邋遢白底衫，spiky hair，鋼管 |
| `enemy_tai_cheung.png` | 睇場 | 大隻夜場睇場，黑西裝，墨鏡，拳頭 |
| `enemy_wu_aa.png` | 烏鴉 | 瘦削三合會跑腿，全黑帽 hoodie，雙刀 |
| `enemy_tau_huen.png` | 鬥犬 | 凶猛黑色 fighting dog (chibi 怪物 style) |
| `enemy_ging_chaat.png` | 警察 | 90 年代港警，深藍制服，警帽，警棍 |
| `boss_mong_kok_boss.png` | 旺角大佬 | 皮褸金鏈油頭，雙手大刀，肌肉，霸氣 |
| `boss_causeway_bay_boss.png` | 銅鑼灣大佬 | 白西裝金飾墨鏡，雙槍，浮誇 |
| `boss_yau_ma_tei_boss.png` | 油麻地大佬 | 老派傳統黑唐裝，銀髮長鬍，蝴蝶刀 |
| `boss_tai_tin_yi_final.png` | 太天義 (最終) | 黑金龍紋華麗長袍，金色拐杖，威壓 |

## 重點要求 — 要對得住個 portraits 風格

- **Front-facing chibi anime**：見正面，三頭身，頭大身細
- **Semi-realistic painted manhua**：唔好 cartoon 唔好 pixel art 唔好 sketch
- **Square format, transparent or pure white background**：方形，後面 flood-fill
- **唔好有陰影或場景**：游戲 render 自己加
- **角色色塊清晰**：衣服、髮色、武器要明顯，從 60–80 px 縮細都認得

## Bing Image Creator prompts

每條 prompt 都 explicit "matching mobile gacha card art style，front-facing，chibi"。
**用白底 (white background)** — 因為呢班角色衫多數係深色（黑皮褸、黑唐裝、黑 hoodie），
用白底再 flood-fill 唔會食衫；用黑底會咬走深色 clothing。

### `enemy_maa_zai.png` (馬仔)
```
chibi anime character portrait, front-facing, 1990s Hong Kong street thug, baggy jeans dirty white tank top, spiky black hair, holding a steel pipe, semi-realistic painted manhua illustration mobile gacha card art style, three-head-tall chibi proportions, square format, pure white background, no shadow, no scene
```

### `enemy_tai_cheung.png` (睇場)
```
chibi anime character portrait, front-facing, heavyset Hong Kong nightclub bouncer, black suit white shirt black sunglasses, thick muscular build, fists raised, semi-realistic painted manhua illustration mobile gacha card art style, three-head-tall chibi proportions, square format, pure white background, no shadow, no scene
```

### `enemy_wu_aa.png` (烏鴉)
```
chibi anime character portrait, front-facing, thin agile Hong Kong triad runner, all black hoodie black pants face partially covered, dual butterfly knives, semi-realistic painted manhua illustration mobile gacha card art style, three-head-tall chibi proportions, square format, pure white background, no shadow, no scene
```

### `enemy_tau_huen.png` (鬥犬)
```
chibi anime monster portrait, front-facing, vicious fighting dog black short fur muscular bared teeth glowing red eyes, mobile gacha card art style, semi-realistic painted illustration, square format, pure white background, no shadow, no scene
```

### `enemy_ging_chaat.png` (警察)
```
chibi anime character portrait, front-facing, 1990s Hong Kong police officer, dark blue uniform peaked cap, holding a black baton, stern expression, semi-realistic painted manhua illustration mobile gacha card art style, three-head-tall chibi proportions, square format, pure white background, no shadow, no scene
```

### `boss_mong_kok_boss.png` (旺角大佬)
```
chibi anime character portrait, front-facing, Hong Kong triad boss, slick black hair leather jacket gold chains intimidating muscular, holding a double-edged sword, semi-realistic painted manhua illustration mobile gacha card art style, three-head-tall chibi proportions, square format, pure white background, no shadow, no scene, 古惑仔 mobile game style
```

### `boss_causeway_bay_boss.png` (銅鑼灣大佬)
```
chibi anime character portrait, front-facing, flashy Hong Kong nightclub triad boss, white suit gold accessories black sunglasses confident smirk, holding twin pistols, semi-realistic painted manhua illustration mobile gacha card art style, three-head-tall chibi proportions, square format, pure white background, no shadow, no scene
```

### `boss_yau_ma_tei_boss.png` (油麻地大佬)
```
chibi anime character portrait, front-facing, old-school Hong Kong triad master, traditional black tang suit silver hair long beard, holding a butterfly sword, calm intimidating, semi-realistic painted manhua illustration mobile gacha card art style, three-head-tall chibi proportions, square format, pure white background, no shadow, no scene
```

### `boss_tai_tin_yi_final.png` (太天義 最終 boss)
```
chibi anime character portrait, front-facing, supreme triad warlord final boss, ornate black gold dragon-embroidered robe, golden cane raised, menacing aura with glowing red eyes, semi-realistic painted manhua illustration mobile gacha card art style, three-head-tall chibi proportions, square format, pure white background, no shadow, no scene
```

## 工作流程

1. 去 <https://www.bing.com/images/create>，貼一條 prompt，generate 4 張
2. 揀最似 portraits 風格 (對比 `public/portraits/` 入面 chan_ho_nam.png 嗰種感覺) 嗰張
3. Download 落 local
4. 用 BG flood-fill remover 去背景
5. Rename 做上面表格內 filename
6. Drop 入呢個 folder
7. Reload game

## 沒有 sprite 時的 fallback

draw.ts 會 fallback 去原本 neon circle 渲染，缺 file 都 playable，
只係樣冇咁靚。
