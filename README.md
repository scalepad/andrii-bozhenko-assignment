# SoleCraft — Custom Shoe Marketplace

A full-stack assignment project where independent sellers list custom shoes and buyers discover and purchase them through a mocked checkout.

## Stack

- React 19, Vite, TypeScript, React Router, and MUI
- Node.js, Express 5, Prisma, and SQLite
- npm workspaces with shared API/domain types
- Vitest, Testing Library, and Supertest

## Setup

Requires Node.js 20 or newer.

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Development defaults to `apps/api/prisma/dev.db`. Copy `.env.example` to `apps/api/.env` only when you need to override the database, port, origin, or session duration.

Open `http://localhost:5173`. The seed creates:

- `seller@example.com` / `password123`
- `atelier@example.com` / `password123`
- `buyer@example.com` / `password123`

## Commands

```bash
npm run dev          # web and API in watch mode
npm run build        # production builds
npm run typecheck    # all TypeScript projects
npm run lint
npm test             # database-backed API integration and UI tests
npm run db:migrate
npm run db:seed
```

## Architecture and decisions

The repository is a small monorepo: `apps/web` is the browser application, `apps/api` owns HTTP and persistence, and `packages/shared` defines contracts used on both sides. REST resources live under `/api`; errors consistently return `{ error: { code, message, fields? } }`.

Authentication uses opaque, random session IDs in HTTP-only cookies. Sessions are stored in SQLite, so logout and expiration can be enforced server-side. Roles and listing ownership are checked in the API rather than trusted from navigation. Prices use integer cents, and checkout recalculates totals inside a database transaction. Order items snapshot title, image, and price so later listing edits do not rewrite purchase history.

Listing attributes form a discriminated union of standard and custom attributes. Standard size, primary color, style, and upper-material keys use shared value enums so seller inputs and buyer filters stay consistent; all are optional. Custom attributes retain arbitrary key/value details without weakening the standard contracts. Image handling intentionally accepts URLs; payment is explicitly mocked.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/listings`, `GET /api/listings/:id`, `GET /api/listings/mine`
- `POST /api/listings`, `PUT /api/listings/:id`, `DELETE /api/listings/:id`
- `GET /api/cart`, `POST /api/cart/items`, `PATCH|DELETE /api/cart/items/:id`
- `POST /api/orders/checkout`, `GET /api/orders`

Catalog filters include `search`, `seller`, `minPrice`, `maxPrice`, `size`, `color`, `style`, `upperMaterial`, and arbitrary `attr.<key>` query parameters. Standard filters accept values from the shared enums. Prices in API requests and filters are cents.

## Scope and future work

This prototype omits real payments, inventory, uploads, shipping, password recovery, CSRF tokens, rate limiting, and deployment configuration. A production iteration should add those controls, pagination, accessibility testing, browser-level end-to-end coverage, and generated OpenAPI documentation.

## AI-assisted development

AI was used to accelerate initial architecture, implementation, and test generation. The important boundaries—server-side authorization, monetary representation, transactional checkout, validation, and persisted sessions—remain explicit and testable rather than delegated to generated UI behavior.
