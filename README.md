# Reza Naserivand — Personal Website

Source code for [rezansrv.ir](https://rezansrv.ir), a statically generated personal website built with Nuxt 4 and Vue 3.

The site includes the public routes `/`, `/projects`, and `/writing`, server-rendered SEO metadata, structured data, a sitemap, responsive layouts, and an animated hero with reduced-motion support.

## Requirements

- Node.js 24.21.0 or a compatible Node.js 24 LTS release
- npm 11.19.0

The supported versions are also recorded in `.nvmrc` and `package.json`.

## Local development

Install the locked dependencies:

```sh
npm ci
```

Start the Nuxt development server:

```sh
npm run dev
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Nuxt development server. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run Nuxt and Vue TypeScript checks. |
| `npm run test:unit` | Run the hero animation and interaction unit tests. |
| `npm run build` | Build the universal Nuxt application. |
| `npm run generate` | Prerender the static website into `.output/public`. |
| `npm run test:generated` | Validate generated HTML, SEO output, routes, and glitch keyframes. |
| `npm run test:smoke` | Generate the site and run the complete Playwright smoke suite. |
| `npm run test:smoke:generated` | Run Playwright against existing generated output. |
| `npm run preview` | Preview a production Nuxt build locally. |
| `npm run validate` | Run the complete local quality gate. |

## Validation

Run the full validation workflow before proposing a release:

```sh
npm run validate
```

This runs linting, type checking, unit tests, the production build, static generation, generated-output checks, and Playwright browser tests.

## Static deployment

Generate the deployable artifact with:

```sh
npm run generate
```

The static output directory is:

```text
.output/public
```

Generated build output and installed dependencies are local artifacts and must not be committed.
