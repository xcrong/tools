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