import { cp, mkdir, rm } from 'node:fs/promises'

await rm('_site', { recursive: true, force: true })
await mkdir('_site')
await cp('docs', '_site', { recursive: true })
await cp('snippets_extension.js', '_site/snippets_extension.js')
