import styles from './ComponentDetail.module.css'
import { DetailData } from './componentDetailUtils'

interface ComponentDetailContentProps {
    detail: DetailData | null;
}

function ComponentDetailContent({ detail }: ComponentDetailContentProps) {
    if (!detail) return null

    return (
        <>
            <div className={styles.componentDetailTitle}>{detail.title}</div>
            <dl className={styles.componentDetailGrid}>
                {detail.rows.map((row) => (
                    <div key={`${detail.title}-${row.label}`} className={styles.componentDetailRow}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                    </div>
                ))}
            </dl>
        </>
    )
}

export default ComponentDetailContent
