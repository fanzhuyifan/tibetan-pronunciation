import { State } from 'ts-fsrs'

export const KIND_CONSONANT = 'consonant'
export const KIND_VOWEL = 'vowel'
export const KIND_SUFFIX = 'suffix'
export const KIND_SECOND_SUFFIX = 'secondSuffix'

export const KIND_LABELS: Record<string, string> = {
    [KIND_CONSONANT]: 'Consonant',
    [KIND_VOWEL]: 'Vowel',
    [KIND_SUFFIX]: 'Suffix',
    [KIND_SECOND_SUFFIX]: 'Second suffix',
}

export const KIND_ORDER: Record<string, number> = {
    [KIND_CONSONANT]: 0,
    [KIND_VOWEL]: 1,
    [KIND_SUFFIX]: 2,
    [KIND_SECOND_SUFFIX]: 3,
}

export const KIND_COLORS: Record<string, string> = {
    [KIND_CONSONANT]: '#3b82f6', // blue-500
    [KIND_VOWEL]: '#10b981',     // emerald-500
    [KIND_SUFFIX]: '#f59e0b',    // amber-500
    [KIND_SECOND_SUFFIX]: '#6366f1', // indigo-500
}

export const STATE_LABELS: Record<number, string> = {
    [State.New]: 'New',
    [State.Learning]: 'Learning',
    [State.Review]: 'Review',
    [State.Relearning]: 'Relearning',
}

export const STATE_COLORS: Record<number, string> = {
    [State.New]: '#3b82f6',        // blue-500
    [State.Learning]: '#f97316',   // orange-500
    [State.Review]: '#10b981',     // emerald-500
    [State.Relearning]: '#ef4444', // red-500
}
