# ULMS kit


## Development

Lerna is a dev-dependency so there is no need to install it globally.

- Link all the components

```bash
npx lerna exec 'npm link'
```

- Build all packages

```bash
npx lerna run build
```

- Provide build capabilities to the packages (runs automatically after installation)

```bash
npm run postinstall
```
