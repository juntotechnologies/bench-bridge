/** Generated blocks in markdown: finds each `gen` marker pair and fills it from a renderer. */

export type Renderer = (arg: string) => string
export type Renderers = Record<string, Renderer>

const BLOCK = /<!-- gen:(\S+?)(?: ([^>]*?))? -->([\s\S]*?)<!-- \/gen -->/g

export function applyBlocks(text: string, renderers: Renderers): string {
  return text.replace(BLOCK, renderBlock.bind(null, renderers))
}

function renderBlock(renderers: Renderers, _match: string, name: string, arg: string | undefined): string {
  const render = renderers[name]
  if (!render) throw new Error(`unknown generator: ${name}`)
  const argument = arg ?? ""
  const open = argument ? `<!-- gen:${name} ${argument} -->` : `<!-- gen:${name} -->`
  return `${open}${render(argument)}<!-- /gen -->`
}
