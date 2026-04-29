# Portfolio

A scroll-driven, dark-themed personal portfolio built with React + Vite +
Three.js (via `@react-three/fiber`). Six 3D scenes on a single page —
each tells a different part of the story without ever loading them all at once.

## Stack

- **Vite** + **React 18** — build tool & framework
- **three** — WebGL renderer
- **@react-three/fiber** — React renderer for Three.js
- **@react-three/drei** — helpers (`Float`, `Environment`, `Text`, `useGLTF`, …)

No router, no state library, no UI framework — plain CSS for layout and
hand-rolled hooks (`useInView`, `useMediaQuery`) for behaviour.

## Sections

| # | Section | Highlight |
|---|---------|-----------|
| 01 | **Hero**       | Wireframe torus knot, drifting motes, mouse parallax. Letter-by-letter text animation on mount. |
| 02 | **Journey**    | Scroll-driven race car following a Catmull-Rom curve along a stylized asphalt road. Experience cards cross-fade at curve checkpoints. |
| 03 | **Skills**     | Tech stack as glowing planets orbiting a wireframe core, with floating SDF text labels. |
| 04 | **Projects**   | Click-to-focus planet galaxy. Each planet has its own colour, rotating ring, and detail card. |
| 05 | **About**      | Two-column layout: bio + interactive globe with location pins (lat/lng → 3D positions on the planet model). |
| 06 | **Contact**    | Black-hole portal — accretion disc, photon ring, infalling particles — with a form floating in front. |

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build → dist/
npm run preview  # preview the built site → http://localhost:4173
```

Requires Node ≥ 20 (pinned in `package.json`).

## Project structure

```
src/
├── App.jsx          # routes the page sections + lazy-loads each one
├── main.jsx         # ReactDOM root
├── index.css        # all styling (no preprocessor)
├── hooks.js         # useInView + useMediaQuery
├── Hero3D.jsx       # 01 Hero — torus knot scene
├── Journey.jsx      # 02 Journey — scroll-driven race car
├── Skills.jsx       # 03 Skills — orbital constellation
├── Projects.jsx     # 04 Projects — planet galaxy
├── About.jsx        # 05 About — locations globe + bio
└── Contact.jsx      # 06 Contact — black-hole portal + form

public/
├── car/             # Kenney race.glb + colormap.png texture
└── planet/          # Stylized planet GLTF + textures
```

## Editing content

Most "data" is right at the top of each section file:

| What | Where |
|------|-------|
| Experience milestones    | `EXPERIENCES` in [src/Journey.jsx](src/Journey.jsx) |
| Skills + brand colours   | `SKILLS` in [src/Skills.jsx](src/Skills.jsx) |
| Projects (name, copy, colour, position, link) | `PROJECTS` in [src/Projects.jsx](src/Projects.jsx) |
| Bio copy + stat counters | About section JSX in [src/About.jsx](src/About.jsx) |
| Map pins (lat/lng)       | `LOCATIONS` in [src/About.jsx](src/About.jsx) |
| Contact email + socials  | Bottom of [src/Contact.jsx](src/Contact.jsx) |
| Nav links                | `<nav className="nav-links">` in [src/App.jsx](src/App.jsx) |

To change the car: drop a different `.glb` from the [Kenney Car
Kit](https://kenney.nl/assets/car-kit) into `public/car/` and update the
path inside [src/Journey.jsx](src/Journey.jsx). The shared `colormap.png`
already lives in `public/car/Textures/`, so any model from the same kit
will render with full colour automatically.

## Performance strategy

Six 3D scenes on one page would normally tank framerate. Three layers keep
this smooth:

1. **Code-splitting** — every section after the hero is `React.lazy()`'d.
   On first paint the user only downloads the hero + main bundle. Each
   section's JS streams in as the section nears the viewport.
2. **Frame-loop gating** — every Canvas listens to an `IntersectionObserver`
   via `useInView` and toggles its `frameloop` between `'always'` and
   `'never'`. Only the section currently on screen renders. Six canvases
   cost roughly the same as one.
3. **Mobile-aware geometry** — Skills and Projects detect
   `(max-width: 768px)` via `useMediaQuery` and scale their scene group
   down so all content fits inside portrait viewports without clipping.
   Camera FOV widens slightly on small screens.

`touch-action: pan-y` is set on every `<canvas>` so vertical swipes always
scroll the page, even when the gesture starts on a 3D scene.

## Deploying

Vercel auto-detects this project as Vite — no config required.

```bash
# Option A: CLI
npm install -g vercel
vercel --prod

# Option B: push to GitHub and import via vercel.com
```

Built output is ~4 MB, ~330 KB gzipped on first paint.

## Asset credits

- **Stylized Planet** by [cmzw](https://sketchfab.com/cmzw) on Sketchfab —
  [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/). Used in the
  hero (formerly), About globe, and as visual reference. Attribution
  appears in the About section as required by the licence.
- **Car Kit** by [Kenney](https://kenney.nl/assets/car-kit) — CC0
  (no attribution required, but they're great so credit them anyway).

## Licence

The code in this repo is yours to do whatever with. The 3D assets above
keep the licences listed by their original authors.
