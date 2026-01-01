import './FlashcardPrompt.css'
import { TibetanSyllable } from '../../tibetanSyllable'

interface FlashcardPromptProps {
    card: TibetanSyllable | null;
    isReverse: boolean;
    onToggleReveal: () => void;
    showAnswer: boolean;
}

function FlashcardPrompt({ card, isReverse, onToggleReveal, showAnswer }: FlashcardPromptProps) {
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
                {isReverse ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '2rem' }}>
                        <div>{card?.pronunciation}</div>
                        {card?.wylie && <div style={{ fontSize: '1.25rem', color: '#64748b', marginTop: '0.5rem' }}>{card.wylie}</div>}
                    </div>
                ) : (
                    card?.letter || 'No cards'
                )}
            </div>
        </>
    )
}

export default FlashcardPrompt
