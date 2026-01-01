import './FlashcardPrompt.css'
import { TibetanSyllable } from '../../tibetanSyllable'

interface FlashcardPromptProps {
    card: TibetanSyllable | null;
    onToggleReveal: () => void;
    showAnswer: boolean;
}

function FlashcardPrompt({ card, onToggleReveal, showAnswer }: FlashcardPromptProps) {
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
