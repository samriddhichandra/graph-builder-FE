<<<<<<< HEAD
# graph-builder-FE
=======
# App Graph Builder

Responsive React take-home project for viewing and editing a small service graph. The app starts with a simple landing page and opens into the required builder layout with a top bar, left rail, React Flow canvas, app panel, and node inspector.

## Assignment Checklist

| Requirement | Status | Notes |
| --- | --- | --- |
| React + Vite | Done | Vite app with React entry in `src/main.tsx`. |
| TypeScript strict mode | Done | `strict: true` is enabled in `tsconfig.app.json`. |
| React Flow / xyflow | Done | Canvas uses `@xyflow/react`. |
| TanStack Query | Done | Mock app and graph data load through `useQuery`. |
| Zustand | Done | Stores selected app, selected node, active tab, mobile drawer, theme, and test error mode. |
| Mock API calls | Done | Promise-based mock API with simulated latency. MSW handlers are also included for extension. |
| Top bar | Done | Title, search, test error, theme, notifications, panel, and add service actions. |
| Left rail | Done | Static icon-style navigation. |
| Right app panel | Done | App selector/list plus node inspector. |
| Dotted React Flow canvas | Done | Uses React Flow `Background` dots. |
| Mobile drawer | Done | Right panel becomes a slide-over under 900px. |
| 3 nodes and 2 edges | Done | Each mock app graph has at least 3 nodes and 2 edges. |
| Drag nodes | Done | React Flow default node dragging. |
| Select node | Done | Clicking a node opens/updates the inspector. |
| Delete selected node | Done | Delete/Backspace removes nodes and clears selected node state. |
| Zoom and pan | Done | React Flow defaults plus controls. |
| Fit view | Done | Initial `fitView`; `F` shortcut also fits the view. |
| Status pill | Done | Healthy, Degraded, and Down badges. |
| Inspector tabs | Done | Config and Runtime tabs. |
| Synced slider and number input | Done | CPU value syncs both ways and persists into node data. |
| Editable node name | Done | Config tab input updates React Flow node data. |
| Description textarea | Done | Optional field included. |
| Loading state | Done | Loading panel appears while mock data resolves. |
| Error state | Done | `Test error` simulates failures and shows retry. |
| Query caching | Done | TanStack Query caches by app id and error mode. |
| App change refetch | Done | Selecting an app changes the graph query key. |
| Required scripts | Done | `dev`, `build`, `preview`, `lint`, and `typecheck`. |
| ESLint React + TS | Done | Configured in `eslint.config.js`. |

## Left / Known Limitations

- The project uses small shadcn-style local primitives for buttons and tabs, but it does not include a full shadcn component install for every input/badge/slider.
- Most UI code still lives in `App.tsx`; for a larger project, `TopBar`, `GraphCanvas`, `AppPanel`, and `NodeInspector` should be split into separate files.
- Mock data is in-memory and resets on refresh.
- Added nodes are local only and are not persisted to a backend.
- The left rail is static placeholder navigation.
- MSW handlers exist, but the running app uses the simpler promise-based mock API path.

## Features

- Loads mock apps: `supertokens-golang`, `supertokens-java`, and `supertokens-python`.
- Fetches app graphs through typed mock API functions with simulated latency.
- Renders draggable service nodes and edges with React Flow.
- Supports node selection, Delete/Backspace removal, zoom, pan, and fit view.
- Lets users edit node name, description, and CPU target from the inspector.
- Keeps the CPU slider and numeric input in sync.
- Includes search, status filtering, add node, and connect-node interactions.
- Shows loading and error states through TanStack Query.
- Shows a short buffer transition when opening the workspace from the landing page.
- Turns the right panel into a slide-over drawer on smaller screens.

## Tech Stack

- React + Vite
- TypeScript with `strict: true`
- React Flow / xyflow
- TanStack Query
- Zustand
- Tailwind CSS with small shadcn-style UI primitives
- ESLint
- MSW handlers included alongside the local promise-based mock API

## Project Structure

```text
public/                  Static public assets
src/
  assets/                Local assets
  components/ui/         Reusable UI primitives
  lib/                   Shared helpers
  mocks/                 Mock API client, fixtures, and MSW handlers
  App.css                Main app styles
  App.tsx                Main graph builder implementation
  index.css              Global styles and Tailwind import
  main.tsx               React entry point
index.html               Vite HTML entry
package.json             Scripts and dependencies
tsconfig*.json           TypeScript configuration
vite.config.ts           Vite configuration
```

## Setup

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open the Vite URL, usually:

```text
http://localhost:5173
```

## Scripts

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Key Decisions

- TanStack Query owns mock server data for `GET /apps` and `GET /apps/:appId/graph`.
- Zustand owns local UI state only: selected app, selected node, active inspector tab, mobile drawer, theme, and test error mode.
- React Flow state is kept predictable with `useNodesState` and `useEdgesState`.
- A landing page is included because it was requested; opening it shows a short buffer transition before mounting the builder.
- The dark theme uses a graphite, teal, and amber palette to avoid the default blue-black dashboard look.

## Error Testing

The `Test error` button makes mock API requests fail. Use it to check the loading, error, and retry flow. The retry button clears test error mode and refetches the mock data.
>>>>>>> 107176a (feat: integrate MSW mocks, dark theme, canvas grid, node styling, shortcuts)
