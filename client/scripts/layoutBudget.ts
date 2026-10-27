/** Layout budget: pure rules that judge measured boxes and text lines. The fit check measures; this file decides. */

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

function isUndersized(tapMin: number, box: Box): boolean {
  return Math.min(box.width, box.height) < tapMin - 0.5
}

/** The boxes that are smaller than the tap size in either direction. */
export function undersized(boxes: Box[], tapMin: number): Box[] {
  return boxes.filter(isUndersized.bind(null, tapMin))
}

function widthOf(box: Box): number {
  return box.width
}

function widthSpread(row: Box[]): number {
  const widths = row.map(widthOf)
  return Math.max(...widths) - Math.min(...widths)
}

function startsRow(tolerance: number, box: Box, row: Box[]): boolean {
  return Math.abs((row[0]?.y ?? 0) - box.y) <= tolerance
}

function place(tolerance: number, rows: Box[][], box: Box): Box[][] {
  const row = rows.find(startsRow.bind(null, tolerance, box))
  if (row) row.push(box)
  else rows.push([box])
  return rows
}

/** The boxes grouped into rows: boxes whose tops are within the tolerance share a row. */
export function rowsOf(boxes: Box[], tolerance: number): Box[][] {
  return boxes.reduce(place.bind(null, tolerance), [])
}

function isUneven(tolerance: number, row: Box[]): boolean {
  return row.length > 1 && widthSpread(row) > tolerance
}

/** True when the buttons of one row differ in width by more than the tolerance. */
export function hasUnevenRow(boxes: Box[], tolerance: number): boolean {
  return rowsOf(boxes, tolerance).some(isUneven.bind(null, tolerance))
}

function isLopsided(windowWidth: number, tolerance: number, box: Box): boolean {
  return Math.abs(box.x - (windowWidth - box.x - box.width)) > tolerance
}

/** The boxes whose gap to the left edge of the window differs from the gap to the right edge. */
export function lopsided(boxes: Box[], windowWidth: number, tolerance: number): Box[] {
  return boxes.filter(isLopsided.bind(null, windowWidth, tolerance))
}

function isOver(max: number, count: number): boolean {
  return count > max
}

/** The line counts that are over the limit. */
export function overlong(lines: number[], max: number): number[] {
  return lines.filter(isOver.bind(null, max))
}
