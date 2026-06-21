// US states laid out as a tile-grid cartogram — the canonical labeled-square
// map. Each state is one cell on an 11×8 grid (col = west→east, row =
// north→south). This is bundled static geometry (no geocoding, no runtime
// fetch), which keeps the choropleth fully offline-safe. Because every tile is
// labeled with its abbreviation, the schematic reads unambiguously.

export type StateTile = {
  abbr: string;
  name: string;
  col: number;
  row: number;
};

export const GRID_COLS = 11;
export const GRID_ROWS = 8;

export const STATE_TILES: StateTile[] = [
  { abbr: "AK", name: "Alaska", col: 0, row: 0 },
  { abbr: "ME", name: "Maine", col: 10, row: 0 },

  { abbr: "VT", name: "Vermont", col: 9, row: 1 },
  { abbr: "NH", name: "New Hampshire", col: 10, row: 1 },

  { abbr: "WA", name: "Washington", col: 0, row: 2 },
  { abbr: "ID", name: "Idaho", col: 1, row: 2 },
  { abbr: "MT", name: "Montana", col: 2, row: 2 },
  { abbr: "ND", name: "North Dakota", col: 3, row: 2 },
  { abbr: "MN", name: "Minnesota", col: 4, row: 2 },
  { abbr: "IL", name: "Illinois", col: 5, row: 2 },
  { abbr: "WI", name: "Wisconsin", col: 6, row: 2 },
  { abbr: "MI", name: "Michigan", col: 8, row: 2 },
  { abbr: "NY", name: "New York", col: 9, row: 2 },
  { abbr: "MA", name: "Massachusetts", col: 10, row: 2 },

  { abbr: "OR", name: "Oregon", col: 0, row: 3 },
  { abbr: "NV", name: "Nevada", col: 1, row: 3 },
  { abbr: "WY", name: "Wyoming", col: 2, row: 3 },
  { abbr: "SD", name: "South Dakota", col: 3, row: 3 },
  { abbr: "IA", name: "Iowa", col: 4, row: 3 },
  { abbr: "IN", name: "Indiana", col: 5, row: 3 },
  { abbr: "OH", name: "Ohio", col: 6, row: 3 },
  { abbr: "PA", name: "Pennsylvania", col: 7, row: 3 },
  { abbr: "NJ", name: "New Jersey", col: 8, row: 3 },
  { abbr: "CT", name: "Connecticut", col: 9, row: 3 },
  { abbr: "RI", name: "Rhode Island", col: 10, row: 3 },

  { abbr: "CA", name: "California", col: 0, row: 4 },
  { abbr: "UT", name: "Utah", col: 1, row: 4 },
  { abbr: "CO", name: "Colorado", col: 2, row: 4 },
  { abbr: "NE", name: "Nebraska", col: 3, row: 4 },
  { abbr: "MO", name: "Missouri", col: 4, row: 4 },
  { abbr: "KY", name: "Kentucky", col: 5, row: 4 },
  { abbr: "WV", name: "West Virginia", col: 6, row: 4 },
  { abbr: "VA", name: "Virginia", col: 7, row: 4 },
  { abbr: "MD", name: "Maryland", col: 8, row: 4 },
  { abbr: "DE", name: "Delaware", col: 9, row: 4 },

  { abbr: "AZ", name: "Arizona", col: 1, row: 5 },
  { abbr: "NM", name: "New Mexico", col: 2, row: 5 },
  { abbr: "KS", name: "Kansas", col: 3, row: 5 },
  { abbr: "AR", name: "Arkansas", col: 4, row: 5 },
  { abbr: "TN", name: "Tennessee", col: 5, row: 5 },
  { abbr: "NC", name: "North Carolina", col: 6, row: 5 },
  { abbr: "SC", name: "South Carolina", col: 7, row: 5 },
  { abbr: "DC", name: "District of Columbia", col: 8, row: 5 },

  { abbr: "OK", name: "Oklahoma", col: 3, row: 6 },
  { abbr: "LA", name: "Louisiana", col: 4, row: 6 },
  { abbr: "MS", name: "Mississippi", col: 5, row: 6 },
  { abbr: "AL", name: "Alabama", col: 6, row: 6 },
  { abbr: "GA", name: "Georgia", col: 7, row: 6 },

  { abbr: "HI", name: "Hawaii", col: 0, row: 7 },
  { abbr: "TX", name: "Texas", col: 3, row: 7 },
  { abbr: "FL", name: "Florida", col: 8, row: 7 },
];

// Name → USPS abbreviation, so free-text "state" values like "California" or
// "calif." resolve to a tile alongside already-abbreviated values.
const NAME_TO_ABBR: Record<string, string> = Object.fromEntries(
  STATE_TILES.map((t) => [t.name.toLowerCase(), t.abbr])
);

const VALID_ABBRS = new Set(STATE_TILES.map((t) => t.abbr));

/** Normalize a user-entered state value to a USPS abbr, or null if unknown. */
export function normalizeState(value: string | null | undefined): string | null {
  if (!value) return null;
  const v = value.trim();
  if (!v) return null;
  const upper = v.toUpperCase();
  if (VALID_ABBRS.has(upper)) return upper;
  return NAME_TO_ABBR[v.toLowerCase()] ?? null;
}
