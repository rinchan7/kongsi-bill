import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const billData = await request.json()
  const id = Math.random().toString(36).slice(2, 8)

  await put(`bills/${id}.json`, JSON.stringify(billData), {
    access: 'public',
    contentType: 'application/json',
  })

  return NextResponse.json({ id })
}
