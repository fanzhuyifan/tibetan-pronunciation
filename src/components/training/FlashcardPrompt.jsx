import './FlashcardPrompt.css'

function FlashcardPrompt({ card }) {
    return (
        <>
            <div className="syllable-display">
                {card?.letter || 'No cards'}
            </div>
        </>
    )
}

export default FlashcardPrompt
