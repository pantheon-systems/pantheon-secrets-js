---
contract_version: 2
kind: library                       # npm package @pantheon-systems/pantheon-secrets; nothing runs from this repo
service: null                       # doesn't apply

trigger: tag                        # pushing any tag runs .github/workflows/release.yml, which publishes to npm
merged_implies_deployed: false      # a merge publishes nothing; main is 10 commits past 0.0.2 (2026-11-10), none of them shipped code
other_paths_to_prod:
  - "anyone with npm publish rights on the package can publish from a laptop (npm publish)"

pipeline:
  system: github-actions
  workflow: ".github/workflows/release.yml"   # workflow name "Release"; on: push tags '*'
  jobs_in_order: [publish]          # npm ci, npm run build, npm publish --access public (NPM_TOKEN). It does NOT run lint/tests.
  typical_minutes: null             # TODO(verify-on-deploy): no Release run is in the Actions history (0.0.2 was 2025-08-05)
  minutes_by_change: {}
  watch: "Actions workflow 'Release' for the tag; then `npm view @pantheon-systems/pantheon-secrets version`"
  concurrency_group: null           # verified: none
  cancel_in_progress: false
  blocked_by_waiting_run: null
  approval_gate: null               # verified: no GitHub Environments

repo_properties:
  observed_at: 2026-11-10
  trust_level: TL4
  ccb_status: in-ccb
  owner: developer-experience
  repo_type: library

gating_checks:                      # `gh api repos/pantheon-systems/pantheon-secrets-js/rules/branches/main`, 2026-11-10
  required: ["Wiz IaC Scanner", "Wiz Vulnerability Scanner", "Wiz Data Scanner", "Codacy Static Code Analysis"]   # org TL4: Wiz; repo ruleset 'Codacy': Codacy
  approvals: {required: 1, code_owner: true, last_push_approval: false, strict_up_to_date: false, merge_queue: true}
  run_but_not_required: ["CI / test (lint, jest, build)"]   # on: push branches '*' and pull_request; '*' doesn't match the merge queue's gh-readonly-queue/... branches [inferred], so it doesn't run there
  conditional: []

environments: []

artifact:
  image: null
  tag_scheme: semver                # tags without a v: 0.0.1, 0.0.2
  tag_mutable: false                # by convention: no tag ruleset (verified)
  retention: "npm versions are permanent (unpublish only within 72 h, and discouraged)"
  version_signal: tag               # the PUBLISHED version comes from package.json "version", not from the tag name
  tag_to_sha: "git rev-list -n1 <tag>"

release:
  mechanism: "manual: PR bumping package.json version -> merge -> create a GitHub release/tag with the same version -> 'Release' workflow runs npm publish"
  published_to: ["npm: @pantheon-systems/pantheon-secrets (verified: versions 0.0.1, 0.0.2; dist-tag latest = 0.0.2; 2026-11-10)"]
  never: "unpublish a version that anyone may have installed; move dist-tags instead"

consumers:                          # gh search code --owner pantheon-systems "@pantheon-systems/pantheon-secrets", 2026-11-10
  []                                # none in the org (only a docs-screenshot watchlist mentions it). External: 59 npm downloads in the month to 2026-11-09.

deployed_when:
  - "npm view @pantheon-systems/pantheon-secrets dist-tags.latest == the new version, and gitHead matches the tagged commit"

health:
  soak_minutes: null                # no runtime; consumers are external Node.js apps
  baseline: null
  checks:
    - name: published
      kind: command
      run: "npm view @pantheon-systems/pantheon-secrets@<version> version gitHead dist.tarball"
      healthy: "returns the version; gitHead == the tag's commit"   # verified on 0.0.2: gitHead fd7ed1a == tag 0.0.2
  known_baseline_errors: []
  dashboards: []
  alerts: []

rollback:
  options:
    - when: "a bad version is 'latest'"
      kind: retract-and-repin       # npm: move the dist-tag back, deprecate the bad version, publish a fix
      steps: "npm dist-tag add @pantheon-systems/pantheon-secrets@<last good> latest; npm deprecate @pantheon-systems/pantheon-secrets@<bad> '<reason>'; then release a fixed version"
      time_to_rollback_minutes: 5   # inferred: two npm commands
  not_restored: ["installs that already resolved the bad version (lock files) keep it"]
  one_way_changes: ["a published npm version number can never be reused"]
  currently_blocked: null
  last_exercised: null
  capture_before_merge: "npm view @pantheon-systems/pantheon-secrets dist-tags.latest"
  who_can: ["npm maintainers of the package"]   # TODO(owner): which DevX people hold npm publish rights for @pantheon-systems
  verify: "npm view @pantheon-systems/pantheon-secrets dist-tags.latest shows the good version; npm view ...@<bad> deprecated is set"

escalation:
  slack: "#ask-hosting"
  owner_team: developer-experience
  paged: false                      # inferred

preflight:
  - "gh auth status"
  - "npm whoami (with publish rights on @pantheon-systems) for any rollback"

automation_blockers:
  - blocker: "the release workflow has never been observed running (no run in history); it depends on an NPM_TOKEN secret that couldn't be confirmed from the repo"
    clears_when: "one release is observed end to end (TODO(owner): confirm NPM_TOKEN is available to this repo)"
  - blocker: "release publishes without lint/tests and trusts package.json's version to match the tag"
    clears_when: "release.yml runs npm test and checks that the tag equals package.json version before npm publish"
  - blocker: "rollback needs npm credentials no agent has"
    clears_when: "documented owner with npm rights, or automation for dist-tag moves"

verified:
  at: null
  by: null
  change: null
  running_digest: null              # doesn't apply
---

# Deployment

This repo is a small **TypeScript library** published to npm as `@pantheon-systems/pantheon-secrets`. Nothing runs from it, and merging to `main` publishes nothing. A release happens only when someone pushes a tag.

## How a change reaches production

1. **PR → merge.** TL4 org ruleset: 1 approval from a code owner (`@pantheon-systems/developer-experience`). Required checks: Wiz, plus `Codacy Static Code Analysis` from the repo ruleset. Squash merge queue. The `CI` workflow (lint, jest, build) runs on PRs but isn't required.
2. **Bump the version.** `npm publish` uses the `version` in `package.json`, not the tag name. Bump it in a PR (e.g. `npm version patch --no-git-tag-version`) and merge.
3. **Tag.** Create a GitHub release on `main` with a tag equal to the new version (existing tags have no `v`: `0.0.1`, `0.0.2`).
4. **Publish.** The tag push runs workflow `Release`: `npm ci`, `npm run build`, `npm publish --access public` with the `NPM_TOKEN` secret. It doesn't run tests. TODO(verify-on-deploy): no run of this workflow is in the Actions history, so its duration and whether the secret is available are unobserved.
5. **Consumers** get it on their next install or update. No repo in the org depends on it; npm counted 59 downloads in the month to 2026-11-09.

State on 2026-11-10: npm `latest` is `0.0.2` (2025-08-05). `main` has 10 later commits: dev-dependency VUL bumps (the package has no runtime dependencies), workflow hardening, and file syncs. None changes the published code, so nothing is waiting to ship.

## How to confirm it deployed

```sh
npm view @pantheon-systems/pantheon-secrets dist-tags.latest
npm view @pantheon-systems/pantheon-secrets@<version> version gitHead
git rev-list -n1 <tag>      # must equal gitHead
```

## How to confirm it's healthy

There's no runtime signal. Bad releases show up as consumer reports in `#ask-hosting`. Sanity-check a release by installing it in a scratch project and calling the exported function with the Pantheon environment variables unset (it should return the default or `null`).

## Rollback

npm versions are permanent. To roll back:

```sh
npm dist-tag add @pantheon-systems/pantheon-secrets@<last good> latest
npm deprecate @pantheon-systems/pantheon-secrets@<bad> "<reason>; use <last good>"
```

New installs get the good version immediately. Installs that already resolved the bad version keep it until they update. Then fix forward: revert on `main`, bump the version, tag, publish. Don't `npm unpublish`.

Capture the current `latest` before tagging: `npm view @pantheon-systems/pantheon-secrets dist-tags.latest`. These commands need an npm account with publish rights on the package (TODO(owner): who in DevX has them).

## Escalation

- Owner: `@pantheon-systems/developer-experience`. Ask in `#ask-hosting`. Not paged.

## Suggested pipeline changes

- In `release.yml`, run `npm test` and fail if the tag doesn't equal `package.json`'s version before publishing.
- Use npm provenance / trusted publishing (OIDC) instead of a long-lived token.
- Make `CI` run in the merge queue (`merge_group` trigger; `branches: '*'` doesn't match `gh-readonly-queue/...`).
