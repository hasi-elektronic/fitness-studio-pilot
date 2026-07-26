import type { Machine, StudioTheme, TrainingTemplate } from './types'

export const studioTheme: StudioTheme = {
  studioId: 'pilot-studio-vaihingen',
  productName: 'FitPath',
  studioName: 'Pilot Studio',
  location: 'Vaihingen an der Enz',
  inviteCode: 'FIT2026',
  primary: '#3abadd',
  accent: '#ff6b00',
}

const machinePhoto = (code: string, name: string) => {
  const artwork = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#1b3440"/>
          <stop offset="1" stop-color="#091116"/>
        </linearGradient>
        <radialGradient id="glow">
          <stop stop-color="#3abadd" stop-opacity=".34"/>
          <stop offset="1" stop-color="#3abadd" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="640" height="420" rx="36" fill="url(#bg)"/>
      <circle cx="470" cy="110" r="190" fill="url(#glow)"/>
      <g fill="none" stroke="#5ad0ef" stroke-width="18" stroke-linecap="round" stroke-linejoin="round">
        <path d="M180 280h280M228 270V145M412 270V128"/>
        <path d="M228 175h184M268 175v-42M372 175v-42"/>
        <path d="M278 280l-34-70h152l-34 70"/>
      </g>
      <text x="42" y="70" fill="#ffffff" font-family="Arial,sans-serif" font-size="28" font-weight="700">${code}</text>
      <text x="42" y="382" fill="#ffffff" font-family="Arial,sans-serif" font-size="24" font-weight="700">${name}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(artwork)}`
}

const machine = (
  id: string,
  code: string,
  name: string,
  zone: string,
  muscleGroups: Machine['muscleGroups'],
  routeOrder: number,
  alternativeIds: string[],
  instruction: string,
  active = true,
): Machine => ({
  studioId: studioTheme.studioId,
  id,
  code,
  name,
  photoUrl: machinePhoto(code, name),
  zone,
  muscleGroups,
  active,
  routeOrder,
  alternativeIds,
  instruction,
})

export const machines: Machine[] = [
  machine(
    'leg-press',
    'M04',
    'Beinpresse',
    'Kraft · Zone A',
    ['legs'],
    1,
    ['hack-squat'],
    'Rücken anlehnen, Knie kontrolliert beugen und niemals vollständig durchdrücken.',
  ),
  machine(
    'hack-squat',
    'M05',
    'Hackenschmidt',
    'Kraft · Zone A',
    ['legs'],
    2,
    ['leg-press'],
    'Füße schulterbreit, Bewegung langsam und im schmerzfreien Bereich ausführen.',
  ),
  machine(
    'chest-press',
    'M07',
    'Brustpresse',
    'Kraft · Zone B',
    ['chest'],
    3,
    ['butterfly'],
    'Griffe auf Brusthöhe einstellen und die Schulterblätter am Polster halten.',
  ),
  machine(
    'butterfly',
    'M08',
    'Butterfly',
    'Kraft · Zone B',
    ['chest'],
    4,
    ['chest-press'],
    'Ellbogen leicht gebeugt lassen und die Bewegung ohne Schwung schließen.',
  ),
  machine(
    'lat-pulldown',
    'M12',
    'Latzug',
    'Kraft · Zone C',
    ['back'],
    5,
    ['assisted-pullup'],
    'Brust anheben, Stange kontrolliert zur oberen Brust ziehen und nicht in den Nacken.',
  ),
  machine(
    'assisted-pullup',
    'M13',
    'Klimmzug assistiert',
    'Kraft · Zone C',
    ['back'],
    6,
    ['lat-pulldown'],
    'Körperspannung halten und die Unterstützung so wählen, dass die Wiederholungen sauber bleiben.',
  ),
  machine(
    'seated-row',
    'M15',
    'Rudermaschine',
    'Kraft · Zone C',
    ['back'],
    7,
    ['cable-row'],
    'Brust am Polster halten, Ellbogen nah am Körper nach hinten führen.',
  ),
  machine(
    'cable-row',
    'M16',
    'Kabelrudern',
    'Kraft · Zone C',
    ['back'],
    8,
    ['seated-row'],
    'Aufrecht sitzen und den Griff ohne Rückenschwung zum Körper ziehen.',
  ),
  machine(
    'shoulder-press',
    'M18',
    'Schulterpresse',
    'Kraft · Zone D',
    ['shoulders'],
    9,
    [],
    'Sitz so einstellen, dass die Griffe knapp über Schulterhöhe starten.',
  ),
  machine(
    'leg-curl',
    'M21',
    'Beinbeuger',
    'Kraft · Zone A',
    ['legs'],
    10,
    [],
    'Kniegelenk an der Drehachse ausrichten und das Gewicht kontrolliert absenken.',
  ),
  machine(
    'abdominal',
    'M23',
    'Bauchmaschine',
    'Functional · Zone E',
    ['core'],
    11,
    ['back-extension'],
    'Aus der Bauchmuskulatur einrollen und nicht mit den Armen ziehen.',
  ),
  machine(
    'back-extension',
    'M26',
    'Rückenstrecker',
    'Functional · Zone E',
    ['core', 'back'],
    12,
    ['abdominal'],
    'Wirbelsäule neutral halten und nur bis zur aufrechten Position strecken.',
  ),
]

export const trainingTemplates: TrainingTemplate[] = [
  {
    studioId: studioTheme.studioId,
    id: 'balanced-start',
    name: 'Balanced Start',
    description: 'Ein klarer Ganzkörper-Einstieg mit kurzen Wegen und kontrollierter Belastung.',
    goals: ['general_fitness', 'weight_control'],
    levels: ['beginner', 'intermediate'],
    supportedDays: [2, 3],
    supportedDurations: [30, 45, 60],
    machineIds: ['leg-press', 'chest-press', 'lat-pulldown', 'seated-row', 'abdominal', 'back-extension'],
    dayBlueprints: [
      {
        id: 'balanced-a',
        name: 'Ganzkörper Basis',
        machineIds: ['leg-press', 'chest-press', 'lat-pulldown', 'seated-row', 'abdominal'],
      },
      {
        id: 'balanced-b',
        name: 'Ganzkörper Variation',
        machineIds: ['hack-squat', 'butterfly', 'assisted-pullup', 'cable-row', 'back-extension'],
      },
    ],
    targetSets: 3,
    repMin: 8,
    repMax: 12,
    weightStep: 2.5,
    approvedBy: 'Trainerteam Pilot Studio',
  },
  {
    studioId: studioTheme.studioId,
    id: 'strength-foundation',
    name: 'Strength Foundation',
    description: 'Mehr Struktur und Trainingsvolumen für einen nachhaltigen Kraftaufbau.',
    goals: ['muscle_gain'],
    levels: ['beginner', 'intermediate', 'advanced'],
    supportedDays: [3, 4, 5],
    supportedDurations: [45, 60, 90],
    machineIds: [
      'leg-press',
      'leg-curl',
      'chest-press',
      'lat-pulldown',
      'seated-row',
      'shoulder-press',
      'abdominal',
      'back-extension',
    ],
    dayBlueprints: [
      {
        id: 'strength-a',
        name: 'Unterkörper & Mitte',
        machineIds: ['leg-press', 'leg-curl', 'abdominal', 'back-extension'],
      },
      {
        id: 'strength-b',
        name: 'Oberkörper Zug',
        machineIds: ['lat-pulldown', 'seated-row', 'assisted-pullup', 'cable-row'],
      },
      {
        id: 'strength-c',
        name: 'Oberkörper Druck',
        machineIds: ['chest-press', 'shoulder-press', 'butterfly', 'abdominal'],
      },
    ],
    targetSets: 3,
    repMin: 8,
    repMax: 12,
    weightStep: 2.5,
    approvedBy: 'Trainerteam Pilot Studio',
  },
  {
    studioId: studioTheme.studioId,
    id: 'active-circuit',
    name: 'Active Circuit',
    description: 'Ein zügiger Maschinenzirkel mit moderaten Pausen für Kraftausdauer.',
    goals: ['endurance', 'weight_control'],
    levels: ['beginner', 'intermediate', 'advanced'],
    supportedDays: [2, 3, 4, 5],
    supportedDurations: [30, 45, 60],
    machineIds: ['leg-press', 'chest-press', 'lat-pulldown', 'seated-row', 'shoulder-press', 'abdominal'],
    dayBlueprints: [
      {
        id: 'circuit-a',
        name: 'Aktiv-Zirkel A',
        machineIds: ['leg-press', 'chest-press', 'lat-pulldown', 'abdominal'],
      },
      {
        id: 'circuit-b',
        name: 'Aktiv-Zirkel B',
        machineIds: ['hack-squat', 'shoulder-press', 'seated-row', 'back-extension'],
      },
    ],
    targetSets: 2,
    repMin: 12,
    repMax: 15,
    weightStep: 2.5,
    approvedBy: 'Trainerteam Pilot Studio',
  },
]
