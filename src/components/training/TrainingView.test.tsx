import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TrainingView from './TrainingView'
import { useFsrsDeck } from '../../hooks/useFsrsDeck'
import { Consonant, Vowel, Suffix, consonants, vowels, suffixes } from '../../data/tibetanData'

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

async function playCard() {
    fireEvent.click(screen.getByRole('button', { name: /show answer/i }))
    fireEvent.click(screen.getByText(/Good/i))
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /show answer/i })).not.toBeNull()
    })
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
        const c = consonants.find(c => c.wylie === 'ka')!
        const v = vowels.find(v => v.wylie === 'i')!
        const s = suffixes.find(s => s.letter === 'ས')!

        render(<TestWrapper consonants={[c]} vowels={[v]} suffixes={[s]} />)

        const tsheg = '་'

        // 1. Expect Consonant (KA)
        // The syllable logic adds a tsheg
        await waitFor(() => expect(screen.getByText(c.letter + tsheg)).not.toBeNull())

        // Play card (Show Answer -> Good)
        await playCard()

        // 2. Expect Vowel (I)
        // Vowel card shows Consonant + Vowel + tsheg
        // Note: The consonant partner is random, but since we only passed [c], it must be c.
        // The text might be split across elements, so we use a custom matcher or regex
        await waitFor(() => {
            // Look for the vowel letter 'ི' which is combined with the consonant
            // The display might be 'ཀི' (ka + i)
            // Let's just check if the text content of the display contains the expected string
            // The element with role 'button' and title 'Reveal answer' is the flashcard prompt
            const display = screen.getByTitle(/Reveal answer/i)
            // The display text might be split by newlines or other elements, so we check if it contains the letters
            // We expect 'ཀ' and 'ི' and '་'
            // NOTE: The prompt might be showing the REVERSE card (pronunciation -> letter)
            // If it shows "gà" and "ka", it's the reverse card.
            // We want to test the forward card (Letter -> Pronunciation).
            // useFsrsDeck creates both forward and reverse cards.
            // If we get a reverse card, we should just play it and wait for the forward one?
            // Or we can check if it's reverse and expect the pronunciation.

            // Let's check if we see the Tibetan letter. If not, it might be reverse.
            if (!display.textContent?.includes(c.letter)) {
                // It's likely a reverse card showing pronunciation.
                // Just play it.
                return; // Wait for next loop or just fail if we strictly expect forward
            }

            expect(display.textContent).toContain(c.letter)
            expect(display.textContent).toContain(v.letter)
            expect(display.textContent).toContain(tsheg)
        })

        // If we didn't find the Tibetan letter above, we might have just returned.
        // But waitFor will retry until it passes or times out.
        // If we keep getting the reverse card, we are stuck.
        // We need to handle the possibility of reverse cards in the test flow.

        // Let's just play cards until we see the Vowel card with Tibetan script.
        // We can loop a few times.

        let foundVowel = false
        for (let i = 0; i < 5; i++) {
            const display = screen.getByTitle(/Reveal answer/i)
            if (display.textContent?.includes(c.letter) && display.textContent?.includes(v.letter)) {
                foundVowel = true
                break
            }
            await playCard()
        }
        expect(foundVowel).toBe(true)

        // Play the vowel card
        await playCard()

        // 3. Expect Suffix (S)
        // Suffix card shows Consonant + Vowel + Suffix + tsheg
        // Again, partners must be c and v.

        let foundSuffix = false
        for (let i = 0; i < 5; i++) {
            const display = screen.getByTitle(/Reveal answer/i)
            if (display.textContent?.includes(c.letter) && display.textContent?.includes(v.letter) && display.textContent?.includes(s.letter)) {
                foundSuffix = true
                break
            }
            await playCard()
        }
        expect(foundSuffix).toBe(true)

        // Reveal answer to see details
        fireEvent.click(screen.getByRole('button', { name: /show answer/i }))

        // Check for details
        // Should show "Base", "Vowel", "Suffix" labels in the component details
        // The UI uses "Base" for consonant.
        expect(screen.getByText('Base')).not.toBeNull()
        expect(screen.getByText('Vowel')).not.toBeNull()
        expect(screen.getByText('Suffix')).not.toBeNull()

        // Verify Details:
        // Click "Base" -> Check details
        fireEvent.click(screen.getByRole('button', { name: /Base/i }))
        expect(screen.getByText('Base pron.')).not.toBeNull()
        expect(screen.getByText(c.letter)).not.toBeNull()

        // Close Base detail (click it again)
        fireEvent.click(screen.getByRole('button', { name: /Base/i }))

        // Click "Vowel" -> Check details
        fireEvent.click(screen.getByRole('button', { name: /Vowel/i }))
        expect(screen.getByText('Pronunciation')).not.toBeNull()
        expect(screen.getByText(v.letter)).not.toBeNull()

        // Close Vowel detail
        fireEvent.click(screen.getByRole('button', { name: /Vowel/i }))

        // Click "Suffix" -> Check details
        fireEvent.click(screen.getByRole('button', { name: /Suffix/i }))
        expect(screen.getByText(s.letter)).not.toBeNull()
    })
})
