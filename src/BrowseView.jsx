import { useMemo } from 'react'
import { State } from 'ts-fsrs'
import { consonants, vowels, suffixes } from './data/tibetanData'
import { formatTime } from './utils'
import './BrowseView.css'

const kindLabels = {
    consonant: 'Consonant',
    vowel: 'Vowel',
    suffix: 'Suffix',
}

const kindOrder = {
    consonant: 0,
    vowel: 1,
    suffix: 2,
}

const stateLabels = {
    [State.New]: 'New',
    [State.Learning]: 'Learning',
    [State.Review]: 'Review',
    [State.Relearning]: 'Relearning',
}

const stateClassNames = {
    [State.New]: 'state-new',
    [State.Learning]: 'state-learning',
    [State.Review]: 'state-review',
    [State.Relearning]: 'state-relearning',
}

const lookupMeta = (kind, letter) => {
    if (!letter) return null
    if (kind === 'consonant') return consonants.find((c) => c.letter === letter) || null
    if (kind === 'vowel') return vowels.find((v) => v.letter === letter) || null
    if (kind === 'suffix') return suffixes.find((s) => s.letter === letter) || null
    return null
}

function BrowseView({ cards }) {
    const rows = useMemo(() => {
        const now = new Date()
        return Array.from(cards?.entries?.() || [])
            .map(([id, card]) => {
                const [kind, letter] = (id || '').split(':')
                const due = card?.due ? new Date(card.due) : null
                const intervalSeconds = due ? Math.max((due - now) / 1000, 0) : 0
                return {
                    id,
                    kind,
                    letter,
                    card,
                    due,
                    intervalSeconds,
                    meta: lookupMeta(kind, letter),
                }
            })
            .sort((a, b) => {
                const kindA = kindOrder[a.kind] ?? 99
                const kindB = kindOrder[b.kind] ?? 99
                if (kindA !== kindB) return kindA - kindB
                return (a.letter || '').localeCompare(b.letter || '')
            })
    }, [cards])

    return (
        <div className="browse-panel">
            <div className="browse-toolbar">
                <div>
                    <div className="browse-title">Browse cards</div>
                    <p className="browse-subtitle">Inspect every consonant, vowel, and suffix.</p>
                </div>
                <div className="browse-count">{rows.length} total</div>
            </div>

            <div className="browse-table">
                <div className="browse-head">
                    <div>Card</div>
                    <div>Status</div>
                    <div>Due</div>
                    <div>Metrics</div>
                </div>

                {rows.map((row) => (
                    <div className="browse-row" key={row.id}>
                        <div className="browse-card">
                            <div className="letter-symbol">{row.letter || '?'}</div>
                            <div className="letter-meta">
                                <div className="letter-kind">{kindLabels[row.kind] || 'Unknown'}</div>
                                {row.meta?.wylie && <div className="letter-wylie">Wylie: {row.meta.wylie}</div>}
                                {row.meta?.pronunciation && (
                                    <div className="letter-pron">Pron.: {row.meta.pronunciation}</div>
                                )}
                            </div>
                        </div>

                        <div className="browse-state">
                            <span className={`state-pill ${stateClassNames[row.card?.state] || ''}`}>
                                {stateLabels[row.card?.state] || 'Unknown'}
                            </span>
                            <div className="state-subtext">
                                Reps {row.card?.reps ?? 0} | Lapses {row.card?.lapses ?? 0}
                            </div>
                        </div>

                        <div className="browse-due">
                            <div className="due-main">{row.due ? row.due.toLocaleString() : 'Not scheduled'}</div>
                            <div className="due-sub">
                                {row.due
                                    ? row.intervalSeconds <= 0
                                        ? 'Due now'
                                        : `Due in ${formatTime(row.intervalSeconds)}`
                                    : '--'}
                            </div>
                        </div>

                        <div className="browse-metrics">
                            <div className="metric">
                                <div className="metric-label">Stability</div>
                                <div className="metric-value">
                                    {row.card?.stability != null ? row.card.stability.toFixed(1) : '--'}
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric-label">Difficulty</div>
                                <div className="metric-value">
                                    {row.card?.difficulty != null ? row.card.difficulty.toFixed(1) : '--'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BrowseView
