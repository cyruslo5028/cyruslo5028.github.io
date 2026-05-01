# BGM 音樂

Drop Suno / Udio / 其他生成嘅 .mp3 檔入呢度，filename 對應：

```
public/audio/bgm/
├── menu.mp3                   ← 主選單（角色 roster）
├── mong_kok.mp3               ← 第 1 層 旺角
├── causeway_bay.mp3           ← 第 2 層 銅鑼灣
├── yau_ma_tei.mp3             ← 第 3 層 油麻地
├── temple_street.mp3          ← 第 4 層 廟街
└── boss.mp3                   ← 通用 boss 戰加強版
```

遊戲會自動：
- 主選單 → menu.mp3 loop
- 入第 N 層 → {floor}.mp3 loop
- 入 boss 房 → boss.mp3 加強
- 切換時 cross-fade 1.5 秒

## Suno prompts（每首約 2 分鐘 loop-able）

### menu.mp3
```
moody hong kong 80s synthwave ambient, neon nightcity vibe, slow gangster movie title theme, dark synth pads, distant guitar, looping intro, no vocals, instrumental, 2:00
```

### mong_kok.mp3 — 旺角（緊張街頭、霓虹密集）
```
80s hong kong cantopop instrumental, fast tempo, electric guitar lead, synth bass, neon street action vibe, gangster movie chase scene, dark synthwave drums, no vocals, looping, 2:00
```

### causeway_bay.mp3 — 銅鑼灣（夜總會、disco funk）
```
hong kong 80s nightclub disco funk, slap bass, glossy synth strings, tight drums, neon liquor lounge vibe, gangster boss in nightclub, instrumental, no vocals, looping, 2:00
```

### yau_ma_tei.mp3 — 油麻地（廟堂神秘、東洋鼓）
```
hong kong dark eastern temple ambient, taiko drums, bamboo flute, mystical incense atmosphere, slow tempo, ominous, gangster ritual scene, instrumental, no vocals, looping, 2:00
```

### temple_street.mp3 — 廟街（最終層、緊張收尾）
```
hong kong gangster final showdown, tense epic strings, electric guitar, taiko drums, synthwave bass, dramatic build, neon night market battle, instrumental, no vocals, looping, 2:00
```

### boss.mp3 — Boss 戰（通用加強版）
```
hong kong 80s gangster boss battle theme, intense fast electric guitar shred, hard rock drums, synth bass drive, distorted brass, climactic action, instrumental no vocals, looping, 2:00
```

## 操作

1. 上 [suno.com](https://suno.com)（免費版每日 10 首）
2. paste prompt → generate → 揀靚張嗰首（Suno 通常出 2 個版本）
3. download .mp3
4. rename + drop 入 `public/audio/bgm/`
5. refresh dev server，行入個地區應該即刻聽到

如果 Suno 出嚟太短想 loop，**選 long instrumental**（v4+ 默認 4 分鐘）會 cleaner。

## Tips

- prompt 加「**no vocals**」+「**instrumental**」鎖死冇人聲
- 加「**looping**」叫 Suno 結尾返到開頭
- 如果結尾仲係 abrupt cut，可以喺 [Audacity](https://www.audacityteam.org/) 用 cross-fade 做手 loop
