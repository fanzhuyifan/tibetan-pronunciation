import { useRef } from 'react'
import { useTrainingSession } from '../../hooks/useTrainingSession'
import Flashcard from './Flashcard'
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
        actions,
    } = useTrainingSession(deck)

    const handleExport = () => {
        try {
            if (!deck?.exportYaml) throw new Error('Deck export unavailable')

            const yaml = deck.exportYaml()
            const blob = new Blob([yaml], { type: 'text/yaml' })
            const url = URL.createObjectURL(blob)

            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = 'tibetan-deck.yaml'
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
                    newCardsToLearn={newCardsToLearn}
                    reviewsDue={trainingStats?.reviewsDue ?? 0}
                    learningCardsDue={trainingStats?.learningCardsDue ?? 0}
                    onChangeNewCards={updateNewCardsToLearn}
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

            <Flashcard
                card={currentCard}
                showAnswer={showAnswer}
                predictedNextDueDates={predictedNextDueDates}
                onRate={actions.rate}
                onReveal={actions.reveal}
            />
        </main>
    )
}

export default TrainingView
