import { State } from 'ts-fsrs'
import './StatsView.css'
import { Legend, StatCard } from './components/stats/StatsComponents'
import { ReviewForecast } from './components/stats/ReviewForecast'

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
    const now = new Date()

    const stateCounts = {
        [State.New]: 0,
        [State.Learning]: 0,
        [State.Review]: 0,
        [State.Relearning]: 0,
    }

    const kindCounts = {
        consonant: 0,
        vowel: 0,
        suffix: 0,
    }

    const stateByKind = {
        [State.New]: { consonant: 0, vowel: 0, suffix: 0 },
        [State.Learning]: { consonant: 0, vowel: 0, suffix: 0 },
        [State.Review]: { consonant: 0, vowel: 0, suffix: 0 },
        [State.Relearning]: { consonant: 0, vowel: 0, suffix: 0 },
    }

    const kindByState = {
        consonant: { [State.New]: 0, [State.Learning]: 0, [State.Review]: 0, [State.Relearning]: 0 },
        vowel: { [State.New]: 0, [State.Learning]: 0, [State.Review]: 0, [State.Relearning]: 0 },
        suffix: { [State.New]: 0, [State.Learning]: 0, [State.Review]: 0, [State.Relearning]: 0 },
    }

    // Forecast calculation
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const counts = new Map()

    cards.forEach((card, id) => {
        stateCounts[card.state] = (stateCounts[card.state] || 0) + 1

        // Count by kind
        const [kind] = id.split(':')
        if (kindCounts[kind] !== undefined) {
            kindCounts[kind]++

            if (stateByKind[card.state]) {
                stateByKind[card.state][kind] = (stateByKind[card.state][kind] || 0) + 1
            }
            if (kindByState[kind]) {
                kindByState[kind][card.state] = (kindByState[kind][card.state] || 0) + 1
            }
        }

        let due = new Date(card.due)
        if (due < now) due = now

        const d = new Date(due)
        d.setHours(0, 0, 0, 0)
        const key = d.getTime()
        counts.set(key, (counts.get(key) || 0) + 1)
    })

    const forecastData = []
    for (let i = 0; i < 14; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const key = d.getTime()
        forecastData.push({
            date: d,
            count: counts.get(key) || 0,
            label: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString(undefined, { weekday: 'short' }),
        })
    }

    const maxCount = Math.max(...forecastData.map((d) => d.count), 1)

    return (
        <div className="stats-panel">
            <div className="stats-header">
                <div>
                    <div className="stats-title">Deck Stats</div>
                    <p className="stats-subtitle">Current status of your cards.</p>
                </div>
            </div>

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
            <Legend items={[
                { label: 'Consonant', color: KIND_COLORS.consonant },
                { label: 'Vowel', color: KIND_COLORS.vowel },
                { label: 'Suffix', color: KIND_COLORS.suffix },
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
                { label: 'New', color: STATE_COLORS[State.New] },
                { label: 'Learning', color: STATE_COLORS[State.Learning] },
                { label: 'Review', color: STATE_COLORS[State.Review] },
                { label: 'Relearning', color: STATE_COLORS[State.Relearning] },
            ]} />

            <ReviewForecast forecastData={forecastData} maxCount={maxCount} />
        </div>
    )
}

export default StatsView
