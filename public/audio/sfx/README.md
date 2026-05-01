# SFX — public CC0 / 免費資源指南

遊戲完全無 SFX file 都行 — Audio.ts 內置 procedural synth fallback。
但係如果想 quality 大升級，可以從以下 public CC0 來源 download，rename
做下面 13 個 filename 然後丟入呢個 folder。

加入後 reload 就自動播放，唔需要改 code。

## 13 個 SFX filenames

放入 `public/audio/sfx/` (即係呢個 folder)：

| Filename | 用途 | 推薦 keyword |
| --- | --- | --- |
| `shoot.mp3` | 射飛刀 / 弓箭 | `arrow whoosh`, `dagger throw`, `swish` |
| `hit.mp3` | 普攻命中 | `impact hit`, `flesh hit`, `blade impact` |
| `crit.mp3` | 暴擊「劈！」 | `heavy impact`, `critical hit`, `slash crit` |
| `enemy_death.mp3` | 馬仔倒地 | `enemy death`, `monster die`, `body fall` |
| `player_hurt.mp3` | 玩家受傷 | `player hurt`, `male grunt pain` |
| `shield.mp3` | 護盾觸發 | `shield up`, `magic ward`, `bubble pop` |
| `pick_card.mp3` | 升級揀技能 | `ui confirm`, `level up chime`, `card pickup` |
| `room_clear.mp3` | 房間清完 | `victory chime`, `level cleared`, `success bell` |
| `boss_spawn.mp3` | 大佬出場 | `boss intro`, `dark drone`, `low boom` |
| `boss_death.mp3` | 大佬死 | `big explosion`, `boss death`, `final blow` |
| `explode.mp3` | 冰+火 = 爆炸 | `small explosion`, `bomb burst` |
| `freeze.mp3` | 結冰 | `ice shatter`, `freeze magic`, `crystal chime` |
| `thunder.mp3` | 過電 | `lightning strike`, `electric zap`, `thunder crack` |

## 推薦 CC0 資源 (商用唔洗 attribution)

### 1. Kenney.nl — 最簡單，一次過 download 全 pack
- **Impact Sounds (130 SFX)**: <https://kenney.nl/assets/impact-sounds>
  → 用嚟搞 `hit.mp3` / `crit.mp3` / `enemy_death.mp3` / `player_hurt.mp3`
- **UI Audio (50 SFX)**: <https://kenney.nl/assets/ui-audio>
  → 用嚟搞 `pick_card.mp3` / `room_clear.mp3` / `shield.mp3`
- **Sci-Fi Sounds**: <https://kenney.nl/assets/sci-fi-sounds>
  → 用嚟搞 `thunder.mp3` / `explode.mp3`

License: **CC0** (完全免費，唔需要寫名)

### 2. Pixabay (royalty-free, mp3 直接 download)
- 飛刀 / 揮舞: <https://pixabay.com/sound-effects/search/swoosh/>
- 弓箭: <https://pixabay.com/sound-effects/search/arrow/>
- 爆炸: <https://pixabay.com/sound-effects/search/explosion/>
- 結冰: <https://pixabay.com/sound-effects/search/ice/>
- 雷電: <https://pixabay.com/sound-effects/search/thunder/>
- 男聲呻吟 (player_hurt): <https://pixabay.com/sound-effects/search/male%20grunt/>

License: **Pixabay Content License** (商用免費，唔需要 attribution)

### 3. OpenGameArt.org (CC0 selection)
- Swishes Sound Pack: <https://opengameart.org/content/swishes-sound-pack> (sword/arrow whoosh)
- 50 CC0 SFX pack: <https://opengameart.org/content/50-cc0-sci-fi-sfx>

注意要篩 license = CC0 (有啲 pack 係 CC-BY 要寫名)

### 4. itch.io — CC0 collections
- jco's CC0 SFX: <https://itch.io/c/4003879/cc0-sfx-and-voices>

## 工作流程

1. 去 Kenney **Impact Sounds** 下載 zip
2. 解壓，`Sounds/` 入面有 `.ogg` 同 `.wav`
3. 揀 13 個合適嘅 file，用 [https://convertio.co/wav-mp3/] 或 ffmpeg 轉做 mp3
4. Rename 做上面 13 個 filename
5. 全部 drop 入 `public/audio/sfx/` 呢個 folder
6. Refresh 個 game (Vite hot-reload 就 work)

## ffmpeg 一條命令搞掂 batch convert

```bash
# 假設 source 喺 ./raw_sfx/，output 入 public/audio/sfx/
for f in ./raw_sfx/*.wav; do
  name=$(basename "$f" .wav)
  ffmpeg -y -i "$f" -ac 1 -b:a 128k "public/audio/sfx/${name}.mp3"
done
```

## 暫時跳過唔加 file 都 OK

Audio.ts 入面有 procedural synth — 全部 13 個 SFX 都有 synth fallback，
所以由第一日開始 game 就有聲。File-based SFX 純粹 quality upgrade。
