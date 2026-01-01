import { useMemo, useState } from 'react'
import { Card } from 'ts-fsrs'
import { KIND_ORDER } from '../constants'
import { lookupMeta, parseCardId, TibetanData } from '../utils'

export interface BrowseRowData {
    id: string;
    kind: string | null;
    letter: string | null;
    card: Card;
    due: Date | null;
    intervalSeconds: number;
    meta: TibetanData | null;
}

export const useBrowseCards = (cards: Map<string, Card>) => {
    const [kindFilter, setKindFilter] = useState('all')

    const rows = useMemo(() => {
        const now = new Date()
        return Array.from(cards?.entries?.() || [])
            .map(([id, card]) => {
                const { kind, letter } = parseCardId(id)
                const due = card?.due ? new Date(card.due) : null
                const intervalSeconds = due ? Math.max((due.getTime() - now.getTime()) / 1000, 0) : 0
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
                const kindA = KIND_ORDER[a.kind || ''] ?? 99
                const kindB = KIND_ORDER[b.kind || ''] ?? 99
                if (kindA !== kindB) return kindA - kindB
                return (a.letter || '').localeCompare(b.letter || '')
            })
    }, [cards])

    const kindCounts = useMemo(() => {
        const counts: Record<string, number> = { all: rows.length }
        for (const row of rows) {
            const k = row.kind || 'unknown'
            counts[k] = (counts[k] || 0) + 1
        }
        return counts
    }, [rows])

    const filteredRows = useMemo(() => {
        if (kindFilter === 'all') return rows
        return rows.filter((row) => row.kind === kindFilter)
    }, [kindFilter, rows])

    return {
        kindFilter,
        setKindFilter,
        rows,
        filteredRows,
        kindCounts
    }
}
