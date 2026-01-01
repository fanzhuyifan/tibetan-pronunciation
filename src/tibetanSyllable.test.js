import { describe, it, expect, beforeEach } from 'vitest'
import {
    TibetanSyllableFactory,
    applyToneToPronunciation,
    combinePronunciation,
    appendSuffixPronunciation,
} from './tibetanSyllable'

const DATA_VOWELS = [
    ['ི', 'i'],
    ['ུ', 'u'],
    ['ེ', 'e'],
    ['ོ', 'o'],
]

describe('tibetanSyllable helpers', () => {
    it('applyToneToPronunciation inserts tone after first vowel', () => {
        expect(applyToneToPronunciation('gu', '◌̅')).toBe('gu\u0305')
        expect(applyToneToPronunciation('nga', '◌̀')).toBe('nga\u0300')
    })

    it('combinePronunciation replaces inherent a and appends when needed', () => {
        expect(combinePronunciation('ga', 'o')).toBe('go')
        expect(combinePronunciation('ga', 'a')).toBe('ga')
        expect(combinePronunciation('g', 'ü')).toBe('gü')
    })



    it('appendSuffixPronunciation prefers pronunciation and suffix fields', () => {
        expect(appendSuffixPronunciation('ga', { pronunciation: 'x' })).toBe('gax')
        expect(appendSuffixPronunciation('ga', { suffix: 'm' })).toBe('gam')
    })
})

describe('TibetanSyllableFactory', () => {
    let factory

    beforeEach(() => {
        factory = new TibetanSyllableFactory()
    })

    const assertRoundtrip = ({
        base,
        vowelLetter = '',
        expectedWylie,
        expectedPron,
        wylieInput = null,
        suffixLetter = '',
        skipFromTibetan = false,
    }) => {
        const expectedLetter = `${base}${vowelLetter}${suffixLetter}་`
        const wylieIn = wylieInput || expectedWylie

        const syllables = [
            factory.fromParts(base, { vowel: vowelLetter, suffix: suffixLetter }),
            factory.fromWylie(wylieIn),
        ]

        if (!skipFromTibetan) {
            syllables.push(factory.fromTibetan(expectedLetter))
        }

        for (const syl of syllables) {
            expect(syl.letter).toBe(expectedLetter)
            expect(syl.wylie).toBe(expectedWylie)
            expect(syl.pronunciation).toBe(expectedPron)
        }
    }

    it('basic roundtrip with i', () => {
        assertRoundtrip({
            base: 'ཀ',
            vowelLetter: 'ི',
            expectedWylie: 'ki',
            expectedPron: 'gi\u0300',
        })
        expect(factory.fromTibetan('ཀི').wylie.endsWith('i')).toBe(true)
    })

    it('tone on base only', () => {
        const syl = factory.fromParts('ག')
        expect(syl.pronunciation).toBe('ka\u0301')
    })

    it('combine inherent a', () => {
        const syl = factory.fromParts('ཀ')
        expect(syl.pronunciation).toBe('ga\u0300')
    })

    it('applies vowel change while preserving tone when suffix does not alter it', () => {
        const syl = factory.fromParts('ཀ', { vowel: 'ུ', suffix: 'ས' })
        expect(syl.wylie).toBe('kus')
        expect(syl.pronunciation).toBe('gü\u0300')
    })

    it('all vowels roundtrip', () => {
        const baseLetter = 'ཀ'
        const expectedPron = {
            i: 'gi\u0300',
            u: 'gu\u0300',
            e: 'ge\u0300',
            o: 'go\u0300',
        }

        for (const [vowelLetter, vowelWylie] of DATA_VOWELS) {
            assertRoundtrip({
                base: baseLetter,
                vowelLetter,
                expectedWylie: `k${vowelWylie}`,
                expectedPron: expectedPron[vowelWylie],
            })
        }
    })

    it('all vowels special bases', () => {
        const accent = {
            '◌̀': { i: 'i\u0300', u: 'u\u0300', e: 'e\u0300', o: 'o\u0300' },
            '◌́': { i: 'i\u0301', u: 'u\u0301', e: 'e\u0301', o: 'o\u0301' },
        }
        const bases = [
            ['འ', "'a", '◌́'],
            ['ཨ', 'a', '◌̀'],
        ]

        for (const [baseLetter, baseWylie, tone] of bases) {
            const basePrefix = baseWylie.slice(0, -1)
            for (const [vowelLetter, vowelWylie] of DATA_VOWELS) {
                assertRoundtrip({
                    base: baseLetter,
                    vowelLetter,
                    expectedWylie: `${basePrefix}${vowelWylie}`,
                    expectedPron: accent[tone][vowelWylie],
                    wylieInput: `${baseWylie}${vowelWylie}`,
                })
            }
        }
    })

    it('suffix without vowel roundtrip', () => {
        assertRoundtrip({
            base: 'ཀ',
            suffixLetter: 'ན',
            expectedWylie: 'kan',
            expectedPron: 'ge\u0305n',
        })
        assertRoundtrip({
            base: 'ཁ',
            suffixLetter: 'བ',
            expectedWylie: 'khab',
            expectedPron: 'ka\u0300b',
        })
        assertRoundtrip({
            base: 'ག',
            suffixLetter: 'ན',
            expectedWylie: 'gan',
            expectedPron: 'ke\u0301n',
        })
    })

    it('suffix with vowel roundtrip', () => {
        const cases = [
            ['ེ', 'e', 'ge\u0305n'],
            ['ི', 'i', 'gi\u0305n'],
            ['ོ', 'o', 'gö\u0305n'],
            ['ུ', 'u', 'gü\u0305n'],
        ]

        for (const [vowelLetter, vowelWylie, expectedPron] of cases) {
            assertRoundtrip({
                base: 'ཀ',
                vowelLetter,
                suffixLetter: 'ན',
                expectedWylie: `k${vowelWylie}n`,
                expectedPron,
            })
        }
    })

    it('silent suffix roundtrip', () => {
        const cases = [
            ['', 'a', 'ge\u0300'],
            ['ེ', 'e', 'ge\u0300'],
            ['ི', 'i', 'gi\u0300'],
            ['ོ', 'o', 'gö\u0300'],
            ['ུ', 'u', 'gü\u0300'],
        ]

        for (const [vowelLetter, vowelWylie, expectedPron] of cases) {
            assertRoundtrip({
                base: 'ཀ',
                vowelLetter,
                suffixLetter: 'ས',
                expectedWylie: `k${vowelWylie}s`,
                expectedPron,
            })
        }
    })

    it('fromWylie prefers longest consonant match for bare syllable', () => {
        const syl = factory.fromWylie('kha')
        expect(syl.letter).toBe('ཁ་')
        expect(syl.wylie).toBe('kha')
        expect(syl.pronunciation).toBe('ka\u0300')
    })

    it('throws on unparsed remainder in wylie input', () => {
        expect(() => factory.fromWylie('kaabc')).toThrow(/Unparsed remainder/)
    })

    it('rejects empty tibetan syllable input', () => {
        expect(() => factory.fromTibetan('')).toThrow('Empty syllable')
    })
})
