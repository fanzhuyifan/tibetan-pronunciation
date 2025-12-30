export const storageAvailable = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export const formatTime = (seconds) => {
    if (seconds <= 0) return 'Now'
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = seconds / 60
    if (minutes < 60) return `${Math.round(minutes)}m`
    const hours = minutes / 60
    if (hours < 24) return `${Math.round(hours)}h`
    const days = hours / 24
    if (days < 30) return `${Math.round(days)}d`
    const months = days / 30
    if (months < 12) return `${Math.round(months)}mo`
    const years = days / 365
    return `${Math.round(years)}y`
}
