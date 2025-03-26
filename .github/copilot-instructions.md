# Product Requirements Document (PRD)

## 1. Project Overview

- **Project Name:** nextjs-practice1
- **Objective:**
  - Learn AI-assisted development and prompt engineering.
  - Implement basic CRUD features (users, posts) using [mockapi.io](https://mockapi.io/).

## 2. Core Features

### 🟢 User Management

- Create, read, update, and delete users.
- Display user details in a structured format.

### 🟠 Post Management

- CRUD operations for posts.
- Support text-based posts.

## 3. Technical Implementation

- **Framework:** Next.js 15 (Latest Spec)
- **Data Fetching Strategies:** SSR, ISR, Caching
- **API Handling:** `ServerAction` for backend interactions (`actions.ts`).
- **UI & Styling:** TailwindCSS v4, ShadCN/UI.
- **Testing:** Vitest, React Testing Library.

## 4. Performance & Optimization

- Use Next.js caching strategies.
- Optimize API calls using `ServerAction`.
- Ensure responsiveness with TailwindCSS.
