import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, mkdir, readFile, writeFile, symlink } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

// Candidate tarballs are optional; without them the committed registry versions
// are installed. Everything generated, installed or executed lives in a temp dir.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [nodePack, reactPack] = process.argv.slice(2).map(value => path.resolve(value))
assert.equal(Boolean(nodePack), Boolean(reactPack), 'Pass both SDK tarballs or neither')
const workspace = await mkdtemp(path.join(os.tmpdir(), 'nozle-generated-'))
const mirror = path.join(workspace, 'mirror')
await mkdir(mirror)
const templates = ['compute', 'credit-based', 'flat-subscription', 'saas-usage']
for (const template of templates) {
  await cp(path.join(root, template), path.join(mirror, template), {
    recursive: true,
    filter: source => !['node_modules', '.next', '.turbo'].includes(path.basename(source)),
  })
}
const run = (command, args, cwd) => execFileSync(command, args, { cwd, stdio: 'inherit' })
run('git', ['init', '-b', 'main', '--quiet'], mirror)
run('git', ['add', '.'], mirror)
run('git', ['-c', 'user.name=Template test', '-c', 'user.email=template-test@example.test',
  'commit', '--quiet', '-m', 'Candidate template fixture'], mirror)
// Exercise the real sparse checkout without fetching a different main revision.
process.env.GIT_CONFIG_COUNT = '1'
process.env.GIT_CONFIG_KEY_0 = `url.${pathToFileURL(mirror).href}.insteadOf`
process.env.GIT_CONFIG_VALUE_0 = 'https://github.com/nozle-dev/create-nozle-app.git'
await symlink(path.join(root, 'node_modules'), path.join(workspace, 'node_modules'))

async function compile(source, destination, replacements = []) {
  let code = await readFile(source, 'utf8')
  for (const [from, to] of replacements) code = code.replaceAll(from, to)
  const output = ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  await writeFile(destination, output)
  return import(pathToFileURL(destination).href)
}

const { fetchTemplate } = await compile(path.join(root, 'src/utils/fetch-template.ts'), path.join(workspace, 'fetch-template.mjs'))
for (const template of templates) {
  const app = path.join(workspace, template)
  await fetchTemplate(template, app)
  const manifestPath = path.join(app, 'package.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  if (nodePack) {
    manifest.dependencies['@nozle-js/node'] = `file:${nodePack}`
    manifest.dependencies['@nozle-js/react'] = `file:${reactPack}`
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
  }
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], app)
  run('npm', ['run', 'typecheck'], app)

  for (const custom of [false, true]) {
    const engine = custom ? 'https://example.test/team/engine' : 'https://api.nozle.app/engine'
    const core = custom ? 'https://example.test/team/core' : 'https://api.nozle.app/core'
    process.env.NOZLE_API_KEY = 'sk_template_test'
    if (custom) {
      process.env.NOZLE_API_URL = `${engine}/`
      process.env.NOZLE_EVENTS_URL = `${core}/`
    } else {
      delete process.env.NOZLE_API_URL
      delete process.env.NOZLE_EVENTS_URL
    }
    const calls = []
    globalThis.fetch = async (url, options) => {
      calls.push({ url: String(url), options })
      return new Response(JSON.stringify({ allowed: true, url: 'https://checkout.example.test' }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
      })
    }
    const { nozle } = await compile(path.join(app, 'lib/nozle-client.ts'), path.join(app, `client-${custom}.mjs`))
    await nozle.can('customer/one', 'requests')
    await nozle.track('customer/one', 'requests', { count: 1 }, { subscriptionId: 'sub_one' })
    await nozle.checkout('customer/one', 'pro', 'https://merchant.example.test/return')
    assert.equal(calls[0].url, `${engine}/api/v1/can?customer_id=customer%2Fone&feature=requests`)
    assert.equal(calls[1].url, `${core}/api/v1/events`)
    assert.equal(calls[2].url, `${engine}/api/v1/checkout`)
    for (const call of calls) assert.equal(call.options.headers.Authorization, 'Bearer sk_template_test')
    assert.equal(JSON.parse(calls[2].options.body).customer_id, 'customer/one')
  }

  if (template === 'credit-based') {
    // A forged query customer is ignored: only the authenticated session chooses
    // whose balance the merchant server reads, and no key reaches the browser.
    await writeFile(path.join(app, 'session.mjs'), 'export async function getSession() { return globalThis.testSession }')
    await writeFile(path.join(app, 'credit-client.mjs'), 'export const nozle = { credits: { getBalance: async (...args) => { globalThis.creditArgs = args; return { available: "12.5" } } } }')
    const { GET } = await compile(path.join(app, 'app/api/credits/balance/route.ts'), path.join(app, 'balance.mjs'), [
      ['next/server', 'next/server.js'], ['@/lib/session', './session.mjs'], ['@/lib/nozle-client', './credit-client.mjs'],
    ])
    globalThis.testSession = {}
    assert.equal((await GET()).status, 401)
    assert.equal(globalThis.creditArgs, undefined)
    globalThis.testSession = { userId: 'session_customer' }
    delete process.env.NOZLE_CREDIT_SYSTEM_CODE
    assert.equal((await GET()).status, 503)
    process.env.NOZLE_CREDIT_SYSTEM_CODE = 'credits'
    const response = await GET(new Request('http://localhost/api/credits/balance?customer=someone_else'))
    assert.deepEqual(globalThis.creditArgs, ['session_customer', 'credits'])
    assert.deepEqual(await response.json(), { available: '12.5' })
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
  }
  console.log(`${template}: generation, installation, types and transport passed`)
}
console.log(`Verified generated applications: ${workspace}`)
