# Product Requirements Document (PRD)

## 1. Overview

- **Project Name**: `nextjs-practice1`
- **Goal**: Implement and learn CRUD operations for `user` and `post` resources via a REST API backend.

---

## 2. Main Features

- **User**
  - Create, Read, Update, Delete users
  - View all posts by a user
  - Like/unlike users
  - View all users who liked a user
- **Post**
  - Create, Read, Update, Delete posts
  - Like/unlike posts
  - View all users liked by a post

---

## 3. Tech Stack & Implementation

### 3.1 Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS + Shadcn/UI
- mockapi.io REST API
- Vercel (deployment)
- GitHub (version control)
- Vitest, React Testing Library (testing)

### 3.2 Implementation Guidelines

- **Project Structure**
  ```text
  /src
    /app         # Next.js pages using App Router
    /components  # React components
    /lib         # Utility functions and API wrapper
    /types       # TypeScript type definitions
  /public        # Static assets
  ```
- Follow App Router conventions
- Global styles in `globals.css`; component styles with Tailwind classes
- Wrap REST calls in `/lib/api.ts`
- Write tests with Vitest and React Testing Library
- **Security**: Do not read or modify `.env*`, `/config/secrets.*`, or any file with API keys or credentials

---

## 4. Code Style & Naming

- Use ESLint + Prettier for formatting
- Follow Next.js and React naming and style conventions

---

## 5. Development Process

**Note:** GitHub repo information is in the `repository` field in the `package.json` file.

### 5.1 Branch Strategy

- Use GitHub Flow
- Branch types: `feature/*` and `bugfix/*`
- **Naming**: `feature/{issue-number}-{short-title}` or `bugfix/{issue-number}-{short-title}`

### 5.2 Issue, Commit & PR Guidelines

#### Issue Management

- **Labels**: `feature` for new features, `bug` for bugs
- **Template**:

  ```markdown
  ### Why?

  (Purpose)

  ### What?

  (Task to do)

  ### Notes

  (Screenshots, links)
  ```

#### Branch Rules

- One branch per issue
- Merge to `main` when work is complete

#### Commit Messages

```text
<type>: <subject>
```

- **type**: `feat`, `fix`, `docs`, `chore`
- **subject**: imperative, under 50 characters
- **Examples**:
  ```
  feat: connect login API
  fix: correct avatar upload error
  ```

#### Pull Request (PR)

- **Title**: same as commit message
- **Body**:

  ```markdown
  ### Summary

  - Key changes

  ### Details

  - Detailed description

  ### Related Issue

  - Closes #123
  ```

- Merge directly if CI passes
- For large changes:
  1. Draft PR
  2. Self-review
  3. Ready for review
  4. Merge after approval
- **CI Checks**: commitlint, build, test

---

### 5.3 Testing & Quality

- Unit tests for business logic
- Integration tests for REST API endpoints
- E2E tests for critical user flows (CRUD, like feature)

---

## 6. Entity Definitions

### User

| column          | type     |
| --------------- | -------- |
| id              | ObjectID |
| createdAt       | Date     |
| name            | String   |
| avatar          | String   |
| email           | String   |
| followers       | Array    |
| following       | Array    |
| bookmarkedPosts | Array    |

### Post

| column       | type     |
| ------------ | -------- |
| id           | ObjectID |
| userId       | ObjectID |
| title        | String   |
| content      | String   |
| bookmarkedBy | Array    |
| createdAt    | Date     |
| updatedAt    | Date     |
