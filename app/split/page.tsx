'use client'

import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface BillData {
  billName: string
  payerName: string
  items: { name: string; price: number }[]
  serviceChargeRate: number
  sstRate: number
  qrCode: string
}

function decodeBillData(encoded: string): BillData | null {
  try {
    const standard = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded = standard + '=='.slice(0, (4 - standard.length % 4) % 4)
    const json = decodeURIComponent(escape(atob(padded)))
    return JSON.parse(json) as BillData
  } catch {
    return null
  }
}

function useAnimatedValue(target: number, duration = 900) {
  const [displayed, setDisplayed] = useState(target)
  const prevRef = useRef(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = prevRef.current
    const end = target
    if (start === end) return

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

    const startTime = performance.now()

    function animate(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(start + (end - start) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevRef.current = end
        setDisplayed(end)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return displayed
}

function fmt(n: number): string {
  return n.toFixed(2)
}

function SplitPageContent() {
  const searchParams = useSearchParams()
  const encoded = searchParams.get('d')

  const billData = useMemo((): BillData | null => {
    if (!encoded) return null
    return decodeBillData(encoded)
  }, [encoded])

  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  function toggleItem(idx: number) {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(idx)) {
        next.delete(idx)
      } else {
        next.add(idx)
      }
      return next
    })
  }

  const subtotal = useMemo(() => {
    return Array.from(selectedItems).reduce((sum, idx) => {
      return sum + (billData?.items[idx]?.price ?? 0)
    }, 0)
  }, [selectedItems, billData])

  const serviceCharge = useMemo(() => {
    return subtotal * ((billData?.serviceChargeRate ?? 0) / 100)
  }, [subtotal, billData])

  const sst = useMemo(() => {
    return (subtotal + serviceCharge) * ((billData?.sstRate ?? 0) / 100)
  }, [subtotal, serviceCharge, billData])

  const grandTotal = subtotal + serviceCharge + sst

  const animatedTotal = useAnimatedValue(grandTotal)
  const animatedSubtotal = useAnimatedValue(subtotal)
  const animatedSC = useAnimatedValue(serviceCharge)
  const animatedSST = useAnimatedValue(sst)

  if (!billData) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center max-w-[430px] w-full mx-auto">
        <p className="text-4xl mb-4">😕</p>
        <h1 className="text-text-primary font-bold text-xl mb-2">Invalid link</h1>
        <p className="text-text-secondary text-sm">
          This link doesn&apos;t contain valid bill data. Ask the payer to generate a new link.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[430px]">

      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] tracking-[2px] uppercase text-text-muted mb-1">Kongsi Bill</p>
        <h1 className="text-[26px] font-bold text-text-primary leading-tight">{billData.billName}</h1>
        <p className="text-text-secondary text-[14px] mt-1">
          Pilih lah makan apa tadi
        </p>
      </div>

      {/* Items */}
      <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
        <p className="text-[11px] tracking-[1.5px] uppercase text-text-muted mb-4">What did you have?</p>
        <div>
          {billData.items.map((item, idx) => {
            const selected = selectedItems.has(idx)
            return (
              <button
                key={idx}
                onClick={() => toggleItem(idx)}
                className="w-full flex items-center justify-between py-3 border-b border-border last:border-b-0 cursor-pointer select-none active:opacity-70 transition-opacity text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-all ${
                      selected ? 'bg-accent border-accent' : 'bg-transparent border-border'
                    }`}
                  >
                    {selected && (
                      <span className="text-text-on-accent text-[13px] font-bold leading-none">✓</span>
                    )}
                  </div>
                  <span className={`text-[15px] ${selected ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                    {item.name}
                  </span>
                </div>
                <span className="text-[15px] font-semibold text-text-primary shrink-0 ml-2">
                  RM {fmt(item.price)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Total */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{ background: 'linear-gradient(135deg, #00d094 0%, #0086ff 100%)' }}
      >
        <p className="text-[12px] tracking-[1.5px] uppercase text-white/70 mb-2">Your total</p>
        <p className="text-[42px] font-extrabold tracking-tight text-white mb-3 leading-none tabular-nums">
          <span className="text-[20px] font-normal opacity-80 mr-1">RM</span>
          {fmt(animatedTotal)}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between text-[13px] text-white/70">
            <span>Items subtotal</span>
            <span className="tabular-nums">RM {fmt(animatedSubtotal)}</span>
          </div>
          {billData.serviceChargeRate > 0 && (
            <div className="flex justify-between text-[13px] text-white/70">
              <span>Service charge ({billData.serviceChargeRate}%)</span>
              <span className="tabular-nums">RM {fmt(animatedSC)}</span>
            </div>
          )}
          {billData.sstRate > 0 && (
            <div className="flex justify-between text-[13px] text-white/70">
              <span>SST ({billData.sstRate}%)</span>
              <span className="tabular-nums">RM {fmt(animatedSST)}</span>
            </div>
          )}
        </div>
        {selectedItems.size === 0 && (
          <p className="text-white/50 text-[12px] mt-3">← Tap your items above to see your total</p>
        )}
      </div>

      {/* Pay card */}
      <div className="bg-surface border border-border rounded-2xl p-5 text-center mb-4">
        {billData.qrCode ? (
          <>
            <p className="text-[11px] tracking-[1.5px] uppercase text-text-muted mb-3">
              Pay {billData.payerName}
            </p>
            <img
              src={billData.qrCode}
              alt={`${billData.payerName}'s payment QR`}
              className="w-[200px] h-[200px] object-contain mx-auto rounded-xl bg-white p-2 mb-3"
            />
            <p className="text-text-secondary text-[13px]">
              Screenshot this QR and pay via DuitNow · TNG · Any bank
            </p>
          </>
        ) : (
          <>
            <p className="text-text-secondary text-[13px]">Scan {billData.payerName}&apos;s QR code to pay</p>
            <p className="text-text-primary font-semibold text-[16px] mt-1">{billData.payerName}</p>
            <p className="text-text-muted text-[11px] mt-1">DuitNow · Touch &apos;n Go · Any Malaysian bank</p>
          </>
        )}
      </div>

      <p className="text-center text-text-muted text-[12px] pb-8">
        Each person selects their own items independently.
      </p>
    </div>
  )
}

export default function SplitPage() {
  return (
    <main className="min-h-screen bg-bg py-8 px-4">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-text-secondary text-[14px]">Loading bill...</p>
        </div>
      }>
        <SplitPageContent />
      </Suspense>
    </main>
  )
}
