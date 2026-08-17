# Maryam OS portfolio

This repository contains Maryam Yahaya's retro desktop-OS portfolio.

## Start here

- Run `npm install` once.
- Run `npm run dev` for local development.
- Open the URL printed by Vite. The root `index.html` redirects to `/index-os.html`.
- Run `npm run build` before handing off or deploying.

## Source of truth

- `index-os.html` is the live portfolio. It contains the main HTML, CSS, and vanilla JavaScript.
- `index.html` is only the redirecting entry page.
- `public/images/` contains project, portrait, interest, case-study, and resume assets served by Vite at `/images/...`.
- `images/ai-builds/` contains AI-build artwork referenced directly by the portfolio.
- `src/` is an older React scaffold and is not the source of the current Maryam OS interface. Do not move work into it unless Maryam explicitly asks for a rewrite.

## Visual rules

- Preserve the pink-and-cream retro OS language and existing CSS variables.
- Use Playfair Display italic for editorial headings, the mono font for OS labels and chrome, and Tahoma/Inter for body text.
- Keep surfaces light. Do not introduce dark gradients or unrelated colours.
- Cards use inset framed images with captions underneath.
- Use one rose primary action and pale secondary actions within a window.
- Keep changes responsive and respect `prefers-reduced-motion` whenever motion is added.

## Current state

- The original About window is active.
- The About profile portrait uses a square frame with slightly rounded corners.
- A rejected About redesign remains in `index-os.html` under `#about-character-rejected`, hidden and with its style block disabled. It can be removed in a future cleanup, but it must never replace `#about` unless Maryam asks.

## Working safely

- Edit `index-os.html` carefully because it is a large monolithic file.
- Search for a window by its section ID before changing it: `welcome`, `work`, `ai-builds`, `about`, `xp`, or `contact`.
- Preserve asset paths and test project images after server changes. A plain static server will not map `public/images` correctly; use Vite.
- Do not commit `.env` files, `node_modules/`, or `dist/`.
- Preserve Maryam's existing copy unless she specifically asks for a rewrite.
