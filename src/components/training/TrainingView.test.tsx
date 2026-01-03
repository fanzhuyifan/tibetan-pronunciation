import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createEmptyCard, State } from 'ts-fsrs'
import TrainingView from './TrainingView'
import { useFsrsDeck } from '../../hooks/useFsrsDeck'
import { Consonant, Vowel, Suffix, consonants, vowels, suffixes } from '../../data/tibetanData'
import { createCardId } from '../../utils'
import { KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX } from '../../constants'

// Mocks
window.scrollTo = vi.fn()

const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem: function (key: string) {
            return store[key] || null;
        },
        setItem: function (key: string, value: string) {
            store[key] = value.toString();
        },
        removeItem: function (key: string) {
            delete store[key];
        },
        clear: function () {
            store = {};
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}))

// Subsets for default testing to keep tests stable
const subsetConsonants = consonants.slice(0, 2)
const subsetVowels = vowels.slice(0, 1)
const subsetSuffixes: Suffix[] = []

// Test Wrapper
function TestWrapper({
    consonants: testConsonants = subsetConsonants,
    vowels: testVowels = subsetVowels,
    suffixes: testSuffixes = subsetSuffixes
}: {
    consonants?: Consonant[],
    vowels?: Vowel[],
    suffixes?: Suffix[]
}) {
    const deck = useFsrsDeck(testConsonants, testVowels, testSuffixes)
    return <TrainingView deck={deck} />
}

const tsheg = '་'

type FakeDeckCandidate = {
    id: string;
    card: ReturnType<typeof createEmptyCard>;
    kind: string;
    letter: string;
    reversed: boolean;
}

type FakeSyllable = {
    primary: FakeDeckCandidate;
    consonant?: FakeDeckCandidate;
    vowel?: FakeDeckCandidate;
    suffix?: FakeDeckCandidate;
}

function makeLearningCard(kind: string, letter: string, now: Date): FakeDeckCandidate {
    const card = createEmptyCard()
    card.state = State.Learning
    card.stability = 1
    card.difficulty = 3
    card.reps = 1
    card.lapses = 0
    card.elapsed_days = 0
    card.due = now
    card.last_review = now
    return {
        id: createCardId(kind, letter, false),
        card,
        kind,
        letter,
        reversed: false,
    }
}

function createDeckSequence({ consonant, vowel, suffix, now }: { consonant: string, vowel: string, suffix: string, now: Date }) {
    const base = makeLearningCard(KIND_CONSONANT, consonant, now)
    const v = makeLearningCard(KIND_VOWEL, vowel, now)
    const s = makeLearningCard(KIND_SUFFIX, suffix, now)

    const sequence: FakeSyllable[] = [
        { primary: base, consonant: base },
        { primary: v, consonant: base, vowel: v },
        { primary: s, consonant: base, vowel: v, suffix: s },
    ]

    const stateCards = new Map<string, ReturnType<typeof createEmptyCard>>([
        [base.id, base.card],
        [v.id, v.card],
        [s.id, s.card],
    ])

    let index = 0

    return {
        stateCards,
        get getNextSyllable() {
            return () => sequence[index] ?? null
        },
        rateMany: () => { index += 1 },
        calculateDueDate: () => now,
        exportYaml: () => '',
        importYaml: () => true,
    }
}

describe('TrainingView', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
        localStorage.clear()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('renders the initial review state', async () => {
        render(<TestWrapper />)

        // Should show a prompt (one of the letters)
        // We use a regex to match either letter since order might vary
        expect(screen.getByText(new RegExp(`${subsetConsonants[0].letter}|${subsetConsonants[1].letter}`))).not.toBeNull()

        // Should show "Show answer" button
        expect(screen.getByRole('button', { name: /show answer/i })).not.toBeNull()

        // Should not show rating buttons yet
        expect(screen.queryByText(/Good/i)).toBeNull()
    })

    it('reveals answer when "Show answer" is clicked', async () => {
        render(<TestWrapper />)

        const showAnswerBtn = screen.getByRole('button', { name: /show answer/i })
        fireEvent.click(showAnswerBtn)

        // Should show rating buttons
        expect(screen.getByText(/Good/i)).not.toBeNull()
        expect(screen.getByText(/Again/i)).not.toBeNull()
    })

    it('advances to next card on rating', async () => {
        render(<TestWrapper />)

        // Reveal answer
        fireEvent.click(screen.getByRole('button', { name: /show answer/i }))

        // Click rating (Good)
        const goodBtn = screen.getByText(/Good/i)
        fireEvent.click(goodBtn)

        // Should return to "Show answer" state (indicating new card)
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /show answer/i })).not.toBeNull()
        })
    })

    it('shows "More Training" when no cards are available', async () => {
        // Pass empty arrays to simulate no cards
        render(<TestWrapper consonants={[]} vowels={[]} suffixes={[]} />)

        // Should show "More Training" component content
        // We look for text that appears in the MoreTraining component
        expect(screen.getByText(/No more cards for now/i)).not.toBeNull()
    })

    it('shows component details when clicked and closes on click away', async () => {
        render(<TestWrapper />)

        // Reveal answer
        fireEvent.click(screen.getByRole('button', { name: /show answer/i }))

        // Find the Base component tile
        // The tile has text "Base" and the letter
        const baseTile = screen.getByRole('button', { name: /Base/i })
        fireEvent.click(baseTile)

        // Should show details
        // We can look for "Base pron." which is a label in the detail view
        expect(screen.getByText('Base pron.')).not.toBeNull()

        // The "Base" button should now be the detail view (containing extra info)
        const detailView = screen.getByRole('button', { name: /Base/i })
        expect(detailView.textContent).toContain('Base pron.')

        // Click the detail view to close it
        fireEvent.click(detailView)

        // Should be back to tiles
        // The "Base" button should now be the tile (NOT containing extra info)
        const tile = screen.getByRole('button', { name: /Base/i })
        expect(tile.textContent).not.toContain('Base pron.')
        expect(screen.queryByText('Base pron.')).toBeNull()
    })

    it('learns a syllable with consonant + vowel + suffix and shows details', async () => {
        const c = consonants.find(cn => cn.wylie === 'ka')!
        const v = vowels.find(vw => vw.wylie === 'i')!
        const s = suffixes.find(sx => sx.letter === 'ས')!

        const now = new Date('2024-01-01T12:00:00Z')
        const deck = createDeckSequence({ consonant: c.letter, vowel: v.letter, suffix: s.letter, now })

        render(<TrainingView deck={deck as unknown as ReturnType<typeof useFsrsDeck>} />)

        // 1) Consonant prompt
        await waitFor(() => expect(screen.getByText(c.letter + tsheg)).not.toBeNull())
        fireEvent.click(screen.getByRole('button', { name: /show answer/i }))
        expect(screen.getByText(/Good/i)).not.toBeNull()
        fireEvent.click(screen.getByText(/Good/i))

        // 2) Vowel prompt
        await waitFor(() => {
            const prompt = screen.getByTitle(/Reveal answer/i)
            const text = prompt.textContent || ''
            expect(text).toContain(c.letter)
            expect(text).toContain(v.letter)
        })
        fireEvent.click(screen.getByRole('button', { name: /show answer/i }))
        fireEvent.click(screen.getByText(/Good/i))

        // 3) Suffix prompt and component details
        await waitFor(() => {
            const prompt = screen.getByTitle(/Reveal answer/i)
            const text = prompt.textContent || ''
            expect(text).toContain(c.letter)
            expect(text).toContain(v.letter)
            expect(text).toContain(s.letter)
        })
        fireEvent.click(screen.getByRole('button', { name: /show answer/i }))

        expect(screen.getByText('Base')).not.toBeNull()
        expect(screen.getByText('Vowel')).not.toBeNull()
        expect(screen.getByText('Suffix')).not.toBeNull()

        fireEvent.click(screen.getByRole('button', { name: /Base/i }))
        expect(screen.getByText('Base pron.')).not.toBeNull()

        fireEvent.click(screen.getByText(/Good/i))

        await waitFor(() => expect(screen.getByText(/No more cards for now/i)).not.toBeNull())
    })
})
