import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Rating, State } from 'ts-fsrs'
import { useFsrsDeck } from './useFsrsDeck'

const consonants = [{ letter: 'k' }]
const vowels = [{ letter: 'a' }]
const suffixes = [{ letter: 's' }]
const secondSuffixes = [{ letter: 'z', suffixes: ['s'] }]

const storageKey = 'tibetanFsrsDeck'

const ensureMockStorage = () => {
    if (window.localStorage && typeof window.localStorage.clear === 'function') return

    let store = {}
    const api = {
        getItem: (key) => (key in store ? store[key] : null),
        setItem: (key, value) => {
            store[key] = String(value)
        },
        removeItem: (key) => {
            delete store[key]
        },
        clear: () => {
            store = {}
        },
    }

    Object.defineProperty(window, 'localStorage', {
        value: api,
        configurable: true,
        writable: true,
    })
}

describe('useFsrsDeck', () => {
    beforeEach(() => {
        ensureMockStorage()
        window.localStorage.clear()
        vi.useRealTimers()
    })

    it('initializes a card for each letter kind (forward and reverse)', () => {
        const { result } = renderHook(() => useFsrsDeck(consonants, vowels, suffixes, secondSuffixes))
        expect(result.current.stateCards.size).toBe(8)
    })

    it('returns the next syllable with prioritized consonant', () => {
        const { result } = renderHook(() => useFsrsDeck(consonants, vowels, suffixes, secondSuffixes))
        const next = result.current.getNextSyllable()

        expect(next?.primary?.kind).toBe('consonant')
        expect(next?.primary?.letter).toBe('k')
        expect(next?.consonant?.id).toBe(next?.primary?.id)
    })

    it('rates cards, updates state, and persists deck', () => {
        const { result } = renderHook(() => useFsrsDeck(consonants, vowels, suffixes, secondSuffixes))
        const primary = result.current.getNextSyllable()?.primary
        expect(primary).toBeTruthy()

        act(() => {
            result.current.rateMany([primary.id], Rating.Good)
        })

        const updatedCard = result.current.stateCards.get(primary.id)
        expect(updatedCard.state).not.toBe(State.New)

        const stored = window.localStorage.getItem(storageKey)
        expect(stored).toBeTruthy()
        const parsed = JSON.parse(stored)
        expect(Array.isArray(parsed)).toBe(true)
        expect(parsed.length).toBeGreaterThan(0)
    })
})
