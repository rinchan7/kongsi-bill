'use client'

import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface BillData {
  billName: string
  payerName: string
  payerPhone?: string
  items: { name: string; price: number; qty?: number }[]
  serviceChargeRate: number
  sstRate: number
  qrCode: string
  receiptUrl?: string
}

const THANK_YOU_MEMES = [
  { id: 'KJ1f5iTl4Oo7u', caption: 'T.HANKS! 🙏' },
  { id: '1Z02vuppxP1Pa', caption: "That's what legends do." },
  { id: 'AeWoyE3ZT90YM', caption: 'Respect. 🫡' },
  { id: 'BYoRqTmcgzHcL9TCy1', caption: "You're the GOAT. 🐐" },
  { id: 'uWlpPGquhGZNFzY90z', caption: 'Good human. 🐾' },
]

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

function formatMalaysianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('60')) return digits
  if (digits.startsWith('0')) return '60' + digits.slice(1)
  return '60' + digits
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

  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map())
  const [showMeme, setShowMeme] = useState(false)
  const [currentMeme, setCurrentMeme] = useState(THANK_YOU_MEMES[0])
  const pendingMemeRef = useRef(false)

  const [feedbackRating, setFeedbackRating] = useState<string | null>(null)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)

  useEffect(() => {
    if (showMeme) {
      setFeedbackRating(null)
      setFeedbackComment('')
      setFeedbackSubmitted(false)
    }
  }, [showMeme])

  async function handleFeedbackSubmit() {
    if (!feedbackRating) return
    setFeedbackSubmitting(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          comment: feedbackComment.trim() || undefined,
          billName: billData?.billName,
        }),
      })
    } catch {
      // fail silently — feedback is best-effort
    }
    setFeedbackSubmitting(false)
    setFeedbackSubmitted(true)
    setTimeout(() => setShowMeme(false), 1500)
  }

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible' && pendingMemeRef.current) {
        pendingMemeRef.current = false
        setShowMeme(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  function adjustQty(idx: number, newQty: number) {
    setSelectedItems(prev => {
      const next = new Map(prev)
      if (newQty <= 0) {
        next.delete(idx)
      } else {
        next.set(idx, newQty)
      }
      return next
    })
  }

  async function downloadQR() {
    if (!billData?.qrCode) return
    try {
      const res = await fetch(billData.qrCode)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `${billData.payerName}-QR.jpg`
      a.click()
      URL.revokeObjectURL(objectUrl)
    } catch {
      window.open(billData.qrCode, '_blank')
    }
  }

  function handleDahBayar() {
    if (!billData) return

    const meme = THANK_YOU_MEMES[Math.floor(Math.random() * THANK_YOU_MEMES.length)]
    setCurrentMeme(meme)

    const lines: string[] = [`Hi ${billData.payerName}! 🙏 Dah bayar untuk *${billData.billName}*\n`]
    Array.from(selectedItems.entries()).forEach(([idx, qty]) => {
      const item = billData.items[idx]
      if (!item) return
      const itemTotal = item.price * qty
      lines.push(`${item.name}${qty > 1 ? ` × ${qty}` : ''} — RM ${fmt(itemTotal)}`)
    })
    if (selectedItems.size > 0) {
      lines.push(`\n*Total: RM ${fmt(grandTotal)}*`)
    }
    lines.push(`\n_Sent via Kongsi Bill_`)

    const message = lines.join('\n')
    const phone = billData.payerPhone ? formatMalaysianPhone(billData.payerPhone) : ''
    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`

    pendingMemeRef.current = true
    window.location.href = waUrl
  }

  const subtotal = useMemo(() => {
    return Array.from(selectedItems.entries()).reduce((sum, [idx, qty]) => {
      return sum + (billData?.items[idx]?.price ?? 0) * qty
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

  const stepperBtn = 'w-9 h-9 rounded-full border flex items-center justify-center text-[18px] leading-none transition-colors active:opacity-70 shrink-0'

  return (
    <>
      {/* Meme overlay — appears when user returns from WhatsApp */}
      {showMeme && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 overflow-y-auto"
          style={{ background: 'rgba(10,10,15,0.96)' }}
          onClick={() => { if (!feedbackRating || feedbackSubmitted) setShowMeme(false) }}
        >
          <p className="text-[11px] tracking-[2px] uppercase text-text-muted mb-5">Terima kasih!</p>
          <img
            src={`https://media.giphy.com/media/${currentMeme.id}/giphy.gif`}
            alt="Thank you"
            className="w-full max-w-[300px] rounded-2xl"
          />
          <p className="text-white text-[20px] font-bold mt-5 text-center">{currentMeme.caption}</p>

          {/* Feedback */}
          <div
            className="mt-8 w-full max-w-[300px]"
            onClick={e => e.stopPropagation()}
          >
            {!feedbackSubmitted ? (
              <>
                <p className="text-text-muted text-[12px] text-center mb-4">
                  How was your experience?
                </p>
                <div className="flex justify-center gap-5 mb-4">
                  {(['😕', '😊', '🤩'] as const).map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setFeedbackRating(emoji)}
                      className="text-[34px] transition-all duration-150"
                      style={{
                        transform: feedbackRating === emoji ? 'scale(1.3)' : 'scale(1)',
                        opacity: feedbackRating && feedbackRating !== emoji ? 0.35 : 1,
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {feedbackRating && (
                  <div className="space-y-2">
                    <textarea
                      value={feedbackComment}
                      onChange={e => setFeedbackComment(e.target.value)}
                      placeholder="Anything to improve? (optional)"
                      rows={2}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-text-primary placeholder:text-text-muted text-[13px] resize-none focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={feedbackSubmitting}
                      className="w-full bg-accent text-text-on-accent font-semibold rounded-xl py-2.5 text-[14px] disabled:opacity-60 transition-opacity"
                    >
                      {feedbackSubmitting ? 'Sending...' : 'Send feedback'}
                    </button>
                  </div>
                )}

                {!feedbackRating && (
                  <p className="text-text-muted text-[12px] text-center mt-2">Tap anywhere to close</p>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="text-accent text-[15px] font-semibold">Thanks for your feedback! 🙏</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[430px]">

        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] tracking-[2px] uppercase text-text-muted mb-1">Kongsi Bill</p>
          <h1 className="text-[26px] font-bold text-text-primary leading-tight">{billData.billName}</h1>
          <p className="text-text-secondary text-[14px] mt-1">Pilih lah makan apa tadi</p>
        </div>

        {/* View Receipt */}
        {billData.receiptUrl && (
          <a
            href={billData.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full border border-border rounded-2xl py-3 text-text-secondary text-[14px] hover:border-accent hover:text-accent transition-colors mb-4"
          >
            View Receipt ↗
          </a>
        )}

        {/* Items */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
          <p className="text-[11px] tracking-[1.5px] uppercase text-text-muted mb-4">What did you have?</p>
          <div className="divide-y divide-border">
            {billData.items.map((item, idx) => {
              const qty = selectedItems.get(idx) ?? 0
              const isSelected = qty > 0
              return (
                <div key={idx} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {isSelected ? (
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-text-primary font-medium">{item.name}</p>
                      <p className="text-[13px] text-text-muted mt-0.5">RM {fmt(item.price)} / portion</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => adjustQty(idx, 1)}
                      className="flex-1 text-left min-w-0 opacity-75 active:opacity-50 transition-opacity"
                    >
                      <p className="text-[15px] text-text-secondary">{item.name}</p>
                      <p className="text-[13px] text-text-muted mt-0.5">RM {fmt(item.price)}</p>
                    </button>
                  )}

                  {isSelected ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => adjustQty(idx, qty - 1)}
                        className={`${stepperBtn} border-accent/70 text-text-secondary hover:border-accent`}
                      >
                        −
                      </button>
                      <span className="text-text-primary font-semibold text-[16px] w-5 text-center tabular-nums select-none">
                        {qty}
                      </span>
                      <button
                        onClick={() => adjustQty(idx, qty + 1)}
                        className={`${stepperBtn} border-accent bg-accent text-text-on-accent`}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => adjustQty(idx, 1)}
                      className={`${stepperBtn} border-border text-text-muted hover:border-accent hover:text-accent`}
                    >
                      +
                    </button>
                  )}
                </div>
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
            <p className="text-white/50 text-[12px] mt-3">Tap items above to see your total</p>
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
              <button
                onClick={downloadQR}
                className="mt-3 w-full border border-border rounded-xl py-2.5 text-text-secondary text-[13px] font-medium hover:border-accent hover:text-accent transition-colors"
              >
                Save QR to Photos
              </button>
            </>
          ) : (
            <>
              <p className="text-text-secondary text-[13px]">Scan {billData.payerName}&apos;s QR code to pay</p>
              <p className="text-text-primary font-semibold text-[16px] mt-1">{billData.payerName}</p>
              <p className="text-text-muted text-[11px] mt-1">DuitNow · Touch &apos;n Go · Any Malaysian bank</p>
            </>
          )}
        </div>

        {/* Dah bayar */}
        <button
          onClick={handleDahBayar}
          className="w-full bg-accent text-text-on-accent font-bold rounded-2xl py-4 text-[17px] mb-4 active:opacity-80 transition-opacity"
        >
          Dah bayar 🤙
        </button>

        <p className="text-center text-text-muted text-[12px] pb-8">
          Each person selects their own items independently.
        </p>
      </div>
    </>
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
