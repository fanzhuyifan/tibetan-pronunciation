import { consonants as defaultConsonants, vowels as defaultVowels, suffixes as defaultSuffixes } from './data/tibetanData'
import { pick } from './utils'

const BASE_VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'ö', 'ü'])

const isCombining = (ch) => /\p{M}/u.test(ch)

export const applyToneToPronunciation = (pron, tone) => {
    if (!pron || !tone) return pron
    const toneMark = tone.at(-1)
    const chars = Array.from(pron)

    for (let i = 0; i < chars.length; i += 1) {
        const ch = chars[i]
        if (isCombining(ch)) continue
        if (BASE_VOWELS.has(ch.toLowerCase())) {
            chars.splice(i + 1, 0, toneMark)
            return chars.join('')
        }
    }
    return pron
}

export const combinePronunciation = (basePron, vowelPron) => {
    if (!vowelPron || vowelPron === 'a') return basePron
    if (basePron.endsWith('a') && vowelPron !== 'a') {
        return `${basePron.slice(0, -1)}${vowelPron}`
    }
    return `${basePron}${vowelPron}`
}

export const appendSuffixPronunciation = (pron, suffix) => {
    if (!suffix) return pron
    const extra =
        suffix.pronunciation ||
        suffix.base_pronunciation ||
        suffix.suffix ||
        ''
    return `${pron}${extra}`
}

export const maybeAdjustVowelPronunciation = (vowelPron, suffix) => {
    if (!suffix) return vowelPron
    const mapping = suffix.vowel_change
    if (typeof mapping !== 'object' || mapping === null) return vowelPron
    const current = vowelPron || 'a'
    return mapping[current] ?? vowelPron
}

export const effectiveTone = (baseTone, suffix) => {
    if (!suffix) return baseTone
    const toneChange = suffix.tone_change
    if (toneChange && typeof toneChange === 'object' && baseTone in toneChange) {
        return toneChange[baseTone]
    }
    return baseTone
}

const emptyVowel = () => ({ letter: '', wylie: '', pronunciation: '' })

export class TibetanSyllable {
    constructor({ letter, wylie, pronunciation, tone, consonant, vowel, suffix, suffixComment }) {
        this.letter = letter
        this.wylie = wylie
        this.pronunciation = pronunciation
        this.tone = tone
        this.consonant = consonant
        this.vowel = vowel || null
        this.suffix = suffix || null
        this.suffixComment = suffixComment || null
    }

    toString() {
        return `${this.letter} (${this.wylie}) -> ${this.pronunciation} [${this.tone}]`
    }
}

const findEntry = (entries, field, value) => {
    const entry = entries.find((e) => e[field] === value)
    if (entry) return entry
    throw new Error(`No entry with ${field}=${String(value)}`)
}

export const buildSyllable = (base, vowel, suffix = null) => {
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
        suffixWylie = suffix.wylie || suffix.suffix || ''
    }

    if (vowelLetter && baseWylie.endsWith('a')) {
        baseWylie = baseWylie.slice(0, -1)
    }

    const wylie = `${baseWylie}${vowelWylie}${suffixWylie}`

    const vowelPron = maybeAdjustVowelPronunciation(
        resolvedVowel.pronunciation || '',
        suffix,
    )
    const tone = effectiveTone(base.tone || '', suffix)

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
        suffixComment: suffix?.comment || null,
    })
}

export class TibetanSyllableFactory {
    constructor({ consonants = defaultConsonants, vowels = defaultVowels, suffixes = defaultSuffixes } = {}) {
        this.consonants = consonants
        this.vowels = vowels
        this.suffixes = suffixes
    }

    fromParts(baseLetter, { vowel = '', suffix = '' } = {}) {
        const base = findEntry(this.consonants, 'letter', baseLetter)

        const vowelEntry = vowel ? findEntry(this.vowels, 'letter', vowel) : emptyVowel()
        const suffixEntry = suffix ? findEntry(this.suffixes, 'letter', suffix) : null

        return buildSyllable(base, vowelEntry, suffixEntry)
    }

    fromTibetan(syllable) {
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

    fromWylie(wylie) {
        if (!wylie) throw new Error('Empty wylie string')

        let bestEntry = null
        let bestToken = ''

        for (const entry of this.consonants) {
            const tok = entry.wylie || ''
            const candidates = new Set([tok])
            if (tok.endsWith('a')) candidates.add(tok.slice(0, -1))

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
        let vowel = null
        let suffix = null

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
                    const suffixWylie = s.wylie || s.suffix || ''
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

        return buildSyllable(bestEntry, vowel, suffix)
    }
}

export const sampleCard = (
    factory,
    { includeVowel = true, includeSuffix = true } = {},
) => {
    const consonants = factory.consonants
    const vowels = factory.vowels
    const suffixes = factory.suffixes

    const empty = emptyVowel()

    const vowelOptions = [empty]
    if (includeVowel) vowelOptions.push(...vowels)

    const suffixOptions = [null]
    if (includeSuffix) suffixOptions.push(...suffixes)

    const base = pick(consonants)
    const vowel = pick(vowelOptions)
    const suffix = pick(suffixOptions)

    const vowelLetter = vowel.letter || ''
    const suffixLetter = suffix?.letter || ''

    return factory.fromParts(base.letter, { vowel: vowelLetter, suffix: suffixLetter })
}
