## Tibetan Practice Web

Interactive Tibetan syllable trainer built with React + Vite. The app helps practice consonants, vowels, and suffixes using FSRS-based spaced repetition, browsing, and inline reference details.

### Features
- Training view with reveal/rate flow and YAML import/export of progress.
- Browse view with filters and per-card details (consonant, vowel, suffix metadata).
- Stats dashboard (reviews due, stability/difficulty forecasts).
- Shared pronunciation utilities and syllable builder for consistent rendering.

### Getting started
```bash
npm install
npm run dev    # start Vite dev server
npm run build  # production build
npm run lint   # eslint
npm test       # vitest tests
```

### Key modules
- `src/tibetanSyllable.js` / `src/utils/pronunciation.js`: build Tibetan syllables, apply tones, vowel/suffix adjustments.
- `src/hooks/useFsrsDeck.js`: deck state and FSRS scheduling.
- `src/components/training/*`: training flow, flashcards, component details.
- `src/components/BrowseView.jsx`: browse/filter cards with per-card detail view.
- `src/components/stats/*`: stats and forecasts.

### Data
- Tibetan consonant, vowel, and suffix metadata live in `src/data/` (YAML + bundled JS).

### Testing
- Unit tests for syllable logic and FSRS hook live in `src/tibetanSyllable.test.js` and `src/hooks/useFsrsDeck.test.js`.
