import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InviteScreen } from './InviteScreen'

describe('InviteScreen', () => {
  it('shows the FitPath promise and trust signals', () => {
    render(<InviteScreen onContinue={vi.fn()} />)

    expect(
      screen.getByRole('heading', {
        name: 'Dein Plan.Deine Geräte.Dein Fortschritt.',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Trainer-geprüft')).toHaveLength(2)
    expect(screen.getAllByText('Nur Studio-Geräte')).toHaveLength(2)
    expect(screen.getAllByText('Kein geschätztes Startgewicht')).toHaveLength(2)
  })

  it('keeps the member on the screen when the studio code is invalid', () => {
    render(<InviteScreen onContinue={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Dein Studio-Code'), {
      target: { value: 'BAD' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Studio-Code eingeben' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Dieser Studio-Code ist nicht gültig.')
  })

  it('continues when the pilot studio code is valid', () => {
    const onContinue = vi.fn()
    render(<InviteScreen onContinue={onContinue} />)

    fireEvent.change(screen.getByLabelText('Dein Studio-Code'), {
      target: { value: 'FIT2026' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Studio-Code eingeben' }))

    expect(onContinue).toHaveBeenCalledOnce()
  })
})
