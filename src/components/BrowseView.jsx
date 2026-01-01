import { useState, useCallback } from 'react'
import { useBrowseCards } from '../hooks/useBrowseCards'
import BrowseRow from './BrowseRow'
import { BrowseToolbar } from './BrowseToolbar'
import './BrowseView.css'

function BrowseView({ cards }) {
    const [selectedId, setSelectedId] = useState(null)
    const { kindFilter, setKindFilter, filteredRows, kindCounts, rows } = useBrowseCards(cards)

    const handleRowSelect = useCallback((id) => {
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

