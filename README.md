# Tax Loss Harvesting (Dashboard)

A compact React + TypeScript dashboard that demonstrates tax-loss-harvesting UX: search, sorting, expandable rows, dark mode, and harvesting suggestions. This repository is a Vite + React app intended as a frontend demo/prototype.

---

## Setup (Quick Start)

Prerequisites:
- Node.js 18.x (LTS) or newer
- npm 9.x (bundled with Node) or yarn

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

Open http://localhost:5173 in your browser (Vite default).

3. Build for production

```bash
npm run build
npm run preview
```

4. Lint (optional)

```bash
npm run lint
```

---

## Assumptions & Notes

- The app uses mock/priced sample data returned by local hooks (`useHoldings`, `useCapitalGains`). There is no backend integration included.
- Tested on Windows (development environment in this workspace). Cross-platform (macOS/Linux) should work with Node 18+.
- Browser support: modern evergreen browsers (Chrome, Edge, Firefox, Safari).
- The UI changes in this branch include: improved dark-mode contrast, smooth transitions (200–300ms), client-side sorting (Current Price, STCG, LTCG), debounced search (300ms), loading indicators for "See More", harvest highlighting (badge + border), and an expandable Pre-Harvest card.

---

## Troubleshooting

- If the dev server doesn't start, check your Node version: run `node -v` and ensure it's >=18. If ports are busy, Vite will prompt to use a different port.
- If styles look broken, ensure the CSS modules are loading and that you're running the dev server (Vite handles HMR).

---

If you'd like, I can add example screenshots to the repo (you can provide images) or wire up a small seed script to regenerate mock holdings.
