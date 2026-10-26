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
| `npm run typecheck` | Run Nuxt, Vue, and build-script TypeScript checks. |
| `npm run typecheck:scripts` | Check the Node build/refresh scripts and their unit tests. |
| `npm run test:unit` | Run the hero, project synchronization, and refresh scheduling unit tests without network requests. |
| `npm run build` | Build the universal Nuxt application. |
| `npm run generate` | Prerender the static website into `.output/public`. |
| `npm run projects:sync` | Refresh the project JSON from GitHub in the current working copy. Requires network access. |
| `npm run generate:cloudflare` | Refresh projects, generate the static site, and check generated HTML before Cloudflare publishes it. |
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

## GitHub project refresh

The Cloudflare build fetches all public repositories owned by `rezansrv`, excluding forks. Archived repositories remain included. It maps GitHub names, links, star counts, and descriptions to the existing project format; a missing description becomes empty text. Projects are ordered by descending star count, then by name using a consistent code-point comparison. New public repositories appear on the next successful build. Renamed, deleted, or newly private repositories are reflected in the next snapshot.

`npm run dev`, `npm run build`, `npm run generate`, and the normal validation workflow continue using the checked-in JSON without contacting GitHub. `npm run projects:sync` intentionally replaces `data/projectsList.json` in the current working copy after the complete response has passed validation. Run it in a disposable build checkout for automated refreshes; do not commit changes that only refresh repository data. No Git write permissions or automatic commits are used.

The sync has bounded requests, checks every page, and rejects failed requests, malformed records, duplicate repositories, and empty eligible results before replacing the file. A failed sync or generated-HTML check exits nonzero and prevents the Cloudflare build command from succeeding. The existing production deployment remains available; there is no client-side GitHub dependency or runtime API.

### Cloudflare setup

Apply these settings only after the feature is reviewed and integrated into the release branch. Repository changes alone do not configure the Cloudflare dashboard or GitHub secrets.

1. Keep the Pages production branch as `main` and the output directory as `.output/public`. Keep the existing push-to-`main` Git integration enabled.
2. Use the Node.js 24 LTS and npm versions recorded in `.nvmrc` and `package.json`. Set the Pages build command to `npm run generate:cloudflare`. Verify the command in a preview before applying it to production. Both push-triggered and hook-triggered builds will then refresh project data.
3. Public data needs no GitHub credential. If build traffic requires an authenticated rate limit, add `GITHUB_PROJECTS_TOKEN` as a **build secret in Cloudflare**, with only the GitHub metadata access necessary to read these public repositories. It is never placed in Nuxt public configuration, output, or browser requests. Do not share it in issues or commit it.
4. Create a [Cloudflare Pages Deploy Hook](https://developers.cloudflare.com/pages/configuration/deploy-hooks/) named `github-projects-refresh` targeting **`main`**. Store its entire URL as the GitHub Actions repository secret `CLOUDFLARE_PAGES_DEPLOY_HOOK`. The URL authorizes builds and must be treated as a secret.
5. After `.github/workflows/refresh-projects.yml` reaches the default branch (`main`), use Actions → **Refresh GitHub projects** → **Run workflow** on `main` for an end-to-end check. Confirm the resulting **Cloudflare** deployment succeeds and the live `/projects` HTML contains the refreshed data. A successful Actions run confirms only that Cloudflare accepted the request, not that its asynchronous build/deployment succeeded.

### Schedule and monitoring

The workflow wakes up on Mondays at 04:17 UTC (07:47 in Tehran) and requests a build every other week, anchored to Monday **2026-10-26**. Scheduled refresh dates include 2026-11-09, 2026-11-23, and 2026-12-07. The weekly wake-up skips intervening weeks without contacting Cloudflare. This maintains a 14-day calendar cadence across month and year boundaries; it is not a twice-per-month cron. Manual runs on `main` bypass the date check without shifting the schedule. Push-triggered production builds also fetch fresh data independently of this schedule.

The refresh workflow does not run on PRs or pushes and refuses manual execution from other branches. Its token has read-only repository access. It makes one hook request, without retries that could duplicate a build after a timeout. If a request times out, inspect Pages before manually retrying. GitHub scheduling can be delayed or skipped, and [public repositories disable scheduled workflows after 60 days without repository activity](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule). Check Actions and Pages build notifications, re-enable the workflow when needed, and use a manual refresh after a missed run. The schedule does not create keepalive commits.

### Rollback and disabling refreshes

If a successful deployment contains unwanted project changes, use Cloudflare Pages' [rollback to a previous successful production deployment](https://developers.cloudflare.com/pages/configuration/rollbacks/). Roll back the deployment artifact rather than rebuilding an old Git commit: GitHub data can change even when the source commit is identical.

To pause periodic rebuilds, disable **Refresh GitHub projects** in Actions or remove its deploy hook. To return to the checked-in project snapshot for ordinary push builds as well, restore the Pages build command to `npm run generate && npm run test:generated`. This keeps the same output directory and public routes. Restore `npm run generate:cloudflare` to resume build-time syncing. Never rotate the hook URL by committing it; replace the GitHub secret instead.
