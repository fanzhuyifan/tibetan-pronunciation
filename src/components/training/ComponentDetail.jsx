import { useEffect, useMemo, useState } from 'react'
import { consonants, vowels, suffixes } from '../../data/tibetanData'

const dataByKind = {
    consonant: consonants,
    vowel: vowels,
    suffix: suffixes,
}


const formatMapping = (mapping) => {
    if (!mapping || typeof mapping !== 'object') return ''
    return Object.entries(mapping)
        .map(([from, to]) => `${from} -> ${to}`)
        .join(', ')
}

const buildDetail = (kind, letter) => {
    const meta = letter
        ? (dataByKind[kind] || []).find((entry) => entry.letter === letter)
        : null

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
                    { label: 'Romanization', value: meta?.suffix || meta?.wylie || '—' },
                    { label: 'Tone change', value: formatMapping(meta?.tone_change) || '—' },
                    { label: 'Vowel change', value: formatMapping(meta?.vowel_change) || '—' },
                    { label: 'Note', value: meta?.comment || '—' },
                ],
            }
        default:
            return null
    }
}
const ComponentTile = ({ kind, title, letter, onSelect, isActive }) => (
    <button
        type="button"
        className={`component-tile ${kind}${isActive ? ' is-active' : ''}`}
        onClick={() => onSelect(kind)}
        aria-pressed={isActive}
    >
        <span className="component-title">{title}</span>
        <span className="component-letter-large">{letter || '—'}</span>
    </button>
)

function ComponentDetail({ card }) {
    const [activeKind, setActiveKind] = useState(null)

    useEffect(() => {
        setActiveKind(null)
    }, [card?.letter])

    const detail = useMemo(() => {
        if (!card || !activeKind) return null
        const letter =
            activeKind === 'consonant'
                ? card.consonant
                : activeKind === 'vowel'
                    ? card.vowel
                    : card.suffix
        if (!letter) return null
        return buildDetail(activeKind, letter)
    }, [activeKind, card])

    if (!card) return null

    const hasVowel = Boolean(card.vowel)
    const hasSuffix = Boolean(card.suffix)

    const handleSelect = (kind, letter) => {
        if (!letter) return
        setActiveKind(kind)
    }

    const handleDetailExit = () => {
        setActiveKind(null)
    }

    return (
        <>
            {!detail && (
                <div className="components-diagram" aria-label="Syllable components">
                    <div className="component-column">
                        {hasVowel && (
                            <ComponentTile
                                kind="vowel"
                                title="Vowel"
                                letter={card.vowel}
                                onSelect={(kind) => handleSelect(kind, card.vowel)}
                                isActive={activeKind === 'vowel'}
                            />
                        )}
                        <ComponentTile
                            kind="consonant"
                            title="Base"
                            letter={card.consonant}
                            onSelect={(kind) => handleSelect(kind, card.consonant)}
                            isActive={activeKind === 'consonant'}
                        />
                    </div>
                    {hasSuffix && (
                        <ComponentTile
                            kind="suffix"
                            title="Suffix"
                            letter={card.suffix}
                            onSelect={(kind) => handleSelect(kind, card.suffix)}
                            isActive={activeKind === 'suffix'}
                        />
                    )}
                </div>
            )}
            {detail && (
                <div
                    className="component-detail"
                    aria-live="polite"
                    role="button"
                    tabIndex={0}
                    onClick={handleDetailExit}
                >
                    <div className="component-detail-title">{detail.title} details</div>
                    <dl className="component-detail-grid">
                        {detail.rows.map((row) => (
                            <div key={`${detail.title}-${row.label}`} className="component-detail-row">
                                <dt>{row.label}</dt>
                                <dd>{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            )}
        </>
    )
}

export default ComponentDetail
