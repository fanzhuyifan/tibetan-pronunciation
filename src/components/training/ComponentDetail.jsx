import { useMemo, useState } from 'react'
import { buildDetail } from './componentDetailUtils'
import './ComponentDetail.css'
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


    const handleSelect = (kind, letter) => {
        if (!letter) return
        setActiveKind(kind)
    }

    const handleDetailExit = () => {
        setActiveKind(null)
    }

    const vowelComponent = card.vowel && (
        <ComponentTile
            kind="vowel"
            title="Vowel"
            letter={card.vowel}
            onSelect={(kind) => handleSelect(kind, card.vowel)}
            isActive={activeKind === 'vowel'}
        />
    )

    console.log(card.vowel)
    const vowelAbove = ['ི', 'ོ', 'ེ'].includes(card.vowel)

    return (
        <>
            {!detail && (
                <div className="components-diagram" aria-label="Syllable components">
                    <div className="component-column">
                        {vowelAbove && vowelComponent}
                        <ComponentTile
                            kind="consonant"
                            title="Base"
                            letter={card.consonant}
                            onSelect={(kind) => handleSelect(kind, card.consonant)}
                            isActive={activeKind === 'consonant'}
                        />
                        {!vowelAbove && vowelComponent}
                    </div>
                    {card.suffix && (
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
