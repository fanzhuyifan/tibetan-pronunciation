import './FlashcardAnswer.css'
import RatingControls from './RatingControls'
import ComponentDetail from './ComponentDetail'
import { TibetanSyllable } from '../../tibetanSyllable'
import { Rating } from 'ts-fsrs'

interface FlashcardAnswerProps {
    card: TibetanSyllable | null;
    predictedNextDueDates: Record<number, Date | null> | null;
    onRate: (rating: Rating) => void;
}

function FlashcardAnswer({ card, predictedNextDueDates, onRate }: FlashcardAnswerProps) {
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
