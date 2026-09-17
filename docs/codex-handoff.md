# Codex Handoff

Updated: 2026-03-09

## Scope

This document captures the UI, content, and performance changes completed in the current Codex session so a future session can resume without re-auditing the repo from scratch.

## Goals Completed

1. Repositioned the homepage from a blog-first layout to a portfolio-first layout aimed at recruiters and visitors.
2. Unified the homepage visual language from top to bottom.
3. Improved homepage information hierarchy for faster scanning.
4. Reduced homepage route loading cost by moving article pages to on-demand loading and refining Vite chunking.

## Homepage Changes

### 1. Page order and navigation

- Updated homepage section order in `src/App.tsx`:
  - `Hero`
  - `Experience`
  - `Projects`
  - `Blog`
  - `About`
  - `ContentMap`
  - `Contact`
- Updated header nav order to match the new page flow.

### 2. Hero redesign

File: `src/components/Hero/index.tsx`

- Rebuilt the hero into a clearer conversion-focused layout:
  - value proposition
  - three CTA paths
  - proof cards with quantitative highlights
  - profile card kept as right-side anchor
- Removed the broken resume-first path from the hero CTA chain.
- Added localized micro-copy badges around the profile card.

Related copy updates:

- `src/i18n/zh.ts`
- `src/i18n/en.ts`

### 3. Projects redesign

File: `src/components/Projects/index.tsx`

- Reworked the section into a case-study style layout.
- Added structured project metadata from i18n:
  - `role`
  - `summary`
  - `highlights`
  - `metrics`
- Changed the presentation from a simple screenshot card into:
  - featured case heading
  - impact-oriented bullets
  - metric chips over the preview
  - stronger CTA group

### 4. About redesign

File: `src/components/About/index.tsx`

- Replaced plain paragraphs with:
  - lead positioning block
  - three capability cards
  - background facts section

Related copy updates:

- `src/i18n/zh.ts`
- `src/i18n/en.ts`

### 5. Experience redesign

File: `src/components/Experience/index.tsx`

- Added a top stats strip for fast recruiter scanning.
- Rebuilt the experience layout into:
  - left company selector
  - right detail card
  - clearer separation of responsibilities, achievements, and tech stack
- Preserved the original experience content while improving scanability.

Related copy updates:

- `src/i18n/zh.ts`
- `src/i18n/en.ts`

### 6. Blog redesign

File: `src/components/Blog/index.tsx`

- Replaced the uniform article grid with:
  - one featured post block
  - a latest-updates list on the side
- Strengthened the “ongoing writing/output” signal for visitors.
- Added supporting localized copy:
  - `lead`
  - `featuredLabel`
  - `recentLabel`

Related copy updates:

- `src/i18n/zh.ts`
- `src/i18n/en.ts`

### 7. Contact redesign

File: `src/components/Contact/index.tsx`

- Reworked the closing section into a stronger contact CTA panel.
- Added:
  - lead paragraph
  - main and secondary CTA buttons
  - availability/status cards
  - structured channel cards for GitHub, Yuque, and email

Related copy updates:

- `src/i18n/zh.ts`
- `src/i18n/en.ts`

## Performance Changes

### 1. Route-level on-demand loading

File: `src/Root.tsx`

- Moved article list and article detail pages to route-triggered dynamic imports.
- Avoided eager article page loading on the homepage route.
- Added a lightweight route loading fallback.

### 2. Removed duplicate comment DB loading pattern

File: `src/pages/ArticleDetail.tsx`

- Removed the inline dynamic import of `updateComment`.
- Switched to a single static import path from `src/lib/commentDB.ts`.
- This removed the previous Vite warning about the same module being both statically and dynamically imported.

### 3. Refined Vite chunk splitting

File: `vite.config.ts`

- Added manual chunk groups for:
  - `article-vendor`
  - `motion-vendor`
  - `gsap-vendor`
  - `icons-vendor`
  - `date-vendor`
  - `react-vendor`
  - fallback `vendor`
- Disabled build-time `modulePreload` to stop the homepage HTML from preloading article-only chunks.

## Current Build State

Validation command used:

```bash
npm run build:skip-notion
```

Latest observed result:

- Build passes.
- Homepage HTML now only includes the main entry script and CSS.
- Route-specific article chunks are no longer injected as homepage preload tags.

Latest notable build output:

- `index-*.js`: about 88 KB
- `vendor-*.js`: about 215 KB
- `react-vendor-*.js`: about 199 KB
- `article-vendor-*.js`: about 783 KB

## Known Remaining Issues

1. `article-vendor` is still large.
   - This no longer blocks homepage performance.
   - It still affects first load of article pages.

2. `baseline-browser-mapping` is out of date.
   - Build warns to update that package.

3. `pnpm-lock.yaml` was already modified in the working tree before/alongside this work and was not touched by Codex logic.

## Files Changed In This Session

- `src/App.tsx`
- `src/Root.tsx`
- `src/components/Hero/index.tsx`
- `src/components/Projects/index.tsx`
- `src/components/About/index.tsx`
- `src/components/Experience/index.tsx`
- `src/components/Blog/index.tsx`
- `src/components/Contact/index.tsx`
- `src/i18n/zh.ts`
- `src/i18n/en.ts`
- `src/pages/ArticleDetail.tsx`
- `vite.config.ts`

## Recommended Next Step

The next worthwhile pass is article-page performance:

1. Lazy-load code highlighting only when fenced code blocks exist.
2. Lazy-load the local comment system below the fold.
3. Consider replacing or slimming the markdown/highlighter stack if article route speed matters.
