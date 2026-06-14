# Bill Splitter — Requirements

**Version:** v1
**Last updated:** 2026-06-14

---

## What We're Building

A mobile-friendly web app for splitting restaurant bills the Malaysian way. The payer creates a bill and shares a link. Each guest opens the link, taps what they ordered, sees their total (with taxes), and scans the payer's QR code to pay.

---

## Core Flows

### Payer Flow
1. Open the app
2. Enter bill name (e.g. "Dinner @ Pelita")
3. Add items (name + price) — as many as needed
4. Set tax rates:
   - Service charge % (e.g. 10%)
   - SST % (e.g. 8%)
5. Upload QR code screenshot (DuitNow / TNG / bank)
6. Get a shareable link → copy and send via WhatsApp

### Guest Flow (via shared link)
1. Open the link — sees bill name and full item list
2. Tap each item they ordered (toggle on/off)
3. Instantly sees their total:
   - Items subtotal
   - Their share of service charge
   - Their share of SST
   - **Grand total they owe**
4. Sees payer's QR code to scan and pay

---

## Tax Calculation Logic

Taxes apply proportionally to each guest's selected items:
- **Service charge** = guest's subtotal × service charge %
- **SST** = (guest's subtotal + service charge) × SST %
- **Guest total** = subtotal + service charge + SST

**Defaults (payer can override):**
- Service charge: 10%
- SST: 6% (Malaysian Service Tax rate for F&B)

**Shared items:** Multiple guests can independently select the same item. Each guest pays their own portion — items are not exclusive.

---

## Technical Approach

- **Frontend only** — no backend or database needed
- **Shareable link** — bill data (items, tax rates, QR code) encoded into URL as base64
- **Framework** — Next.js (JavaScript)
- **No accounts** — no login required for payer or guest

---

## Design

- **Style:** Revolut Dark
  - Background: near-black (#0a0a0f)
  - Cards: dark (#141419) with subtle border
  - Accent: neon green (#00d094)
  - Typography: clean, bold numbers, high contrast white text
- **Mobile-first** — designed for phone screens, works on desktop too
- **Checkboxes** — neon green when selected, dark when unselected
- **Total card** — green gradient, large bold number

---

## Screens

1. **Create Bill** (payer) — item entry, tax inputs, QR upload, generate link
2. **Split Bill** (guest) — item checklist, live-updating total, QR code

---

## Storage & Cross-checking

**v1: No storage.** Everything lives in the URL. The payer cannot see who selected what or who has paid. Cross-checking is manual — payer relies on bank app payment notifications or asking guests directly.

---

## Out of Scope (v1)

- Payer dashboard showing who has paid
- Real-time updates when guests select items
- Payment integration (TNG/DuitNow API)
- OCR receipt scanning
- Split equally option
- Currency selection
- User accounts

---

## V2 Ideas (noted for later)

- **Payer accounts** — login, store past receipts, view history
- **Receipt history** — payer can revisit old bills ("Pelita dinner June 14")
- **Who's paid dashboard** — real-time view of guest payment status
- Integrated payment via DuitNow/TNG API
- OCR to scan receipt and auto-fill items
- Equal split option alongside custom split
