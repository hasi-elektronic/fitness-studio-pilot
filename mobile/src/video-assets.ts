import type { Athlete } from './types'

const videoAssets = {
  'leg-press': {
    female: require('../assets/videos/leg-press-female.mp4'),
    male: require('../assets/videos/leg-press-male.mp4'),
  },
  'chest-press': {
    female: require('../assets/videos/chest-press-female.mp4'),
    male: require('../assets/videos/chest-press-male.mp4'),
  },
  'lat-pulldown': {
    female: require('../assets/videos/lat-pulldown-female.mp4'),
    male: require('../assets/videos/lat-pulldown-male.mp4'),
  },
  'seated-row': {
    female: require('../assets/videos/seated-row-female.mp4'),
    male: require('../assets/videos/seated-row-male.mp4'),
  },
  abdominal: {
    female: require('../assets/videos/abdominal-female.mp4'),
    male: require('../assets/videos/abdominal-male.mp4'),
  },
} as const

export const videoAsset = (machineId: string, athlete: Athlete) =>
  videoAssets[machineId as keyof typeof videoAssets]?.[athlete] ?? null
