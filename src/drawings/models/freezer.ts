import { G, type Part } from "../engine"
import { portAndTap, type Labels } from "../bridgeKit"
import { block, frontRect, spread } from "../shapes"
import { type DrawingModel } from "./types"

function cabinet(): Part {
  const p = block("cabinet", "Insulated cabinet", [[-330, -380, 120], [330, 380, 1900]], [0, 0, 0], 12)
  for (const z of spread(4, 420, 380)) G.line(p, [-300, -380.05, z], [300, -380.05, z], "detail")
  return p
}

function deck(): Part {
  const p = block("deck", "Compressor deck", [[-330, -380, 0], [330, 380, 118]], [0, 0, 0], 12)
  for (const x of spread(10, -260, 56)) frontRect(p, -380.05, [x, 24], [x + 30, 94])
  return p
}

function door(): Part {
  const p = block("door", "Outer door", [[-330, -450, 122], [330, -384, 1900]], [760, -260, 0], 12)
  G.box(p, [250, -490, 900], [280, -450, 1300], { radius: 6 })
  return p
}

function rack(): Part {
  const p = block("rack", "Sample rack", [[-140, -300, 1040], [140, 300, 1340]], [0, -620, 0], 4)
  for (const z of spread(4, 1100, 60)) G.line(p, [-140, -300.05, z], [140, -300.05, z], "detail")
  return p
}

function recorder(): Part {
  const p = block("recorder", "Chart recorder", [[-180, -370, 1902], [180, -240, 1990]], [0, 0, 220], 8)
  G.circle(p, [-80, -370.05, 1946], 34, [0, -1, 0], { role: "detail" })
  return p
}

function build(labels: Labels): Part[] {
  return [deck(), cabinet(), rack(), door(), recorder(), ...portAndTap(labels, { faceX: -330, y: -200, z: 1760 })]
}

export const freezer: DrawingModel = { camera: { azimuth: -132, elevation: 18, roll: 0 }, build }
