# Releasing `@kivu-ui/react`

This repository has not published an npm release yet. Do not run the publish command until the release pull request is approved and the npm scope is ready.

## First-release prerequisites

- Confirm the `@kivu-ui` npm scope is owned by the intended account or organization.
- Enable two-factor authentication on the publishing npm account.
- Use a Node version supported by the root `package.json`.
- Confirm `@kivu-ui/react` is still unused on the npm registry.
- Replace `Unreleased` in `packages/react/CHANGELOG.md` with the release date.
- Merge the release preparation through a pull request so `main` remains protected.

## Local verification

From a clean checkout of `main`:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm run pack:check
```

Inspect the pack output. It must contain only the compiled JavaScript, declaration files, CSS, package metadata, README, changelog and license. It must not contain source maps, raw TypeScript, tests, the playground or repository configuration.

## First publication

The package has `publishConfig.access` set to `public`, so the eventual release command is:

```bash
npm publish -w @kivu-ui/react
```

After npm confirms the publication, create and push the matching `v0.1.0` tag and create a GitHub release from that tag.

## Subsequent publications

After the first package exists on npm, configure npm Trusted Publishing for the public GitHub repository and move publication to a reviewed GitHub Actions workflow. Prefer short-lived OIDC credentials over long-lived npm tokens.
