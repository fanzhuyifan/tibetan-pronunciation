import './MoreTraining.css'
import { ChangeEvent } from 'react'

const REVIEW_AHEAD_OPTIONS = [0, 1, 2, 3, 7, 14, 30, 60, 90]

interface MoreTrainingProps {
    newCardsAvailable?: number;
    onChangeReviewAheadDays?: (days: number) => void;
    onChangeNewCards?: (count: number) => void;
}

function MoreTraining({ newCardsAvailable = 0, onChangeReviewAheadDays, onChangeNewCards }: MoreTrainingProps) {
    const handleAheadChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const next = parseInt(event.target.value, 10)
        const safeValue = Number.isFinite(next) && next >= 0 ? next : 0
        if (onChangeReviewAheadDays) onChangeReviewAheadDays(safeValue)
    }

    const handleNewCardsChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const next = parseInt(event.target.value, 10)
        const safeValue = Number.isFinite(next) && next >= 0 ? next : 0
        const cappedValue = Math.min(safeValue, newCardsAvailable)
        if (onChangeNewCards) onChangeNewCards(cappedValue)
    }

    const maxSelectable = Math.min(newCardsAvailable, 30)
    const newCardOptions = Array.from({ length: maxSelectable + 1 }, (_, index) => index)

    return (
        <div className="no-cards-panel">
            <p className="no-cards-text">No more cards for now. Use the following options for additional learning.</p>

            <label className="ahead-control">
                <span>Review ahead: </span>
                <select value={0} onChange={handleAheadChange}>
                    {REVIEW_AHEAD_OPTIONS.map((option) => (
                        <option key={option} value={option}>{`• ${option === 0 ? 'Today only' : `${option} days`}`}</option>
                    ))}
                </select>
            </label>

            {newCardsAvailable > 0 ? (
                <label className="ahead-control">
                    <span>More new cards:</span>
                    <select value={0} onChange={handleNewCardsChange}>
                        {newCardOptions.map((option) => (
                            <option key={option} value={option}>{`• ${option}`}</option>
                        ))}
                    </select>
                </label>
            ) : null}
        </div>
    )
}

export default MoreTraining
