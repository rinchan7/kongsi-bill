import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { file } = await request.json()

  const match = file.match(/^data:([^;]+);base64,/)
  const contentType = match?.[1] ?? 'image/jpeg'
  const base64Data = file.replace(/^data:[^;]+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')
  const ext = contentType === 'application/pdf' ? 'pdf' : 'jpg'

  const blob = await put(`receipt-${Date.now()}.${ext}`, buffer, {
    access: 'public',
    contentType,
  })

  return NextResponse.json({ url: blob.url })
}
