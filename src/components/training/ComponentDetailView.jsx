import React from 'react'
import { buildDetail } from './componentDetailUtils'
import './ComponentDetail.css'

function ComponentDetailView({ kind, letter }) {
    const detail = buildDetail(kind, letter)
    if (!detail) return null

    return (
        <div className="component-detail" aria-live="polite">
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
    )
}

export default ComponentDetailView
