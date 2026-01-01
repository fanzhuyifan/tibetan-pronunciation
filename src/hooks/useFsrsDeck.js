import { useCallback, useMemo, useState } from 'react'
import { createEmptyCard, fsrs, generatorParameters } from 'ts-fsrs'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { consonants as defaultConsonants, vowels as defaultVowels, suffixes as defaultSuffixes } from '../data/tibetanData'
import { storageAvailable, createCardId, parseCardId } from '../utils'
import { KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX, KIND_ORDER } from '../constants'


const STORAGE_KEY = 'tibetanFsrsDeck'

/**
 * Prepare a card for storage by converting date-like fields to ISO strings.
 */
const serializeCard = (card) => {
    const copy = { ...card }
    if (copy.due instanceof Date) copy.due = copy.due.toISOString()
    if (copy.last_review instanceof Date) copy.last_review = copy.last_review.toISOString()
    return copy
}

/**
 * Convert a Map of cards into a flat, serializable array that also includes
 * the derived letter/kind metadata for easier hydration.
 */
const serializeDeck = (cards) => Array.from(cards.entries()).map(([id, card]) => {
    const { kind, letter } = parseCardId(id)
    return {
        id,
        letter,
        card: serializeCard(card),
        kind,
    }
})

/**
 * Convert persisted card-like data back into Date-aware objects.
 */
const hydrateCard = (card) => {
    if (!card) return card
    const hydrated = { ...card }
    if (hydrated.due) hydrated.due = new Date(hydrated.due)
    if (hydrated.last_review) hydrated.last_review = new Date(hydrated.last_review)
    return hydrated
}


/**
 * Ensure the deck contains entries for all letters we know about, reusing any
 * existing cards so scheduled intervals are preserved.
 */
const ensureDeck = (consonants, vowels, suffixes, existingCards) => {
    const cards = new Map()

    const addLetters = (items = [], kind) => {
        items.forEach((item) => {
            const letter = item?.letter
            if (!letter) return
            const id = createCardId(kind, letter)
            cards.set(id, existingCards.get(id) || createEmptyCard())
        })
    }

    addLetters(consonants, KIND_CONSONANT)
    addLetters(vowels, KIND_VOWEL)
    addLetters(suffixes, KIND_SUFFIX)

    return cards
}

const loadDeck = (consonants, vowels, suffixes) => {
    if (!storageAvailable()) {
        return ensureDeck(consonants, vowels, suffixes, new Map())
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        if (!Array.isArray(parsed)) throw new Error('Invalid deck payload')

        const cardEntries = parsed
            .map(({ id, card }) => {
                if (!id || !card) return null
                return [id, hydrateCard(card)]
            })
            .filter(Boolean)

        return ensureDeck(
            consonants,
            vowels,
            suffixes,
            new Map(cardEntries),
        )
    } catch (error) {
        console.warn('Failed to load FSRS deck, rebuilding', error)
        return ensureDeck(consonants, vowels, suffixes, new Map())
    }
}

/**
 * React hook that manages an FSRS deck for Tibetan syllable practice.
 * - Seeds missing letters so new users start with a full deck.
 * - Persists progress to localStorage when available.
 * - Exposes helpers to rate cards and fetch the next syllable combination.
 */
export function useFsrsDeck(consonants = defaultConsonants, vowels = defaultVowels, suffixes = defaultSuffixes) {
    const scheduler = useMemo(
        () => fsrs(generatorParameters()),
        [],
    )
    const cards = loadDeck(consonants, vowels, suffixes)
    const [stateCards, setStateCards] = useState(cards)

    const persistDeck = useCallback((value) => {
        if (!storageAvailable() || !value) return
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeDeck(value)))
        } catch (error) {
            console.warn('Failed to persist FSRS deck', error)
        }
    }, [])

    const getNextCard = useCallback(({ predicate = null } = {}) => {
        let best = null

        stateCards.forEach((card, id) => {
            const { kind, letter } = parseCardId(id)
            const candidate = { id, card, kind, letter }

            if (predicate && !predicate(candidate)) return

            const dueTime = card?.due ? new Date(card.due).getTime() : Number.POSITIVE_INFINITY
            if (!best) {
                best = candidate
                best.dueTime = dueTime
                return
            }

            const bestPriority = KIND_ORDER[best.kind] ?? 99
            const thisPriority = KIND_ORDER[kind] ?? 99
            const bestDue = best.dueTime ?? (best.card?.due ? new Date(best.card.due).getTime() : Number.POSITIVE_INFINITY)

            if (thisPriority < bestPriority || (thisPriority === bestPriority && dueTime < bestDue)) {
                best = { ...candidate, dueTime }
            }
        })

        return best
    }, [stateCards])

    function rateMany(ids, rating, now = new Date()) {
        const nextCards = new Map(stateCards)
        ids.forEach((id) => {
            const card = stateCards.get(id)
            if (!card) return
            const result = scheduler.next(card, now, rating)
            nextCards.set(id, result.card)
        })
        persistDeck(nextCards)
        setStateCards(nextCards)
    }

    /**
     * Predict the next due date for a given card if it receives the provided
     * rating. Does not mutate the original card.
     */
    function calculateDueDate(card, rating, now = new Date()) {
        if (!card) return null

        const hydratedCard = {
            ...card,
            due: card?.due ? new Date(card.due) : undefined,
            last_review: card?.last_review ? new Date(card.last_review) : undefined,
        }

        const result = scheduler.next(hydratedCard, now, rating)
        return result?.card?.due ?? null
    }

    const exportYaml = useCallback(() => {
        const payload = {
            version: 1,
            cards: Array.from(stateCards.entries()).map(([id, card]) => ({
                id,
                card: serializeCard(card),
            })),
        }
        return stringifyYaml(payload)
    }, [stateCards])

    const importYaml = useCallback((yamlText) => {
        if (!yamlText) return false

        try {
            const parsed = parseYaml(yamlText)
            const rows = Array.isArray(parsed?.cards) ? parsed.cards : (Array.isArray(parsed) ? parsed : [])
            const nextCards = new Map()

            rows.forEach((row) => {
                const { id, card } = row || {}
                if (!id || !card) return
                nextCards.set(id, hydrateCard(card))
            })

            const ensured = ensureDeck(consonants, vowels, suffixes, nextCards)
            persistDeck(ensured)
            setStateCards(ensured)
            return true
        } catch (error) {
            console.warn('Failed to import FSRS deck from YAML', error)
            return false
        }
    }, [consonants, vowels, suffixes, persistDeck])

    /**
     * Retrieve the next syllable to drill, returning the primary card and any
     * companion cards needed to form a valid syllable (consonant/vowel/suffix).
     */
    function getNextSyllable(predicate = null) {
        const nextCard = getNextCard({ predicate })
        if (!nextCard) return null
        const { kind } = nextCard

        const partner = (targetKind) => {
            const candidates = []
            stateCards.forEach((card, id) => {
                const { kind: k, letter } = parseCardId(id)
                if (k === targetKind) {
                    candidates.push({ id, card, kind: k, letter })
                }
            })
            if (candidates.length === 0) return null
            if (targetKind === KIND_VOWEL) {
                candidates.push(null) // allow no vowel (a)
            }
            return candidates[Math.floor(Math.random() * candidates.length)]
        }

        switch (kind) {
            case KIND_CONSONANT:
                return { primary: nextCard, consonant: nextCard }
            case KIND_VOWEL:
                return {
                    primary: nextCard,
                    vowel: nextCard,
                    consonant: partner(KIND_CONSONANT),
                }
            case KIND_SUFFIX:
                return {
                    primary: nextCard,
                    suffix: nextCard,
                    consonant: partner(KIND_CONSONANT),
                    vowel: partner(KIND_VOWEL),
                }
            default:
                return null
        }
    }

    return {
        stateCards,
        rateMany,
        getNextSyllable,
        calculateDueDate,
        exportYaml,
        importYaml,
    }
}
