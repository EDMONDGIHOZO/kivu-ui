# Releasing `kivu-ui`

Releases are published to npm automatically by `.github/workflows/publish.yml`
when a GitHub Release is published. It uses npm Trusted Publishing, so no npm
token is stored in GitHub, and npm shows a provenance badge for each version.

## Release steps

1. On a branch, bump `version` in `packages/react/package.json` and add an entry
   to `packages/react/CHANGELOG.md`. Run `npm install` so `package-lock.json`
   picks up the new version.
2. Verify locally:

   ```bash
   npm ci
   npm run typecheck
   npm test
   npm run build
   npm run pack:check
   ```

   The pack output must contain only compiled JavaScript, declaration files,
   CSS, package metadata, README, changelog and license.
3. Merge the branch into `main` through a pull request.
4. On GitHub, create a Release from `main` with a new tag `v<version>`
   (for example `v0.2.0`) and publish it.
5. Watch the **Publish to npm** run under the repository's Actions tab.

The workflow fails if the tag does not match the package version, and skips
publishing if that version is already on npm.

## One-time setup

On npmjs.com, open the `kivu-ui` package → Settings → Trusted Publisher, choose
GitHub Actions and enter:

- Organization or user: `EDMONDGIHOZO`
- Repository: `kivu-ui`
- Workflow filename: `publish.yml`
