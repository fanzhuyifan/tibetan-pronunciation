import './HelpView.css'

const ratingShortcuts = [
    {
        title: 'Reveal answer',
        keys: ['Space', 'Enter'],
        detail: '',
    },
    {
        title: 'Again',
        keys: ['1'],
        detail: 'Incorrect answer.',
    },
    {
        title: 'Hard',
        keys: ['2'],
        detail: 'Correct but difficult recall.',
    },
    {
        title: 'Good',
        keys: ['3', 'Space', 'Enter'],
        detail: 'Solid recall.',
    },
    {
        title: 'Easy',
        keys: ['4'],
        detail: 'Effortless recall.',
    },
]

function HelpView() {
    return (
        <main className="help-panel">
            <header className="help-header">
                <div>
                    <p className="help-subtitle">
                        Tibetan syllable pronunciation trainer is meant to be used with <a href="https://www.youtube.com/playlist?list=PLT2AXPGuqkXewc0Yvy9LJhyt_HvFSHKtA" target="_blank" rel="noreferrer">this youtube tutorial</a>.

                    </p>
                </div>
            </header>

            <section className="help-section">
                <div className="help-section-header">
                    <h2>Ratings and shortcuts</h2>
                </div>
                <div className="help-grid">
                    {ratingShortcuts.map((item) => (
                        <article key={item.title} className="help-card rating-card">
                            <div className="shortcut-keys">
                                {item.keys.map((key) => (
                                    <span key={key} className="keycap" aria-label={`Shortcut key ${key}`}>
                                        {key}
                                    </span>
                                ))}
                            </div>
                            <div className="shortcut-body">
                                <div className="rating-title">{item.title}</div>
                                <p className="rating-detail">{item.detail}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}

export default HelpView
