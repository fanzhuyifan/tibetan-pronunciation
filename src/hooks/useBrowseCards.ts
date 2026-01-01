import { useMemo, useState } from 'react'
import { Card } from 'ts-fsrs'
import { KIND_ORDER } from '../constants'
import { lookupMeta, parseCardId, TibetanData } from '../utils'

export interface BrowseRowData {
    id: string;
    kind: string | null;
    letter: string | null;
    card: Card;
    reverseCard?: Card;
    due: Date | null;
    intervalSeconds: number;
    reverseIntervalSeconds?: number;
    meta: TibetanData | null;
}

export const useBrowseCards = (cards: Map<string, Card>) => {
    const [kindFilter, setKindFilter] = useState('all')

    const rows = useMemo(() => {
        const now = new Date()
        const getInterval = (card: Card | undefined) => {
            if (!card?.due) return 0
            const due = new Date(card.due)
            return Math.max((due.getTime() - now.getTime()) / 1000, 0)
        }

        const grouped = new Map<string, BrowseRowData>()

        Array.from(cards?.entries?.() || []).forEach(([id, card]) => {
            const { kind, letter, reversed } = parseCardId(id)
            const baseId = `${kind}:${letter}`

            if (!grouped.has(baseId)) {
                grouped.set(baseId, {
                    id: baseId,
                    kind,
                    letter,
                    card: reversed ? (null as unknown as Card) : card, // Placeholder if reverse comes first
                    reverseCard: reversed ? card : undefined,
                    due: null,
                    intervalSeconds: 0,
                    meta: lookupMeta(kind, letter),
                })
            }

            const entry = grouped.get(baseId)!
            if (reversed) {
                entry.reverseCard = card
                entry.reverseIntervalSeconds = getInterval(card)
            } else {
                entry.card = card
                entry.due = card?.due ? new Date(card.due) : null
                entry.intervalSeconds = getInterval(card)
            }
        })

        return Array.from(grouped.values())
            .filter(row => row.card) // Ensure we have the base card
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
