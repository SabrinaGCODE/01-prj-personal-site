# Personal Site (Vite + Three.js)

This project is a personal portfolio site for Sabrina Garcia. It uses Vite for local development/build tooling and Three.js for the interactive 3D showcase section.

## Features

- Responsive hero/about/projects layout
- Accessible semantic structure and focus-visible states
- Lazy-loaded Three.js scene for better initial performance
- GLB model loading with automatic fallback 3D mesh when no model file is present
- Reduced-motion and tab-visibility safeguards for smoother rendering behavior

## Project Structure

- `index.html` - page structure and section content
- `style.css` - responsive styles and design tokens
- `src/main.js` - app bootstrap and lazy-loading logic
- `src/three/scene.js` - Three.js scene setup and runtime behavior
- `public/models/` - place your `showcase.glb` model here

## Prerequisites

- Node.js 20+ recommended
- npm (comes with Node.js)

## Local Development

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Open the local URL shown by Vite (usually `http://localhost:5173`)

## Production Build

1. Build:
   - `npm run build`
2. Preview build locally:
   - `npm run preview`

## Adding Your 3D Model

1. Export or download a `.glb` model.
2. Place it at:
   - `public/models/showcase.glb`
3. Reload the page. The 3D section will load your model automatically.
