import { useCallback, useMemo, useState } from 'react'
import { createEmptyCard, fsrs, generatorParameters, Card, Rating } from 'ts-fsrs'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { consonants as defaultConsonants, vowels as defaultVowels, suffixes as defaultSuffixes, Consonant, Vowel, Suffix } from '../data/tibetanData'
import { storageAvailable, createCardId, parseCardId } from '../utils'
import { KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX, KIND_ORDER } from '../constants'

const STORAGE_KEY = 'tibetanFsrsDeck'

interface SerializedCard extends Omit<Card, 'due' | 'last_review'> {
    due: string;
    last_review?: string;
}

interface SerializedDeckItem {
    id: string;
    letter: string | null;
    card: SerializedCard;
    kind: string | null;
}

const serializeCard = (card: Card): SerializedCard => {
    const copy: any = { ...card }
    if (copy.due instanceof Date) copy.due = copy.due.toISOString()
    if (copy.last_review instanceof Date) copy.last_review = copy.last_review.toISOString()
    return copy as SerializedCard
}

const serializeDeck = (cards: Map<string, Card>): SerializedDeckItem[] => Array.from(cards.entries()).map(([id, card]) => {
    const { kind, letter } = parseCardId(id)
    return {
        id,
        letter,
        card: serializeCard(card),
        kind,
    }
})

const hydrateCard = (card: SerializedCard): Card => {
    if (!card) return card as any
    const hydrated: any = { ...card }
    if (hydrated.due) hydrated.due = new Date(hydrated.due)
    if (hydrated.last_review) hydrated.last_review = new Date(hydrated.last_review)
    return hydrated as Card
}

const ensureDeck = (consonants: Consonant[], vowels: Vowel[], suffixes: Suffix[], existingCards: Map<string, Card>): Map<string, Card> => {
    const cards = new Map<string, Card>()

    const addLetters = (items: { letter: string }[] = [], kind: string) => {
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

const loadDeck = (consonants: Consonant[], vowels: Vowel[], suffixes: Suffix[]): Map<string, Card> => {
    if (!storageAvailable()) {
        return ensureDeck(consonants, vowels, suffixes, new Map())
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        if (!Array.isArray(parsed)) throw new Error('Invalid deck payload')

        const cardEntries = parsed
            .map(({ id, card }: { id: string, card: SerializedCard }) => {
                if (!id || !card) return null
                return [id, hydrateCard(card)] as [string, Card]
            })
            .filter((entry): entry is [string, Card] => Boolean(entry))

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

export interface DeckCandidate {
    id: string;
    card: Card;
    kind: string | null;
    letter: string | null;
    dueTime?: number;
}

export function useFsrsDeck(consonants: Consonant[] = defaultConsonants, vowels: Vowel[] = defaultVowels, suffixes: Suffix[] = defaultSuffixes) {
    const scheduler = useMemo(
        () => fsrs(generatorParameters()),
        [],
    )
    const cards = loadDeck(consonants, vowels, suffixes)
    const [stateCards, setStateCards] = useState<Map<string, Card>>(cards)

    const persistDeck = useCallback((value: Map<string, Card>) => {
        if (!storageAvailable() || !value) return
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeDeck(value)))
        } catch (error) {
            console.warn('Failed to persist FSRS deck', error)
        }
    }, [])

    const getNextCard = useCallback(({ predicate = null }: { predicate?: ((c: DeckCandidate) => boolean) | null } = {}): DeckCandidate | null => {
        let best: DeckCandidate | null = null

        stateCards.forEach((card, id) => {
            const { kind, letter } = parseCardId(id)
            const candidate: DeckCandidate = { id, card, kind, letter }

            if (predicate && !predicate(candidate)) return

            const dueTime = card?.due ? new Date(card.due).getTime() : Number.POSITIVE_INFINITY
            if (!best) {
                best = candidate
                best.dueTime = dueTime
                return
            }

            const bestPriority = KIND_ORDER[best.kind || ''] ?? 99
            const thisPriority = KIND_ORDER[kind || ''] ?? 99
            const bestDue = best.dueTime ?? (best.card?.due ? new Date(best.card.due).getTime() : Number.POSITIVE_INFINITY)

            if (thisPriority < bestPriority || (thisPriority === bestPriority && dueTime < bestDue)) {
                best = { ...candidate, dueTime }
            }
        })

        return best
    }, [stateCards])

    function rateMany(ids: string[], rating: Rating, now: Date = new Date()) {
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

    function calculateDueDate(card: Card | undefined, rating: Rating, now: Date = new Date()): Date | null {
        if (!card) return null

        const hydratedCard = {
            ...card,
            due: card?.due ? new Date(card.due) : new Date(),
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

    const importYaml = useCallback((yamlText: string) => {
        if (!yamlText) return false

        try {
            const parsed = parseYaml(yamlText)
            const rows = Array.isArray(parsed?.cards) ? parsed.cards : (Array.isArray(parsed) ? parsed : [])
            const nextCards = new Map<string, Card>()

            rows.forEach((row: any) => {
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

    function getNextSyllable(predicate: ((c: DeckCandidate) => boolean) | null = null) {
        const nextCard = getNextCard({ predicate })
        if (!nextCard) return null
        const { kind } = nextCard

        const partner = (targetKind: string): DeckCandidate | null => {
            const candidates: DeckCandidate[] = []
            stateCards.forEach((card, id) => {
                const { kind: k, letter } = parseCardId(id)
                if (k === targetKind) {
                    candidates.push({ id, card, kind: k, letter })
                }
            })
            if (candidates.length === 0) return null
            if (targetKind === KIND_VOWEL) {
                const randomIndex = Math.floor(Math.random() * (candidates.length + 1))
                if (randomIndex === candidates.length) return null
                return candidates[randomIndex]
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
