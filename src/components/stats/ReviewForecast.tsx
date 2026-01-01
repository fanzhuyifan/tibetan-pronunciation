import React from 'react'
import { ForecastItem } from './useStats'

const KIND_COLORS = {
    consonant: '#3b82f6', // blue-500
    vowel: '#10b981',     // emerald-500
    suffix: '#f59e0b',    // amber-500
}

interface ReviewForecastProps {
    forecastData: ForecastItem[];
    maxCount: number;
}

export const ReviewForecast = ({ forecastData, maxCount }: ReviewForecastProps) => {
    return (
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
                                display: 'flex',
                                flexDirection: 'column-reverse',
                                backgroundColor: day.count > 0 ? 'transparent' : undefined,
                            }}
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
                        <div className="bar-label">{day.label}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
