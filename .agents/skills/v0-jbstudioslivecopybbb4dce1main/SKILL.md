```markdown
# v0-jbstudioslivecopybbb4dce1main Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill introduces the core development patterns and conventions used in the `v0-jbstudioslivecopybbb4dce1main` TypeScript codebase. It covers file naming, import/export styles, commit message conventions, and testing patterns. While no frameworks or automated workflows were detected, this guide will help you maintain consistency and quality when contributing to this repository.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userProfile.ts`, `apiClient.ts`

### Import Style
- Use **alias imports** to reference modules.
  - Example:
    ```typescript
    import apiClient from 'services/apiClient';
    ```

### Export Style
- Use **default exports** for modules.
  - Example:
    ```typescript
    const userProfile = { /* ... */ };
    export default userProfile;
    ```

### Commit Message Convention
- Use **conventional commits**.
- Prefix: `fix`
- Example:
  ```
  fix: correct user authentication flow on login page
  ```

## Workflows

_No automated workflows detected in this repository._

## Testing Patterns

- Test files follow the `*.test.*` naming pattern.
  - Example: `userProfile.test.ts`
- The specific testing framework is **unknown**; check existing test files for patterns.
- Example test file structure:
  ```typescript
  // userProfile.test.ts
  import userProfile from './userProfile';

  describe('userProfile', () => {
    it('should return correct user data', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command | Purpose |
|---------|---------|
| /commit-fix | Start a commit with the `fix` prefix following conventional commit style |
| /test-run  | Run all test files matching `*.test.*` pattern |
```