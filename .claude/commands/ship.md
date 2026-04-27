Build, commit, and push all current changes.

Steps:

1. Run `/Users/heeyoon1302/.nvm/versions/node/v24.15.0/bin/npm run build`.
2. Run `git diff` and `git status` to understand what changed.
3. Generate a concise Korean commit message based on the actual changes. Format: `type: 내용` (type = feat / fix / refactor / style / chore).
4. Stage all changed files with `git add -A`.
5. Commit with the generated message.
6. Push to the current branch with `git push`.
7. Report: commit message used, files changed, push result.
8. Create a Pull Request to main branch using `gh pr create --base main --fill`.
9. Report: commit message used, files changed, push result, PR URL.
