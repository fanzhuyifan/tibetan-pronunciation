import { consonants, vowels, suffixes, Consonant, Vowel, Suffix } from '../../data/tibetanData'
import { TibetanData } from '../../utils'

export const formatMapping = (mapping: Record<string, string> | undefined): string => {
    if (!mapping || typeof mapping !== 'object') return ''
    return Object.entries(mapping)
        .map(([from, to]) => `${from} -> ${to}`)
        .join(', ')
}

const dataByKind: Record<string, TibetanData[]> = {
    consonant: consonants,
    vowel: vowels,
    suffix: suffixes,
}

export interface DetailRow {
    label: string;
    value: string;
}

export interface DetailData {
    title: string;
    rows: DetailRow[];
}

export const buildDetail = (kind: string, letter: string | null): DetailData | null => {
    const meta = letter ? (dataByKind[kind] || []).find((entry) => entry.letter === letter) : null

    switch (kind) {
        case 'consonant':
            const c = meta as Consonant | undefined;
            return {
                title: 'Base',
                rows: [
                    { label: 'Letter', value: letter || '—' },
                    { label: 'Wylie', value: c?.wylie || '—' },
                    { label: 'Base pron.', value: c?.base_pronunciation || '—' },
                    { label: 'Tone', value: c?.tone || '—' },
                ],
            }
        case 'vowel':
            const v = meta as Vowel | undefined;
            return {
                title: 'Vowel',
                rows: [
                    { label: 'Letter', value: letter || '—' },
                    { label: 'Wylie', value: v?.wylie || '—' },
                    { label: 'Pronunciation', value: v?.pronunciation || '—' },
                ],
            }
        case 'suffix':
            const s = meta as Suffix | undefined;
            return {
                title: 'Suffix',
                rows: [
                    { label: 'Letter', value: letter || '—' },
                    { label: 'Suffix', value: s?.suffix || '—' },
                    { label: 'Tone', value: formatMapping(s?.tone_change) || '—' },
                    s?.vowel_change ? { label: 'Vowel', value: formatMapping(s?.vowel_change) } : null,
                    { label: 'Note', value: s?.comment || '—' },
                ].filter((row): row is DetailRow => Boolean(row)),
            }
        default:
            return null
    }
}
