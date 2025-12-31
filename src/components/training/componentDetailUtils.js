import { consonants, vowels, suffixes } from '../../data/tibetanData'

export const formatMapping = (mapping) => {
    if (!mapping || typeof mapping !== 'object') return ''
    return Object.entries(mapping)
        .map(([from, to]) => `${from} -> ${to}`)
        .join(', ')
}

const dataByKind = {
    consonant: consonants,
    vowel: vowels,
    suffix: suffixes,
}

export const buildDetail = (kind, letter) => {
    const meta = letter ? (dataByKind[kind] || []).find((entry) => entry.letter === letter) : null

    switch (kind) {
        case 'consonant':
            return {
                title: 'Base consonant',
                rows: [
                    { label: 'Letter', value: letter || '—' },
                    { label: 'Wylie', value: meta?.wylie || '—' },
                    { label: 'Base pron.', value: meta?.base_pronunciation || '—' },
                    { label: 'Tone', value: meta?.tone || '—' },
                ],
            }
        case 'vowel':
            return {
                title: 'Vowel',
                rows: [
                    { label: 'Letter', value: letter || '—' },
                    { label: 'Wylie', value: meta?.wylie || '—' },
                    { label: 'Pronunciation', value: meta?.pronunciation || '—' },
                ],
            }
        case 'suffix':
            return {
                title: 'Suffix',
                rows: [
                    { label: 'Letter', value: letter || '—' },
                    { label: 'Suffix', value: meta?.suffix || meta?.wylie || '—' },
                    { label: 'Tone change', value: formatMapping(meta?.tone_change) || '—' },
                    meta?.vowel_change ? { label: 'Vowel change', value: formatMapping(meta?.vowel_change) } : null,
                    { label: 'Note', value: meta?.comment || '—' },
                ].filter(Boolean),
            }
        default:
            return null
    }
}

export default buildDetail
