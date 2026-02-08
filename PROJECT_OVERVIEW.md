# Kelp Branches - Project Overview

## Objective
Build a VS Code extension called **Kelp Branches** that visualizes Git branches and rebases in a 3D space. The visualization resembles giant bull kelp growing upward, allowing users to intuitively see differences in rebased branches versus branches with old commits.

## Tech Stack
- **VS Code Extension API**: Integration with the editor.
- **TypeScript**: Primary language for the extension logic.
- **Three.js**: 3D rendering library (currently loaded via CDN in the webview).
- **simple-git**: Node.js library for interacting with the Git repository.

## Architecture

### Extension Logic (`src/extension.ts`)
- **Command**: Registers `git3d.start`.
- **Webview**: Creates a panel and loads HTML from `media/webview.html`.
- **Data Fetching**: Uses `simple-git` to fetch the last 20 commits from the active workspace root.
- **Communication**: Sends commit data to the webview via `postMessage` (`command: 'loadCommits'`).

### Visualization (`media/webview.html`)
- **Setup**: Standalone HTML file loaded by the extension.
- **Rendering**: Imports Three.js from `unpkg.com` (ES modules).
- **Scene**: Sets up a scene with fog matching the VS Code theme background (`#0d1117`).
- **Logic**:
  - Listens for `message` events from the extension.
  - Renders commits as green spheres stacked vertically.
  - Connects nodes with blue lines ("stems") to form the kelp structure.
  - Includes a basic rotation animation.

## Current Status
- **File Structure**: Logic is separated into `src/extension.ts` (backend) and `media/webview.html` (frontend).
- **Git Integration**: Successfully fetches commit logs and passes them to the frontend.
- **Visuals**: Basic vertical stack of spheres representing a single branch history.
- **Config**: `tsconfig.json` is configured to `skipLibCheck` to avoid `node_modules` errors.

## Future Goals
- Visualize actual branching paths (multiple stalks diverging).
- Visually distinguish rebased branches vs. upstream.
- Add interactive elements (hover/click commits for details).
- Enhance the "kelp" aesthetic (organic movement, leaves).