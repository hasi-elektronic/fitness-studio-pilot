import { useEffect, useId, useRef, useState } from 'react'
import { Camera, CameraOff, LoaderCircle, X } from 'lucide-react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { Button } from './ui'

export function QrScanner({
  onDecoded,
  onClose,
}: {
  onDecoded: (value: string) => void
  onClose: () => void
}) {
  const rawId = useId()
  const readerId = `qr-reader-${rawId.replace(/:/g, '')}`
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const stopScanner = async () => {
    const scanner = scannerRef.current
    if (!scanner) return
    try {
      if (scanner.isScanning) await scanner.stop()
      scanner.clear()
    } catch {
      // Cleanup must not block the fallback machine list.
    } finally {
      scannerRef.current = null
    }
  }

  useEffect(
    () => () => {
      void stopScanner()
    },
    [],
  )

  const startScanner = async () => {
    setStatus('starting')
    setMessage('')
    try {
      const scanner = new Html5Qrcode(readerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: (width, height) => {
            const edge = Math.min(width, height, 260)
            return { width: edge, height: edge }
          },
          aspectRatio: 1,
          disableFlip: false,
        },
        async (decodedText) => {
          await stopScanner()
          onDecoded(decodedText)
        },
        () => undefined,
      )
      setStatus('scanning')
    } catch {
      setStatus('error')
      setMessage('Die Kamera konnte nicht gestartet werden. Nutze bitte die Maschinenliste.')
      await stopScanner()
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#05080b] text-white">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <div>
          <div className="text-sm font-bold">Maschinen-QR scannen</div>
          <div className="text-[11px] text-white/50">Halte den Code vollständig in den Rahmen.</div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await stopScanner()
            onClose()
          }}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-white/8"
          aria-label="Scanner schließen"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(58,186,221,.13),transparent_42%)]" />
        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 p-3">
          <div id={readerId} className="min-h-72 overflow-hidden rounded-3xl" />
          {status !== 'scanning' && (
            <div className="absolute inset-3 grid min-h-72 place-items-center rounded-3xl bg-[#0d1319]">
              <div className="max-w-xs px-5 text-center">
                {status === 'starting' ? (
                  <LoaderCircle className="mx-auto mb-4 animate-spin text-[var(--primary)]" size={42} />
                ) : status === 'error' ? (
                  <CameraOff className="mx-auto mb-4 text-[var(--warning)]" size={42} />
                ) : (
                  <Camera className="mx-auto mb-4 text-[var(--primary)]" size={42} />
                )}
                <p className="mb-5 text-sm text-white/60">
                  {message || 'Die Kamera wird erst nach deiner Freigabe aktiviert.'}
                </p>
                {status !== 'starting' && (
                  <Button onClick={startScanner} icon={Camera}>
                    Kamera starten
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
