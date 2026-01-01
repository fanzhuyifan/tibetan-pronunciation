import { Rating } from 'ts-fsrs'
import { formatTime } from '../../utils'
import './RatingControls.css'

const ratingButtons = [
    { label: 'Again', rating: Rating.Again, hotkey: '1' },
    { label: 'Hard', rating: Rating.Hard, hotkey: '2' },
    { label: 'Good', rating: Rating.Good, hotkey: '3' },
    { label: 'Easy', rating: Rating.Easy, hotkey: '4' },
]

interface RatingControlsProps {
    showAnswer: boolean;
    predictedNextDueDates: Record<number, Date | null> | null;
    onToggleReveal?: () => void;
    onRate: (rating: Rating) => void;
}

function RatingControls({ showAnswer, predictedNextDueDates, onToggleReveal, onRate }: RatingControlsProps) {

    if (!showAnswer) {
        return (
            <footer className="actions">
                <button className="btn primary" onClick={onToggleReveal} title="Show answer (Space or Enter)">
                    Show answer
                </button>
            </footer>
        )
    }


    return (
        <div className="fsrs-actions">
            {ratingButtons.map((btn) => {
                const due = predictedNextDueDates?.[btn.rating]
                const interval = due ? (new Date(due).getTime() - new Date().getTime()) / 1000 : 0
                const timeLabel = due ? formatTime(interval) : '-'

                return (
                    <button
                        key={btn.rating}
                        className="btn secondary rating-btn"
                        onClick={() => onRate(btn.rating)}
                    >
                        <div className="rating-label">
                            {btn.label} ({btn.hotkey})
                        </div>
                        <div className="rating-time">{timeLabel}</div>
                    </button>
                )
            })}
        </div>
    )
}

export default RatingControls
