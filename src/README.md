# Flow Dev Environment Setup

## Recommended VSCode extension

- [VSCode](https://code.visualstudio.com/)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [TailwindCSS](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## Project Setup

### Environment installs

If using [asdf](https://asdf-vm.com/guide/getting-started.html) or [mise](https://mise.jdx.dev/installing-mise.html), run

```bash
$ asdf plugin add nodejs
$ asdf plugin add pnpm
$ asdf install
# or
$ mise install
```

Otherwise, install a version of [nodejs](https://nodejs.org/en) 22+ and [pnpm](https://pnpm.io/installation) 10+

### Install packages

```bash
$ pnpm install
```

### Development

To start the app run:

```bash
$ pnpm dev
```

### Build

```bash
# For windows
$ pnpm build:win

# For macOS
$ pnpm build:mac

# For Linux
$ pnpm build:linux
```
