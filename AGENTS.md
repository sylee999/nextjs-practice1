# Contributor Guide

## Project Overview

This is a Next.js 15 application with TypeScript and Tailwind CSS, using mockapi.io as the REST API backend. The project implements a social platform with user management, posts, following, and bookmarking functionality.

### Key Files and Folders to Work In

- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/` - React components organized by feature
- `/src/lib/api.ts` - API wrapper for all REST calls
- `/src/types/` - TypeScript type definitions
- `/src/hooks/` - Custom React hooks
- `/public/` - Static assets

## Development Environment Setup

- Use `npm install` to install dependencies
- Run `npm run dev` to start the development server
- Use `npm run build` to build for production
- Run `npm run lint` to check code style
- Use `npm test` to run the test suite

## Code Style & Guidelines

### Naming Conventions

- Use PascalCase for React components
- Use camelCase for variables, functions, and methods
- Use kebab-case for file names
- Use ALL_CAPS for constants
- Use descriptive, intention-revealing names

### Component Structure

- Style with Tailwind CSS classes directly in components
- Keep components small and focused
- Extract reusable components to `/components` directory
- Use named exports for components
- Use Server Components by default, mark Client Components with 'use client'

### TypeScript Standards

- Define types in `/types` directory
- Use interfaces for object shapes
- Avoid `any` type as much as possible
- Use generics where appropriate

### API Integration

- Wrap all REST calls in `/lib/api.ts`
- Use proper error handling for API calls
- Implement proper loading states
- Use TypeScript interfaces for API responses

## Entity Structure

### User Entity

- id, createdAt, name, avatar, email, bio, password
- followers, following, bookmarkedPosts arrays

### Post Entity

- id, userId, title, content, bookmarkedBy array
- createdAt, updatedAt timestamps

## Validation & Testing

### Before Committing

1. Run `npm run lint` to check ESLint and TypeScript rules
2. Run `npm test` to ensure all tests pass
3. Run `npm run build` to verify production build
4. Test functionality in development environment

### Testing Guidelines

- Write unit tests with Vitest and React Testing Library
- Test business logic and component functionality
- Implement integration tests for API endpoints
- Write E2E tests for critical user flows
- Add or update tests for any code changes

## Git Workflow & PR Guidelines

### Branch Strategy

- Use GitHub Flow with branches from `main`
- Branch naming: `feature/{issue-number}-{short-title}` or `bugfix/{issue-number}-{short-title}`
- Use GitHub MCP for branch operations

### Commit Messages

- Format: `<type>: <subject>`
- Types: `feat`, `fix`, `docs`, `chore`
- Use imperative mood, keep under 50 characters
- Examples: `feat: connect login API`, `fix: correct avatar upload error`

### Pull Request Format

- **Title**: `feat: <main feature description>` or `fix: <bug description>`
- **Template**:

  ```markdown
  ### Summary

  - Key changes introduced

  ### Details

  - Additional explanation or reasoning

  ### Related Issue

  - Closes #<issue-number>
  ```

- Wait for reviewer confirmation before merging
- Use draft PRs for ongoing changes

## Issue Management

### Issue Template

```markdown
### Why?

(Purpose)

### What?

(Tasks or changes required)

### Notes

(Screenshots, links, context)
```

### Labels

- `feature` for new features
- `bug` for bugs
- Create one branch per issue

## Agent Work Guidelines

### Context Exploration

1. Start by examining related components in `/src/components/`
2. Check existing API calls in `/src/lib/api.ts`
3. Review type definitions in `/src/types/`
4. Look at similar pages in `/src/app/` for patterns

### Implementation Approach

1. Follow existing code patterns and conventions
2. Implement proper TypeScript typing
3. Use Tailwind CSS for styling
4. Handle loading and error states
5. Write tests for new functionality

### Documentation

- Update README.md only if explicitly requested
- Add inline comments for complex business logic
- Document API changes in `/lib/api.ts`
- Update type definitions as needed

### Quality Checklist

- Code follows naming conventions
- TypeScript types are properly defined
- Components are responsive and accessible
- API calls have proper error handling
- Tests are written and passing
- ESLint rules are satisfied
- Build completes successfully
