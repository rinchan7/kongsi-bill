import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { image } = await request.json()

  const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  const blob = await put(`qr-${Date.now()}.jpg`, buffer, {
    access: 'public',
    contentType: 'image/jpeg',
  })

  return NextResponse.json({ url: blob.url })
}
