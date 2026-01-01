import YAML from 'yaml'
import consonantYaml from './consonant.yaml?raw'
import vowelYaml from './vowel.yaml?raw'
import suffixYaml from './suffix.yaml?raw'

export interface Consonant {
    letter: string;
    wylie: string;
    base_pronunciation: string;
    tone: string;
}

export interface Vowel {
    letter: string;
    wylie: string;
    pronunciation: string;
}

export interface Suffix {
    letter: string;
    suffix?: string;
    tone_change?: Record<string, string>;
    vowel_change?: Record<string, string>;
    comment?: string;
    pronunciation?: string;
    base_pronunciation?: string;
}

// Parse YAML source into JS objects so the source of truth stays in YAML.
const parse = <T>(src: string): T[] => YAML.parse(src) || []

export const consonants = parse<Consonant>(consonantYaml)
export const vowels = parse<Vowel>(vowelYaml)
export const suffixes = parse<Suffix>(suffixYaml)
