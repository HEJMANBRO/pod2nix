# Pod2Nix - AI Coding Instructions

## Project Overview

Pod2Nix is a web application that converts Docker Compose YAML files to NixOS
configuration files. It provides a React-based UI for inputting Docker Compose
content and generates corresponding NixOS systemd services and container
configurations using `virtualisation.oci-containers`.

## Architecture & Key Components

### Core Conversion Logic (`src/lib/converter.ts`)

- **Main Function**: `convertComposeToNix()` at line 92 - Entry point for
  conversion
- **Data Flow**: YAML parsing → Service extraction → NixOS config generation
- **Key Patterns**:
  - Uses TypeScript interfaces for Docker Compose schema
    (`DockerComposeService`, `DockerCompose`)
  - Generates NixOS `virtualisation.oci-containers.containers` configurations
  - Handles systemd service extensions via `pod2nix.systemd.*` labels
  - Supports both Docker and Podman backends
  - Traefik integration with label parsing and dynamic config generation

### React Application Structure

- **Main App**: Single-page application with conversion interface
- **State Management**: React hooks (`useState`, custom hooks) for form state
  and conversion
- **UI Patterns**:
  - Manual conversion triggered by button click
  - Hover-activated action buttons (copy/clear) on textareas
  - Error handling with user-friendly messages
  - Copy-to-clipboard functionality for generated Nix configs
  - Dynamic version and repository info from `package.json` (auto-updated via
    build script)
  - Responsive design with mobile-friendly dialogs/drawers

## Configuration Features

### Backend Selection

- **Docker/Podman Toggle**: Radio buttons to choose between Docker and Podman
  backends
- **Default**: Docker backend
- **UI Location**: Configuration section at the top of the main interface

### Traefik Services Configuration

- **Dynamic Service Management**: Add/remove Traefik services with form fields
- **Service Fields**:
  - Service name
  - URL (e.g., http://localhost:3000)
  - Host (e.g., example.com)
  - Entrypoint (e.g., web)
  - Certificate resolver (optional)
  - TLS toggle
- **UI Location**: Configuration section with expandable service forms

## Development Workflow

### Build & Run Commands

```bash
pnpm dev          # Start development server (Vite) on port 3000
pnpm build        # Update config + TypeScript compilation + Vite build
pnpm serve        # Preview production build (Vite preview)
pnpm test         # Run unit tests with Vitest
pnpm lint         # ESLint checking
pnpm format       # Prettier formatting
pnpm check        # Format + lint (write/fix)
pnpm check-unused # Check for unused dependencies
```

### Configuration Management

- **Version & Repository**: Automatically extracted from `package.json` via
  `scripts/update-config.js`
- **Build Process**: `pnpm run build` runs `scripts/update-config.js` to update
  `src/lib/config.ts` with current package info
- **No Manual Updates**: Version numbers and GitHub links stay in sync with
  package.json

### Key Development Patterns

#### Docker Compose Parsing

```typescript
// Always validate YAML structure before processing
const compose: DockerCompose = parse(yamlContent);
if (!compose.services) {
  throw new Error("No services found in Docker Compose file");
}
```

#### NixOS Configuration Generation

```typescript
// Use template literals for Nix config generation
const nixConfig = `{ pkgs, lib, ... }:

{
  virtualisation.${backend} = {
    enable = true;
    autoPrune.enable = true;
  };
  virtualisation.oci-containers.backend = "${backend}";
  // ... container definitions
}`;
```

#### Error Handling

```typescript
// Wrap conversion in try-catch with specific error messages
try {
  const result = convertComposeToNix(dockerCompose);
  // Handle success
} catch (err) {
  setError(err instanceof Error ? err.message : "Conversion failed");
}
```

## Technology Stack & Conventions

### Tailwind CSS v4 Integration

- **Plugin**: Uses `@tailwindcss/vite` plugin in `vite.config.ts`
- **CSS Structure**:
  ```css
  @import "tailwindcss";
  @layer base {
    /* Base styles */
  }
  @layer utilities {
    /* Custom utilities */
  }
  ```
- **Fonts**: Loaded via HTML `<link>` tags, not CSS imports

### TypeScript Configuration

- **Version**: TypeScript 5.7
- **Project References**: Uses composite TypeScript project with separate
  app/node configs
- **Strict Mode**: Enabled with comprehensive linting rules
- **Module Resolution**: Bundler mode for modern import handling

### ESLint Setup

- **Modern Config**: Uses flat config format (`eslint.config.js`)
- **React Rules**: Includes React hooks and refresh plugins
- **TypeScript Integration**: Full type-aware linting

### Vite Configuration

- **Version**: Vite 7
- **Base Path**: `/pod2nix` (configured in `vite.config.ts`)
- **Plugins**: React plugin, TanStack Start, Tailwind CSS, TypeScript paths
- **Build**: Static generation with prerendering enabled

## Common Patterns & Gotchas

### Docker Compose to NixOS Mapping

- **Container Names**: `${projectName}-${serviceName}` format
- **Volume Handling**: Named volumes vs bind mounts detection
- **Environment Variables**: Array or object format support
- **Dependencies**: Converted to systemd `dependsOn` arrays
- **Labels**: Non-Traefik labels passed through to container labels

### Label-Based Extensions

```yaml
# Docker Compose
services:
  web:
    labels:
      pod2nix.systemd.service.Restart: "always"
      pod2nix.systemd.unit.After: "network.target"
      traefik.enable: "true"
      traefik.http.routers.web.rule: "Host(`example.com`)"
```

### Backend Selection

- **Default**: Docker backend
- **Podman Support**: Pass `"podman"` as second parameter to
  `convertComposeToNix()`

### File Organization

- **Single Responsibility**: Each function handles one aspect of conversion
- **Interface Definitions**: Comprehensive TypeScript interfaces for all data
  structures
- **Utility Functions**: Pure functions for parsing arrays, mapping values, etc.
- **Component Structure**: UI components in `src/components/`, hooks in
  `src/hooks/`, types in `src/types/`

## Testing & Validation

- **YAML Validation**: Always parse and validate input before processing
- **Error Boundaries**: Wrap conversion logic in try-catch blocks
- **Type Safety**: Leverage TypeScript for compile-time validation of Docker/Nix
  structures
- **Unit Tests**: Located in `tests/lib/` with Vitest

## Deployment Considerations

- **Static Generation**: Vite builds to static files for easy deployment
- **No Server State**: Pure client-side conversion (no backend required)
- **Browser Compatibility**: Modern ES2022+ features with proper bundling
- **Base Path**: Deployed under `/pod2nix` path
