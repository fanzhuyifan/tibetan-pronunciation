import './Flashcard.css'

function FlashcardPrompt({ card }) {
    return (
        <>
            <div className="syllable-display">{card?.letter || 'No more cards today'}</div>
        </>
    )
}

export default FlashcardPrompt
