import './TrainingBanner.css'

function TrainingBanner({ newCardsToLearn = 0, reviewsDue = 0, learningCardsDue = 0, onChangeNewCards }) {
    const handleChange = (event) => {
        const next = parseInt(event.target.value, 10)
        const safeValue = Number.isFinite(next) && next >= 0 ? next : 0
        if (onChangeNewCards) {
            onChangeNewCards(safeValue)
        }
    }

    return (
        <div className="training-banner" aria-label="Training stats">
            <div className="banner-pill">
                <div className="pill-label">New cards to learn</div>
                <input
                    className="pill-input"
                    type="number"
                    min="0"
                    step="1"
                    value={newCardsToLearn ?? 0}
                    onChange={handleChange}
                    aria-label="Set number of new cards to learn"
                />
            </div>
            <div className="banner-pill">
                <div className="pill-label">Learning due</div>
                <div className="pill-value">{learningCardsDue ?? 0}</div>
            </div>
            <div className="banner-pill">
                <div className="pill-label">Reviews due</div>
                <div className="pill-value">{reviewsDue ?? 0}</div>
            </div>
        </div>
    )
}

export default TrainingBanner
