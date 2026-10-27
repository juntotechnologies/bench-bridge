/** Message shapes between the page and the drawing worker. */
export interface DrawRequest {
  requestId: number
  /** A device ID, or "kit:" and a kit ID. */
  drawingId: string
  explosion: number
  annotate: boolean
}

export type DrawReply = { requestId: number; markup: string } | { requestId: number; error: string }
