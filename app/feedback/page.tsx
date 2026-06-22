import { list } from '@vercel/blob'

interface FeedbackItem {
  rating: string
  comment: string | null
  billName: string | null
  submittedAt: string
}

async function getFeedback(): Promise<FeedbackItem[]> {
  try {
    const { blobs } = await list({ prefix: 'feedback/' })
    const items = await Promise.all(
      blobs.map(async (blob) => {
        const res = await fetch(blob.url, { cache: 'no-store' })
        return res.json() as Promise<FeedbackItem>
      })
    )
    return items.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
  } catch {
    return []
  }
}

function ratingLabel(r: string) {
  if (r === '😕') return 'Needs work'
  if (r === '😊') return 'Good'
  if (r === '🤩') return 'Love it'
  return r
}

function ratingColor(r: string) {
  if (r === '😕') return '#ef4444'
  if (r === '😊') return '#f59e0b'
  if (r === '🤩') return '#00d094'
  return '#888'
}

export const metadata = { title: 'Feedback — Kongsi Bill' }
export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  const items = await getFeedback()

  const counts = { '😕': 0, '😊': 0, '🤩': 0 }
  items.forEach(i => { if (i.rating in counts) counts[i.rating as keyof typeof counts]++ })

  return (
    <main className="min-h-screen bg-bg py-10 px-4">
      <div className="mx-auto max-w-[640px]">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[2px] uppercase text-text-muted mb-1">Kongsi Bill</p>
          <h1 className="text-[28px] font-bold text-text-primary">Feedback</h1>
          <p className="text-text-secondary text-[14px] mt-1">
            {items.length} submission{items.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Summary cards */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {(['😕', '😊', '🤩'] as const).map(emoji => (
              <div key={emoji} className="bg-surface border border-border rounded-2xl p-4 text-center">
                <p className="text-[28px] mb-1">{emoji}</p>
                <p className="text-[22px] font-bold text-text-primary">{counts[emoji]}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{ratingLabel(emoji)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Submissions */}
        {items.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-10 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-text-primary font-semibold text-[16px]">No feedback yet</p>
            <p className="text-text-secondary text-[14px] mt-2">
              Submissions will appear here after guests rate their experience.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[22px]">{item.rating}</span>
                    <span
                      className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: ratingColor(item.rating), background: ratingColor(item.rating) + '20' }}
                    >
                      {ratingLabel(item.rating)}
                    </span>
                  </div>
                  <p className="text-text-muted text-[11px]">
                    {new Date(item.submittedAt).toLocaleString('en-MY', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>

                {item.comment && (
                  <p className="text-text-primary text-[14px] mt-2 leading-relaxed">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                )}

                {item.billName && (
                  <p className="text-text-muted text-[12px] mt-2">
                    Bill: {item.billName}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-text-muted text-[12px] mt-10 pb-4">
          <a href="/" className="hover:text-accent transition-colors">← Back to app</a>
        </p>
      </div>
    </main>
  )
}
