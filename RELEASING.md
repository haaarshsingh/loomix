# Releasing `loomix`

This repo publishes the [`loomix`](https://www.npmjs.com/package/loomix) package
to npmjs.org via GitHub Actions. Releases are release-driven: cutting a
GitHub Release is what triggers a publish.

## One-time setup

1. **Claim the package name.** Make sure `loomix` is reserved for you on
   [npmjs.org](https://www.npmjs.com/). The very first publish must be done by
   the account that owns the name.
2. **Create an npm Automation token.**
   - In npm: _Access Tokens_ → _Generate New Token_ → **Automation**.
   - Automation tokens are required for [npm provenance](https://docs.npmjs.com/generating-provenance-statements)
     and are not subject to 2FA prompts.
3. **Add the token to repo secrets.** In GitHub: _Settings_ → _Secrets and
   variables_ → _Actions_ → _New repository secret_:
   - Name: `NPM_TOKEN`
   - Value: the automation token from the previous step.

That's it. The release workflow uses the built-in `GITHUB_TOKEN` for uploading
Release assets — no extra secret needed for that.

## Cutting a release

The package version is the source of truth; the GitHub Release tag must match
it exactly (with a leading `v`).

1. On `main`, bump `version` in [packages/ui/package.json](packages/ui/package.json)
   following semver. Pre-1.0 conventions:
   - Breaking change → bump **minor** (e.g. `0.1.0` → `0.2.0`).
   - Feature / fix → bump **patch** (e.g. `0.1.0` → `0.1.1`).
2. Commit and push:
   ```sh
   git commit -am "Release v0.2.0"
   git push origin main
   ```
3. Wait for [CI](.github/workflows/ci.yml) to go green.
4. Create a GitHub Release:
   - Tag: `v<version>` (e.g. `v0.2.0`).
   - Target: `main`.
   - Title and notes: whatever you want (GitHub's "Generate release notes" is
     fine).
   - Hit **Publish release**.

That fires [`.github/workflows/release.yml`](.github/workflows/release.yml),
which:

1. Installs and gates with `bun run lint` + `bun run check-types`.
2. Verifies the tag (`v0.2.0`) matches `packages/ui/package.json` (`0.2.0`) and
   fails fast otherwise.
3. Builds the package via the existing `prepublishOnly` hook (`tsup`).
4. Runs `npm publish --access public --provenance` against npmjs.org.
5. Uploads `loomix-<version>.tgz` to the GitHub Release as a downloadable
   asset.

## Troubleshooting

- **`Tag '...' does not match packages/ui/package.json version '...'`** — the
  Release tag and the committed `version` are out of sync. Delete the Release
  (and its tag), fix the `version` on `main`, then re-create the Release.
- **`npm publish` 403 / authentication errors** — re-check that `NPM_TOKEN` is
  set, is an **Automation** token, and belongs to an account that owns / is a
  collaborator on the `loomix` package.
- **Provenance attestation errors** — provenance requires the workflow to have
  `id-token: write` permission (already set) and a recent enough Node.js. If
  npm rejects it, bump the `node-version` in the workflow.
