# Development Process Guidelines

## 1. Issue-Driven Development

### Issue Creation

- **Labels**: Use `feature` for new features, `bug` for bugs
- **Title**: Brief and descriptive (no prefixes - use labels instead)
- **Template**:

  ```markdown
  ### Why?

  (Purpose and context)

  ### What?

  (Tasks or changes required)

  ### Notes

  (Screenshots, links, additional context)
  ```

### Issue Workflow

1. Create issue with proper label and description
2. Assign to developer
3. Link to branch when development starts
4. Update with implementation plan and progress
5. Close with PR merge

## 2. Branching & Version Control

### Branch Strategy (GitHub Flow)

- Create branches from `main`
- Naming convention: `{type}/{issue-number}-{short-title}`
  - Types: `feature/*` or `bugfix/*`
  - Example: `feature/81-add-user-profile`
- Use GitHub MCP tools for all branch operations
- Delete branch after merge

### Commit Guidelines

- Format: `<type>: <subject>`
- Types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`
- Subject: imperative mood, under 50 characters
- Examples:
  ```
  feat: add user authentication
  fix: resolve login redirect issue
  test: add user profile tests
  ```

## 3. Development Workflow

### Step 1: Planning

1. **Analyze Issue**
   - Review requirements and acceptance criteria
   - Identify technical approach and dependencies
2. **Create Implementation Plan**
   - Post as comment on GitHub issue
   - Include:
     - Technical approach and architecture decisions
     - List of files to be created/modified
     - Key implementation steps
     - Testing strategy
     - Potential risks or blockers

### Step 2: Implementation

1. **Create and Switch Branch**

   ```bash
   # Using GitHub MCP to ensure proper syncing
   feature/{issue-number}-{short-title}
   ```

2. **Code Development**

   - Follow the implementation plan
   - Write tests alongside code
   - Make incremental commits
   - Run tests locally before pushing

3. **Progress Updates**
   - Add comments to issue for significant milestones
   - Document any deviations from plan with reasoning
   - Ask for help early if blocked

### Step 3: Review & Merge

1. **Pre-PR Checklist**
   - [ ] All tests pass locally
   - [ ] Code follows style guidelines
   - [ ] No linting errors
   - [ ] Documentation updated if needed
2. **Create Pull Request**

   - Title: Match issue format (e.g., `feat: implement user profile`)
   - Use PR template:

     ```markdown
     ### Summary

     - Key changes introduced
     - Technologies/patterns used

     ### Testing

     - How the changes were tested
     - Any manual testing required

     ### Screenshots

     (If UI changes)

     ### Related Issue

     Closes #<issue-number>
     ```

3. **Review Process**
   - Request review from team lead/senior developer
   - Address feedback promptly
   - Do NOT merge without approval
   - Reviewer merges after approval

## 4. Quality Standards

### Testing Requirements

- **Unit Tests**: All business logic and utilities
- **Integration Tests**: API endpoints and data flow
- **Component Tests**: React components with user interaction
- **E2E Tests**: Critical user journeys

### Code Quality

- ESLint + Prettier compliance
- TypeScript strict mode
- No `any` types without justification
- Meaningful variable/function names
- Comments for complex logic

### CI/CD Pipeline

- All tests must pass
- Build must succeed
- No decrease in code coverage
- Deployment preview for UI changes

## 5. Best Practices

### Communication

- Update issues regularly
- Ask questions early
- Share blockers in standup
- Document decisions

### Git Hygiene

- Pull from `main` before starting work
- Rebase feature branches if needed
- Keep commits atomic and meaningful
- Clean up branches after merge

### Time Management

- Break large issues into subtasks
- Estimate effort in issue comments
- Flag delays early
- Focus on MVP first, enhance later

## Quick Reference

### Daily Workflow

```bash
# Start of day
git checkout main
git pull origin main

# Start new feature
git checkout -b feature/123-new-feature

# During development
git add .
git commit -m "feat: implement feature logic"
git push origin feature/123-new-feature

# Create PR when ready
# Use GitHub MCP or web interface
```

### Common Commands

```bash
# Check branch status
git status

# View commit history
git log --oneline -10

# Sync with main
git checkout main
git pull origin main
git checkout feature/123-new-feature
git rebase main
```
