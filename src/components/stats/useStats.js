import { State } from 'ts-fsrs'
import { KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX } from '../../constants'
import { parseCardId } from '../../utils'

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
        [KIND_CONSONANT]: 0,
        [KIND_VOWEL]: 0,
        [KIND_SUFFIX]: 0,
    }

    const stateByKind = {
        [State.New]: { [KIND_CONSONANT]: 0, [KIND_VOWEL]: 0, [KIND_SUFFIX]: 0 },
        [State.Learning]: { [KIND_CONSONANT]: 0, [KIND_VOWEL]: 0, [KIND_SUFFIX]: 0 },
        [State.Review]: { [KIND_CONSONANT]: 0, [KIND_VOWEL]: 0, [KIND_SUFFIX]: 0 },
        [State.Relearning]: { [KIND_CONSONANT]: 0, [KIND_VOWEL]: 0, [KIND_SUFFIX]: 0 },
    }

    const kindByState = {
        [KIND_CONSONANT]: { [State.New]: 0, [State.Learning]: 0, [State.Review]: 0, [State.Relearning]: 0 },
        [KIND_VOWEL]: { [State.New]: 0, [State.Learning]: 0, [State.Review]: 0, [State.Relearning]: 0 },
        [KIND_SUFFIX]: { [State.New]: 0, [State.Learning]: 0, [State.Review]: 0, [State.Relearning]: 0 },
    }

    const counts = new Map()

    cards.forEach((card, id) => {
        stateCounts[card.state] = (stateCounts[card.state] || 0) + 1

        const { kind } = parseCardId(id)
        if (kindCounts[kind] !== undefined) {
            kindCounts[kind]++

            if (stateByKind[card.state]) {
                stateByKind[card.state][kind] = (stateByKind[card.state][kind] || 0) + 1
            }
            if (kindByState[kind]) {
                kindByState[kind][card.state] = (kindByState[kind][card.state] || 0) + 1
            }
        }

        if (card.state != State.New) {
            let due = new Date(card.due)
            if (due < now) due = now

            const d = new Date(due)
            d.setHours(0, 0, 0, 0)
            const key = d.getTime()

            const dayCounts = counts.get(key) || { total: 0, [KIND_CONSONANT]: 0, [KIND_VOWEL]: 0, [KIND_SUFFIX]: 0 }
            dayCounts.total++
            if (dayCounts[kind] !== undefined) {
                dayCounts[kind]++
            }
            counts.set(key, dayCounts)
        }
    })

    const forecastData = []
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

    for (let i = 0; i < 14; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const key = d.getTime()
        const dayCounts = counts.get(key) || { total: 0, [KIND_CONSONANT]: 0, [KIND_VOWEL]: 0, [KIND_SUFFIX]: 0 }

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
            consonant: dayCounts[KIND_CONSONANT],
            vowel: dayCounts[KIND_VOWEL],
            suffix: dayCounts[KIND_SUFFIX],
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
