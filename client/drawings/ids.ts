/** Drawing IDs: an instrument drawing uses the device ID, and a kit drawing uses "kit:" and the kit ID. */
const KIT_PREFIX = "kit:"

/** The ID of the bridge tap in an instrument drawing. A click on it opens the kit. */
export const BRIDGE_ID = "bridge"

export function kitDrawingId(kitId: string): string {
  return `${KIT_PREFIX}${kitId}`
}

/** The kit ID inside a kit drawing ID, or null for an instrument drawing. */
export function kitIdOf(id: string): string | null {
  return id.startsWith(KIT_PREFIX) ? id.slice(KIT_PREFIX.length) : null
}
