import { State } from 'ts-fsrs'
import './StatsView.css'

function StatsView({ cards }) {
    const now = new Date()
    const cardList = Array.from(cards.values())

    const stateCounts = {
        [State.New]: 0,
        [State.Learning]: 0,
        [State.Review]: 0,
        [State.Relearning]: 0,
    }

    // Forecast calculation
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    const counts = new Map()

    cardList.forEach((card) => {
        stateCounts[card.state] = (stateCounts[card.state] || 0) + 1

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
                <div className="stat-card">
                    <div className="stat-label">New Cards</div>
                    <div className="stat-value">{stateCounts[State.New]}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Learning</div>
                    <div className="stat-value">{stateCounts[State.Learning]}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Review</div>
                    <div className="stat-value">{stateCounts[State.Review]}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Relearning</div>
                    <div className="stat-value">{stateCounts[State.Relearning]}</div>
                </div>
            </div>

            <div className="chart-container">
                <div className="chart-title">Review Forecast (14 Days)</div>
                <div className="bar-chart">
                    {forecastData.map((day, index) => (
                        <div key={index} className="bar-column">
                            <div className="bar-value">{day.count > 0 ? day.count : ''}</div>
                            <div
                                className="bar"
                                style={{
                                    height: `${(day.count / maxCount) * 100}%`,
                                    opacity: day.count > 0 ? 1 : 0.3,
                                }}
                            ></div>
                            <div className="bar-label">{day.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default StatsView
