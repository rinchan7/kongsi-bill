import { put, list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { rating, comment, billName } = await request.json()

  if (!rating) {
    return NextResponse.json({ error: 'Rating is required' }, { status: 400 })
  }

  const data = {
    rating,
    comment: comment?.trim() || null,
    billName: billName?.trim() || null,
    submittedAt: new Date().toISOString(),
  }

  await put(
    `feedback/${Date.now()}-${Math.random().toString(36).slice(2)}.json`,
    JSON.stringify(data),
    { access: 'public', contentType: 'application/json' }
  )

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const { blobs } = await list({ prefix: 'feedback/' })

  const items = await Promise.all(
    blobs.map(async (blob) => {
      const res = await fetch(blob.url, { cache: 'no-store' })
      return res.json()
    })
  )

  items.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  return NextResponse.json(items)
}
