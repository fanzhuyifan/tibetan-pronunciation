import { memo } from 'react'
import { State } from 'ts-fsrs'
import { formatTime } from '../utils'
import { KIND_LABELS, STATE_LABELS } from '../constants'
import ComponentDetailView from './training/ComponentDetailView'

const stateClassNames = {
    [State.New]: 'state-new',
    [State.Learning]: 'state-learning',
    [State.Review]: 'state-review',
    [State.Relearning]: 'state-relearning',
}

const BrowseRow = memo(({ row, isSelected, onSelect }) => {
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
                        <div className="letter-kind">{KIND_LABELS[kind] || 'Unknown'}</div>
                        {meta?.wylie && <div className="letter-wylie">Wylie: {meta.wylie}</div>}
                        {meta?.pronunciation && (
                            <div className="letter-pron">Pron.: {meta.pronunciation}</div>
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
                                ? 'Due now'
                                : `Due in ${formatTime(intervalSeconds)}`
                            : '--'}
                    </div>
                </div>

                <div className="browse-metrics">
                    <div className="metric">
                        <div className="metric-label">Stability</div>
                        <div className="metric-value">
                            {card?.stability != null ? card.stability.toFixed(1) : '--'}
                        </div>
                    </div>
                    <div className="metric">
                        <div className="metric-label">Difficulty</div>
                        <div className="metric-value">
                            {card?.difficulty != null ? card.difficulty.toFixed(1) : '--'}
                        </div>
                    </div>
                </div>
            </div>

            {isSelected && (
                <div className="browse-row-detail" onClick={() => onSelect(null)}>
                    <ComponentDetailView kind={kind} letter={letter} />
                </div>
            )}
        </div>
    )
})

BrowseRow.displayName = 'BrowseRow'

export default BrowseRow
