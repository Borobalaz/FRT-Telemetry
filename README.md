# `create-preact`

<h2 align="center">
  <img height="256" width="256" src="./src/assets/preact.svg">
</h2>

<h3 align="center">Get started using Preact and Vite!</h3>

## Getting Started

-   `npm run dev` - Starts desktop development mode only
-   `npm run dev:desktop` - Watches the renderer and Electron processes, then launches the desktop app

-   `npm run build` - Builds and packages the desktop application
-   `npm run build:renderer` - Builds the renderer assets into `dist/`
-   `npm run build:electron` - Bundles Electron main and preload entrypoints into `dist-electron/`
-   `npm run build:desktop` - Builds the renderer and Electron app, then packages installers into `release/`
-   `npm run publish:github` - Builds production artifacts and publishes a GitHub release via Electron Builder

## GitHub Production Publish

Before running publish:

-   Set `GH_TOKEN` to a GitHub token that can create releases in your repository.
-   Provide repository target using one of:
  -   `GITHUB_REPOSITORY=owner/repo` (automatic in GitHub Actions), or
  -   `GH_OWNER` and `GH_REPO` in your environment.

Command:

-   `npm run publish:github`

## Desktop Foundation

-   Electron runs the existing renderer through a secure preload bridge.
-   Native DBC file open is available in desktop mode via Electron dialog APIs.
-   The project now runs as a desktop-only Electron application; there is no separate browser runtime path.
