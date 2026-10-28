/** App state and a minimal store: one state object, set by patch, observed by listeners. */
import type { DeliverResponse } from "@shared/contracts"
import type { BridgeRun } from "@shared/bridge/types"
import { Connection } from "@shared/registry/schema"
import type { Theme } from "./theme"

export type TabId = "overview" | "port" | "kit" | "data" | "deliver"

/** The panes a narrow window shows one at a time. Wide windows show all three. */
export const PANES = ["devices", "stage", "inspector"] as const
export type Pane = (typeof PANES)[number]

/** The status chips, in order. */
export const STATUS_FILTERS = ["all", "bridged", "planned"] as const
export type StatusFilter = (typeof STATUS_FILTERS)[number]

/** Every catalogue chip, in order: each status, then each connection type. One chip is on at a time. */
export const CATALOG_FILTERS = [...STATUS_FILTERS, ...Connection.options] as const
export type CatalogFilter = StatusFilter | Connection

export interface RunState {
  run: BridgeRun | null
  delivery: DeliverResponse | null
  failed: boolean
  /** How many pipeline stages the current run has revealed, 0 to 5. */
  revealed: number
  /** The clock time when the run began, or null when none is going. */
  startedAt: number | null
}

export interface AppState extends RunState {
  deviceId: string
  tab: TabId
  pane: Pane
  explosion: number
  labels: boolean
  zoom: number
  catalogFilter: CatalogFilter
  theme: Theme
  /** The kit part picked on the Kit tab, or null. */
  part: string | null
}

export type Listener = (state: AppState, previous: AppState) => void

export const IDLE_RUN: RunState = { run: null, delivery: null, failed: false, revealed: 0, startedAt: null }

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
