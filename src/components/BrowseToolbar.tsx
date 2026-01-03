import { KIND_LABELS, KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX, KIND_SECOND_SUFFIX } from '../constants'

interface BrowseToolbarProps {
    kindFilter: string;
    setKindFilter: (kind: string) => void;
    kindCounts: Record<string, number>;
    totalCount: number;
    filteredCount: number;
}

export const BrowseToolbar = ({ kindFilter, setKindFilter, kindCounts, totalCount, filteredCount }: BrowseToolbarProps) => {
    return (
        <div className="panel-header">
            <div>
                <div className="panel-title">Browse cards</div>
            </div>
            <div className="browse-actions">
                <div className="browse-filters" role="group" aria-label="Filter by card kind">
                    {['all', KIND_CONSONANT, KIND_VOWEL, KIND_SUFFIX, KIND_SECOND_SUFFIX].map((kind) => (
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
