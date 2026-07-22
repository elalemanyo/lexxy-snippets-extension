const triggerIcon = '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="scale(0.75)"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></g></svg>'

export class SnippetsExtension {
  #dropdownObserver
  #editorElement

  constructor (editorElement) {
    this.#editorElement = editorElement
  }

  get editorElement () {
    return this.#editorElement
  }

  get enabled () {
    return this.editorElement.supportsRichText
  }

  get allowedElements () {
    return []
  }

  initializeToolbar (toolbar) {
    if (toolbar.querySelector('button[name=snippets]')) return

    const snippets = this.#snippets
    if (!snippets?.length) return

    const dropdown = document.createElement('lexxy-toolbar-dropdown')
    dropdown.className = 'lexxy-editor__toolbar-dropdown'
    dropdown.innerHTML = `
      <button type="button" class="lexxy-editor__toolbar-button lexxy-editor__toolbar-button--chevron" name="snippets" title="Insert snippet" data-dropdown-trigger aria-haspopup="menu" aria-expanded="false">
        ${triggerIcon}
      </button>
      <div data-dropdown-panel role="menu" class="lexxy-editor__toolbar-dropdown-list lexxy-snippets__dropdown-list" hidden>
        ${snippets.map((snippet, index) => `
          <button type="button" role="menuitem" data-snippet-index="${index}" title="${this.#escapeAttribute(snippet.label)}">
            ${snippet.icon || this.#fallbackIcon(snippet.label)}
            <span>${this.#escapeHtml(snippet.label)}</span>
          </button>
        `).join('')}
      </div>
    `

    dropdown.querySelectorAll('.lexxy-snippets__dropdown-list button svg').forEach(svg => {
      svg.style.flexShrink = '0'
    })

    dropdown.querySelectorAll('[data-snippet-index]').forEach(button => {
      const index = parseInt(button.dataset.snippetIndex, 10)
      button.addEventListener('click', () => this.#insertSnippet(snippets[index]))
    })

    const undo = toolbar.querySelector('button[name=undo]')
    if (undo) {
      undo.insertAdjacentElement('beforebegin', dropdown)
      dropdown.previousElementSibling?.classList.add('lexxy-editor__toolbar-group-end')
    } else {
      toolbar.append(dropdown)
    }

    const trigger = dropdown.querySelector('[data-dropdown-trigger]')
    const panel = dropdown.querySelector('[data-dropdown-panel]')
    this.#dropdownObserver = new MutationObserver(() => {
      trigger?.setAttribute('aria-expanded', String(!panel.hidden))
    })
    this.#dropdownObserver.observe(panel, { attributes: true, attributeFilter: ['hidden'] })

    this.dropdown = dropdown
  }

  dispose () {
    this.#dropdownObserver?.disconnect()
    this.dropdown?.remove()
  }

  #insertSnippet (snippet) {
    const editor = this.editorElement

    if (snippet.type === 'html') {
      editor.contents.insertHtml(snippet.insert)
    } else {
      editor.contents.insertText(snippet.insert)
    }

    editor.focus()
    this.dropdown?.close()
  }

  get #snippets () {
    const raw = this.editorElement.getAttribute('data-snippets')
    if (!raw) return null

    try {
      const snippets = JSON.parse(raw)
      return Array.isArray(snippets) ? snippets.filter(snippet => this.#isValidSnippet(snippet)) : null
    } catch {
      return null
    }
  }

  #isValidSnippet (snippet) {
    return snippet !== null &&
      typeof snippet === 'object' &&
      typeof snippet.label === 'string' &&
      snippet.label.trim().length > 0 &&
      typeof snippet.insert === 'string' &&
      (snippet.type === undefined || snippet.type === 'text' || snippet.type === 'html') &&
      (snippet.icon === undefined || typeof snippet.icon === 'string')
  }

  #escapeHtml (text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  #escapeAttribute (text) {
    return this.#escapeHtml(text).replace(/"/g, '&quot;')
  }

  #fallbackIcon (label) {
    const letter = this.#escapeHtml(label?.trim().slice(0, 1) || 'S')
    return `<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><text x="9" y="9" text-anchor="middle" dominant-baseline="central" font-size="13.5" font-weight="700" style="fill: currentColor; stroke: none">${letter}</text></svg>`
  }
}
