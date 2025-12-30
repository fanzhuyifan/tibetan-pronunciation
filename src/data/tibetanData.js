import YAML from 'yaml'
import consonantYaml from './consonant.yaml?raw'
import vowelYaml from './vowel.yaml?raw'
import suffixYaml from './suffix.yaml?raw'

// Parse YAML source into JS objects so the source of truth stays in YAML.
const parse = (src) => YAML.parse(src) || []

export const consonants = parse(consonantYaml)
export const vowels = parse(vowelYaml)
export const suffixes = parse(suffixYaml)
