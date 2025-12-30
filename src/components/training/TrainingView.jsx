import { useTrainingSession } from '../../hooks/useTrainingSession'
import Flashcard from './Flashcard'
import RatingControls from './RatingControls'
import TrainingBanner from './TrainingBanner'
import './TrainingView.css'

function TrainingView({ deck }) {
    const {
        currentCard,
        showAnswer,
        predictedNextDueDates,
        trainingStats,
        newCardsToLearn,
        updateNewCardsToLearn,
        actions,
    } = useTrainingSession(deck)

    return (
        <main className="syllable-panel">
            <TrainingBanner
                newCardsToLearn={newCardsToLearn}
                reviewsDue={trainingStats?.reviewsDue ?? 0}
                learningCardsDue={trainingStats?.learningCardsDue ?? 0}
                onChangeNewCards={updateNewCardsToLearn}
            />

            <Flashcard card={currentCard} showAnswer={showAnswer} />

            {currentCard && (
                <RatingControls
                    showAnswer={showAnswer}
                    predictedNextDueDates={predictedNextDueDates}
                    onReveal={actions.reveal}
                    onRate={actions.rate}
                />
            )}
        </main>
    )
}

export default TrainingView
