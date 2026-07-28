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

    const startImage = screen.getByAltText('Beinpresse mit Sportlerin, Bewegungsphase 1 von 8')
    expect(startImage).toHaveAttribute('src', '/guides/sequences/leg-press-female-01.webp')

    fireEvent.click(screen.getByRole('button', { name: 'Mann' }))
    expect(screen.getByAltText('Beinpresse mit Sportler, Bewegungsphase 1 von 8')).toHaveAttribute(
      'src',
      '/guides/sequences/leg-press-male-01.webp',
    )
  })

  it('uses an eight-frame motion sequence for every studio machine', () => {
    const { container, rerender } = render(
      <MachineGuidePanel machine={machines[0]} onStart={vi.fn()} />,
    )

    for (const machine of machines) {
      rerender(<MachineGuidePanel machine={machine} onStart={vi.fn()} />)

      expect(container.querySelectorAll('.exercise-frame--sequence')).toHaveLength(8)
      const extension = machine.id === 'leg-press' ? 'webp' : 'jpg'
      expect(
        screen.getByAltText(`${machine.name} mit Sportlerin, Bewegungsphase 1 von 8`),
      ).toHaveAttribute(
        'src',
        `/guides/sequences/${machine.id}-female-01.${extension}`,
      )
    }
  })
})
