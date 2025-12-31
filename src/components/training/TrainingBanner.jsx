import ExportIcon from './icons/ExportIcon'
import ImportIcon from './icons/ImportIcon'
import './TrainingBanner.css'

function TrainingBanner({
    newCardsToLearn = 0,
    reviewsDue = 0,
    learningCardsDue = 0,
    onImportClick,
    onExportClick,
}) {
    const safeNewCardsValue = Number.isFinite(newCardsToLearn) ? newCardsToLearn : 0

    return (
        <div className="training-banner" aria-label="Training stats">
            <div className="banner-row banner-row--labels">
                <button
                    className="secondary icon-button io-button"
                    onClick={onImportClick}
                    type="button"
                    aria-label="Import YAML"
                    title="Import YAML"
                >
                    <ImportIcon />
                </button>
                <div className="banner-label">New</div>
                <div className="banner-label">Learning</div>
                <div className="banner-label">Review</div>
            </div>

            <div className="banner-row banner-row--values">
                <button
                    className="secondary icon-button io-button"
                    onClick={onExportClick}
                    type="button"
                    aria-label="Export YAML"
                    title="Export YAML"
                >
                    <ExportIcon />
                </button>

                <div className="pill-value" aria-label="New cards planned">
                    {safeNewCardsValue}
                </div>

                <div className="pill-value" aria-label="Learning cards due">
                    {learningCardsDue ?? 0}
                </div>

                <div className="pill-value" aria-label="Review cards due">
                    {reviewsDue ?? 0}
                </div>
            </div>
        </div>
    )
}

export default TrainingBanner
