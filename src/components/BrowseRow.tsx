import { memo, useMemo } from 'react'
import { State } from 'ts-fsrs'
import { formatTime, TibetanData } from '../utils'
import { KIND_LABELS, STATE_LABELS } from '../constants'
import ComponentDetailView from './training/ComponentDetailView'
import { BrowseRowData } from '../hooks/useBrowseCards'

const stateClassNames: Record<number, string> = {
    [State.New]: 'state-new',
    [State.Learning]: 'state-learning',
    [State.Review]: 'state-review',
    [State.Relearning]: 'state-relearning',
}

interface BrowseRowProps {
    row: BrowseRowData;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

const BrowseRowSummary = ({ row, wylie, pronunciation }: { row: BrowseRowData, wylie?: string, pronunciation?: string }) => {
    const { kind, letter, card, reverseCard, due, intervalSeconds, reverseIntervalSeconds } = row
    return (
        <>
            <div className="browse-card">
                <div className="letter-symbol">{letter || '?'}</div>
                <div className="letter-meta">
                    <div className="letter-kind">{KIND_LABELS[kind || ''] || 'Unknown'}</div>
                    {wylie && <div className="letter-wylie">{wylie}</div>}
                    {pronunciation && (
                        <div className="letter-pron">/{pronunciation}/</div>
                    )}
                </div>
            </div>

            <div className="browse-stats-grid">
                <div className="stat-col">
                    <div className="stat-header">Forward</div>
                    <span className={`state-pill ${stateClassNames[card?.state] || ''}`}>
                        {STATE_LABELS[card?.state] || 'New'}
                    </span>
                    <div className="due-sub">
                        {due
                            ? intervalSeconds <= 0
                                ? 'Overdue'
                                : formatTime(intervalSeconds)
                            : '—'}
                    </div>
                </div>
                <div className="stat-col">
                    <div className="stat-header">Reverse</div>
                    {reverseCard ? (
                        <>
                            <span className={`state-pill ${stateClassNames[reverseCard.state] || ''}`}>
                                {STATE_LABELS[reverseCard.state] || 'New'}
                            </span>
                            <div className="due-sub">
                                {reverseCard.due
                                    ? (reverseIntervalSeconds ?? 0) <= 0
                                        ? 'Overdue'
                                        : formatTime(reverseIntervalSeconds ?? 0)
                                    : '—'}
                            </div>
                        </>
                    ) : (
                        <span className="state-pill">N/A</span>
                    )}
                </div>
            </div>
        </>
    )
}

const BrowseRow = memo(({ row, isSelected, onSelect }: BrowseRowProps) => {
    const { id, kind, letter, meta } = row

    const { wylie, pronunciation } = useMemo(() => {
        const m = meta as TibetanData | null
        if (!m) return { wylie: undefined, pronunciation: undefined }
        return {
            wylie: 'wylie' in m ? m.wylie : undefined,
            pronunciation: 'pronunciation' in m ? m.pronunciation : undefined,
        }
    }, [meta])

    return (
        <div
            className={`browse-row ${isSelected ? 'is-selected' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(id)}
        >
            {isSelected ? (
                <div className="browse-detail-container">
                    <ComponentDetailView kind={kind || ''} letter={letter} />
                </div>
            ) : (
                <BrowseRowSummary row={row} wylie={wylie} pronunciation={pronunciation} />
            )}
        </div>
    )
})

export default BrowseRow
