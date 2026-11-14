# Contributing to Kivu UI

Thanks for contributing to Kivu UI.

## Development

Use a Node version supported by the root `package.json`, then install dependencies from the repository root:

```bash
npm install
npm run build
npm run dev
```

The React package lives in `packages/react`; the development playground lives in `apps/playground`.

## Pull requests

1. Create a focused branch from `main`.
2. Keep public API changes intentional and documented.
3. Add or update component coverage when behavior changes.
4. Update `packages/react/README.md` and `packages/react/CHANGELOG.md` when users need to know about the change.
5. Open a pull request and resolve all review conversations.

Pull requests are squash-merged to keep `main` linear. Do not commit generated `dist` files or package archives.

## Commit messages

Use concise Conventional Commit-style messages where practical:

```text
feat(button): add loading state
fix(modal): restore focus after closing
docs: clarify Tailwind setup
```
