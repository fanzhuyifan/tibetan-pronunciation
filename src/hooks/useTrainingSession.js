import { useCallback, useEffect, useMemo, useState } from 'react'
import { Rating, State } from 'ts-fsrs'
import { storageAvailable } from '../utils'
import { TibetanSyllableFactory } from '../tibetanSyllable'

const HOTKEY_TO_RATING = {
    '1': Rating.Again,
    '2': Rating.Hard,
    '3': Rating.Good,
    '4': Rating.Easy,
}

const STORAGE_KEY_NEW_CARDS = 'tibetanNewCardsToLearn'

const loadNewCardsToLearn = () => {
    const defaultValue = 5
    if (!storageAvailable()) return defaultValue

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY_NEW_CARDS)
        const parsed = raw != null ? parseInt(raw, 10) : defaultValue
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : defaultValue
    } catch (error) {
        console.warn('Failed to load newCardsToLearn from storage', error)
        return defaultValue
    }
}

const buildCurrentSyllable = (factory, parts) => {
    if (!parts?.consonant?.letter) return null
    return factory.fromParts(parts.consonant.letter, {
        vowel: parts.vowel?.letter || '',
        suffix: parts.suffix?.letter || '',
    })
}

export function useTrainingSession(deck) {
    const { stateCards: cards, rateMany, getNextSyllable, calculateDueDate } = deck || {}
    const [showAnswer, setShowAnswer] = useState(false)
    const [newCardsToLearn, setNewCardsToLearn] = useState(() => loadNewCardsToLearn())
    const [reviewAheadDays, setReviewAheadDays] = useState(0)

    const factory = useMemo(() => new TibetanSyllableFactory(), [])

    const dueDateCutOff = useMemo(() => {
        const date = new Date()
        date.setHours(23, 59, 59, 999)
        date.setDate(date.getDate() + reviewAheadDays)
        return date
    }, [reviewAheadDays])

    const dueDatePredicate = useCallback((card) => {
        const dueDate = card.due ? new Date(card.due) : new Date() - 1
        return dueDate && dueDate <= dueDateCutOff
    }, [dueDateCutOff])

    const persistNewCardsToLearn = useCallback((value) => {
        if (!storageAvailable()) return

        try {
            window.localStorage.setItem(STORAGE_KEY_NEW_CARDS, String(value))
        } catch (error) {
            console.warn('Failed to persist newCardsToLearn', error)
        }
    }, [])

    const updateNewCardsToLearn = useCallback((value) => {
        const safeValue = Number.isFinite(value) && value >= 0 ? value : 0
        setNewCardsToLearn(safeValue)
        persistNewCardsToLearn(safeValue)
    }, [persistNewCardsToLearn])

    const updateReviewAheadDays = useCallback((value) => {
        const safeValue = Number.isFinite(value) && value >= 0 ? value : 0
        setReviewAheadDays(safeValue)
    }, [])

    const syllable = useMemo(() => {
        if (newCardsToLearn > 0) {
            return getNextSyllable((candidate) => dueDatePredicate(candidate.card))
        } else {
            return getNextSyllable((candidate) => candidate.card && candidate.card.state !== State.New && dueDatePredicate(candidate.card))
        }
    }, [newCardsToLearn, getNextSyllable, dueDatePredicate])

    const currentCard = buildCurrentSyllable(factory, syllable)

    const handleReveal = useCallback(() => {
        setShowAnswer(true)
    }, [])

    const handleFsrsRating = useCallback(
        (rating) => {
            if (!syllable || !rateMany) return

            const targets = []
            for (const key of Object.keys(syllable)) {
                if (key === 'primary') continue
                const variant = syllable[key]
                if (variant?.card) {
                    targets.push(variant.id)
                }
            }
            if (!targets.length) return

            rateMany(targets, rating)

            if (syllable.primary?.card?.state === State.New) {
                updateNewCardsToLearn((Math.max(newCardsToLearn - 1, 0)))
            }
            setShowAnswer(false)
        },
        [rateMany, syllable, updateNewCardsToLearn, newCardsToLearn],
    )


    // Keyboard shortcuts
    useEffect(() => {
        const handler = (event) => {
            const key = event.key

            if (!showAnswer && (key === ' ' || key === 'Enter')) {
                event.preventDefault()
                handleReveal()
                return
            }

            if (showAnswer) {
                if (key === ' ' || key === 'Enter') {
                    event.preventDefault()
                    handleFsrsRating(Rating.Good)
                    return
                }

                const rating = HOTKEY_TO_RATING[key]
                if (rating) {
                    event.preventDefault()
                    handleFsrsRating(rating)
                }
            }
        }

        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [showAnswer, handleReveal, handleFsrsRating])

    const trainingStats = useMemo(() => {
        const values = cards instanceof Map ? Array.from(cards.values()) : []

        const counts = values.reduce(
            (acc, card) => {
                if (!card || !dueDatePredicate(card)) return acc
                if (card.state === State.Learning) acc.learningCardsDue += 1
                if (card.state === State.Review || card.state === State.Relearning) acc.reviewsDue += 1
                return acc
            },
            { learningCardsDue: 0, reviewsDue: 0 },
        )

        return {
            newCardsToLearn,
            learningCardsDue: counts.learningCardsDue,
            reviewsDue: counts.reviewsDue,
        }
    }, [cards, newCardsToLearn, dueDatePredicate])

    const predictedNextDueDates = useMemo(() => {
        if (!syllable || !syllable.primary?.card) return null
        const card = syllable.primary.card
        const dates = {}
        for (const rating of [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]) {
            const dueDate = calculateDueDate(card, rating)
            dates[rating] = dueDate
        }
        return dates
    }, [syllable, calculateDueDate])

    return {
        currentCard,
        showAnswer,
        updateNewCardsToLearn,
        updateReviewAheadDays,
        trainingStats,
        predictedNextDueDates,
        actions: {
            reveal: handleReveal,
            rate: handleFsrsRating,
        },
    }
}
