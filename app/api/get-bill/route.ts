import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const { blobs } = await list({ prefix: `bills/${id}` })

  if (blobs.length === 0) {
    return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
  }

  const res = await fetch(blobs[0].url, { cache: 'no-store' })
  const data = await res.json()

  return NextResponse.json(data)
}
