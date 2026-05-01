import type { FloorDef, FloorKey } from '../types'

// 4 個香港地區 floors，每個有獨特 enemy pool + 配色。
export const FLOORS: Record<FloorKey, FloorDef> = {
  mong_kok: {
    key: 'mong_kok',
    displayName: '旺角',
    english: 'Mong Kok',
    bgColor: '#0a0617',
    accent: '#ff4fd8',
    enemyPool: ['maa_zai', 'maa_zai', 'maa_zai', 'dau_hou'],
    bossKey: 'mong_kok_boss',
  },
  causeway_bay: {
    key: 'causeway_bay',
    displayName: '銅鑼灣',
    english: 'Causeway Bay',
    bgColor: '#040a18',
    accent: '#36d6ff',
    enemyPool: ['maa_zai', 'tai_cheung', 'tai_cheung', 'dau_hou'],
    bossKey: 'causeway_bay_boss',
  },
  yau_ma_tei: {
    key: 'yau_ma_tei',
    displayName: '油麻地',
    english: 'Yau Ma Tei',
    bgColor: '#100612',
    accent: '#ffd16a',
    enemyPool: ['tai_cheung', 'wu_ngaa', 'wu_ngaa', 'ging_caat'],
    bossKey: 'yau_ma_tei_boss',
  },
  temple_street: {
    key: 'temple_street',
    displayName: '廟街',
    english: 'Temple Street',
    bgColor: '#0d0a04',
    accent: '#93ff66',
    enemyPool: ['wu_ngaa', 'tai_cheung', 'ging_caat', 'ging_caat'],
    bossKey: 'tai_tin_yi_final',
  },
}

export const FLOOR_ORDER: FloorKey[] = ['mong_kok', 'causeway_bay', 'yau_ma_tei', 'temple_street']
