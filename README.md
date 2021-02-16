# ULMS kit

[![codecov](https://codecov.io/gh/netology-group/ulms-media-ui/branch/add-package-manager/graph/badge.svg?token=e10nIirTN9)](https://codecov.io/gh/netology-group/ulms-media-ui)
[![Build Status](https://netology-group.semaphoreci.com/badges/ulms-media-ui/branches/master.svg?style=shields)](https://netology-group.semaphoreci.com/projects/ulms-media-ui)

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
