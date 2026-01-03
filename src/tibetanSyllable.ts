import {
    consonants as defaultConsonants,
    vowels as defaultVowels,
    suffixes as defaultSuffixes,
    secondSuffixes as defaultSecondSuffixes,
    Consonant,
    Vowel,
    Suffix,
    SecondSuffix,
} from './data/tibetanData'
import {
    applyToneToPronunciation,
    combinePronunciation,
    appendSuffixPronunciation,
    applySuffixAdjustments,
    effectiveTone,
} from './utils/pronunciation'

// Re-export pronunciation helpers for backwards compatibility.
export {
    applyToneToPronunciation,
    combinePronunciation,
    appendSuffixPronunciation,
    applySuffixAdjustments,
    effectiveTone,
} from './utils/pronunciation'

const consonantFromLetter = (letter: string, consonants: Consonant[]): Consonant | null => {
    return consonants.find((c) => c.letter === letter) || null
}

const stripWylie = (wylie: string): string => {
    return wylie.endsWith('a') ? wylie.slice(0, -1) : wylie
}

const emptyVowel = (): Vowel => ({ letter: '', wylie: '', pronunciation: '' })

const buildSecondSuffixMap = (rules: SecondSuffix[]): Map<string, Set<string>> => {
    const map = new Map<string, Set<string>>()
    for (const rule of rules) {
        map.set(rule.letter, new Set(rule.suffixes))
    }
    return map
}


const buildWylieMap = (consonants: Consonant[], vowels: Vowel[]): Map<string, string> => {
    const wylieMap = new Map<string, string>()

    for (const entry of consonants) {
        wylieMap.set(entry.wylie, entry.letter)
        const stripped = stripWylie(entry.wylie)
        if (stripped !== "") {
            wylieMap.set(stripped, entry.letter)
        }
    }

    for (const vowel of vowels) {
        wylieMap.set(vowel.wylie, vowel.letter)
    }

    return wylieMap
}

export interface TibetanSyllableProps {
    letter: string;
    wylie: string;
    pronunciation: string;
    tone: string;
    consonant: string;
    vowel: string | null;
    suffix: string | null;
    secondSuffix: string | null;
}

export class TibetanSyllable {
    letter: string;
    wylie: string;
    pronunciation: string;
    tone: string;
    consonant: string;
    vowel: string | null;
    suffix: string | null;
    secondSuffix: string | null;

    constructor({ letter, wylie, pronunciation, tone, consonant, vowel, suffix, secondSuffix }: TibetanSyllableProps) {
        this.letter = letter
        this.wylie = wylie
        this.pronunciation = pronunciation
        this.tone = tone
        this.consonant = consonant
        this.vowel = vowel || null
        this.suffix = suffix || null
        this.secondSuffix = secondSuffix || null
    }

    toString() {
        return `${this.letter} (${this.wylie}) -> ${this.pronunciation} [${this.tone}]`
    }
}

const findEntry = <T>(entries: T[], field: keyof T, value: T[keyof T]): T => {
    const entry = entries.find((e) => e[field] === value)
    if (entry) return entry
    throw new Error(`No entry with ${String(field)}=${String(value)}`)
}

export const buildSyllable = (
    base: Consonant,
    vowel: Vowel | null,
    suffix: Suffix | null = null,
    consonants: Consonant[] = defaultConsonants,
    secondSuffix: Suffix | null = null,
): TibetanSyllable => {
    const resolvedVowel = vowel || emptyVowel()

    const baseLetter = base.letter || ''
    const vowelLetter = resolvedVowel.letter || ''
    const suffixLetter = suffix?.letter || ''
    const secondSuffixLetter = secondSuffix?.letter || ''

    const letter = `${baseLetter}${vowelLetter}${suffixLetter}${secondSuffixLetter}་`

    let baseWylie = base.wylie || ''
    const vowelWylie = resolvedVowel.wylie || ''
    let suffixWylie = ''
    let secondSuffixWylie = ''

    if (suffix) {
        suffixWylie = stripWylie(consonantFromLetter(suffix.letter, consonants)?.wylie || '')
    }

    if (secondSuffix) {
        secondSuffixWylie = stripWylie(consonantFromLetter(secondSuffix.letter, consonants)?.wylie || '')
    }

    if (vowelLetter) {
        baseWylie = stripWylie(baseWylie)
    }

    const wylie = `${baseWylie}${vowelWylie}${suffixWylie}${secondSuffixWylie}`

    const toneFromSecond = effectiveTone(base.tone || '', secondSuffix)
    const { vowelPron, tone: toneFromFirst } = applySuffixAdjustments({
        vowelPron: resolvedVowel.pronunciation || '',
        baseTone: base.tone || '',
        suffix,
    })
    const tone = secondSuffix ? toneFromSecond : toneFromFirst

    let pron = combinePronunciation(base.base_pronunciation || '', vowelPron)
    pron = applyToneToPronunciation(pron, tone)
    pron = appendSuffixPronunciation(pron, suffix)

    return new TibetanSyllable({
        letter,
        wylie,
        pronunciation: pron,
        tone,
        consonant: baseLetter,
        vowel: vowelLetter || null,
        suffix: suffixLetter || null,
        secondSuffix: secondSuffixLetter || null,
    })
}

export class TibetanSyllableFactory {
    consonants: Consonant[];
    vowels: Vowel[];
    suffixes: Suffix[];
    secondSuffixes: SecondSuffix[];
    allowedSecondSuffixes: Map<string, Set<string>>;
    vowelLetters: Set<string>;
    suffixLetters: Set<string>;
    secondSuffixLetters: Set<string>;
    wylieMap: Map<string, string>;

    constructor({ consonants = defaultConsonants, vowels = defaultVowels, suffixes = defaultSuffixes, secondSuffixes = defaultSecondSuffixes }: { consonants?: Consonant[], vowels?: Vowel[], suffixes?: Suffix[], secondSuffixes?: SecondSuffix[] } = {}) {
        this.consonants = consonants
        this.vowels = vowels
        this.suffixes = suffixes
        this.secondSuffixes = secondSuffixes
        this.allowedSecondSuffixes = buildSecondSuffixMap(secondSuffixes)

        this.vowelLetters = new Set(vowels.map((v) => v.letter))
        this.suffixLetters = new Set(suffixes.map((s) => s.letter))
        this.secondSuffixLetters = new Set(secondSuffixes.map((s) => s.letter))

        this.wylieMap = buildWylieMap(this.consonants, this.vowels)
    }

    private pickLongestWylieToken(remaining: string): string | null {
        while (remaining !== '') {
            if (this.wylieMap.has(remaining)) {
                return remaining
            }
            remaining = remaining.slice(0, -1)
        }
        return null
    }

    private convertWylieToTibetan(wylie: string): string {
        let remaining = wylie
        let tibetan = ''

        while (remaining.length > 0) {
            const match = this.pickLongestWylieToken(remaining)
            if (!match) {
                throw new Error(`No tibetan letter for wylie prefix in ${remaining}`)
            }

            const letter = this.wylieMap.get(match)
            if (tibetan === '' && this.vowelLetters.has(letter!)) {
                tibetan += 'ཨ' // implicit initial 'a' consonant
            }

            tibetan += letter
            remaining = remaining.slice(match.length)
        }

        return tibetan
    }

    resolveSecondSuffix(letter: string, suffixEntry: Suffix | null): Suffix | null {
        if (!letter) return null
        if (!suffixEntry) {
            throw new Error(`Second suffix ${letter} requires a primary suffix`)
        }

        const allowedSuffixes = this.allowedSecondSuffixes.get(letter)
        if (!allowedSuffixes || !allowedSuffixes.has(suffixEntry.letter)) {
            throw new Error(`Second suffix ${letter} is not allowed after ${suffixEntry.letter}`)
        }

        return findEntry(this.suffixes, 'letter', letter)
    }

    fromParts(baseLetter: string, { vowel = '', suffix = '', secondSuffix = '' }: { vowel?: string, suffix?: string, secondSuffix?: string } = {}): TibetanSyllable {
        const base = findEntry(this.consonants, 'letter', baseLetter)

        const vowelEntry = vowel ? findEntry(this.vowels, 'letter', vowel) : emptyVowel()
        const suffixEntry = suffix ? findEntry(this.suffixes, 'letter', suffix) : null
        const secondSuffixEntry = this.resolveSecondSuffix(secondSuffix, suffixEntry)

        return buildSyllable(base, vowelEntry, suffixEntry, this.consonants, secondSuffixEntry)
    }

    fromTibetan(syllable: string): TibetanSyllable {
        if (!syllable) throw new Error('Empty syllable')
        let remaining = syllable.endsWith('་') ? syllable.slice(0, -1) : syllable

        const baseLetter = remaining[0]
        remaining = remaining.slice(1)

        const take = (set: Set<string>): string => {
            const ch = remaining[0]
            if (ch && set.has(ch)) {
                remaining = remaining.slice(1)
                return ch
            }
            return ''
        }

        const vowelLetter = take(this.vowelLetters)
        const suffixLetter = take(this.suffixLetters)
        const secondSuffixLetter = suffixLetter ? take(this.secondSuffixLetters) : ''

        if (remaining) {
            throw new Error(`Unexpected trailing characters ${remaining} tibetan syllable ${syllable}`)
        }

        return this.fromParts(baseLetter, { vowel: vowelLetter, suffix: suffixLetter, secondSuffix: secondSuffixLetter })
    }

    fromWylie(wylie: string): TibetanSyllable {
        if (!wylie) throw new Error('Empty wylie string')

        const tibetan = this.convertWylieToTibetan(wylie)
        return this.fromTibetan(tibetan)
    }
}
