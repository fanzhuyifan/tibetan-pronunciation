import { State, Card } from 'ts-fsrs'
import { STATE_COLORS, KIND_COLORS, KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX } from '../../constants'
import './StatsView.css'
import { Legend, StatCard } from './StatsComponents'
import { ReviewForecast } from './ReviewForecast'
import { useStats } from './useStats'

interface StatsViewProps {
    cards: Map<string, Card>;
}

function StatsView({ cards }: StatsViewProps) {
    const {
        stateCounts,
        kindCounts,
        kindByState,
        stateByKind,
        forecastData,
        maxCount
    } = useStats(cards)

    return (
        <div className="panel">
            <div className="panel-header stats-header">
                <p className="panel-subtitle">Breakdown by state:</p>
                <Legend
                    className="legend-large"
                    items={[
                        { label: 'New', color: STATE_COLORS[State.New] },
                        { label: 'Learning', color: STATE_COLORS[State.Learning] },
                        { label: 'Review', color: STATE_COLORS[State.Review] },
                        { label: 'Relearning', color: STATE_COLORS[State.Relearning] },
                    ]}
                />
            </div>

            <div className="panel-grid" style={{ marginTop: '1rem' }}>
                <StatCard
                    label="Consonants"
                    value={kindCounts[KIND_CONSONANT]}
                    breakdownData={kindByState[KIND_CONSONANT]}
                    colorMap={STATE_COLORS}
                />
                <StatCard
                    label="Vowels"
                    value={kindCounts[KIND_VOWEL]}
                    breakdownData={kindByState[KIND_VOWEL]}
                    colorMap={STATE_COLORS}
                />
                <StatCard
                    label="Suffixes"
                    value={kindCounts[KIND_SUFFIX]}
                    breakdownData={kindByState[KIND_SUFFIX]}
                    colorMap={STATE_COLORS}
                />
                <StatCard
                    label="Total"
                    value={Object.values(stateCounts).reduce((a, b) => a + b, 0)}
                    breakdownData={stateCounts}
                    colorMap={STATE_COLORS}
                />
            </div>
            <div className="panel-header stats-header" style={{ marginTop: '2rem' }}>
                <p className="panel-subtitle">Breakdown by card kind:</p>
                <Legend
                    className="legend-large"
                    items={[
                        { label: 'Consonant', color: KIND_COLORS[KIND_CONSONANT] },
                        { label: 'Vowel', color: KIND_COLORS[KIND_VOWEL] },
                        { label: 'Suffix', color: KIND_COLORS[KIND_SUFFIX] },
                    ]}
                />
            </div>

            <div className="panel-grid" style={{ marginTop: '1rem' }}>
                <StatCard
                    label="New"
                    value={stateCounts[State.New]}
                    breakdownData={stateByKind[State.New]}
                    colorMap={KIND_COLORS}
                />
                <StatCard
                    label="Learning"
                    value={stateCounts[State.Learning]}
                    breakdownData={stateByKind[State.Learning]}
                    colorMap={KIND_COLORS}
                />
                <StatCard
                    label="Review"
                    value={stateCounts[State.Review]}
                    breakdownData={stateByKind[State.Review]}
                    colorMap={KIND_COLORS}
                />
                <StatCard
                    label="Relearning"
                    value={stateCounts[State.Relearning]}
                    breakdownData={stateByKind[State.Relearning]}
                    colorMap={KIND_COLORS}
                />
            </div>

            <div style={{ marginTop: '2rem' }}>
                <ReviewForecast forecastData={forecastData} maxCount={maxCount} />
            </div>
        </div>
    )
}

export default StatsView
