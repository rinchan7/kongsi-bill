'use client'

import { useState, useRef } from 'react'

interface Item {
  name: string
  price: string
  qty: number
}

interface BillData {
  billName: string
  payerName: string
  payerPhone?: string
  items: { name: string; price: number; qty: number }[]
  serviceChargeRate: number
  sstRate: number
  qrCode: string
  receiptUrl?: string
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const MAX_SIZE = 400
      let { width, height } = img
      if (width > MAX_SIZE || height > MAX_SIZE) {
        const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      URL.revokeObjectURL(objectUrl)
      resolve(dataUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }
    img.src = objectUrl
  })
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

async function uploadQR(dataUrl: string): Promise<string> {
  const res = await fetch('/api/upload-qr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataUrl }),
  })
  if (!res.ok) throw new Error('Failed to upload QR')
  const { url } = await res.json()
  return url
}

async function uploadReceipt(dataUrl: string): Promise<string> {
  const res = await fetch('/api/upload-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: dataUrl }),
  })
  if (!res.ok) throw new Error('Failed to upload receipt')
  const { url } = await res.json()
  return url
}

function encodeBillData(data: BillData): string {
  const json = JSON.stringify(data)
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function fmt(n: number): string {
  return n.toFixed(2)
}

export default function PayerPage() {
  const [billName, setBillName] = useState('')
  const [payerName, setPayerName] = useState('')
  const [items, setItems] = useState<Item[]>([{ name: '', price: '', qty: 1 }])
  const [serviceChargeRate, setServiceChargeRate] = useState(10)
  const [sstRate, setSstRate] = useState(6)
  const [payerPhone, setPayerPhone] = useState('')
  const [qrPreview, setQrPreview] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrFileName, setQrFileName] = useState('')
  const [qrUploading, setQrUploading] = useState(false)
  const [receiptDataUrl, setReceiptDataUrl] = useState('')
  const [receiptFileName, setReceiptFileName] = useState('')
  const [receiptUploading, setReceiptUploading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const receiptFileInputRef = useRef<HTMLInputElement>(null)

  function addItem() {
    setItems(prev => [...prev, { name: '', price: '', qty: 1 }])
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: 'name' | 'price', value: string) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  function updateQty(idx: number, delta: number) {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ))
  }

  async function handleQrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setQrUploading(true)
    try {
      const dataUrl = await compressImage(file)
      setQrPreview(dataUrl)
      setQrDataUrl(dataUrl)
      setQrFileName(file.name)
    } catch {
      setError('Failed to process QR image. Please try another file.')
    } finally {
      setQrUploading(false)
    }
  }

  async function handleReceiptUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setReceiptUploading(true)
    try {
      const dataUrl = file.type === 'application/pdf'
        ? await fileToDataUrl(file)
        : await compressImage(file)
      setReceiptDataUrl(dataUrl)
      setReceiptFileName(file.name)
    } catch {
      setError('Failed to process receipt. Please try another file.')
    } finally {
      setReceiptUploading(false)
    }
  }

  async function handleGenerateLink() {
    setError('')
    setGeneratedUrl('')

    const validItems = items.filter(i => i.name.trim() && i.price.trim())
    if (!billName.trim()) { setError('Please enter a bill name.'); return }
    if (validItems.length === 0) { setError('Please add at least one item with a name and price.'); return }
    if (!payerName.trim()) { setError('Please enter your name so guests know who to pay.'); return }

    setGenerating(true)
    try {
      let qrCode = ''
      if (qrDataUrl) qrCode = await uploadQR(qrDataUrl)

      let receiptUrl: string | undefined
      if (receiptDataUrl) receiptUrl = await uploadReceipt(receiptDataUrl)

      const billData: BillData = {
        billName: billName.trim(),
        payerName: payerName.trim(),
        payerPhone: payerPhone.trim() || undefined,
        items: validItems.map(i => ({
          name: i.name.trim(),
          price: parseFloat(i.price.replace(',', '.')) || 0,
          qty: i.qty,
        })),
        serviceChargeRate,
        sstRate,
        qrCode,
        receiptUrl,
      }

      const encoded = encodeBillData(billData)
      const url = `${window.location.origin}/split?d=${encoded}`
      setGeneratedUrl(url)

      try {
        await navigator.clipboard.writeText(url)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 3000)
      } catch {
        // fallback: show URL in box
      }
    } catch {
      setError('Failed to upload. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const inputClass =
    'w-full bg-bg border border-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors text-[15px]'

  const linkGenerated = generatedUrl.length > 0

  const billSubtotal = items.reduce((sum, i) => {
    if (!i.name.trim() || !i.price.trim()) return sum
    return sum + i.qty * (parseFloat(i.price.replace(',', '.')) || 0)
  }, 0)
  const billServiceCharge = billSubtotal * (serviceChargeRate / 100)
  const billSST = (billSubtotal + billServiceCharge) * (sstRate / 100)
  const billTotal = billSubtotal + billServiceCharge + billSST

  const stepperBtn = 'w-9 h-9 rounded-full border flex items-center justify-center text-[18px] leading-none transition-colors shrink-0'

  return (
    <main className="min-h-screen bg-bg py-8 px-4">
      <div className="mx-auto max-w-[430px]">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[2px] uppercase text-text-muted mb-1">Kongsi Bill</p>
          <h1 className="text-[28px] font-bold text-text-primary">Create Bill</h1>
          <p className="text-text-secondary text-[14px] mt-1">
            Fill in the details and share the link with your group.
          </p>
        </div>

        {/* Bill Name */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
          <p className="text-[11px] tracking-[1.5px] uppercase text-text-muted mb-3">Bill Name</p>
          <input
            className={inputClass}
            placeholder="e.g. Dinner @ Restoran Pelita"
            value={billName}
            onChange={e => setBillName(e.target.value)}
          />
        </div>

        {/* Items */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
          <p className="text-[11px] tracking-[1.5px] uppercase text-text-muted mb-4">Items</p>
          <div className="divide-y divide-border">
            {items.map((item, idx) => {
              const price = parseFloat(item.price.replace(',', '.')) || 0
              const itemTotal = item.qty * price
              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  {/* Name row */}
                  <div className="flex gap-2 items-center mb-3">
                    <input
                      className={`${inputClass} flex-1`}
                      placeholder="Item name"
                      value={item.name}
                      onChange={e => updateItem(idx, 'name', e.target.value)}
                    />
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(idx)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-text-muted hover:text-text-primary hover:border-text-muted transition-colors shrink-0 text-lg leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {/* Price + Stepper row */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]">RM</span>
                      <input
                        className="w-full bg-bg border border-border rounded-xl pl-9 pr-3 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors text-[15px]"
                        placeholder="0.00"
                        value={item.price}
                        onChange={e => updateItem(idx, 'price', e.target.value)}
                        inputMode="decimal"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateQty(idx, -1)}
                        disabled={item.qty <= 1}
                        className={`${stepperBtn} border-accent/70 text-text-secondary hover:border-accent disabled:opacity-25 disabled:cursor-not-allowed`}
                      >
                        −
                      </button>
                      <span className="text-text-primary font-semibold text-[16px] w-6 text-center tabular-nums select-none">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(idx, 1)}
                        className={`${stepperBtn} border-accent bg-accent text-text-on-accent active:opacity-80`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {item.qty > 1 && price > 0 && (
                    <p className="text-text-muted text-[12px] mt-2 text-right tabular-nums">
                      {item.qty} × RM {fmt(price)} = RM {fmt(itemTotal)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          <button
            onClick={addItem}
            className="mt-4 w-full border border-border rounded-xl py-3 text-text-secondary text-[14px] font-medium hover:border-accent hover:text-accent transition-colors"
          >
            + Add Item
          </button>
        </div>

        {/* Tax Rates */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
          <p className="text-[11px] tracking-[1.5px] uppercase text-text-muted mb-4">Tax & Charges</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-text-secondary text-[12px] mb-2">Service Charge</p>
              <div className="relative">
                <input
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 pr-8 text-text-primary focus:outline-none focus:border-accent transition-colors text-[15px]"
                  value={serviceChargeRate}
                  onChange={e => setServiceChargeRate(parseFloat(e.target.value) || 0)}
                  inputMode="decimal"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]">%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-text-secondary text-[12px] mb-2">SST</p>
              <div className="relative">
                <input
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 pr-8 text-text-primary focus:outline-none focus:border-accent transition-colors text-[15px]"
                  value={sstRate}
                  onChange={e => setSstRate(parseFloat(e.target.value) || 0)}
                  inputMode="decimal"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[13px]">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        {billSubtotal > 0 && (
          <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
            <p className="text-[11px] tracking-[1.5px] uppercase text-text-muted mb-4">Bill Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-text-secondary">Items subtotal</span>
                <span className="text-text-primary tabular-nums">RM {fmt(billSubtotal)}</span>
              </div>
              {serviceChargeRate > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-text-secondary">Service charge ({serviceChargeRate}%)</span>
                  <span className="text-text-primary tabular-nums">RM {fmt(billServiceCharge)}</span>
                </div>
              )}
              {sstRate > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-text-secondary">SST ({sstRate}%)</span>
                  <span className="text-text-primary tabular-nums">RM {fmt(billSST)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-text-primary font-semibold text-[15px]">You paid</span>
                <span className="text-accent font-bold text-[20px] tabular-nums">RM {fmt(billTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payer Info */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-4">
          <p className="text-[11px] tracking-[1.5px] uppercase text-text-muted mb-4">Your Info</p>
          <input
            className={`${inputClass} mb-3`}
            placeholder="Your name (shown to guests)"
            value={payerName}
            onChange={e => setPayerName(e.target.value)}
          />
          <input
            className={`${inputClass} mb-4`}
            placeholder="WhatsApp number e.g. 0123456789 (optional)"
            value={payerPhone}
            onChange={e => setPayerPhone(e.target.value)}
            inputMode="tel"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleQrUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-dashed border-border rounded-xl py-4 text-text-secondary text-[14px] hover:border-accent hover:text-accent transition-colors"
          >
            {qrUploading
              ? 'Processing...'
              : qrFileName
                ? <span className="text-accent">✓ {qrFileName}</span>
                : '↑ Upload your QR code (DuitNow / TNG)'}
          </button>
          {qrPreview && (
            <div className="mt-3 flex items-start gap-3 bg-bg rounded-xl p-3 border border-border">
              <img
                src={qrPreview}
                alt="Your QR code"
                className="w-[80px] h-[80px] object-contain rounded-lg bg-white p-1 shrink-0"
              />
              <div>
                <p className="text-text-primary text-[13px] font-medium">QR ready</p>
                <p className="text-text-muted text-[12px] mt-1">
                  Will be uploaded when you generate the link. Guests can screenshot to pay.
                </p>
              </div>
            </div>
          )}

          <input
            ref={receiptFileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleReceiptUpload}
          />
          <button
            onClick={() => receiptFileInputRef.current?.click()}
            className="mt-3 w-full border border-dashed border-border rounded-xl py-4 text-text-secondary text-[14px] hover:border-accent hover:text-accent transition-colors"
          >
            {receiptUploading
              ? 'Processing...'
              : receiptFileName
                ? <span className="text-accent">✓ {receiptFileName}</span>
                : '↑ Upload receipt (optional · image or PDF)'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-[13px] mb-4 px-1">{error}</p>
        )}

        {/* Generate Link */}
        <button
          onClick={handleGenerateLink}
          disabled={generating}
          className="w-full bg-accent text-text-on-accent font-semibold rounded-2xl py-4 text-[16px] mb-4 transition-opacity active:opacity-80 disabled:opacity-60"
        >
          {generating ? 'Uploading & generating...' : linkCopied ? '✓ Link Copied!' : 'Generate Shareable Link'}
        </button>

        {/* Link Result */}
        {linkGenerated && (
          <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
            <p className="text-text-secondary text-[12px] mb-3">
              {linkCopied ? '✓ Copied! Send this to your group:' : 'Copy this link and send on WhatsApp:'}
            </p>
            <div className="bg-bg border border-border rounded-xl p-3 mb-3">
              <p className="text-text-muted text-[11px] break-all select-all">{generatedUrl}</p>
            </div>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(generatedUrl)
                setLinkCopied(true)
                setTimeout(() => setLinkCopied(false), 2000)
              }}
              className="w-full border border-accent text-accent rounded-xl py-2.5 text-[13px] font-medium"
            >
              Copy Link
            </button>
          </div>
        )}

        {linkGenerated && qrPreview && (
          <div className="bg-surface border border-border rounded-2xl p-5 mb-4 text-center">
            <p className="text-[11px] tracking-[1.5px] uppercase text-text-muted mb-3">Your QR code</p>
            <img
              src={qrPreview}
              alt="Your payment QR"
              className="w-[180px] h-[180px] object-contain mx-auto rounded-xl bg-white p-2 mb-3"
            />
            <p className="text-text-secondary text-[13px]">Guests will see this in the link</p>
          </div>
        )}

        <p className="text-center text-text-muted text-[12px] pb-8">
          Guests open the link, tap what they ordered, and see exactly what they owe.
        </p>
      </div>
    </main>
  )
}
