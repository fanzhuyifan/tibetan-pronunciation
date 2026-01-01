import { useMemo, useState } from 'react'
import { buildDetail } from './componentDetailUtils'
import ComponentDetailContent from './ComponentDetailContent'
import styles from './ComponentDetail.module.css'
const ComponentTile = ({ kind, title, letter, onSelect, isActive }) => (
    <button
        type="button"
        className={[
            'btn',
            styles.componentTile,
            kind === 'vowel' && styles.componentTileVowel,
            kind === 'consonant' && styles.componentTileConsonant,
            kind === 'suffix' && styles.componentTileSuffix,
            isActive && styles.componentTileActive,
        ].filter(Boolean).join(' ')}
        onClick={() => onSelect(kind)}
        aria-pressed={isActive}
    >
        <span className={styles.componentTitle}>{title}</span>
        <span className={styles.componentLetterLarge}>{letter || '—'}</span>
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

    const vowelAbove = ['ི', 'ོ', 'ེ'].includes(card.vowel)

    return (
        <>
            {!detail && (
                <div className={styles.componentsDiagram} aria-label="Syllable components">
                    <div className={styles.componentColumn}>
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
                    className={styles.componentDetail}
                    aria-live="polite"
                    role="button"
                    tabIndex={0}
                    onClick={handleDetailExit}
                >
                    <ComponentDetailContent detail={detail} />
                </div>
            )}
        </>
    )
}

export default ComponentDetail
