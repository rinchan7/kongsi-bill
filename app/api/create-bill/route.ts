import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export async function POST(request: Request) {
  const billData = await request.json()
  const shortId = Math.random().toString(36).slice(2, 8)
  const slug = slugify(billData.billName || '')
  const id = slug ? `${slug}-${shortId}` : shortId

  await put(`bills/${id}.json`, JSON.stringify(billData), {
    access: 'public',
    contentType: 'application/json',
  })

  return NextResponse.json({ id })
}
