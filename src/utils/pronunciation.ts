import { Suffix } from '../data/tibetanData'

const BASE_VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'ö', 'ü'])

const isCombining = (ch: string) => /\p{M}/u.test(ch)

export const applyToneToPronunciation = (pron: string, tone: string): string => {
    if (!pron || !tone) return pron
    const toneMark = tone.slice(-1)[0]
    if (!toneMark) return pron
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

export const combinePronunciation = (basePron: string, vowelPron: string): string => {
    if (!vowelPron || vowelPron === 'a') return basePron
    if (basePron.endsWith('a') && vowelPron !== 'a') {
        return `${basePron.slice(0, -1)}${vowelPron}`
    }
    return `${basePron}${vowelPron}`
}

export const appendSuffixPronunciation = (pron: string, suffix: Suffix | null): string => {
    if (!suffix) return pron
    const extra =
        suffix.pronunciation ||
        suffix.base_pronunciation ||
        suffix.suffix ||
        ''
    return `${pron}${extra}`
}

export const maybeAdjustVowelPronunciation = (vowelPron: string, suffix: Suffix | null): string => {
    if (!suffix) return vowelPron
    const mapping = suffix.vowel_change
    if (typeof mapping !== 'object' || mapping === null) return vowelPron
    const current = vowelPron || 'a'
    return mapping[current] ?? vowelPron
}

export const effectiveTone = (baseTone: string, suffix: Suffix | null): string => {
    if (!suffix) return baseTone
    const toneChange = suffix.tone_change
    if (toneChange && typeof toneChange === 'object' && baseTone in toneChange) {
        return toneChange[baseTone]
    }
    return baseTone
}

export const applySuffixAdjustments = ({ vowelPron, baseTone, suffix }: { vowelPron: string, baseTone: string, suffix: Suffix | null }) => {
    const adjustedVowelPron = maybeAdjustVowelPronunciation(vowelPron, suffix)
    const tone = effectiveTone(baseTone, suffix)
    return { vowelPron: adjustedVowelPron, tone }
}

export default {
    applyToneToPronunciation,
    combinePronunciation,
    appendSuffixPronunciation,
    maybeAdjustVowelPronunciation,
    effectiveTone,
}
