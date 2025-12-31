import './Flashcard.css'
import RatingControls from './RatingControls'
import ComponentDetail from './ComponentDetail'

function FlashcardAnswer({ card, predictedNextDueDates, onRate }) {
    if (!card) return null

    return (
        <div className="answer-block">
            <div className="answer-line answer-center">
                <span className="answer-value">
                    {card.pronunciation}
                    {card.wylie ? ` (Wylie: ${card.wylie})` : ''}
                </span>
            </div>
            <div className="answer-ratings">
                <RatingControls showAnswer predictedNextDueDates={predictedNextDueDates} onRate={onRate} />
            </div>
            <div className="answer-line components">
                <ComponentDetail card={card} />
            </div>
        </div>
    )
}

export default FlashcardAnswer
