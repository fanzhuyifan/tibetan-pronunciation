import './Flashcard.css'

// Flashcard composes a prompt (question) and an answer reveal.
import FlashcardAnswer from './FlashcardAnswer'
import FlashcardPrompt from './FlashcardPrompt'

function Flashcard({ card, showAnswer, predictedNextDueDates, onRate, onReveal }) {
    return (
        <>
            <FlashcardPrompt card={card} />
            {showAnswer && card ? (
                <FlashcardAnswer
                    card={card}
                    predictedNextDueDates={predictedNextDueDates}
                    onRate={onRate}
                />
            ) : null}
            {!showAnswer && card && (
                <div className="answer-reveal">
                    <button className="primary" onClick={onReveal} title="Show answer (Space or Enter)">
                        Show answer
                    </button>
                </div>
            )}
        </>
    )
}

export default Flashcard
