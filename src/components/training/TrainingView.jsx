import { useRef, useMemo } from 'react'
import { State } from 'ts-fsrs'
import { useTrainingSession } from '../../hooks/useTrainingSession'
import FlashcardAnswer from './FlashcardAnswer'
import FlashcardPrompt from './FlashcardPrompt'
import MoreTraining from './MoreTraining'
import TrainingBanner from './TrainingBanner'
import './TrainingView.css'

function TrainingView({ deck }) {
    const fileInputRef = useRef(null)

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

    const newCardsAvailable = useMemo(
        () => Array.from(deck?.stateCards?.values() ?? []).filter((card) => card.state === State.New).length,
        [deck],
    )

    const handleExport = () => {
        try {
            if (!deck?.exportYaml) throw new Error('Deck export unavailable')

            const yaml = deck.exportYaml()
            const blob = new Blob([yaml], { type: 'text/yaml' })
            const url = URL.createObjectURL(blob)

            const anchor = document.createElement('a')
            anchor.href = url
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            anchor.download = `tibetan-pronunciation-progress-${timestamp}.yaml`
            anchor.click()

            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Failed to export deck', error)
            window.alert('Unable to export deck. Please try again.')
        }
    }

    const handleImportFile = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const text = await file.text()
            const ok = deck?.importYaml?.(text)
            if (!ok) throw new Error('Deck import returned false')
        } catch (error) {
            console.error('Failed to import deck', error)
            window.alert('Unable to import deck. Please verify the YAML file and try again.')
        } finally {
            event.target.value = ''
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <main className="syllable-panel">
            <div className="training-header">
                <TrainingBanner
                    reviewsDue={trainingStats?.reviewsDue ?? 0}
                    learningCardsDue={trainingStats?.learningCardsDue ?? 0}
                    newCardsToLearn={Math.min(newCardsToLearn, newCardsAvailable)}
                    onImportClick={handleImportClick}
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
                                <button className="primary" onClick={actions.toggleReveal} title="Show answer (Space or Enter)">
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
