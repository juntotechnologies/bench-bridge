export interface DrawRequest {
  requestId: number
  deviceId: string
  explosion: number
  annotate: boolean
}

export type DrawReply = { requestId: number; markup: string } | { requestId: number; error: string }
