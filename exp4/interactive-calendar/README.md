# Interactive Calendar — Post Scheduler

A frontend-only React app for scheduling posts across platforms, with a built-in
demonstration of React performance optimizations (React.memo, useMemo, useCallback)
and a render counter that makes the impact visible.

## Stack

- React 18 + Vite
- Redux Toolkit + react-redux
- FullCalendar (daygrid, timegrid, interaction)
- Vitest + Testing Library + jsdom

## Folder Structure

```
interactive-calendar/
├── src/
│   ├── components/
│   │   ├── Calendar.jsx
│   │   ├── PostForm.jsx
│   │   ├── PostCard.jsx
│   │   ├── RenderCounter.jsx
│   │   └── PerformancePanel.jsx
│   ├── store/
│   │   ├── store.js
│   │   └── postSlice.js
│   ├── tests/
│   │   └── Calendar.test.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## Features

- 5 sample posts loaded on first run, persisted to localStorage.
- Three-column dashboard: PostForm (left), Calendar (center), PerformancePanel (right).
- Add / edit / delete posts.
- Drag-and-drop events on the calendar to reschedule — dispatches `reschedulePost`
  and persists to localStorage.
- Optimization toggle in the top-right switches between:
  - **ON** — PostCard wrapped in React.memo, Calendar events memoized with useMemo,
    handlers stabilized with useCallback.
  - **OFF** — plain components, inline events, fresh handlers every render.
- Live render counts for App / Calendar / PostCard, visibly climbing faster
  when optimization is off.

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # runs vitest suite
npm run build   # production build
```