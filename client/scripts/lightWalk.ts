/** Light walk: moves the mouse over a glowing card and reports when the pointer light does not follow it. */
import type { Page } from "@playwright/test"

const WAIT_MS = 100

function glowX(element: Element): string {
  return getComputedStyle(element).getPropertyValue("--glow-x")
}

/** The x offset the card holds for the light, or an empty string when the light never moved. */
async function lightOffset(page: Page, selector: string): Promise<string> {
  return page.locator(selector).evaluate(glowX)
}

async function moveInto(page: Page, selector: string): Promise<void> {
  const box = await page.locator(selector).boundingBox()
  if (box) await page.mouse.move(box.x + box.width / 3, box.y + box.height / 3)
  await page.waitForTimeout(WAIT_MS)
}

export async function walkLight(page: Page, selector: string): Promise<string[]> {
  await moveInto(page, selector)
  const offset = await lightOffset(page, selector)
  return offset.trim() === "" ? [`pointer light did not follow the pointer on ${selector}`] : []
}
