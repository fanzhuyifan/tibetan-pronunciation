import { consonants as defaultConsonants, vowels as defaultVowels, suffixes as defaultSuffixes, Consonant, Vowel, Suffix } from './data/tibetanData'
import {
    applyToneToPronunciation,
    combinePronunciation,
    appendSuffixPronunciation,
    applySuffixAdjustments,
} from './utils/pronunciation'

// Re-export pronunciation helpers for backwards compatibility.
export {
    applyToneToPronunciation,
    combinePronunciation,
    appendSuffixPronunciation,
    applySuffixAdjustments,
} from './utils/pronunciation'

const consonantFromLetter = (letter: string, consonants: Consonant[]): Consonant | null => {
    return consonants.find((c) => c.letter === letter) || null
}

const stripWylie = (wylie: string): string => {
    return wylie.endsWith('a') ? wylie.slice(0, -1) : wylie
}

const emptyVowel = (): Vowel => ({ letter: '', wylie: '', pronunciation: '' })

export interface TibetanSyllableProps {
    letter: string;
    wylie: string;
    pronunciation: string;
    tone: string;
    consonant: string;
    vowel: string | null;
    suffix: string | null;
}

export class TibetanSyllable {
    letter: string;
    wylie: string;
    pronunciation: string;
    tone: string;
    consonant: string;
    vowel: string | null;
    suffix: string | null;

    constructor({ letter, wylie, pronunciation, tone, consonant, vowel, suffix }: TibetanSyllableProps) {
        this.letter = letter
        this.wylie = wylie
        this.pronunciation = pronunciation
        this.tone = tone
        this.consonant = consonant
        this.vowel = vowel || null
        this.suffix = suffix || null
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

export const buildSyllable = (base: Consonant, vowel: Vowel | null, suffix: Suffix | null = null, consonants: Consonant[] = defaultConsonants): TibetanSyllable => {
    const resolvedVowel = vowel || emptyVowel()

    const baseLetter = base.letter || ''
    const vowelLetter = resolvedVowel.letter || ''
    const suffixLetter = suffix?.letter || ''

    const letterCore = `${baseLetter}${vowelLetter}${suffixLetter}`
    const letter = letterCore.endsWith('་') ? letterCore : `${letterCore}་`

    let baseWylie = base.wylie || ''
    const vowelWylie = resolvedVowel.wylie || ''
    let suffixWylie = ''

    if (suffix) {
        suffixWylie = stripWylie(consonantFromLetter(suffix.letter, consonants)?.wylie || '')
    }

    if (vowelLetter) {
        baseWylie = stripWylie(baseWylie)
    }

    const wylie = `${baseWylie}${vowelWylie}${suffixWylie}`

    const { vowelPron, tone } = applySuffixAdjustments({
        vowelPron: resolvedVowel.pronunciation || '',
        baseTone: base.tone || '',
        suffix,
    })

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
    })
}

export class TibetanSyllableFactory {
    consonants: Consonant[];
    vowels: Vowel[];
    suffixes: Suffix[];

    constructor({ consonants = defaultConsonants, vowels = defaultVowels, suffixes = defaultSuffixes }: { consonants?: Consonant[], vowels?: Vowel[], suffixes?: Suffix[] } = {}) {
        this.consonants = consonants
        this.vowels = vowels
        this.suffixes = suffixes
    }

    fromParts(baseLetter: string, { vowel = '', suffix = '' }: { vowel?: string, suffix?: string } = {}): TibetanSyllable {
        const base = findEntry(this.consonants, 'letter', baseLetter)

        const vowelEntry = vowel ? findEntry(this.vowels, 'letter', vowel) : emptyVowel()
        const suffixEntry = suffix ? findEntry(this.suffixes, 'letter', suffix) : null

        return buildSyllable(base, vowelEntry, suffixEntry, this.consonants)
    }

    fromTibetan(syllable: string): TibetanSyllable {
        if (!syllable) throw new Error('Empty syllable')

        let trimmed = syllable
        if (trimmed.endsWith('་')) {
            trimmed = trimmed.slice(0, -1)
        }

        const baseLetter = trimmed[0]
        const remainder = trimmed.slice(1)

        let vowelLetter = ''
        let suffixLetter = ''

        if (remainder) {
            if (this.vowels.some((v) => v.letter === remainder[0])) {
                vowelLetter = remainder[0]
                suffixLetter = remainder[1] || ''
            } else {
                suffixLetter = remainder[0]
            }
        }
        return this.fromParts(baseLetter, { vowel: vowelLetter, suffix: suffixLetter })
    }

    fromWylie(wylie: string): TibetanSyllable {
        if (!wylie) throw new Error('Empty wylie string')

        let bestEntry: Consonant | null = null
        let bestToken = ''

        for (const entry of this.consonants) {
            const tok = entry.wylie || ''
            const candidates = new Set([tok])
            candidates.add(stripWylie(tok))

            for (const cand of candidates) {
                if (wylie.startsWith(cand) && cand.length > bestToken.length) {
                    bestEntry = entry
                    bestToken = cand
                }
            }
        }

        if (!bestEntry) {
            throw new Error(`No consonant for wylie prefix in ${wylie}`)
        }

        let remaining = wylie.slice(bestToken.length)
        let vowel: Vowel | null = null
        let suffix: Suffix | null = null

        if (remaining) {
            for (const v of this.vowels) {
                const vw = v.wylie || ''
                if (vw && remaining.startsWith(vw)) {
                    vowel = v
                    remaining = remaining.slice(vw.length)
                    break
                }
            }

            if (remaining) {
                for (const s of this.suffixes) {
                    const suffixWylie = stripWylie(consonantFromLetter(s.letter, this.consonants)?.wylie || '')
                    if (suffixWylie && remaining === suffixWylie) {
                        suffix = s
                        remaining = ''
                        break
                    }
                }
            }

            if (remaining) {
                throw new Error(`Unparsed remainder ${remaining} in wylie ${wylie}`)
            }
        }

        return buildSyllable(bestEntry, vowel, suffix, this.consonants)
    }
}
