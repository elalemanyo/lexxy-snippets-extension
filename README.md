# Lexxy Snippets Extension

[![CI](https://github.com/elalemanyo/lexxy-snippets-extension/actions/workflows/ci.yml/badge.svg)](https://github.com/elalemanyo/lexxy-snippets-extension/actions/workflows/ci.yml)

Snippets toolbar extension for Lexxy editors.

## Installation

```sh
npm install lexxy-snippets-extension
```

`@37signals/lexxy` is a peer dependency — make sure it is installed in your app.

```js
import { configure } from "@37signals/lexxy"
import { SnippetsExtension } from "lexxy-snippets-extension"

configure({
  global: {
    extensions: [SnippetsExtension]
  }
})
```

Lexxy replaces the global `extensions` array when configured. Include every global extension your application uses in the same array.

```erb
<%= lexxy_editor_tag :body,
  data: {
    snippets: [
      { label: "Greeting", insert: "Hello!" },
      { label: "Signature", insert: "Best,\nDHH" }
    ].to_json
  } %>
```

## Snippet options

| Property | Required | Description |
|----------|----------|-------------|
| `label`  | Yes      | Name shown in the snippets menu. |
| `insert` | Yes      | Content inserted when the snippet is selected. |
| `icon`   | No       | Trusted SVG markup shown next to the label. Falls back to the first letter of `label`. |
| `type`   | No       | Set to `"html"` to insert raw HTML instead of plain text. |

Use `type: "html"` for snippets that need markup, like a styled signature. By default snippets are inserted as plain text.

Invalid JSON and malformed snippet records are ignored. If no valid snippets remain, the toolbar is left unchanged.

## Example with custom icons

```erb
<%= lexxy_editor_tag :body,
  data: {
    snippets: [
      {
        label: "Greeting",
        insert: "Hello!",
        icon: %q(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2"><g transform="scale(0.75)"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></g></svg>)
      },
      {
        label: "Signature",
        insert: "Best,<br>Team",
        type: "html",
        icon: %q(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2"><g transform="scale(0.75)"><path d="M3 17h18"/><path d="m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284"/></g></svg>)
      }
    ].to_json
  } %>
```

## Security

`icon` and `type: "html"` are trusted-input APIs. They do not sanitize markup. Never populate them with user-controlled or otherwise untrusted content.

## Contributing

Bug reports and pull requests are welcome.


## License

Released under the [MIT License](LICENSE).
