import { memo } from 'react'
import { State } from 'ts-fsrs'
import { formatTime } from '../utils'
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

const BrowseRow = memo(({ row, isSelected, onSelect }: BrowseRowProps) => {
    const { id, kind, letter, card, due, intervalSeconds, meta } = row

    return (
        <div>
            <div
                className={`browse-row ${isSelected ? 'is-selected' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(id)}
            >
                <div className="browse-card">
                    <div className="letter-symbol">{letter || '?'}</div>
                    <div className="letter-meta">
                        <div className="letter-kind">{KIND_LABELS[kind || ''] || 'Unknown'}</div>
                        {(meta as any)?.wylie && <div className="letter-wylie">Wylie: {(meta as any).wylie}</div>}
                        {(meta as any)?.pronunciation && (
                            <div className="letter-pron">Pron.: {(meta as any).pronunciation}</div>
                        )}
                    </div>
                </div>

                <div className="browse-state">
                    <span className={`state-pill ${stateClassNames[card?.state] || ''}`}>
                        {STATE_LABELS[card?.state] || 'Unknown'}
                    </span>
                    <div className="state-subtext">
                        Reps {card?.reps ?? 0} | Lapses {card?.lapses ?? 0}
                    </div>
                </div>

                <div className="browse-due">
                    <div className="due-main">{due ? due.toLocaleString() : 'Not scheduled'}</div>
                    <div className="due-sub">
                        {due
                            ? intervalSeconds <= 0
                                ? 'Overdue'
                                : `in ${formatTime(intervalSeconds)}`
                            : '—'}
                    </div>
                </div>

                <div className="browse-metrics">
                    <div>S: {card?.stability?.toFixed(2) ?? '0.00'}</div>
                    <div>D: {card?.difficulty?.toFixed(2) ?? '0.00'}</div>
                </div>
            </div>

            {isSelected && (
                <div
                    className="browse-detail"
                    onClick={() => onSelect(id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(id)}
                >
                    <ComponentDetailView kind={kind || ''} letter={letter} />
                </div>
            )}
        </div>
    )
})

export default BrowseRow
