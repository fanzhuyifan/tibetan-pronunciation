import { useState, useCallback } from 'react'
import { Card } from 'ts-fsrs'
import { useBrowseCards } from '../hooks/useBrowseCards'
import BrowseRow from './BrowseRow'
import { BrowseToolbar } from './BrowseToolbar'
import './BrowseView.css'

interface BrowseViewProps {
    cards: Map<string, Card>;
}

function BrowseView({ cards }: BrowseViewProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const { kindFilter, setKindFilter, filteredRows, kindCounts, rows } = useBrowseCards(cards)

    const handleRowSelect = useCallback((id: string) => {
        setSelectedId((prev) => (prev === id ? null : id))
    }, [])

    return (
        <div className="panel">
            <BrowseToolbar
                kindFilter={kindFilter}
                setKindFilter={setKindFilter}
                kindCounts={kindCounts}
                totalCount={rows.length}
                filteredCount={filteredRows.length}
            />

            <div className="browse-table">
                <div className="browse-head">
                    <div>Card</div>
                    <div>Status</div>
                    <div>Due</div>
                    <div>Metrics</div>
                </div>

                {filteredRows.map((row) => (
                    <BrowseRow
                        key={row.id}
                        row={row}
                        isSelected={selectedId === row.id}
                        onSelect={handleRowSelect}
                    />
                ))}
            </div>
        </div>
    )
}

export default BrowseView
