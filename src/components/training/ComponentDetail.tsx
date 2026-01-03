import { useMemo, useState } from 'react'
import { buildDetail } from './componentDetailUtils'
import ComponentDetailContent from './ComponentDetailContent'
import styles from './ComponentDetail.module.css'
import { TibetanSyllable } from '../../tibetanSyllable'

interface ComponentTileProps {
    kind: string;
    title: string;
    letter: string | null;
    onSelect: (kind: string) => void;
    isActive: boolean;
}

const ComponentTile = ({ kind, title, letter, onSelect, isActive }: ComponentTileProps) => (
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

interface ComponentDetailProps {
    card: TibetanSyllable | null;
}

function ComponentDetail({ card }: ComponentDetailProps) {
    const [activeKind, setActiveKind] = useState<string | null>(null)

    const detail = useMemo(() => {
        if (!card || !activeKind) return null
        switch (activeKind) {
            case 'consonant':
                return buildDetail(activeKind, card.consonant)
            case 'vowel':
                return buildDetail(activeKind, card.vowel)
            case 'suffix':
                return buildDetail(activeKind, card.suffix)
            case 'secondSuffix':
                return buildDetail(activeKind, card.secondSuffix)
            default:
                return null
        }
    }, [activeKind, card])

    if (!card) return null


    const handleSelect = (kind: string, letter: string | null) => {
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

    const vowelAbove = card.vowel ? ['ི', 'ོ', 'ེ'].includes(card.vowel) : false

    return (
        <>
            {!detail && (
                <div className={styles.componentsDiagram} aria-label="Syllable components">
                    {card.vowel && (
                        <div
                            className={[
                                styles.vowelCell,
                                vowelAbove ? styles.vowelAbove : styles.vowelBelow,
                            ].join(' ')}
                        >
                            {vowelComponent}
                        </div>
                    )}
                    <div className={styles.baseCell}>
                        <ComponentTile
                            kind="consonant"
                            title="Base"
                            letter={card.consonant}
                            onSelect={(kind) => handleSelect(kind, card.consonant)}
                            isActive={activeKind === 'consonant'}
                        />
                    </div>
                    {card.suffix && (
                        <div className={styles.suffixCell}>
                            <ComponentTile
                                kind="suffix"
                                title="Suffix"
                                letter={card.suffix}
                                onSelect={(kind) => handleSelect(kind, card.suffix)}
                                isActive={activeKind === 'suffix'}
                            />
                        </div>
                    )}
                    {card.suffix && (
                        <div className={styles.secondSuffixCell}>
                            <ComponentTile
                                kind="secondSuffix"
                                title="Second suffix"
                                letter={card.secondSuffix}
                                onSelect={(kind) => handleSelect(kind, card.secondSuffix)}
                                isActive={activeKind === 'secondSuffix'}
                            />
                        </div>
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
