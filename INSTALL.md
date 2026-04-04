Instructions for installing your software. You should also include uninstall
instructions.

# Installation

## Pre-built binaries

To install Flow, follow these steps:

1. Download the latest release from the [releases page](https://github.com/ritual-17/flow/releases).
2. Extract the downloaded archive to a directory of your choice.
3. Run the executable file to start using the software.

### Uninstall

To uninstall Flow, simply delete the directory where you extracted the files.
If you added Flow to your system's PATH, make sure to remove it from there as
well.

## Building from source

To build Flow from source, follow these steps:

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd flow
   ```
3. Ensure you have a version of [nodejs](https://nodejs.org/en) 22+ and [pnpm](https://pnpm.io/installation) 10+ installed.
   If you have [asdf](https://asdf-vm.com/guide/getting-started.html) or [mise](https://mise.jdx.dev/installing-mise.html), you can run:
   ```bash
   asdf plugin add nodejs
   asdf plugin add pnpm
   asdf install
   # or
   mise install
   ```
4. Install the dependencies:
   ```bash
   pnpm install
   ```
5. If you want to run the application in development mode, you can use:

   ```bash
   pnpm dev
   ```

6. Build the project:
   ```bash
   pnpm build:win # For windows
   pnpm build:mac # For macOS
   pnpm build:linux # For Linux
   ```
7. After building, you can find the executable in the `dist` directory. Run the executable to start using Flow.

### Uninstall

To uninstall Flow, simply delete the directory where you built the project.
