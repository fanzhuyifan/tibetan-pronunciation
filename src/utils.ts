import { consonants, vowels, suffixes, Consonant, Vowel, Suffix } from './data/tibetanData'
import { KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX } from './constants'

export const storageAvailable = (): boolean => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export const formatTime = (seconds: number): string => {
    if (seconds <= 0) return 'Now'
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = seconds / 60
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = minutes / 60
    if (hours < 24) return `${Math.round(hours)}h`
    const days = hours / 24
    if (days < 30) return `${Math.round(days)}d`
    const months = days / 30
    if (months < 12) return `${Math.round(months)}mo`
    const years = days / 365
    return `${Math.round(years)}y`
}

export const createCardId = (kind: string, letter: string): string => `${kind}:${letter}`

export const parseCardId = (id: string | null | undefined): { kind: string | null, letter: string | null } => {
    if (!id) return { kind: null, letter: null }
    const [kind, letter] = id.split(':')
    return { kind, letter }
}

export type TibetanData = Consonant | Vowel | Suffix;

export const lookupMeta = (kind: string | null, letter: string | null): TibetanData | null => {
    if (!letter) return null
    if (kind === KIND_CONSONANT) return consonants.find((c) => c.letter === letter) || null
    if (kind === KIND_VOWEL) return vowels.find((v) => v.letter === letter) || null
    if (kind === KIND_SUFFIX) return suffixes.find((s) => s.letter === letter) || null
    return null
}

