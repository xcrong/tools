# Agent Guidelines for Svelte 5 Tools Website

This file provides guidance for AI agents working on this SvelteKit codebase using Svelte 5.

## Project Overview
A collection of developer tools built with SvelteKit 5 and Vite, featuring:
- MongoDB ObjectId converter
- Timestamp converter
- Doubao video downloader

## Build, Lint, and Test Commands

### Development
```bash
# Start development server
npm run dev

# Preview production build
npm run preview
```

### Building
```bash
# Build for production (output to /build directory)
npm run build
```

### Code Quality - MANDATORY
```bash
# Check TypeScript and Svelte syntax - MUST PASS AFTER EVERY FRONTEND CHANGE
npm run check

# Watch for changes and validate (useful during development)
npm run check:watch
```

> **IMPORTANT**: After any frontend code modification, you MUST run `npm run check` and fix any errors or warnings before considering the task complete. This ensures code quality and type safety.

### Testing
Note: This project does not currently have a testing framework configured.
When tests are added in the future:
```bash
# Example commands (to be implemented when tests are added)
# npm test
# npm run test:unit
# npm run test:integration

# Running a single test (when testing framework is implemented)
# npm test -- -t "test name pattern"
# npx vitest run testName
```

## Code Style Guidelines

### TypeScript Conventions
- Use strict TypeScript checking (enabled via tsconfig.json)
- Prefer interfaces over types for object shapes
- Use type aliases for union/types and complex types
- Enable `checkJs` for JavaScript files with JSDoc
- Export types when they're part of a module's public API
- Avoid `any` type; use `unknown` when type is uncertain and perform type narrowing

### Svelte 5 Specific Standards (Runes)
- **State Management**: Use `$state()` for reactive state
  ```javascript
  let count = $state(0);
  let user = $state({ name: "", age: 0 });
  ```
- **Derived Values**: Use `$derived()` for computed values
  ```javascript
  const doubled = $derived(count * 2);
  const fullName = $derived(`${user.firstName} ${user.lastName}`);
  ```
- **Side Effects**: Use `$effect()` for side effects
  ```javascript
  $effect(() => {
    document.title = `Count: ${count}`;
  });
  
  $effect(() => {
    if (user.age > 18) {
      console.log("User is adult");
    }
  }, { once: true }); // Run only once
  ```
- **Props**: Use `export let` for props (Svelte 5 still supports this)
- **Events**: Use `onclick`, `oninput`, etc. directly in templates
- **Two-way Binding**: Use `bind:` directive when needed, but prefer unidirectional data flow

### File Organization
- Components: `src/routes/` for page components, `src/lib/` for reusable components
- Styles: Scoped within `<style>` tags in Svelte files
- Type definitions: `.ts` files alongside components or in `src/lib/types/`
- Services: `src/lib/services/` for API calls and business logic
- Utils: `src/lib/utils/` for helper functions

### Import Organization
1. External packages (alphabetical)
2. Absolute imports from `$lib` or `$src`
3. Relative imports (./, ../)
4. Svelte-specific imports last

Example:
```typescript
import { onMount } from 'svelte';
import { writable } from 'svelte/store';
import { api } from '$lib/services';
import Component from './Component.svelte';
```

### Naming Conventions
- Components: PascalCase (MyComponent.svelte)
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Event handlers: camelCase with prefix (handleClick, onInputChange)
- Stores: camelCase with Store suffix (userStore)
- DOM nodes: camelCase with Element suffix (inputElement)

### Error Handling
- Use try/catch for async operations
- Display user-friendly error messages in UI
- Log errors to console in development (avoid in production)
- Consider using Svelte stores for error state
- Validate inputs before processing
- Use `Error` subclasses for specific error types when beneficial

### Formatting
- Use 2 spaces for indentation (VS Code default)
- Maximum line length: 100 characters
- Semicolons: Optional but consistent (prefer omitting in Svelte/TS)
- Quotes: Single quotes for strings, double quotes for HTML attributes
- Trailing commas: Multi-line objects and arrays
- Empty lines: One empty line between logical sections in templates and scripts

### Specific Patterns in This Codebase
- Use `adapter-static` for static site generation (output to 'build' directory)
- All pages under `src/routes/` with `+page.svelte` and `+page.ts`
- Layouts use `+layout.svelte`
- Data loading with `load` functions in `+page.ts` files
- Styling with CSS variables and scoped styles
- Template conditionals: Use `{#if}`, `{:else}`, `{/if}` blocks
- Template loops: Use `{#each items as item}`, `{/each}`
- Keyed each blocks: `{#each items as item (item.id)}` for stable IDs

### Version Control
- Commit messages: Conventional Commits format
  - `fix: correct typo in timestamp conversion`
  - `feat: add video download progress indicator`
  - `refactor: simplify ObjectId extraction logic`
  - `docs: update README with new tool description`
  - `test: add unit tests for timestamp parser`
  - `chore: update dependencies`
- Keep commits focused and atomic
- Write clear, descriptive commit messages

### Performance Considerations
- Use Svelte 5's fine-grained reactivity efficiently
- Avoid unnecessary computations in `$derived` blocks
- Use `$effect` with dependencies array when appropriate
- Lazy load non-critical components
- Optimize images and assets
- Consider code splitting for larger features
- Use `requestIdleCallback` for non-urgent work
- Memoize expensive computations when needed

### Accessibility (a11y)
- Use semantic HTML elements
- Ensure proper color contrast
- Add alt text to images
- Ensure keyboard navigation works
- Use ARIA attributes when necessary
- Test with screen readers

### Security
- Sanitize user inputs
- Avoid innerHTML with user content
- Use HTTPS in production
- Implement proper CORS policies
- Store secrets in environment variables, never in code
- Validate file uploads

## Troubleshooting Common Issues

### TypeScript Errors
- Check for missing imports
- Verify type definitions exist
- Use type assertions sparingly: `const element = node as HTMLInputElement;`
- Consider adding JSDoc to JavaScript files: `/** @type {HTMLInputElement} */`

### Svelte 5 Reactivity
- Remember that `$state` creates reactive proxies
- Direct mutation works: `state.count++`
- Avoid spreading state objects when you need reactivity: `{...state}` loses reactivity
- Use `$state.snapshot()` when you need a non-reactive copy

### Styling Issues
- Scoped styles don't affect child components unless using `:global()`
- Use CSS custom properties for theme variables
- Consider using a utility-first approach for common styles

## Final Checklist Before Considering Work Complete
- [ ] All frontend changes have been made
- [ ] `npm run check` passes with no errors or warnings
- [ ] Code follows Svelte 5 best practices (proper use of runes)
- [ ] Component is responsive and accessible
- [ ] No console errors in development mode
- [ ] Changes are committed with descriptive message
- [ ] Documentation updated if necessary

Remember: **Never consider frontend work complete until `npm run check` passes cleanly.**

---

## Project Evolution History

### Cyberpunk Terminal Design System (2026-03-17)
This project uses a custom "Cyber Terminal" design system with the following characteristics:

**Color Palette**
- Primary neon colors: `--neon-cyan` (#00f5ff), `--neon-pink` (#ff00a0), `--neon-green` (#00ff9d), `--neon-yellow` (#ffee00), `--neon-purple` (#b829dd)
- Dark backgrounds: `--bg-primary` (#0a0a0f), `--bg-secondary` (#12121a), `--bg-card` (#13131a)
- Text hierarchy: `--text-primary`, `--text-secondary`, `--text-muted`

**Typography**
- Display/Headlines: `'JetBrains Mono'` - monospace for terminal aesthetic
- Body: `'Space Grotesk'` - clean sans-serif
- All code and data displays use JetBrains Mono

**UI Patterns**
- Terminal window cards with traffic light dots (red/yellow/green)
- Glowing text effects: `.text-glow-cyan`, `.text-glow-pink`, etc.
- Icon boxes with neon borders: `.icon-box-cyan`, `.icon-box-pink`, etc.
- Scan line background overlay (`body::before`)
- Grid background pattern (`.grid-bg`)

**Navigation Structure**
- Sidebar navigation (VS Code style) with tool categories
- Categories: DATABASE, TIME, MEDIA, GENERATOR
- Each tool has: icon, label, and belongs to a category
- Mobile: sidebar collapsible with hamburger menu
- Desktop: sidebar always visible, main content offset

### Sidebar Navigation Pattern

To add a new tool to the sidebar:

1. **Create the tool page** at `src/routes/tool-name/+page.svelte`
2. **Add to Sidebar.svelte** categories array:
   ```typescript
   const categories = [
     {
       name: "CATEGORY_NAME",
       items: [
         { href: "/tool-name", label: "Tool Label", icon: "◆" },
       ]
     }
   ];
   ```
3. **Update tool count** in Sidebar footer
4. **Add to homepage** grid in `src/routes/+page.svelte`
5. **Update status bar** tool count

### Adding New Tools

When integrating a new tool:

1. **Adapt to existing design system**
   - Use `tool-card`, `icon-box-*`, `btn-primary`, `btn-secondary` classes
   - Follow the card-header-content pattern with icon + title
   - Use the established color coding (cyan/database, green/time, pink/media, purple/generator)

2. **Page structure pattern**
   ```
   <div class="content-container">
     <div class="page-title">Tool Name // Subtitle</div>
     
     <!-- Input section -->
     <div class="tool-card">
       <div class="flex items-center mb-5">
         <div class="icon-box icon-box-cyan">
           <span class="font-mono text-lg text-cyan">$</span>
         </div>
         <h2 class="card-title">Section Title // LABEL</h2>
       </div>
       <!-- Content -->
     </div>
     
     <!-- Output/Result section (if applicable) -->
   </div>
   ```

3. **Always run** `npm run check` after changes

### Git Workflow Notes

- Use `.gitignore` to exclude: `node_modules/`, `build/`, `.svelte-kit/`, IDE files
- Commit source code only, never commit build outputs
- Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`
- Keep commits atomic and focused

### SVG Animation Tools (term2svg)

The term2svg tool generates animated terminal SVGs:
- Supports 6 terminal themes: catppuccin, dracula, tokyo, gruvbox, nord, light
- Command lines get typing animation
- Output lines fade in sequentially
- Uses SMIL animations (not CSS) for compatibility
- Parsing rules: `$`/`%`/`#!` prefix = command, others = output

### Internationalization (i18n) (2026-03-18)

This project supports Chinese and English with automatic browser language detection.

**Architecture**
- Custom lightweight i18n implementation (no external dependencies)
- Svelte 5 runes for reactive language switching
- Static site compatible (no SSR required)

**File Structure**
```
src/lib/i18n/
├── index.ts          # Core translation logic, language detection
├── store.svelte.ts   # Svelte 5 reactive state (i18n, translate)
└── locales/
    ├── zh.json       # Chinese translations
    └── en.json       # English translations
```

**Usage**
```svelte
<script lang="ts">
  import { translate, i18n } from "$lib/i18n/store.svelte";
</script>

<!-- In templates -->
<h1>{translate("common.title")}</h1>

<!-- Language switching -->
<button onclick={() => i18n.toggle()}>
  {i18n.locale === 'zh' ? 'EN' : '中文'}
</button>
```

**Features**
- Automatic browser language detection (`navigator.language`)
- Language preference stored in `localStorage`
- FOWL (Flash of Wrong Locale) prevention via inline script in `app.html`
- URL remains unchanged (no language prefix)
- Instant language switching without page refresh

**Translation Keys Structure**
```json
{
  "common": { "title": "...", "copy": "...", ... },
  "sidebar": { "home": "...", "database": "...", ... },
  "home": { "tools": {...}, "status": {...}, ... },
  "mongoObjectId": {...},
  "timestamp": {...},
  "doubaoVideo": {...},
  "term2svg": {...}
}
```

**Adding New Translations**
1. Add keys to both `zh.json` and `en.json`
2. Use `translate("key.path")` in components
3. Run `npm run check` to verify