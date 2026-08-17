# Sudoku Field Sheet

A Sudoku app built with Node.js, TypeScript, React and webpack (no Vite).

## Features

- **Random puzzle generator** — builds a full valid solved board, then removes
  cells while checking (via a solution-counting backtracking solver) that the
  puzzle still has exactly one solution.
- **Difficulty levels 1–5**, from 46 starting clues (Easy) down to 24 (Expert).
- **1–9 number picker per cell** — every open cell has a custom popover picker
  (not a native `<select>`, for reliable positioning). Any digit already
  present in that cell's row, column, or 3×3 block is automatically
  **disabled**, so you can only pick numbers that are still legal there.
- Check-solution, reset, and new-puzzle controls, plus a live fill count.

## Getting started

```bash
npm install
npm start
```

This runs `webpack serve` and opens the app at http://localhost:3000.

## Build for production

```bash
npm run build
```

Outputs a static bundle to `dist/`.

## Deploying to GitHub Pages

This is a fully static, client-side app, so it deploys cleanly to GitHub Pages. Two ways to do it:

### Option A — one-off manual deploy

```bash
npm run deploy
```

This runs `npm run build` then publishes the `dist/` folder to a `gh-pages`
branch (via the `gh-pages` package already listed in `devDependencies`).
Then in your repo settings → Pages, set the source to the `gh-pages` branch.
Your app will be live at `https://<username>.github.io/<repo-name>/`.

### Option B — automatic deploy on every push

A workflow is already included at `.github/workflows/deploy.yml`. It builds
the app and publishes it via GitHub's official Pages Actions whenever you
push to `main`. To enable it:

1. Push this repo to GitHub.
2. In repo settings → Pages, set **Source** to **GitHub Actions**.
3. Push to `main` — the workflow builds and deploys automatically.

Either way, `webpack.config.js` uses `output.publicPath: 'auto'`, so the
build works whether it's served from the site root or from a repo subpath
like `/sudoku-app/` — no manual path configuration needed.

## Project structure

```
webpack.config.js -> webpack build/dev-server config
public/index.html -> HTML template (html-webpack-plugin injects the bundle)
src/
  sudoku.ts        -> generator, solver, and conflict-checking logic (framework-free)
  NumberPicker.tsx -> custom 1-9 popover picker component
  App.tsx          -> board UI, level selector
  App.css          -> styling
  index.tsx        -> React entry point
```

## How the generator keeps puzzles solvable

1. `generateSolvedBoard()` fills a full 9×9 grid with a randomized
   backtracking solver.
2. `carvePuzzle()` removes cells one at a time, in random order, up to the
   clue target for the chosen level. After each removal it re-solves the
   board with `countSolutions(board, 2)` (capped at 2 for speed) — if the
   puzzle no longer has exactly one solution, the cell is put back.

## Code style

Indentation is tabs. Every `{` and `}` sits on its own line (Allman-style
braces), including function/block bodies, object and array literals, and
JSX expression containers.
