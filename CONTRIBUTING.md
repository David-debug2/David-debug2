# Contributing to the Project D profile

This repository contains David's public profile README and its supporting generator. Keep changes focused on accurate portfolio content, accessible presentation, and reliable updates.

## Check a change locally

Use Node.js 24, then run these commands from the repository root. No dependency installation is required.

```sh
npm test
npm run generate
git diff
```

Without YOUTUBE_API_KEY, generation preserves the existing YouTube cache and prints a warning. Do not add credentials to source or a pull request. See the [maintenance guide](MAINTENANCE.md) for private setup and troubleshooting.

## Choose the right source

- Edit authored biography text in [README.md](README.md), outside the VIDEOS and STATS markers.
- Edit [data/projects.json](data/projects.json) for verified built projects; count each project once and exclude demos, editions, templates, individual features, and this profile.
- Edit [scripts/profile-lib.mjs](scripts/profile-lib.mjs) and [scripts/update-profile.mjs](scripts/update-profile.mjs) for generator behavior, then regenerate derived output. Do not hand-edit generated cards as the sole change.
- Keep the supplied banner source and both light and dark contribution-snake variants available.

## Submit a pull request

Use a focused branch and a Conventional Commit title such as `docs(profile): clarify maintenance steps`. Describe the problem, the resulting behavior, and the checks actually performed. Include relevant generated changes and inspect the diff for unrelated edits before submitting.

For generator behavior changes, run the existing tests and add coverage when it verifies a meaningful new case. Documentation-only changes need link and content checks. For visual changes, inspect wide and narrow screens and light and dark themes; report any checks that remain pending. Local tests do not prove live API access, scheduled execution, or owner acceptance.
