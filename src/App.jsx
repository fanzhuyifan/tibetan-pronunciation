import { useState } from 'react'
import './App.css'

import { useFsrsDeck } from './hooks/useFsrsDeck'
import TrainingView from './components/training/TrainingView'
import StatsView from './StatsView'
import BrowseView from './BrowseView'

const VIEW_TRAINING = 'training'
const VIEW_STATS = 'stats'
const VIEW_BROWSE = 'browse'

function App() {
  const [view, setView] = useState(VIEW_TRAINING)
  const deck = useFsrsDeck()

  return (
    <div className="page">
      <div className="topnav">
        <div className="nav-actions">
          <button
            className={view === VIEW_TRAINING ? 'active' : ''}
            onClick={() => setView(VIEW_TRAINING)}
          >
            Training
          </button>
          <button
            className={view === VIEW_STATS ? 'active' : ''}
            onClick={() => setView(VIEW_STATS)}
          >
            Stats
          </button>
          <button
            className={view === VIEW_BROWSE ? 'active' : ''}
            onClick={() => setView(VIEW_BROWSE)}
          >
            Browse
          </button>
        </div>
      </div>

      {
        (() => {
          switch (view) {
            case VIEW_TRAINING:
              return <TrainingView deck={deck} />
            case VIEW_STATS:
              return <StatsView cards={deck.stateCards} />
            case VIEW_BROWSE:
              return <BrowseView cards={deck.stateCards} />
            default:
              return null
          }
        })()
      }
    </div>
  )
}

export default App
