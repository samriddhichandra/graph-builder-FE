# App Graph Builder

A responsive React application for viewing and editing a small service dependency graph. Built with React Flow, TanStack Query, and Zustand.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Architecture Decisions](#architecture-decisions)
- [Feature Checklist](#feature-checklist)
- [Known Limitations](#known-limitations)
- [Error Testing](#error-testing)

---

## Overview

App Graph Builder starts from a landing page and opens into a builder workspace with a top bar, left rail, React Flow canvas, app panel, and node inspector. It loads mock service graphs for three apps (`supertokens-golang`, `supertokens-java`, `supertokens-python`) and lets users explore, edit, and interact with service dependency graphs in real time.

## Demo Images

![App Graph Builder Screenshot 1](./Screenshot 2026-06-14 160417.png)

![App Graph Builder Screenshot 2](./Screenshot 2026-06-14 160438.png)

![App Graph Builder Screenshot 3](./Screenshot 2026-06-14 160444.png)

![App Graph Builder Screenshot 4](./Screenshot 2026-06-14 160610.png)

![App Graph Builder Screenshot 5](./Screenshot 2026-06-14 160628.png)

![App Graph Builder Architecture](./app_graph_builder_architecture.png)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (`strict: true`) |
| Graph Canvas | React Flow / xyflow |
| Server State | TanStack Query |
| Client State | Zustand |
| Styling | Tailwind CSS + local shadcn-style primitives |
| Mocking | Promise-based mock API + MSW handlers |
| Linting | ESLint (React + TypeScript rules) |

---

## Project Structure

```
public/                  Static assets
src/
  assets/                Local assets (icons, images)
  components/ui/         Reusable UI primitives (Button, Tabs, Badge, Slider)
  lib/                   Shared utilities and helpers
  mocks/
    api.ts               Promise-based mock API client
    fixtures.ts          Static mock data (apps and graphs)
    handlers.ts          MSW request handlers (for extension)
  App.css                Component-scoped styles
  App.tsx                Main builder implementation
  index.css              Global styles and Tailwind entry
  main.tsx               React entry point
index.html               Vite HTML shell
package.json             Dependencies and scripts
tsconfig.app.json        TypeScript config (strict mode enabled)
tsconfig.json            Root TypeScript config
vite.config.ts           Vite configuration
eslint.config.js         ESLint configuration
```

---

## Getting Started

**Prerequisites:** Node.js 18+ and npm.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run typecheck` | Run `tsc --noEmit` without building |

---

## Architecture Decisions

### State ownership

The project draws a clear boundary between server state and UI state:

- **TanStack Query** owns all mock server data — the `GET /apps` and `GET /apps/:appId/graph` queries. Selecting a different app changes the query key and triggers a fresh fetch. Query results are cached by `[appId, errorMode]`.
- **Zustand** owns local UI state only: selected app, selected node, active inspector tab, mobile drawer open/close, theme, and test error mode. It does not cache or replicate server data.
- **React Flow** state (`useNodesState`, `useEdgesState`) is kept local to the canvas component to preserve predictable node and edge mutations.

### Mock API

The running app uses a promise-based mock API (`src/mocks/api.ts`) with simulated network latency. MSW handlers are included in `src/mocks/handlers.ts` for teams that prefer intercepting real `fetch` calls during development or testing.

### Routing and layout

A landing page is included before the builder workspace. Opening the workspace plays a short buffer transition to avoid a jarring layout flash when React Flow initialises.

### Theming

The dark theme uses a graphite, teal, and amber palette — deliberately avoiding the default blue-black dashboard aesthetic common in off-the-shelf component libraries.

### Responsive layout

The right panel becomes a slide-over drawer on viewports narrower than 900 px, managed via the Zustand drawer state.

---

## Feature Checklist

| Feature | Status | Notes |
|---|---|---|
| React + Vite | ✅ | Vite app with React entry in `src/main.tsx` |
| TypeScript strict mode | ✅ | `strict: true` in `tsconfig.app.json` |
| React Flow canvas | ✅ | `@xyflow/react` with dotted background grid |
| TanStack Query | ✅ | Mock app and graph data via `useQuery` |
| Zustand store | ✅ | Selected app, node, tab, drawer, theme, error mode |
| Mock API | ✅ | Promise-based client; MSW handlers also included |
| Top bar | ✅ | Title, search, test error, theme, notifications, panel toggle, add service |
| Left rail | ✅ | Icon-style navigation (static placeholder) |
| Right app panel | ✅ | App selector/list and node inspector |
| 3+ nodes, 2+ edges per graph | ✅ | All mock graphs satisfy the minimum |
| Drag nodes | ✅ | React Flow default drag behaviour |
| Select node | ✅ | Click opens or updates the inspector |
| Delete selected node | ✅ | Delete / Backspace removes node and clears selection |
| Zoom and pan | ✅ | React Flow defaults + controls widget |
| Fit view | ✅ | Initial `fitView` on load; `F` shortcut re-fits |
| Status pill | ✅ | Healthy, Degraded, and Down badges |
| Inspector tabs | ✅ | Config and Runtime tabs |
| Synced slider + number input | ✅ | CPU value stays in sync; persists into node data |
| Editable node name | ✅ | Config tab input updates React Flow node data |
| Description textarea | ✅ | Optional field on the Config tab |
| Loading state | ✅ | Panel shown while mock data resolves |
| Error state | ✅ | Test error button simulates failure; retry resets |
| Query caching | ✅ | Keyed by `[appId, errorMode]` |
| App-change refetch | ✅ | Changing the selected app updates the query key |
| Mobile drawer | ✅ | Right panel becomes a slide-over below 900 px |
| Required scripts | ✅ | `dev`, `build`, `preview`, `lint`, `typecheck` |
| ESLint (React + TS) | ✅ | Configured in `eslint.config.js` |

---

## Known Limitations

- Most UI code lives in `App.tsx`. For a larger codebase, `TopBar`, `GraphCanvas`, `AppPanel`, and `NodeInspector` should be extracted into separate files.
- Mock data is in-memory and resets on page refresh — added nodes are not persisted.
- The left rail is a static navigation placeholder with no routing.
- MSW handlers exist but the app defaults to the simpler promise-based mock path. To switch to MSW, initialise the service worker in `main.tsx` and remove the direct mock API calls.
- UI primitives are small local components modelled after shadcn; this is not a full shadcn install.

---

## Error Testing

Click **Test error** in the top bar to force mock API requests to fail. The app will show the error state with a retry option. Clicking **Retry** clears the error mode flag in Zustand and triggers a fresh TanStack Query refetch.
