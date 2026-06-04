---
name: git-workflow-pro
description: Use when deciding on a branching strategy, writing commit messages, rebasing, resolving merge conflicts, cherry-picking, setting up git hooks, or recovering lost commits. Covers Conventional Commits, GitHub Flow, interactive rebase, and reflog recovery.
---

# Git Workflow Pro

## When to invoke this skill
- Starting a new feature branch
- Writing a commit message
- Cleaning up messy commit history
- Resolving merge conflicts
- Setting up a team git workflow
- Recovering lost work

---

## Branching Strategies

### GitHub Flow (recommended for most teams)
```
main           always deployable, protected
  └── feature/add-cart
  └── fix/checkout-error
  └── chore/update-deps

Rules:
1. Branch from main
2. Commit to feature branch only
3. Open PR → get review → merge to main
4. Deploy immediately after merge (or on every merge)
5. No develop/release branches needed
```

### Trunk-Based Development (for CI/CD maturity)
```
main           single long-lived branch
  └── short-lived feature branches (< 1 day lifespan)

Use feature flags to hide incomplete features
Requires: fast CI, good test coverage, confident team
```

### Git Flow (for versioned software/libraries)
```
main           → production releases (tagged)
develop        → integration branch
  └── feature/X
  └── release/1.2.0
  └── hotfix/critical-bug

Use when: multiple versions in production, scheduled releases
Avoid for: web apps deployed continuously
```

---

## Conventional Commits

Format: `type(scope): description`

```bash
feat(cart): add quantity selector to cart items
fix(auth): prevent token refresh on 401 from non-auth endpoints
docs(api): add rate limiting section to README
chore(deps): upgrade Next.js to 15.1
refactor(products): extract price formatting to shared util
test(checkout): add integration test for payment flow
perf(images): enable next/image lazy loading on product grid
ci(deploy): add staging environment to GitHub Actions
```

**Types:**
- `feat` — new feature (triggers minor version bump in semver)
- `fix` — bug fix (triggers patch bump)
- `docs` — documentation only
- `chore` — maintenance, deps, config
- `refactor` — code change, no feature/fix
- `test` — tests only
- `perf` — performance improvement
- `ci` — CI/CD configuration
- `style` — formatting, no logic change
- `revert` — reverts a previous commit

**Breaking change:**
```bash
feat(api)!: remove deprecated v1 endpoints

BREAKING CHANGE: /api/v1/* endpoints removed. Migrate to /api/v2/*.
```

---

## Interactive Rebase

```bash
# Clean up last N commits before pushing
git rebase -i HEAD~4

# Commands in the editor:
pick   abc1234 feat: add cart
pick   def5678 fix typo      # → squash into previous
pick   ghi9012 WIP           # → drop
pick   jkl3456 fix: edge case

# Change to:
pick   abc1234 feat: add cart
squash def5678 fix typo      # squash = merge into previous commit
drop   ghi9012 WIP           # drop = remove completely
pick   jkl3456 fix: edge case

# Reorder: just move the lines
# Edit message: use 'reword' instead of 'pick'
```

**Rules:**
- Never rebase commits that are already on a shared/remote branch
- Always rebase locally before pushing to clean up
- `git rebase main` (from feature branch) = update your branch with latest main

---

## Amend Last Commit

```bash
# Fix the last commit message (not yet pushed)
git commit --amend -m "feat(cart): add quantity selector"

# Add forgotten file to last commit
git add forgotten-file.ts
git commit --amend --no-edit

# Never amend pushed commits (rewrites history)
```

---

## Resolving Merge Conflicts

```bash
# Start merge
git merge feature/add-cart
# CONFLICT in src/components/Cart.tsx

# Open the file — look for conflict markers:
<<<<<<< HEAD (your branch)
  const [qty, setQty] = useState(1)
=======
  const [quantity, setQuantity] = useState(0)
>>>>>>> feature/add-cart

# Resolve: keep one, combine, or write new code
  const [quantity, setQuantity] = useState(1)  # resolved

# Mark resolved
git add src/components/Cart.tsx
git merge --continue

# Abort if needed
git merge --abort

# Tools: VS Code has excellent merge conflict UI
# Or: git mergetool (opens configured diff tool)
```

---

## Cherry-Picking

```bash
# Apply a specific commit from another branch
git cherry-pick abc1234

# Apply a range of commits
git cherry-pick abc1234..def5678

# Cherry-pick without committing (review first)
git cherry-pick --no-commit abc1234
git status  # review changes
git commit

# When to use:
# - Backport a hotfix to an older release branch
# - Move an accidental commit to the right branch
# When NOT to use:
# - Moving whole features (use merge or rebase instead)
```

---

## Pull Request Etiquette

**As the author:**
```
□ Self-review the diff before requesting review
□ Keep PRs focused — one feature/fix per PR
□ Write a clear description: what, why, how to test
□ Link the related issue (#123)
□ Add screenshots for UI changes
□ Respond to all review comments
□ Don't force-push after review starts (use new commits)
```

**PR description template:**
```markdown
## What
Brief description of the change.

## Why
The problem this solves or the feature requested.

## How to test
1. Navigate to /cart
2. Add item, change quantity
3. Verify total updates correctly

## Screenshots (if UI change)

Closes #123
```

---

## Git Hooks

```bash
# .husky/pre-commit
#!/bin/sh
npx lint-staged

# .husky/commit-msg
#!/bin/sh
npx commitlint --edit $1

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md}": "prettier --write"
  }
}

# Setup: npx husky init
# Bypass (NEVER in team): git commit --no-verify
```

---

## Recovering Lost Commits (Reflog)

```bash
# Git never truly deletes — reflog keeps everything for 90 days
git reflog

# Output:
# abc1234 HEAD@{0}: commit: feat: add cart
# def5678 HEAD@{1}: rebase: checkout main
# ghi9012 HEAD@{2}: commit: WIP cart  ← "lost" commit

# Recover a lost commit
git checkout ghi9012                    # inspect it
git cherry-pick ghi9012                 # apply to current branch
git branch recovery/cart ghi9012        # create branch at that point

# Recover from bad reset --hard
git reflog
git reset --hard HEAD@{2}              # go back to before the reset

# Recover a deleted branch
git reflog | grep "feature/cart"
git checkout -b feature/cart abc1234
```

---

## Useful Daily Commands

```bash
# See a visual branch graph
git log --oneline --graph --all

# Find who changed a line (blame)
git log -S "functionName" --source --all   # when was it added?
git blame -L 42,55 src/components/Cart.tsx  # who changed these lines?

# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Stash with a message
git stash push -m "WIP: cart quantity feature"
git stash list
git stash pop

# Clean untracked files (dry run first!)
git clean -n    # preview
git clean -fd   # delete

# Compare branches
git diff main..feature/cart --stat
```
