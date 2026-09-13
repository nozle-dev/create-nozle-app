# Release the CLI and templates

Candidate: `create-nozle-app@0.4.0`, Node SDK `0.7.0`, React SDK `0.8.0`.
On 2026-09-13 the npm registry returned 404 for `create-nozle-app`; no existing
npm publication or GitHub release was found. The README's `npx` instructions
require first publication by an npm owner with access to this package name.
Do not publish until production prefix acceptance and both SDK releases pass.

## Verify the candidate

```sh
pnpm install --frozen-lockfile
pnpm typecheck:cli
pnpm build:cli
pnpm test:templates
npm pack --ignore-scripts
```

Before the SDK versions are on npm, pass both built SDK tarballs to the template
verification script. It generates each app through the actual sparse checkout,
installs the packages, typechecks, and verifies default/custom transport URLs and
server-only credit balance access:

```sh
node scripts/verify-templates.mjs /absolute/path/node.tgz /absolute/path/react.tgz
```

After publication, repeat without tarballs to verify the registry and committed
lockfiles. Pack only after building: the archive must contain `dist/index.js`,
its lazy-loaded chunks and declarations. Install the archive into an empty
directory and run `create-nozle-app --help` before release.

## Publish

Merge the tested template revision before publishing the CLI: generation fetches
this repository's `main` branch. An authorized npm owner publishes the exact tested
archive using their configured npm identity:

```sh
npm publish ./create-nozle-app-0.4.0.tgz --access public
```

Never paste an npm token into a commit or a conversation. After first publication,
record the npm owner and configure trusted publishing for any future automated
release workflow. Verify `npm view create-nozle-app@0.4.0` and a fresh install;
attach the tested archive and its SHA-256 to the matching GitHub release.
