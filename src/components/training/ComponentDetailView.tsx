import React from 'react'
import { buildDetail } from './componentDetailUtils'
import ComponentDetailContent from './ComponentDetailContent'
import styles from './ComponentDetail.module.css'

interface ComponentDetailViewProps {
    kind: string;
    letter: string | null;
}

function ComponentDetailView({ kind, letter }: ComponentDetailViewProps) {
    const detail = buildDetail(kind, letter)
    if (!detail) return null

    return (
        <div className={styles.componentDetail} aria-live="polite">
            <ComponentDetailContent detail={detail} />
        </div>
    )
}

export default ComponentDetailView
