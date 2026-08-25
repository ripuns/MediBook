# Layout Components

This folder contains shared layout components used across the frontend app:

- `Sidebar.tsx` — side navigation listing links depending on user's active role.
- `Navbar.tsx` — header showing workspace status, welcome name, and sign-out actions.
- `LayoutShell.tsx` — client wrapper that conditionally shows or hides sidebars and headers based on current path segment rules (e.g. hides panels on auth and landing pages).
