// Shared renderer for component detail rows to avoid duplicate markup.
import styles from './ComponentDetail.module.css'

function ComponentDetailContent({ detail }) {
    if (!detail) return null

    return (
        <>
            <div className={styles.componentDetailTitle}>{detail.title} details</div>
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