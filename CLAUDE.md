# CLAUDE.md

Guidance for Claude Code when working in this repository. See [README.md](README.md) for user-facing setup (env vars, Supabase table schema/SQL).

## Layout

The repo root only holds docs; the actual app is in [Suite-Directory-Vue/](Suite-Directory-Vue/). Run all npm commands from there.

```sh
cd Suite-Directory-Vue
npm run dev       # Vite dev server
npm run build     # production build -> dist/
npm run preview   # serve the build
```

There is no linter, formatter, type checker or test suite configured. Verify changes with `npm run build` and by running the dev server.

## Stack

- Vue 3 with `<script setup>` SFCs, plain JavaScript (no TypeScript)
- Vue Router 4 (`createWebHistory`), routes in [src/router/router.js](Suite-Directory-Vue/src/router/router.js)
- Tailwind CSS 4 via `@tailwindcss/vite`; [src/style.css](Suite-Directory-Vue/src/style.css) is the Tailwind entry. Styling is done with utility classes inline in templates; `<style scoped>` blocks are empty.
- Supabase JS client, created once in [src/supabase.js](Suite-Directory-Vue/src/supabase.js) from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `@` aliases `src/` (vite.config.js / jsconfig.json), though existing code uses relative imports
- Node `^22.18.0 || >=24.12.0`

## Architecture

- [main.js](Suite-Directory-Vue/src/main.js) mounts [App.vue](Suite-Directory-Vue/src/App.vue) (nav bar + `<RouterView />`).
- `/` → [DirectoryView.vue](Suite-Directory-Vue/src/views/DirectoryView.vue): fetches all rows from the Supabase `Suites` table ordered by `created_at` desc, maps DB columns to a UI shape, filters client-side by city/name (search defaults to "Toronto"), and passes `filteredSuites` to `SuiteGrid`. Selecting a suite opens its URL in a new tab and calls the `increment_suite_clicks` RPC.
- `/login` → [LoginView.vue](Suite-Directory-Vue/src/views/LoginView.vue): Supabase email/password sign-in.
- `/admin` → [AdminDashboardView.vue](Suite-Directory-Vue/src/views/AdminDashboardView.vue): stats (suite count, total clicks, most clicked), searchable/sortable table, edit and delete.
- `/admin/create` and `/admin/edit/:id` → [CardBuilderView.vue](Suite-Directory-Vue/src/views/CardBuilderView.vue): one form for insert and update; edit mode is when `route.params.id` is set. `RouterView` is keyed by `fullPath` so it remounts between the two.
- All `/admin*` routes have `meta.requiresAuth`; a `beforeEach` guard in router.js redirects to `/login` without a session. App.vue tracks the session and shows the Admin link and Sign out button only when signed in; the public site has no link to the admin area, and admins enter by visiting `/admin` directly (documented in README "Admin access").
- [SuiteGrid.vue](Suite-Directory-Vue/src/components/SuiteGrid.vue) takes a `suites` prop and re-emits `select` from [SuiteCard.vue](Suite-Directory-Vue/src/components/SuiteCard.vue).
- Writes use `.select()` and treat an empty result as failure, because Supabase reports RLS-blocked updates/deletes as success with zero rows.

### Database setup

[supabase/admin_setup.sql](Suite-Directory-Vue/supabase/admin_setup.sql) adds the `click_count` column, the `increment_suite_clicks(bigint)` security-definer function (so anon visitors can count clicks without update rights), and RLS: anyone can select, only `authenticated` can insert/update/delete. Any signed-in user counts as admin, so public sign-ups should stay disabled in Supabase Auth.

[supabase/suite_images.sql](Suite-Directory-Vue/supabase/suite_images.sql) adds the `image_url` column and the public `suite-images` Storage bucket (authenticated-only writes). CardBuilderView uploads the picked file under a random UUID name, then saves `getPublicUrl()` into `image_url`. Replaced or deleted suites leave their old image files in the bucket.

### Data shape

The table is named `Suites` (capital S). DB columns → UI object (mapping lives in DirectoryView):

| DB column      | UI field                              |
| -------------- | ------------------------------------- |
| `id`           | `id`                                  |
| `suite_name`   | `name`                                |
| `location`     | `city`                                |
| `url`          | `websiteUrl`                          |
| `image_url`    | `image`                               |
| `bedroom_num`  | `features.beds`                       |
| `bathroom_num` | `features.baths`                      |
| `click_count`  | (admin dashboard only, read raw)      |

`SuiteCard` also renders optional fields the DB doesn't have (`description`, `rating`, `tag`, `price`, `features.guests`, `features.sqft`); each is hidden when missing. If you add columns, update the form/insert/update in CardBuilderView, the mapping in DirectoryView, and the dashboard table.

## Known issues (as of current code)

- [ErrorPage.vue](Suite-Directory-Vue/src/components/ErrorPage.vue) is raw markup with no `<template>` and isn't routed (no catch-all route).
- The admin route guard is UI-only; real protection is the RLS policies in admin_setup.sql, which must be applied in Supabase.
- `Suite-Directory-Vue/.env` (Supabase URL + anon key) is committed. Prefer `.env.local` (git-ignored via `*.local`) for new values, and never print the key's contents.
- `@supabase/server` is listed in dependencies but unused. [src/data/suites.json](Suite-Directory-Vue/src/data/suites.json) is sample data not imported anywhere.
