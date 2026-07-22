import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('package entry point has no external imports', async () => {
  const source = await readFile(new URL('../snippets_extension.js', import.meta.url), 'utf8')

  expect(source).not.toMatch(/^import\s/m)
})

async function loadWithSnippets (page, snippets) {
  await page.addInitScript(raw => {
    const observer = new MutationObserver(() => {
      const editor = document.querySelector('lexxy-editor')
      if (editor) {
        editor.setAttribute('data-snippets', raw)
        observer.disconnect()
      }
    })
    observer.observe(document, { childList: true, subtree: true })
  }, typeof snippets === 'string' ? snippets : JSON.stringify(snippets))

  await page.goto('/docs/index.html')
}

test('snippets dropdown shows items', async ({ page }) => {
  await page.goto('/docs/index.html')

  const snippetsButton = page.locator('button[name="snippets"]')
  await expect(snippetsButton).toBeVisible()

  await snippetsButton.click()

  await expect(page.getByRole('menuitem', { name: 'Greeting' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Signature' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Greeting' }).locator('svg')).toHaveCount(1)
})

test('clicking a snippet inserts text', async ({ page }) => {
  await page.goto('/docs/index.html')

  await page.locator('button[name="snippets"]').click()
  await page.getByRole('menuitem', { name: 'Greeting' }).click()

  await expect(page.locator('.lexxy-editor__content')).toContainText('Hello!')
})

test('multiline plain text uses line breaks', async ({ page }) => {
  await page.goto('/docs/index.html')

  await page.locator('button[name="snippets"]').click()
  await page.getByRole('menuitem', { name: 'Signature' }).click()

  await expect(page.locator('.lexxy-editor__content br')).toHaveCount(1)
  await expect(page.locator('.lexxy-editor__content p')).toHaveCount(1)
})

test('HTML snippets insert markup', async ({ page }) => {
  await loadWithSnippets(page, [
    { label: 'Bold', insert: '<strong>Important</strong>', type: 'html' }
  ])

  await page.locator('button[name="snippets"]').click()
  await page.getByRole('menuitem', { name: 'Bold' }).click()

  await expect(page.locator('.lexxy-editor__content strong')).toHaveText('Important')
})

test('a snippet replaces the selected text', async ({ page }) => {
  await page.goto('/docs/index.html')

  const content = page.locator('.lexxy-editor__content')
  await content.click()
  await page.keyboard.type('Replace me')
  await page.keyboard.press('ControlOrMeta+A')
  await page.locator('button[name="snippets"]').click()
  await page.getByRole('menuitem', { name: 'Greeting' }).click()

  await expect(content).toContainText('Hello!')
  await expect(content).not.toContainText('Replace me')
})

test('invalid snippet records are ignored', async ({ page }) => {
  await loadWithSnippets(page, [
    null,
    { label: 123, insert: 'Invalid label' },
    { label: 'Missing content' },
    { label: 'Invalid type', insert: 'Nope', type: 'markdown' },
    { label: 'Invalid icon', insert: 'Nope', icon: 123 },
    { label: 'Valid', insert: 'Works' }
  ])

  await page.locator('button[name="snippets"]').click()

  await expect(page.getByRole('menuitem')).toHaveCount(1)
  await expect(page.getByRole('menuitem', { name: 'Valid' })).toBeVisible()
})

test('invalid JSON leaves the editor unchanged', async ({ page }) => {
  await loadWithSnippets(page, 'not JSON')

  await expect(page.locator('lexxy-editor')).toBeVisible()
  await expect(page.locator('button[name="snippets"]')).toHaveCount(0)
})

test('an empty snippet list leaves the toolbar unchanged', async ({ page }) => {
  await loadWithSnippets(page, [])

  await expect(page.locator('lexxy-editor')).toBeVisible()
  await expect(page.locator('button[name="snippets"]')).toHaveCount(0)
})
