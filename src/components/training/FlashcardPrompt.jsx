import './FlashcardPrompt.css'

function FlashcardPrompt({ card, onToggleReveal, showAnswer }) {
    const handleClick = () => onToggleReveal?.()

    return (
        <>
            <div
                className="syllable-display"
                role="button"
                tabIndex={0}
                onClick={handleClick}
                title={showAnswer ? 'Hide answer' : 'Reveal answer'}
            >
                {card?.letter || 'No cards'}
            </div>
        </>
    )
}

export default FlashcardPrompt
