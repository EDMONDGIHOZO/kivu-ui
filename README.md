<p align="center"><img src="docs/kivuilogo.svg" alt="Kivu UI" height="72" /></p>

# Kivu UI

Open-source home of **@kivu-ui/react**, a lightweight, Tailwind-friendly React component library.

## Repository layout

- `packages/react`: the public React package and its package documentation.
- `apps/playground`: a private workspace app for developing and reviewing components.

The marketing and documentation website is maintained separately so this repository stays focused on the library's public source and release history.

## Development

```bash
npm install
npm run build
npm run dev
npm run typecheck
npm test
```

## Package

Package usage and component documentation live in [packages/react/README.md](packages/react/README.md).

Publishing is intentionally not automated yet. The npm package allowlist excludes raw TypeScript, tests, applications, and source maps.

## License

MIT
