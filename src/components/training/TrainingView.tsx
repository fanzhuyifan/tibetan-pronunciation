import { useMemo } from 'react'
import { State } from 'ts-fsrs'
import { useTrainingSession } from '../../hooks/useTrainingSession'
import { useDeckImportExport } from '../../hooks/useDeckImportExport'
import { FsrsDeckHook } from '../../hooks/useFsrsDeck'
import FlashcardAnswer from './FlashcardAnswer'
import FlashcardPrompt from './FlashcardPrompt'
import MoreTraining from './MoreTraining'
import TrainingBanner from './TrainingBanner'
import './TrainingView.css'

interface TrainingViewProps {
    deck: FsrsDeckHook;
}

function TrainingView({ deck }: TrainingViewProps) {
    const {
        currentCard,
        showAnswer,
        predictedNextDueDates,
        trainingStats,
        newCardsToLearn,
        updateNewCardsToLearn,
        updateReviewAheadDays,
        actions,
    } = useTrainingSession(deck)

    const { fileInputRef, triggerImport, handleExport, handleImportFile } = useDeckImportExport(deck)

    const newCardsAvailable = useMemo(
        () => Array.from(deck.stateCards.values()).filter((card) => card.state === State.New).length,
        [deck],
    )

    return (
        <main className="syllable-panel">
            <div className="training-header">
                <TrainingBanner
                    reviewsDue={trainingStats?.reviewsDue ?? 0}
                    learningCardsDue={trainingStats?.learningCardsDue ?? 0}
                    newCardsToLearn={Math.min(newCardsToLearn, newCardsAvailable)}
                    onImportClick={triggerImport}
                    onExportClick={handleExport}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".yaml,.yml,text/yaml,text/x-yaml"
                    onChange={handleImportFile}
                    style={{ display: 'none' }}
                />
            </div>

            {currentCard ? (
                <>
                    <FlashcardPrompt
                        card={currentCard}
                        onToggleReveal={actions.toggleReveal}
                        showAnswer={showAnswer}
                    />
                    {showAnswer ? (
                        <FlashcardAnswer
                            card={currentCard}
                            predictedNextDueDates={predictedNextDueDates}
                            onRate={actions.rate}
                        />
                    ) : (
                        <div className="answer-reveal">
                            <button className="btn primary" onClick={actions.toggleReveal} title="Show answer (Space or Enter)">
                                Show answer
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <MoreTraining
                    newCardsAvailable={newCardsAvailable}
                    onChangeReviewAheadDays={updateReviewAheadDays}
                    onChangeNewCards={updateNewCardsToLearn}
                />
            )}
        </main>
    )
}

export default TrainingView
