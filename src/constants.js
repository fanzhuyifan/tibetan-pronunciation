import { State } from 'ts-fsrs'

export const KIND_CONSONANT = 'consonant'
export const KIND_VOWEL = 'vowel'
export const KIND_SUFFIX = 'suffix'

export const KIND_LABELS = {
    [KIND_CONSONANT]: 'Consonant',
    [KIND_VOWEL]: 'Vowel',
    [KIND_SUFFIX]: 'Suffix',
}

export const KIND_ORDER = {
    [KIND_CONSONANT]: 0,
    [KIND_VOWEL]: 1,
    [KIND_SUFFIX]: 2,
}

export const KIND_COLORS = {
    [KIND_CONSONANT]: '#3b82f6', // blue-500
    [KIND_VOWEL]: '#10b981',     // emerald-500
    [KIND_SUFFIX]: '#f59e0b',    // amber-500
}

export const STATE_LABELS = {
    [State.New]: 'New',
    [State.Learning]: 'Learning',
    [State.Review]: 'Review',
    [State.Relearning]: 'Relearning',
}

export const STATE_COLORS = {
    [State.New]: '#3b82f6',        // blue-500
    [State.Learning]: '#f97316',   // orange-500
    [State.Review]: '#10b981',     // emerald-500
    [State.Relearning]: '#ef4444', // red-500
}
