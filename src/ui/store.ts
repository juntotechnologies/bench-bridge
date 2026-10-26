import type { BridgeRun } from "../bridge/types"

export type TabId = "overview" | "port" | "data" | "deliver"

export interface AppState {
  deviceId: string
  tab: TabId
  explosion: number
  labels: boolean
  zoom: number
  run: BridgeRun | null
  /** How many pipeline stages the current run has revealed, 0 to 5. */
  revealed: number
}

type Listener = (state: AppState, previous: AppState) => void

export class Store {
  private state: AppState
  private readonly listeners: Listener[] = []

  constructor(initial: AppState) {
    this.state = initial
  }

  get(): AppState {
    return this.state
  }

  set(patch: Partial<AppState>): void {
    const previous = this.state
    this.state = { ...previous, ...patch }
    for (const listener of this.listeners) listener(this.state, previous)
  }

  subscribe(listener: Listener): void {
    this.listeners.push(listener)
  }
}
