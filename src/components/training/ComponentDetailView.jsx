import React from 'react'
import { buildDetail } from './componentDetailUtils'
import ComponentDetailContent from './ComponentDetailContent'
import styles from './ComponentDetail.module.css'

function ComponentDetailView({ kind, letter }) {
    const detail = buildDetail(kind, letter)
    if (!detail) return null

    return (
        <div className={styles.componentDetail} aria-live="polite">
            <ComponentDetailContent detail={detail} />
        </div>
    )
}

export default ComponentDetailView
