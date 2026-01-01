import { State, Card } from 'ts-fsrs'
import { STATE_COLORS, KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX } from '../../constants'
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
        stateByKind,
        kindByState,
        forecastData,
        maxCount
    } = useStats(cards)

    return (
        <div className="panel">
            <div className="panel-header">
                <div>
                    <div className="panel-title">Deck Stats</div>
                    <p className="panel-subtitle">Current status of your cards.</p>
                </div>
            </div>

            <Legend items={[
                { label: 'New', color: STATE_COLORS[State.New] },
                { label: 'Learning', color: STATE_COLORS[State.Learning] },
                { label: 'Review', color: STATE_COLORS[State.Review] },
                { label: 'Relearning', color: STATE_COLORS[State.Relearning] },
            ]} />
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

            <div style={{ marginTop: '2rem' }}>
                <ReviewForecast forecastData={forecastData} maxCount={maxCount} />
            </div>
        </div>
    )
}

export default StatsView
