// Flashcard shows a practice syllable and when showAnswer is true, reveals its details.
import './Flashcard.css'

function Flashcard({ card, showAnswer }) {
    const renderComponents = () => {
        if (!card) return '∅'
        const parts = []
        if (card.consonant) parts.push({ label: 'base', value: card.consonant })
        if (card.vowel) parts.push({ label: 'vowel', value: card.vowel })
        if (card.suffix) parts.push({ label: 'suffix', value: card.suffix })
        if (!parts.length) return '∅'

        return parts.map((part, idx) => (
            <span key={`${part.label}-${idx}`} className="component-part">
                <span className="component-label">{part.label}:</span>
                <span className="component-letter">{part.value}</span>
                {idx < parts.length - 1 ? <span className="component-sep">•</span> : null}
            </span>
        ))
    }

    return (
        <>
            <div className="syllable-meta">Current syllable</div>
            <div className="syllable-display">{card?.letter || 'No cards'}</div>

            {showAnswer && card && (
                <div className="answer-block">
                    <div className="answer-line answer-center">
                        <span className="answer-value">
                            {card.pronunciation}
                            {card.wylie ? ` (Wylie: ${card.wylie})` : ''}
                        </span>
                    </div>
                    <div className="answer-line components">
                        <span className="answer-label">Components</span>
                        <span className="answer-value components-value">{renderComponents()}</span>
                    </div>
                    {card.suffixComment && (
                        <div className="answer-line note">
                            <span className="answer-label">Suffix note</span>
                            <span className="answer-value">{card.suffixComment}</span>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default Flashcard
