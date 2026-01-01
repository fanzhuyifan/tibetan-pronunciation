import { KIND_LABELS } from '../constants'

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
