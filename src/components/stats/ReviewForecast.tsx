import { ForecastItem } from './useStats'

const KIND_COLORS = {
    consonant: '#3b82f6', // blue-500
    vowel: '#10b981',     // emerald-500
    suffix: '#f59e0b',    // amber-500
}

interface ReviewForecastProps {
    forecastData: ForecastItem[];
    maxCount: number;
    periodLabel: string;
}

export const ReviewForecast = ({ forecastData, maxCount, periodLabel }: ReviewForecastProps) => {
    const count = forecastData.length
    
    const getGap = (c: number) => {
        if (c > 90) return 1
        if (c > 30) return 2
        if (c > 14) return 3
        return 6
    }
    const gap = getGap(count)
    
    const showLabel = (index: number) => {
        if (count <= 14) return true
        if (count <= 30) return index % 5 === 0
        // For weekly bins (e.g. 52 weeks for a year), show every 4th week (approx monthly)
        if (count <= 60) return index % 4 === 0
        return index % 10 === 0
    }

    const showValue = count <= 30

    return (
        <div className="chart-container">
            <div className="chart-title">Review Forecast ({periodLabel})</div>
            <div className="bar-chart" style={{ gap: `${gap}px` }}>
                {forecastData.map((day, index) => (
                    <div key={index} className="bar-column">
                        <div className="bar-value">{showValue && day.count > 0 ? day.count : ''}</div>
                        <div
                            className="bar"
                            style={{
                                height: `${(day.count / maxCount) * 100}%`,
                                opacity: day.count > 0 ? 1 : 0.3,
                                display: 'flex',
                                flexDirection: 'column-reverse',
                                backgroundColor: day.count > 0 ? 'transparent' : undefined,
                            }}
                            title={`${day.label}: ${day.count} cards`}
                        >
                            {day.count > 0 && (
                                <>
                                    {day.consonant > 0 && (
                                        <div style={{ height: `${(day.consonant / day.count) * 100}%`, backgroundColor: KIND_COLORS.consonant, width: '100%' }} title={`Consonant: ${day.consonant}`} />
                                    )}
                                    {day.vowel > 0 && (
                                        <div style={{ height: `${(day.vowel / day.count) * 100}%`, backgroundColor: KIND_COLORS.vowel, width: '100%' }} title={`Vowel: ${day.vowel}`} />
                                    )}
                                    {day.suffix > 0 && (
                                        <div style={{ height: `${(day.suffix / day.count) * 100}%`, backgroundColor: KIND_COLORS.suffix, width: '100%' }} title={`Suffix: ${day.suffix}`} />
                                    )}
                                </>
                            )}
                        </div>
                        <div className="bar-label">{showLabel(index) ? day.label : ''}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
