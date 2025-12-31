import { useState } from 'react'
import './App.css'

import { useFsrsDeck } from './hooks/useFsrsDeck'
import TrainingView from './components/training/TrainingView'
import StatsView from './components/stats/StatsView'
import BrowseView from './components/BrowseView'
import HelpView from './components/HelpView'

const VIEW_TRAINING = 'training'
const VIEW_STATS = 'stats'
const VIEW_BROWSE = 'browse'
const VIEW_HELP = 'help'

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
          <button
            className={view === VIEW_HELP ? 'active' : ''}
            onClick={() => setView(VIEW_HELP)}
          >
            Help
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
            case VIEW_HELP:
              return <HelpView />
            default:
              return null
          }
        })()
      }
    </div>
  )
}

export default App
