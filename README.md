# rezansrv.ir

## Requirements

- Node.js 24.21.0
- npm 11.x

## Project setup

```
npm ci
```

### Starts Nuxt in development mode

```
npm run dev
```

### Builds the universal application

```
npm run build
```

### Generates the static Cloudflare Pages artifact

The deployable files are written to `.output/public`.

```
npm run generate
```

### Previews a Nuxt build

```
npm run preview
```

### Lints and type-checks files

```
npm run lint
npm run typecheck
```

### Runs browser smoke tests

The smoke suite generates the site, serves `.output/public` with the repository test server, and checks the public routes in desktop and mobile Chromium projects.

```
npm run test:smoke
```

### Runs the local validation workflow

```
npm run validate
```

This runs linting, type checking, the production build, static generation, generated-HTML checks, and the Playwright smoke suite.
