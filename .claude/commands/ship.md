Build, commit, and push all current changes.

Steps:
1. Run `PATH=~/.nvm/versions/node/v24.14.1/bin:$PATH npm run build`. If there are errors, fix them and rebuild until `✓ built` is confirmed.
2. Run `git diff` and `git status` to understand what changed.
3. Generate a concise Korean commit message based on the actual changes. Format: `type: 내용` (type = feat / fix / refactor / style / chore).
4. Stage all changed files with `git add -A`.
5. Commit with the generated message.
6. Push to the current branch with `git push`.
7. Report: commit message used, files changed, push result.
