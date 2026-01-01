import { KIND_LABELS } from '../constants'

export const BrowseToolbar = ({ kindFilter, setKindFilter, kindCounts, totalCount, filteredCount }) => {
    return (
        <div className="panel-header">
            <div>
                <div className="panel-title">Browse cards</div>
                <p className="panel-subtitle">Inspect every consonant, vowel, and suffix.</p>
            </div>
            <div className="browse-actions">
                <div className="browse-filters" role="group" aria-label="Filter by card kind">
                    {['all', 'consonant', 'vowel', 'suffix'].map((kind) => (
                        <button
                            key={kind}
                            type="button"
                            className={`btn browse-filter ${kindFilter === kind ? 'is-active' : ''}`}
                            onClick={() => setKindFilter(kind)}
                        >
                            {kind === 'all' ? 'All' : KIND_LABELS[kind] || 'Unknown'}
                            <span className="filter-count">{kindCounts[kind] ?? 0}</span>
                        </button>
                    ))}
                </div>
                <div className="browse-count">{filteredCount} shown / {totalCount} total</div>
            </div>
        </div>
    )
}
