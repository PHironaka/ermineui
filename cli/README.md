# Ermine UI

Copy-in Vue 3 components styled with plain CSS variables. The command line copies component source into your project, so nothing is imported from `node_modules` and every line is yours to edit.

```sh
npx ermineui init                 # creates ermine.json and the theme stylesheet
npx ermineui add button dialog    # copies components, and anything they depend on
npx ermineui add dashboard        # copies a block: a whole page built from the components
npx ermineui list                 # shows every component and block
```

`npx ermineui mcp` runs an MCP server, so AI coding tools (Claude Code, Codex, Cursor) can look components up and add them. For Claude Code: `claude mcp add ermine -- npx -y ermineui mcp`.

Works in Vue 3.5+, Nuxt and Astro projects. Needs Node 18 or later.

Full documentation, the component list and the source are at
<https://github.com/PHironaka/ermineui>.

## Licence

MIT
