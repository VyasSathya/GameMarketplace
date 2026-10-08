# GameMarketplace

An archived game-marketplace prototype with a React storefront, game library, developer onboarding and publishing interfaces. The source also includes an Express API, Supabase database migrations, shared TypeScript models, and Bitcoin/BTCPay client code.

## Status

This repository preserves an earlier prototype. The current source has not been independently validated as a complete running product. Payment and deployment integrations require project-specific configuration.

## Source layout

| Directory | Contents |
| --- | --- |
| `packages/web` | React, TypeScript and Vite frontend |
| `packages/backend` | Express API, Supabase configuration and migrations |
| `packages/api` | Additional API routes retained in the source archive |
| `packages/shared` | Types, constants, validation and formatting utilities |
| `packages/bitcoin` | Bitcoin, Lightning and BTCPay client code |
| `scripts` | Development launcher |

## Local setup

The package manifest specifies Node.js 18 or newer and pnpm 8.15.0.

1. Install dependencies with `pnpm install`.
2. Copy `packages/web/.env.example` to `packages/web/.env.local` and set the URL and anonymous client key for your own Supabase project.
3. Copy `packages/backend/.env.example` to `packages/backend/.env` and configure the services you plan to run. Keep backend credentials in that local file.
4. Start the frontend with `pnpm --filter @gamemarketplace/web dev`. Vite is configured for port 7777 and proxies `/api` to port 7778.
5. Start the backend separately with `pnpm --filter @gamemarketplace/backend dev` when needed.

Browser configuration uses a Supabase anonymous client key. A Supabase service-role key belongs only in backend configuration.

## Available checks

The manifests define `lint`, `type-check`, `test` and `build` scripts. These commands are retained from the prototype and have not been verified end to end during the repository publication audit.

## Demo and license

A verified live demo and project-wide license have not been added to this archive. A useful next addition is a short local walkthrough showing the storefront, library and developer publishing flow with sample data.
