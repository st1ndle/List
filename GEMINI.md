# Project: ООО ЛиСТ (Migration to ReactJS)

## Overview
This project is currently undergoing a migration from a legacy vanilla HTML/CSS/JS monolithic frontend to a modern ReactJS architecture. The repository contains both the legacy files (in the root directory) and the new React application (in the `ui/` directory).

- **Legacy Frontend:** `index.html`, `styles.css`, `app.js` (Reference implementation).
- **New Frontend:** Located in the `ui/` directory.
- **Backend:** Node.js, Express, MSSQL (located in the root directory).

## Tech Stack (New Frontend - `ui/`)
- **Core:** React 19, Vite, React Router v7
- **State Management:** Zustand
- **Styling:** Vanilla CSS (co-located with components, e.g., `Button.css` next to `Button.jsx`)
- **Component Explorer:** Storybook
- **Testing:** Vitest, Playwright (@vitest/browser-playwright)
- **Linting/Formatting:** ESLint

## Architecture & Conventions

### Directory Structure (`ui/src/`)
- `/api`: API integration and external data fetching.
- `/assets`: Static assets like images and SVG icons.
- `/components`: Pure, presentational React components. Organized by feature or component type (`/header`, `/site`, `/ui`).
  - Include `.css` and `.stories.jsx` files next to the `.jsx` file.
- `/containers`: Stateful components or blocks that connect to the global state (Zustand) or handle complex business logic (`/blocks`).
- `/pages`: Top-level route components mapped to React Router paths.
- `/stories`: Storybook configurations and documentation.

### Styling Guidelines
- Use **Vanilla CSS**. Do not use CSS Modules, Tailwind, or Styled Components unless explicitly requested.
- Maintain consistency with the legacy `styles.css` color palette and typography (Fonts: Bebas Neue, Geologica).
- CSS files should be imported directly into the corresponding `.jsx` components (e.g., `import './Header.css';`).

### State Management
- Use **Zustand** for global state.
- Avoid passing props down multiple levels (prop drilling); use Zustand stores when state needs to be accessed by deeply nested components.
- Keep local state (useState) for UI-specific, ephemeral state.

### Testing & Storybook
- Create a `.stories.jsx` file for every new component in `/components` and `/containers`.
- Ensure components are tested and documented via Storybook.

### Workflow & Migration
- When implementing a feature in the new React frontend (`ui/`), refer to the legacy `index.html`, `styles.css`, and `app.js` files as the reference implementation.
- The goal is to reproduce the layout, design, and functionality of the legacy app using modern React patterns.
- Ensure all backend API calls match the endpoints defined in the root Node.js server.
