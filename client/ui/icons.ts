/** Inline SVG icon paths used across the UI. */
const PATHS: Record<string, string> = {
  plug: "M9 2v4M15 2v4M6 6h12v4a6 6 0 0 1-12 0zM12 16v6",
  brackets: "M8 4H5v16h3M16 4h3v16h-3M9 12h6",
  scale: "M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM6 15V9a4 4 0 0 1 4-4h6M18 9v6a4 4 0 0 1-4 4H8",
  send: "M4 12l16-8-6 16-3-7z M11 13l9-9",
  check: "M5 12l5 5 9-10",
  cross: "M6 6l12 12M18 6L6 18",
  play: "M7 4l13 8-13 8z",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  reset: "M4 12a8 8 0 1 0 3-6.2M4 4v4h4",
  tag: "M3 12V4h8l10 10-8 8z M8 8h.01",
  bridge: "M2 16h20M4 16V10a8 8 0 0 1 16 0v6M8 16v-4M12 16v-6M16 16v-4",
  flask: "M9 3h6M10 3v6L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2L14 9V3M7 15h10",
  dna: "M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12M8 7h8M8 17h8",
}

export function icon(name: string, size = 16): string {
  const d = PATHS[name] ?? ""
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`
}
