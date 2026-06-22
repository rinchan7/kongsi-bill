import React from 'react'

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const D = {
  bg: '#0a0a0f',
  surface: '#141419',
  border: '#1e1e28',
  accent: '#00d094',
  textPrimary: '#ffffff',
  textSecondary: '#888888',
  textMuted: '#555555',
  textOnAccent: '#000000',
}

const L = {
  bg: '#f5f5f7',
  surface: '#ffffff',
  border: '#e0e0e6',
  accent: '#00d094',
  textPrimary: '#0a0a0f',
  textSecondary: '#555555',
  textMuted: '#888888',
  textOnAccent: '#000000',
}

type T = typeof D

// ─── Mock data ────────────────────────────────────────────────────────────────

const ITEMS = [
  { name: 'Nasi Goreng Kampung', price: 14.0, qty: 2 },
  { name: 'Ayam Goreng Berempah', price: 12.0, qty: 1 },
  { name: 'Teh Tarik', price: 3.5, qty: 3 },
  { name: 'Roti Canai', price: 2.5, qty: 2 },
]

const SC_RATE = 10
const SST_RATE = 6

const subtotal = ITEMS.reduce((s, i) => s + i.price * i.qty, 0) // 55.50
const sc = subtotal * (SC_RATE / 100) // 5.55
const sst = (subtotal + sc) * (SST_RATE / 100) // 3.66
const total = subtotal + sc + sst // 64.71

// Guest picks Nasi Goreng ×1 + Teh Tarik ×1
const gSubtotal = 14 + 3.5
const gSC = gSubtotal * (SC_RATE / 100)
const gSST = (gSubtotal + gSC) * (SST_RATE / 100)
const gTotal = gSubtotal + gSC + gSST

function fmt(n: number) {
  return n.toFixed(2)
}

// ─── Primitive components ─────────────────────────────────────────────────────

function Lbl({ text, t }: { text: string; t: T }) {
  return (
    <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: t.textMuted, margin: '0 0 6px' }}>
      {text}
    </p>
  )
}

function Card({ t, children, mb = 8 }: { t: T; children: React.ReactNode; mb?: number }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, marginBottom: mb }}>
      {children}
    </div>
  )
}

function FakeInput({ placeholder, value, prefix, t }: { placeholder?: string; value?: string; prefix?: string; t: T }) {
  return (
    <div style={{
      background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10,
      padding: '9px 12px', fontSize: 13, color: value ? t.textPrimary : t.textMuted,
      display: 'flex', alignItems: 'center', gap: 4,
    }}>
      {prefix && <span style={{ color: t.textMuted, fontSize: 12, marginRight: 2 }}>{prefix}</span>}
      <span>{value ?? placeholder}</span>
    </div>
  )
}

function Stepper({ qty, t }: { qty: number; t: T }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid rgba(0,208,148,0.6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: t.textSecondary }}>−</div>
      <span style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary, width: 14, textAlign: 'center' }}>{qty}</span>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: t.textOnAccent }}>+</div>
    </div>
  )
}

function PlusBtn({ t }: { t: T }) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, color: t.textMuted, flexShrink: 0 }}>+</div>
  )
}

function GhostBtn({ label, t, dashed = false }: { label: string; t: T; dashed?: boolean }) {
  return (
    <div style={{ border: `1px ${dashed ? 'dashed' : 'solid'} ${t.border}`, borderRadius: 10, padding: '10px 12px', textAlign: 'center', fontSize: 12, color: t.textSecondary }}>
      {label}
    </div>
  )
}

function AccentBtn({ label, t }: { label: string; t: T }) {
  return (
    <div style={{ background: t.accent, borderRadius: 14, padding: '12px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: t.textOnAccent, marginBottom: 8 }}>
      {label}
    </div>
  )
}

function Hr({ t }: { t: T }) {
  return <div style={{ height: 1, background: t.border, margin: '8px 0' }} />
}

function QRBox() {
  return (
    <div style={{ width: 100, height: 100, background: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <rect width="80" height="80" fill="white" />
        <rect x="4" y="4" width="30" height="30" rx="2" fill="black" />
        <rect x="9" y="9" width="20" height="20" rx="1" fill="white" />
        <rect x="13" y="13" width="12" height="12" fill="black" />
        <rect x="46" y="4" width="30" height="30" rx="2" fill="black" />
        <rect x="51" y="9" width="20" height="20" rx="1" fill="white" />
        <rect x="55" y="13" width="12" height="12" fill="black" />
        <rect x="4" y="46" width="30" height="30" rx="2" fill="black" />
        <rect x="9" y="51" width="20" height="20" rx="1" fill="white" />
        <rect x="13" y="55" width="12" height="12" fill="black" />
        <rect x="46" y="46" width="8" height="8" fill="black" />
        <rect x="58" y="46" width="8" height="8" fill="black" />
        <rect x="46" y="58" width="8" height="8" fill="black" />
        <rect x="58" y="58" width="8" height="8" fill="black" />
        <rect x="38" y="38" width="6" height="6" fill="black" />
      </svg>
    </div>
  )
}

// ─── Phone frame ──────────────────────────────────────────────────────────────

function Phone({ t, children }: { t: T; children: React.ReactNode }) {
  const isDark = t === D
  return (
    <div style={{
      width: 280,
      background: t.bg,
      borderRadius: 36,
      border: `6px solid ${isDark ? '#1a1a22' : '#d4d4dc'}`,
      boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.12)',
      overflow: 'hidden',
      flexShrink: 0,
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    }}>
      {/* Status bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px 4px', color: t.textPrimary }}>
        <span style={{ fontSize: 11, fontWeight: 600 }}>9:41</span>
        <div style={{ width: 68, height: 18, background: isDark ? '#000' : '#ccc', borderRadius: 20 }} />
        <span style={{ fontSize: 9, letterSpacing: 1 }}>◼ ◼ ◼</span>
      </div>
      {/* Scrollable content */}
      <div style={{ padding: '8px 14px 28px', maxHeight: 620, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Screen: 1 — Empty create bill ───────────────────────────────────────────

function Screen1({ t }: { t: T }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Lbl text="Kongsi Bill" t={t} />
        <p style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, margin: '0 0 3px' }}>Create Bill</p>
        <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>Fill in the details and share the link with your group.</p>
      </div>

      <Card t={t}>
        <Lbl text="Bill Name" t={t} />
        <FakeInput placeholder="e.g. Dinner @ Restoran Pelita" t={t} />
      </Card>

      <Card t={t}>
        <Lbl text="Items" t={t} />
        <div style={{ marginBottom: 8 }}>
          <FakeInput placeholder="Item name" t={t} />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1 }}><FakeInput placeholder="0.00" prefix="RM" t={t} /></div>
          <Stepper qty={1} t={t} />
        </div>
        <div style={{ marginTop: 10 }}><GhostBtn label="+ Add Item" t={t} /></div>
      </Card>

      <Card t={t}>
        <Lbl text="Tax & Charges" t={t} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: t.textSecondary, margin: '0 0 4px' }}>Service Charge</p>
            <FakeInput value="10" t={t} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: t.textSecondary, margin: '0 0 4px' }}>SST</p>
            <FakeInput value="6" t={t} />
          </div>
        </div>
      </Card>
    </>
  )
}

// ─── Screen: 2 — Bill with items + summary ───────────────────────────────────

function Screen2({ t }: { t: T }) {
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <Lbl text="Kongsi Bill" t={t} />
        <p style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, margin: '0 0 3px' }}>Create Bill</p>
        <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>Fill in the details and share the link with your group.</p>
      </div>

      <Card t={t}>
        <Lbl text="Bill Name" t={t} />
        <FakeInput value="Dinner @ Restoran Pelita" t={t} />
      </Card>

      <Card t={t}>
        <Lbl text="Items" t={t} />
        {ITEMS.map((item, i) => (
          <div key={i}>
            {i > 0 && <Hr t={t} />}
            <div style={{ paddingTop: i > 0 ? 8 : 0, paddingBottom: 8 }}>
              <div style={{ marginBottom: 6 }}><FakeInput value={item.name} t={t} /></div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}><FakeInput value={fmt(item.price)} prefix="RM" t={t} /></div>
                <Stepper qty={item.qty} t={t} />
              </div>
            </div>
          </div>
        ))}
        <GhostBtn label="+ Add Item" t={t} />
      </Card>

      <Card t={t}>
        <Lbl text="Tax & Charges" t={t} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: t.textSecondary, margin: '0 0 4px' }}>Service Charge</p>
            <FakeInput value="10" t={t} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: t.textSecondary, margin: '0 0 4px' }}>SST</p>
            <FakeInput value="6" t={t} />
          </div>
        </div>
      </Card>

      <Card t={t}>
        <Lbl text="Bill Summary" t={t} />
        {[
          ['Items subtotal', `RM ${fmt(subtotal)}`],
          [`Service charge (${SC_RATE}%)`, `RM ${fmt(sc)}`],
          [`SST (${SST_RATE}%)`, `RM ${fmt(sst)}`],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: t.textSecondary }}>{label}</span>
            <span style={{ color: t.textPrimary }}>{value}</span>
          </div>
        ))}
        <Hr t={t} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>You paid</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: t.accent }}>RM {fmt(total)}</span>
        </div>
      </Card>
    </>
  )
}

// ─── Screen: 3 — Payer info + QR uploaded ────────────────────────────────────

function Screen3({ t }: { t: T }) {
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <Lbl text="Kongsi Bill" t={t} />
        <p style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, margin: '0 0 3px' }}>Create Bill</p>
        <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>Fill in the details and share the link with your group.</p>
      </div>

      <Card t={t}>
        <Lbl text="Your Info" t={t} />
        <div style={{ marginBottom: 8 }}><FakeInput value="Ahmad" t={t} /></div>
        <div style={{ marginBottom: 10 }}><FakeInput value="0123456789" t={t} /></div>

        {/* QR uploaded — success state */}
        <div style={{ border: `1px dashed ${t.accent}`, borderRadius: 10, padding: '10px 12px', textAlign: 'center', fontSize: 12, color: t.accent, marginBottom: 8 }}>
          ✓ duitnow-qr.jpg
        </div>

        {/* QR preview card */}
        <div style={{ display: 'flex', gap: 10, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
          <div style={{ width: 52, height: 52, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 3 }}>
            <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
              <rect width="80" height="80" fill="white" />
              <rect x="4" y="4" width="30" height="30" rx="2" fill="black" />
              <rect x="9" y="9" width="20" height="20" rx="1" fill="white" />
              <rect x="13" y="13" width="12" height="12" fill="black" />
              <rect x="46" y="4" width="30" height="30" rx="2" fill="black" />
              <rect x="51" y="9" width="20" height="20" rx="1" fill="white" />
              <rect x="55" y="13" width="12" height="12" fill="black" />
              <rect x="4" y="46" width="30" height="30" rx="2" fill="black" />
              <rect x="9" y="51" width="20" height="20" rx="1" fill="white" />
              <rect x="13" y="55" width="12" height="12" fill="black" />
              <rect x="46" y="46" width="8" height="8" fill="black" />
              <rect x="58" y="46" width="8" height="8" fill="black" />
              <rect x="46" y="58" width="8" height="8" fill="black" />
              <rect x="58" y="58" width="8" height="8" fill="black" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: t.textPrimary, margin: '0 0 3px' }}>QR ready</p>
            <p style={{ fontSize: 11, color: t.textMuted, margin: 0, lineHeight: 1.4 }}>Will be uploaded when you generate the link.</p>
          </div>
        </div>

        <GhostBtn label="↑ Upload receipt (optional · image or PDF)" t={t} dashed />
      </Card>

      <AccentBtn label="Generate Shareable Link" t={t} />
    </>
  )
}

// ─── Screen: 4 — Link generated ──────────────────────────────────────────────

function Screen4({ t }: { t: T }) {
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <Lbl text="Kongsi Bill" t={t} />
        <p style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary, margin: '0 0 3px' }}>Create Bill</p>
        <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>Fill in the details and share the link with your group.</p>
      </div>

      <Card t={t}>
        <Lbl text="Bill Name" t={t} />
        <FakeInput value="Dinner @ Restoran Pelita" t={t} />
      </Card>

      {/* CTA — success state */}
      <div style={{ background: t.accent, borderRadius: 14, padding: '13px', textAlign: 'center', fontSize: 14, fontWeight: 700, color: t.textOnAccent, marginBottom: 8 }}>
        ✓ Link Copied!
      </div>

      {/* Link result */}
      <Card t={t}>
        <p style={{ fontSize: 12, color: t.textSecondary, margin: '0 0 8px' }}>✓ Copied! Send this to your group:</p>
        <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, padding: '8px 10px', marginBottom: 8 }}>
          <p style={{ fontSize: 10, color: t.textMuted, margin: 0, wordBreak: 'break-all' }}>kongsi-bill.vercel.app/split?d=eyJiaWxsTmFtZSI6Ikp...</p>
        </div>
        <div style={{ border: `1px solid ${t.accent}`, borderRadius: 10, padding: '9px', textAlign: 'center', fontSize: 12, fontWeight: 500, color: t.accent }}>
          Copy Link
        </div>
      </Card>

      {/* QR preview */}
      <Card t={t}>
        <Lbl text="Your QR Code" t={t} />
        <QRBox />
        <p style={{ textAlign: 'center', fontSize: 12, color: t.textSecondary, margin: 0 }}>Guests will see this in the link</p>
      </Card>
    </>
  )
}

// ─── Screen: 5 — Guest view, no items selected ───────────────────────────────

function Screen5({ t }: { t: T }) {
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <Lbl text="Kongsi Bill" t={t} />
        <p style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary, margin: '0 0 3px', lineHeight: 1.2 }}>Dinner @ Restoran Pelita</p>
        <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>Pilih lah makan apa tadi</p>
      </div>

      <Card t={t}>
        <Lbl text="What did you have?" t={t} />
        {ITEMS.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: i > 0 ? 8 : 0, paddingBottom: 8, borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: t.textSecondary, margin: '0 0 2px', opacity: 0.75 }}>{item.name}</p>
              <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>RM {fmt(item.price)}</p>
            </div>
            <PlusBtn t={t} />
          </div>
        ))}
      </Card>

      {/* Total — empty */}
      <div style={{ background: 'linear-gradient(135deg, #00d094 0%, #0086ff 100%)', borderRadius: 14, padding: 14, marginBottom: 8 }}>
        <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', margin: '0 0 6px' }}>Your total</p>
        <p style={{ fontSize: 34, fontWeight: 800, color: '#fff', margin: '0 0 4px', lineHeight: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8, marginRight: 2 }}>RM</span>0.00
        </p>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Tap items above to see your total</p>
      </div>

      {/* Pay card */}
      <Card t={t}>
        <Lbl text="Pay Ahmad" t={t} />
        <QRBox />
        <p style={{ fontSize: 11, color: t.textSecondary, textAlign: 'center', margin: '0 0 10px' }}>Screenshot this QR and pay via DuitNow · TNG · Any bank</p>
        <GhostBtn label="Save QR to Photos" t={t} />
      </Card>

      <AccentBtn label="Dah bayar 🤙" t={t} />
    </>
  )
}

// ─── Screen: 6 — Guest view, items selected ──────────────────────────────────

function Screen6({ t }: { t: T }) {
  const selected = new Set([0, 2]) // Nasi Goreng + Teh Tarik

  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <Lbl text="Kongsi Bill" t={t} />
        <p style={{ fontSize: 20, fontWeight: 700, color: t.textPrimary, margin: '0 0 3px', lineHeight: 1.2 }}>Dinner @ Restoran Pelita</p>
        <p style={{ fontSize: 12, color: t.textSecondary, margin: 0 }}>Pilih lah makan apa tadi</p>
      </div>

      <Card t={t}>
        <Lbl text="What did you have?" t={t} />
        {ITEMS.map((item, i) => {
          const on = selected.has(i)
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: i > 0 ? 8 : 0, paddingBottom: 8, borderTop: i > 0 ? `1px solid ${t.border}` : 'none' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: on ? t.textPrimary : t.textSecondary, fontWeight: on ? 500 : 400, margin: '0 0 2px', opacity: on ? 1 : 0.75 }}>{item.name}</p>
                <p style={{ fontSize: 11, color: t.textMuted, margin: 0 }}>RM {fmt(item.price)}{on ? ' / portion' : ''}</p>
              </div>
              {on ? <Stepper qty={1} t={t} /> : <PlusBtn t={t} />}
            </div>
          )
        })}
      </Card>

      {/* Total — active */}
      <div style={{ background: 'linear-gradient(135deg, #00d094 0%, #0086ff 100%)', borderRadius: 14, padding: 14, marginBottom: 8 }}>
        <p style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', margin: '0 0 4px' }}>Your total</p>
        <p style={{ fontSize: 34, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.8, marginRight: 2 }}>RM</span>{fmt(gTotal)}
        </p>
        {[
          ['Items subtotal', fmt(gSubtotal)],
          [`Service charge (${SC_RATE}%)`, fmt(gSC)],
          [`SST (${SST_RATE}%)`, fmt(gSST)],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
            <span>{label}</span><span>RM {value}</span>
          </div>
        ))}
      </div>

      {/* Pay card */}
      <Card t={t}>
        <Lbl text="Pay Ahmad" t={t} />
        <QRBox />
        <p style={{ fontSize: 11, color: t.textSecondary, textAlign: 'center', margin: '0 0 10px' }}>Screenshot this QR and pay via DuitNow · TNG · Any bank</p>
        <GhostBtn label="Save QR to Photos" t={t} />
      </Card>

      <AccentBtn label="Dah bayar 🤙" t={t} />
    </>
  )
}

// ─── Screen: 7 — Thank you overlay ───────────────────────────────────────────

function Screen7({ t }: { t: T }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 500, padding: '32px 16px', background: 'rgba(10,10,15,0.96)' }}>
      <p style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#555', margin: '0 0 24px' }}>Terima kasih!</p>
      <div style={{ width: 160, height: 130, background: t === D ? '#1a1a22' : '#111', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 56 }}>🙏</span>
      </div>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', textAlign: 'center', margin: '0 0 6px' }}>T.HANKS! 🙏</p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 0 40px' }}>That&apos;s what legends do.</p>
      <p style={{ fontSize: 11, color: '#555', margin: 0 }}>Tap anywhere to close</p>
    </div>
  )
}

// ─── Layout components ────────────────────────────────────────────────────────

function ScreenPair({ label, step, total, dark: DScreen, light: LScreen }: {
  label: string
  step: number
  total: number
  dark: React.ReactNode
  light: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: '#bbb', marginRight: 8 }}>{step} / {total}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: 1.2, color: '#aaa', margin: '0 0 10px', textTransform: 'uppercase' }}>Dark</p>
          <Phone t={D}>{DScreen}</Phone>
        </div>
        <div>
          <p style={{ fontSize: 10, letterSpacing: 1.2, color: '#aaa', margin: '0 0 10px', textTransform: 'uppercase' }}>Light</p>
          <Phone t={L}>{LScreen}</Phone>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 36, paddingBottom: 20, borderBottom: '1px solid #ddd' }}>
      <p style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#00d094', margin: '0 0 6px' }}>{num}</p>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0a0a0f', margin: '0 0 6px' }}>{title}</h2>
      <p style={{ fontSize: 14, color: '#666', margin: 0 }}>{desc}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata = {
  title: 'UI Flows — Kongsi Bill',
}

export default function FlowsPage() {
  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', background: '#f0f0f2', minHeight: '100vh', padding: '56px 40px' }}>
      {/* Page header */}
      <div style={{ maxWidth: 800, margin: '0 auto 64px' }}>
        <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#999', margin: '0 0 10px' }}>UI Documentation</p>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: '#0a0a0f', margin: '0 0 10px' }}>Kongsi Bill — UI Flows</h1>
        <p style={{ fontSize: 15, color: '#666', margin: '0 0 6px' }}>All screens shown side-by-side in dark mode (system default) and light mode.</p>
        <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>7 screens across 2 flows · Accent: #00d094 · June 2026</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* ── Payer Flow ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 72 }}>
          <SectionHeader
            num="Flow 01"
            title="Payer Flow"
            desc="The person who paid creates a bill, adds items, uploads their QR code, and shares a link."
          />
          <ScreenPair step={1} total={4} label="Empty form"
            dark={<Screen1 t={D} />} light={<Screen1 t={L} />} />
          <ScreenPair step={2} total={4} label="Bill filled with items + summary"
            dark={<Screen2 t={D} />} light={<Screen2 t={L} />} />
          <ScreenPair step={3} total={4} label="Payer info + QR code uploaded"
            dark={<Screen3 t={D} />} light={<Screen3 t={L} />} />
          <ScreenPair step={4} total={4} label="Shareable link generated"
            dark={<Screen4 t={D} />} light={<Screen4 t={L} />} />
        </div>

        {/* ── Guest Flow ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 72 }}>
          <SectionHeader
            num="Flow 02"
            title="Guest Flow"
            desc="Each guest opens the shared link, picks what they ordered, sees their total, and pays via WhatsApp."
          />
          <ScreenPair step={1} total={3} label="View bill — no items selected"
            dark={<Screen5 t={D} />} light={<Screen5 t={L} />} />
          <ScreenPair step={2} total={3} label="Items selected — total active"
            dark={<Screen6 t={D} />} light={<Screen6 t={L} />} />
          <ScreenPair step={3} total={3} label="Thank you overlay — after paying on WhatsApp"
            dark={<Screen7 t={D} />} light={<Screen7 t={L} />} />
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 32, borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>Kongsi Bill · UI Documentation</p>
          <a href="/" style={{ fontSize: 12, color: '#00d094', textDecoration: 'none' }}>← Back to app</a>
        </div>
      </div>
    </div>
  )
}
