/**
 * Sort a list of items alphabetically by `name`.
 *
 * Case-insensitive and locale-aware (handles accents) via
 * `localeCompare` with `sensitivity: 'base'`. Returns a new array —
 * never mutates the input.
 */
export const sortByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
