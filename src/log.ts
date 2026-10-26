export type Severity = "info" | "warn" | "error"

export type LogFields = Record<string, string | number | boolean>

/** One JSON line per event: a stable name, correlating IDs and a severity. Never payloads. */
export function logEvent(event: string, fields: LogFields, severity: Severity = "info"): void {
  console[severity](JSON.stringify({ event, severity, ...fields }))
}
