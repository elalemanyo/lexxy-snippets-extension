export interface Snippet {
  label: string
  insert: string
  icon?: string
  type?: 'text' | 'html'
}

export declare class SnippetsExtension {
  constructor(editorElement: HTMLElement)
  readonly enabled: boolean
  readonly editorElement: HTMLElement
  initializeToolbar(toolbar: HTMLElement): void
  dispose(): void
}
