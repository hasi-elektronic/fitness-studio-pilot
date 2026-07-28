import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { machines } from '../data'
import { MachineGuidePanel } from './MachineGuide'

describe('MachineGuidePanel', () => {
  it('provides a complete guide for every active studio machine', () => {
    expect(machines).toHaveLength(12)

    for (const machine of machines) {
      expect(machine.guide.summary).toBeTruthy()
      expect(machine.guide.steps).toHaveLength(3)
      expect(machine.guide.targetMuscles).toBeTruthy()
      expect(machine.guide.tempo).toMatch(/\d–\d–\d/)
      expect(machine.guide.breathing).toBeTruthy()
      expect(machine.guide.commonMistakes.length).toBeGreaterThanOrEqual(3)
      expect(machine.guide.safetyNotes.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('switches between technique and safety information and controls the animation', () => {
    render(<MachineGuidePanel machine={machines[0]} onStart={vi.fn()} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Technik' }))
    expect(screen.getByText('Rückenlehne · Sicherheitsanschlag · Fußposition')).toBeVisible()

    fireEvent.click(screen.getByRole('tab', { name: 'Sicherheit' }))
    expect(screen.getByText('Knie nach innen kippen lassen')).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'Animation pausieren' }))
    expect(screen.getByRole('button', { name: 'Animation abspielen' })).toBeVisible()

    expect(
      screen.getByLabelText('Beinpresse mit Sportlerin, kontrollierter Bewegungsablauf'),
    ).toHaveAttribute('src', '/guides/videos/leg-press-female.mp4')

    fireEvent.click(screen.getByRole('button', { name: 'Mann' }))
    expect(
      screen.getByLabelText('Beinpresse mit Sportler, kontrollierter Bewegungsablauf'),
    ).toHaveAttribute('src', '/guides/videos/leg-press-male.mp4')
  })

  it('uses a real video with the eight-frame sequence as fallback for every machine', () => {
    for (const machine of machines) {
      const { container, unmount } = render(
        <MachineGuidePanel machine={machine} onStart={vi.fn()} />,
      )

      const video = screen.getByLabelText(
        `${machine.name} mit Sportlerin, kontrollierter Bewegungsablauf`,
      )
      expect(video).toHaveAttribute('src', `/guides/videos/${machine.id}-female.mp4`)

      fireEvent.error(video)

      expect(container.querySelectorAll('.exercise-frame--sequence')).toHaveLength(8)
      const extension = machine.id === 'leg-press' ? 'webp' : 'jpg'
      expect(
        screen.getByAltText(`${machine.name} mit Sportlerin, Bewegungsphase 1 von 8`),
      ).toHaveAttribute(
        'src',
        `/guides/sequences/${machine.id}-female-01.${extension}`,
      )

      unmount()
    }
  })
})
