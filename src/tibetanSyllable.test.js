import { describe, it, expect, beforeEach } from 'vitest'
import { TibetanSyllableFactory, sampleCard } from './tibetanSyllable'

const DATA_VOWELS = [
    ['ི', 'i'],
    ['ུ', 'u'],
    ['ེ', 'e'],
    ['ོ', 'o'],
]

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
            suffixLetter: 'ང',
            expectedWylie: 'kang',
            expectedPron: 'ge\u0305ng',
        })
        assertRoundtrip({
            base: 'ཁ',
            suffixLetter: 'ང',
            expectedWylie: 'khang',
            expectedPron: 'ke\u0305ng',
        })
        assertRoundtrip({
            base: 'ག',
            suffixLetter: 'ང',
            expectedWylie: 'gang',
            expectedPron: 'ke\u0301ng',
        })
    })

    it('suffix with vowel roundtrip', () => {
        const cases = [
            ['ེ', 'e', 'ge\u0305ng'],
            ['ི', 'i', 'gi\u0305ng'],
            ['ོ', 'o', 'gö\u0305ng'],
            ['ུ', 'u', 'gü\u0305ng'],
        ]

        for (const [vowelLetter, vowelWylie, expectedPron] of cases) {
            assertRoundtrip({
                base: 'ཀ',
                vowelLetter,
                suffixLetter: 'ང',
                expectedWylie: `k${vowelWylie}ng`,
                expectedPron,
            })
        }
    })

    it('sampleCard picks consonant-only when no vowel/suffix', () => {
        for (let i = 0; i < 1000; i += 1) {
            const card = sampleCard(factory, { includeVowel: false, includeSuffix: false })
            expect(card.vowel).toBeNull()
            expect(card.suffix).toBeNull()
        }
    })

    it('sampleCard can include suffix when enabled', () => {
        let sawSuffix = false

        for (let i = 0; i < 1000; i += 1) {
            const card = sampleCard(factory, { includeVowel: false, includeSuffix: true })
            expect(card.vowel).toBeNull()
            if (card.suffix) sawSuffix = true
        }

        expect(sawSuffix).toBe(true)
    })

    it('sampleCard can use vowels when included', () => {
        let sawVowel = false
        let sawNoVowel = false

        for (let i = 0; i < 1000; i += 1) {
            const card = sampleCard(factory, { includeVowel: true, includeSuffix: false })
            if (card.vowel) {
                sawVowel = true
            } else {
                sawNoVowel = true
            }
            expect(card.suffix).toBeNull()
        }

        expect(sawVowel).toBe(true)
        expect(sawNoVowel).toBe(true)
    })
})
