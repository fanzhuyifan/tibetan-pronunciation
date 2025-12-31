import { State } from 'ts-fsrs'
import './StatsView.css'
import { Legend, StatCard } from './StatsComponents'
import { ReviewForecast } from './ReviewForecast'
import { useStats } from './useStats'

const KIND_COLORS = {
    consonant: '#3b82f6', // blue-500
    vowel: '#10b981',     // emerald-500
    suffix: '#f59e0b',    // amber-500
}

const STATE_COLORS = {
    [State.New]: '#3b82f6',        // blue-500
    [State.Learning]: '#f97316',   // orange-500
    [State.Review]: '#10b981',     // emerald-500
    [State.Relearning]: '#ef4444', // red-500
}

function StatsView({ cards }) {
    const {
        stateCounts,
        kindCounts,
        stateByKind,
        kindByState,
        forecastData,
        maxCount
    } = useStats(cards)

    return (
        <div className="stats-panel">
            <div className="stats-header">
                <div>
                    <div className="stats-title">Deck Stats</div>
                    <p className="stats-subtitle">Current status of your cards.</p>
                </div>
            </div>

            <Legend items={[
                { label: 'New', color: STATE_COLORS[State.New] },
                { label: 'Learning', color: STATE_COLORS[State.Learning] },
                { label: 'Review', color: STATE_COLORS[State.Review] },
                { label: 'Relearning', color: STATE_COLORS[State.Relearning] },
            ]} />
            <div className="stats-grid" style={{ marginTop: '1rem' }}>
                <StatCard
                    label="Consonants"
                    value={kindCounts.consonant}
                    breakdownData={kindByState.consonant}
                    colorMap={STATE_COLORS}
                />
                <StatCard
                    label="Vowels"
                    value={kindCounts.vowel}
                    breakdownData={kindByState.vowel}
                    colorMap={STATE_COLORS}
                />
                <StatCard
                    label="Suffixes"
                    value={kindCounts.suffix}
                    breakdownData={kindByState.suffix}
                    colorMap={STATE_COLORS}
                />
            </div>

            <Legend items={[
                { label: 'Consonant', color: KIND_COLORS.consonant },
                { label: 'Vowel', color: KIND_COLORS.vowel },
                { label: 'Suffix', color: KIND_COLORS.suffix },
            ]} />
            <div className="stats-grid">
                <StatCard
                    label="New Cards"
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

            <ReviewForecast forecastData={forecastData} maxCount={maxCount} />
        </div>
    )
}

export default StatsView
