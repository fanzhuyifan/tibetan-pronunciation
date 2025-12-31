import { State } from 'ts-fsrs'

export const useStats = (cards) => {
    const now = new Date()
    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

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

    const counts = new Map()

    cards.forEach((card, id) => {
        stateCounts[card.state] = (stateCounts[card.state] || 0) + 1

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

        const dayCounts = counts.get(key) || { total: 0, consonant: 0, vowel: 0, suffix: 0 }
        dayCounts.total++
        if (dayCounts[kind] !== undefined) {
            dayCounts[kind]++
        }
        counts.set(key, dayCounts)
    })

    const forecastData = []
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

    for (let i = 0; i < 14; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const key = d.getTime()
        const dayCounts = counts.get(key) || { total: 0, consonant: 0, vowel: 0, suffix: 0 }

        let label
        if (i < 2) {
            const val = rtf.format(i, 'day')
            label = val.charAt(0).toUpperCase() + val.slice(1)
        } else {
            label = d.toLocaleDateString(undefined, { weekday: 'short' })
        }

        forecastData.push({
            date: d,
            count: dayCounts.total,
            consonant: dayCounts.consonant,
            vowel: dayCounts.vowel,
            suffix: dayCounts.suffix,
            label,
        })
    }

    const maxCount = Math.max(...forecastData.map((d) => d.count), 1)

    return {
        stateCounts,
        kindCounts,
        stateByKind,
        kindByState,
        forecastData,
        maxCount
    }
}
