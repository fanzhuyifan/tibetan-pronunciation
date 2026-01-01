import React from 'react'

interface StackedBarProps {
    data: Record<string | number, number>;
    total: number;
    colorMap: Record<string | number, string>;
}

export const StackedBar = ({ data, total, colorMap }: StackedBarProps) => {
    if (total === 0) return <div className="stacked-bar" style={{ opacity: 0.3 }} />

    return (
        <div className="stacked-bar">
            {Object.entries(data).map(([key, value]) => {
                if (value === 0) return null
                const width = (value / total) * 100
                return (
                    <div
                        key={key}
                        className="stacked-bar-segment"
                        style={{
                            width: `${width}%`,
                            backgroundColor: colorMap[key]
                        }}
                        title={`${key}: ${value}`}
                    />
                )
            })}
        </div>
    )
}

interface LegendItem {
    label: string;
    color: string;
}

interface LegendProps {
    items: LegendItem[];
}

export const Legend = ({ items }: LegendProps) => (
    <div className="legend-container">
        {items.map(({ label, color }) => (
            <div key={label} className="legend-item">
                <div className="legend-dot" style={{ background: color }} />
                {label}
            </div>
        ))}
    </div>
)

interface StatCardProps {
    label: string;
    value: number;
    breakdownData: Record<string | number, number>;
    colorMap: Record<string | number, string>;
}

export const StatCard = ({ label, value, breakdownData, colorMap }: StatCardProps) => (
    <div className="panel-card">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <StackedBar
            data={breakdownData}
            total={value}
            colorMap={colorMap}
        />
    </div>
)
