import type { Machine } from './types'

const guide = (de: string[], tr: string[], en: string[]) => ({ de, tr, en })
const safety = (de: string, tr: string, en: string) => ({ de, tr, en })

export const machines: Machine[] = [
  {
    id: 'leg-press',
    number: 'M04',
    name: { de: 'Beinpresse', tr: 'Bacak press', en: 'Leg press' },
    zone: 'Kraft · Zone A',
    muscles: { de: 'Oberschenkel · Gesäß', tr: 'Üst bacak · Kalça', en: 'Thighs · Glutes' },
    sets: 3,
    reps: '8–12',
    tempo: '2–1–3',
    instructions: guide(
      ['Rückenlehne passend einstellen.', 'Füße schulterbreit aufsetzen.', 'Kontrolliert drücken und langsam zurückführen.'],
      ['Sırt dayanağını ayarla.', 'Ayaklarını omuz genişliğinde yerleştir.', 'Kontrollü it ve yavaşça geri dön.'],
      ['Adjust the backrest.', 'Place feet shoulder-width apart.', 'Press with control and return slowly.'],
    ),
    safety: safety('Knie nicht vollständig durchdrücken.', 'Dizleri tamamen kilitleme.', 'Do not fully lock the knees.'),
  },
  {
    id: 'chest-press',
    number: 'M07',
    name: { de: 'Brustpresse', tr: 'Göğüs press', en: 'Chest press' },
    zone: 'Kraft · Zone B',
    muscles: { de: 'Brust · Trizeps', tr: 'Göğüs · Arka kol', en: 'Chest · Triceps' },
    sets: 3,
    reps: '8–12',
    tempo: '2–1–3',
    instructions: guide(
      ['Griffe auf Brusthöhe einstellen.', 'Schulterblätter am Polster halten.', 'Griffe nach vorne drücken.'],
      ['Kolları göğüs hizasına ayarla.', 'Kürek kemiklerini dayanakta tut.', 'Kolları öne doğru it.'],
      ['Set handles at chest height.', 'Keep shoulder blades on the pad.', 'Press the handles forward.'],
    ),
    safety: safety('Schultern nicht nach vorne ziehen.', 'Omuzları öne düşürme.', 'Do not roll the shoulders forward.'),
  },
  {
    id: 'lat-pulldown',
    number: 'M12',
    name: { de: 'Latzug', tr: 'Lat çekiş', en: 'Lat pulldown' },
    zone: 'Kraft · Zone C',
    muscles: { de: 'Latissimus · Bizeps', tr: 'Sırt · Ön kol', en: 'Lats · Biceps' },
    sets: 3,
    reps: '8–12',
    tempo: '2–1–3',
    instructions: guide(
      ['Oberschenkelpolster fixieren.', 'Brust anheben und Rumpf stabil halten.', 'Stange vor dem Gesicht zur oberen Brust ziehen.'],
      ['Üst bacak pedini sabitle.', 'Göğsü kaldır ve gövdeyi sabit tut.', 'Barı yüzün önünden üst göğse çek.'],
      ['Secure the thigh pad.', 'Lift the chest and keep the torso stable.', 'Pull the bar in front of the face to the upper chest.'],
    ),
    safety: safety('Nie hinter den Kopf ziehen oder nach hinten schwingen.', 'Barı başın arkasına çekme ve geriye sallanma.', 'Never pull behind the head or rock backward.'),
  },
  {
    id: 'seated-row',
    number: 'M15',
    name: { de: 'Rudermaschine', tr: 'Oturarak row', en: 'Seated row' },
    zone: 'Kraft · Zone C',
    muscles: { de: 'Oberer Rücken · Bizeps', tr: 'Üst sırt · Ön kol', en: 'Upper back · Biceps' },
    sets: 3,
    reps: '8–12',
    tempo: '2–1–3',
    instructions: guide(
      ['Brust am Polster halten.', 'Ellbogen nah am Körper führen.', 'Langsam in die Startposition zurückkehren.'],
      ['Göğsü dayanakta tut.', 'Dirsekleri gövdeye yakın çek.', 'Başlangıç konumuna yavaş dön.'],
      ['Keep chest on the pad.', 'Drive elbows close to the body.', 'Return slowly to the start.'],
    ),
    safety: safety('Nicht mit dem unteren Rücken schwingen.', 'Belden sallanma.', 'Do not swing through the lower back.'),
  },
  {
    id: 'abdominal',
    number: 'M23',
    name: { de: 'Bauchmaschine', tr: 'Karın makinesi', en: 'Abdominal machine' },
    zone: 'Functional · Zone E',
    muscles: { de: 'Bauch · Rumpf', tr: 'Karın · Merkez', en: 'Abs · Core' },
    sets: 3,
    reps: '10–15',
    tempo: '2–1–3',
    instructions: guide(
      ['Füße fest positionieren.', 'Rippen zum Becken einrollen.', 'Kontrolliert aufrichten.'],
      ['Ayaklarını sabitle.', 'Kaburgaları leğen kemiğine doğru kıvır.', 'Kontrollü şekilde doğrul.'],
      ['Fix the feet.', 'Curl the ribs toward the pelvis.', 'Return upright with control.'],
    ),
    safety: safety('Nicht mit den Armen ziehen.', 'Kollarla çekme.', 'Do not pull with the arms.'),
  },
]

export const weeklyRoute = machines.map((machine, index) => ({
  ...machine,
  order: index + 1,
}))

export const findMachine = (id: string) => machines.find((machine) => machine.id === id)

export const resolveQrMachine = (value: string) => {
  const normalized = value.toLowerCase()
  return machines.find(
    (machine) =>
      normalized.includes(machine.id) ||
      normalized.includes(machine.number.toLowerCase()),
  )
}

