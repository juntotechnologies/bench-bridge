/** Maps normalized readings to target records using each device's field map. */
import type { Device, FieldSource } from "../registry/schema"
import type { FieldValue, MappedRecord, Reading } from "./types"

interface MapContext {
  reading: Reading
  device: Device
}

type Delivery = Device["deliveries"][number]

/** One target record per delivery per reading, built from the registry field map. */
export function mapRecords(device: Device, readings: Reading[]): MappedRecord[] {
  return device.deliveries.flatMap(mapDelivery.bind(null, device, readings))
}

function mapDelivery(device: Device, readings: Reading[], delivery: Delivery): MappedRecord[] {
  return readings.map(mapReading.bind(null, device, delivery))
}

function mapReading(device: Device, delivery: Delivery, reading: Reading, readingIndex: number): MappedRecord {
  const context = { reading, device }
  const entries = Object.entries(delivery.fields).flatMap(resolveEntry.bind(null, context))
  return { target: delivery.target, readingIndex, fields: Object.fromEntries(entries) }
}

function resolveEntry(context: MapContext, [name, source]: [string, FieldSource]): [string, FieldValue][] {
  const value = typeof source === "string" ? resolvePath(context, source) : source.const
  return isFieldValue(value) ? [[name, value]] : []
}

function resolvePath(context: MapContext, path: string): unknown {
  return path.split(".").reduce(step, context as unknown)
}

function step(value: unknown, key: string): unknown {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined
}

function isFieldValue(value: unknown): value is FieldValue {
  return ["string", "number", "boolean"].includes(typeof value)
}
