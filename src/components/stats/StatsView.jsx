import { State } from 'ts-fsrs'
import { KIND_COLORS, STATE_COLORS, KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX } from '../../constants'
import './StatsView.css'
import { Legend, StatCard } from './StatsComponents'
import { ReviewForecast } from './ReviewForecast'
import { useStats } from './useStats'

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
            </div>

            <Legend items={[
                { label: 'Consonant', color: KIND_COLORS[KIND_CONSONANT] },
                { label: 'Vowel', color: KIND_COLORS[KIND_VOWEL] },
                { label: 'Suffix', color: KIND_COLORS[KIND_SUFFIX] },
            ]} />
            <div className="panel-grid">
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
