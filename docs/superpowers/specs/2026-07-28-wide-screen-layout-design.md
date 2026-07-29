# Wide-screen layout — spec & implementation plan

**Date:** 2026-07-28
**Branch:** `wide-screen-layout`

## Problem

Scout's entire shell is pinned to `max-w-6xl` (1152px) in `app/layout.tsx` — header,
`<main>`, and footer all share that cap. Page layouts also stop growing at Tailwind's
`lg` breakpoint (1024px); nothing in the app responds to anything wider.

On a physically large monitor the user zooms Chrome out to ~50% because text is still
comfortably readable at that size. But zooming out also doubles the CSS viewport width
(a 1920px display becomes a ~3840px CSS viewport). The 1152px container then occupies a
narrow strip down the middle, with wasted paper-colored gutters on both sides.

Picking a larger fixed pixel cap doesn't solve this — it just moves the problem to the
next display. The container must be **fluid**, and the page layouts must have somewhere
to grow.

## Decisions

| Question | Decision |
| --- | --- |
| Container width | Fluid — grows with the viewport, with responsive edge padding |
| Absolute ceiling | 2800px, then centered (keeps 25% zoom from becoming absurd) |
| What fills the space | **More columns**, not just stretching — see more at once |
| Forms & settings | Stay narrow (readability), but centered rather than left-hugging |
| Below 1024px | **No change.** Mobile and laptop layouts stay exactly as they are today |

## Non-goals

- No changes to data fetching, Server Actions, or the Prisma layer.
- No charting library (`components/charts/` stays hand-rolled SVG).
- No redesign — this is a layout/width change only. Colors, type, and spacing scale
  stay as they are.
- No new responsive behavior at or below `lg` (1024px).

---

## Implementation plan

### Step 1 — Breakpoints (`tailwind.config.js`)

Tailwind's defaults stop at `xl` (1280px). Add to `theme.extend`:

```js
screens: {
  "2xl": "1600px",   // overrides Tailwind's default 1536px
  "3xl": "2000px",
  "4xl": "2560px",
},
```

Note `2xl` already exists at 1536px in Tailwind's defaults; redefining it to 1600px is
intentional and affects nothing today (no file currently uses `2xl:`).

**Verify:** `grep -rn "2xl:" app components` returns nothing before the change.

### Step 2 — Fluid shell (`app/globals.css` + `app/layout.tsx`)

Add a `.shell` component utility in the `@layer components` block of `globals.css`:

```css
.shell {
  @apply mx-auto w-full max-w-[2800px] px-4 sm:px-6 xl:px-8 3xl:px-12;
}
```

In `app/layout.tsx`, replace all three `max-w-6xl` containers with `.shell`:

- line 34 — header inner `<div className="mx-auto max-w-6xl px-4">` → `className="shell"`
- line 69 — `<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">` →
  `className="shell flex-1 py-10"`
- line 73 — footer inner div → keep its flex/gap classes, swap the width+padding for `shell`

**Verify:** `grep -rn "max-w-6xl" app components` returns nothing.

### Step 3 — Dashboard (`app/page.tsx`)

The status ridge (line 69) is already 8-across at `lg` — leave it.

"Awaiting response" (line ~99) and "Recent sign" (line ~158) are two sibling `<section>`
elements inside the page's `space-y-10` wrapper. They currently stack forever. Wrap the
two sections in a grid that splits them side-by-side at `2xl`:

```jsx
<div className="grid gap-10 2xl:grid-cols-2 2xl:items-start">
  {/* awaiting response section */}
  {/* recent sign section */}
</div>
```

The outer `space-y-10` still handles vertical rhythm between the hero and this grid.

### Step 4 — Analytics (`app/analytics/page.tsx`)

- **Stat tiles** (line 112): `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` — there are
  exactly 6 tiles, so the column count stays; they simply grow wider. No change.
- **Status donut + funnel** (line 130): `lg:grid-cols-2` — unchanged, the pair fills the
  row.
- **Rejections** (line ~166) and **Pace & mix** (line ~196): these sit as full-width
  sections. At `3xl` the page has room for three chart columns. Change the "Pace & mix"
  inner pair (line 201) from `sm:grid-cols-2` to `sm:grid-cols-2 3xl:grid-cols-3` and
  move the "Applications over time" trend into that grid so all three sit in one row.
- **Geography** (line 177) and **Networking** (line 225): both use
  `lg:grid-cols-[2fr,1fr]` — unchanged; the ratio holds at any width.

### Step 5 — Tables

`components/ApplicationsTable.tsx`, `ContactsTable.tsx`, `CompaniesTable.tsx`, and
`DataTable.tsx` have no width caps of their own — they inherit the shell and stretch.
**No change required.** Confirm by reading each for hardcoded `max-w-*` or fixed widths.

### Step 6 — Detail pages

`app/applications/[id]/page.tsx:117` — the definition-list grid is
`grid-cols-2 ... sm:grid-cols-3`. Extend to `xl:grid-cols-4 3xl:grid-cols-6` so the
field pairs spread instead of leaving a long empty right side.

Check `app/contacts/[id]/page.tsx` and `app/companies/[id]/page.tsx` for the same
pattern and apply the same treatment where a comparable grid exists.

### Step 7 — Center the narrow pages

Add `mx-auto` alongside the existing caps:

- `components/ApplicationForm.tsx:83` — `max-w-2xl` → `mx-auto max-w-2xl`
- `components/ContactForm.tsx:65` — `max-w-xl` → `mx-auto max-w-xl`
- `components/CompanyForm.tsx:24` — `max-w-xl` → `mx-auto max-w-xl`
- `app/settings/page.tsx:33` — `card max-w-md` → `card mx-auto max-w-md`

The page header above each form (the `eyebrow` / `page-title` block) must get a matching
`mx-auto` + same max-width wrapper, otherwise the heading floats left while the form
centers. Check each `new/` and `[id]/edit/` page for its header block.

### Step 8 — Chart fixes this exposes

Two charts misbehave once their container can exceed ~1150px:

1. **`components/charts/USStateMap.tsx:49`** — the `<svg>` has `viewBox` + `className="w-full"`
   and **no `preserveAspectRatio`**, so it scales proportionally. At a 2500px-wide card
   the map becomes enormous vertically. Fix: cap it — wrap or add
   `mx-auto max-w-[900px]` to the svg's class.

2. **`components/charts/TrendLine.tsx:49`** — uses `preserveAspectRatio="none"`, so it
   stretches horizontally without growing taller (good), but its month labels and stroke
   widths get horizontally distorted in proportion to the stretch. At 1150px the factor
   is mild; at 2500px it is visibly wrong. Fix: raise the internal `w` constant so the
   rendered width is closer to the intrinsic width, keeping the stretch factor near 1.

`DonutChart.tsx` uses fixed `width`/`height` attributes — it stays a fixed size and is
fine as-is. `BarList` and `Funnel` are HTML/flex, not SVG — fine as-is.

---

## Verification

1. `npm run build` — must pass clean (type + lint).
2. `npm run dev`, then in Chrome walk every tab — Dashboard, Applications, Contacts,
   Companies, Analytics, Settings, plus one detail page and one form — at **100%, 67%,
   50%, and 33%** zoom.
3. At each zoom level confirm: no horizontal scrollbar, no orphaned gutters until past
   2800px, charts not distorted or oversized, forms centered and still narrow.
4. Confirm the ≤1024px layouts are byte-identical in behavior — resize the window
   narrow at 100% zoom and compare against `main`.

## Risks

- **Redefining Tailwind's `2xl`** from 1536px to 1600px would silently shift any existing
  `2xl:` usage. Verified in Step 1 that there is none.
- **`preserveAspectRatio="none"` on TrendLine** is a pre-existing distortion this change
  amplifies rather than causes. Step 8 mitigates but does not fully eliminate it; a real
  fix would be a resize-observer-driven width, which is out of scope for a layout pass.
- No test suite exists (per `CLAUDE.md`), so verification is build + manual visual check.
