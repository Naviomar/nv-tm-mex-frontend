#!/usr/bin/env node
/**
 * Finds interfaces that trigger a protected write without checking the permission first.
 *
 * It crosses every `$api.<module>.<method>(...)` call in components/pages with the permission the
 * backend route requires (`can:` / `permission:` middleware, read from `php artisan route:list`).
 * A call is reported when the file that makes it never mentions that permission (no
 * `<Can permission>`, `hasPermission(...)`, `permission="..."` prop, ...) and that no page guard in
 * utils/data/routePermissions.ts already requires. Gating done by a parent component is not detected,
 * so treat the list as candidates to review, not as proven bugs.
 *
 * Usage (monorepo layout, backend in ../nv-tm-backend):
 *   node scripts/audit-permission-gating.mjs                 # report
 *   node scripts/audit-permission-gating.mjs --check         # exit 1 if there are offenders not in the baseline
 *   node scripts/audit-permission-gating.mjs --update-baseline
 *   node scripts/audit-permission-gating.mjs --include-reads
 * Env: BACKEND_DIR to point at another backend checkout.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const FE = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const BACKEND = resolve(process.env.BACKEND_DIR || join(FE, '..', 'nv-tm-backend'))
const BASELINE = join(FE, 'scripts', 'permission-gating-baseline.json')
const args = new Set(process.argv.slice(2))
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, exts, out)
    else if (exts.some((e) => name.endsWith(e))) out.push(p)
  }
  return out
}

// ── backend routes ───────────────────────────────────────────────
const routes = JSON.parse(
  execFileSync('php', ['artisan', 'route:list', '--json'], { cwd: BACKEND, maxBuffer: 64 * 1024 * 1024 }).toString(),
)
const compiled = []
routes.forEach((r, order) => {
  if (!r.uri.startsWith('api/mex/')) return
  const perms = []
  for (const mw of r.middleware) {
    if (mw.startsWith('Illuminate\\Auth\\Middleware\\Authorize:')) perms.push(mw.split(':')[1])
    else if (mw.includes('PermissionMiddleware:')) perms.push(...mw.split(':')[1].split('|'))
  }
  const path = '/' + r.uri.replace(/^api\/mex\/v1\//, '')
  const segs = path.split('/').filter(Boolean)
  const params = segs.filter((s) => s.startsWith('{')).length
  const regex = new RegExp('^/' + segs.map((s) => (s.startsWith('{') ? '[^/]+' : s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('/') + '/?$')
  for (const method of r.method.split('|').filter((m) => m !== 'HEAD')) compiled.push({ method, regex, params, order, perms, uri: path })
})

function matchRoute(method, path) {
  let best = null
  for (const c of compiled) {
    if (c.method !== method || !c.regex.test(path)) continue
    if (!best || c.params < best.params || (c.params === best.params && c.order < best.order)) best = c
  }
  return best
}

// ── frontend api modules: "module.method" -> http method + route ───
const factory = readFileSync(join(FE, 'composables/apiFactory.ts'), 'utf8')
const imports = Object.fromEntries([...factory.matchAll(/import\s+(\w+)\s+from\s+'([^']+)'/g)].map((m) => [m[1], m[2]]))
const apiMethods = {}
for (const [, key, cls] of factory.matchAll(/(\w+):\s*new\s+(\w+)\(/g)) {
  const imp = imports[cls]
  if (!imp) continue
  let file = imp.replace(/^[~@]\//, FE + '/')
  if (!file.endsWith('.ts')) file += '.ts'
  if (!existsSync(file)) continue
  const src = readFileSync(file, 'utf8')
  const consts = Object.fromEntries([...src.matchAll(/(RESOURCE\d*)\s*=\s*['"`]([^'"`]+)['"`]/g)].map((m) => [m[1], m[2]]))
  for (const m of src.matchAll(/async\s+(\w+)\s*\([^)]*\)[^{]*\{([\s\S]*?)\n {2}\}/g)) {
    const call = /this\.call\(\s*['"](GET|POST|PUT|PATCH|DELETE)['"]\s*,\s*`([^`]*)`/.exec(m[2])
    if (!call) continue
    let path = call[2].replace(/\$\{([^}]*)\}/g, (_, e) => (e.trim().startsWith('this.') ? consts[e.trim().slice(5)] ?? '' : 'x'))
    path = '/' + path.split('?')[0].replace(/\/+/g, '/').replace(/^\//, '')
    const route = matchRoute(call[1], path)
    if (route) apiMethods[`${key}.${m[1]}`] = { http: call[1], route }
  }
}

// Permissions already required to open a page (utils/data/routePermissions.ts): a form that lives
// in such a page is reachable only by users who have them, so it isn't reported.
const routeRules = readFileSync(join(FE, 'utils/data/routePermissions.ts'), 'utf8')
const pageGuarded = new Set([...routeRules.matchAll(/'([a-z0-9]+(?:-[a-z0-9]+)+)'/g)].map((m) => m[1]))

// Permission names exposed through constants (e.g. `menuPermissions.X`, `permissions.DemurragesRateOverrideEdit`):
// a file that references the constant counts as mentioning the permission.
const constantsByPermission = {}
for (const file of walk(join(FE, 'utils'), ['.ts'])) {
  for (const m of readFileSync(file, 'utf8').matchAll(/\b([A-Za-z_][A-Za-z0-9_]*)\s*:\s*['"]([a-z0-9]+(?:-[a-z0-9]+)+)['"]/g)) {
    ;(constantsByPermission[m[2]] ??= new Set()).add(m[1])
  }
}
// Buttons that carry their own permission logic by service type.
const trashButtonSrc = readFileSync(join(FE, 'components/common/TrashButton.vue'), 'utf8')

function mentions(src, perm) {
  if (src.includes(perm) || pageGuarded.has(perm)) return true
  if (src.includes('<TrashButton') && trashButtonSrc.includes(perm)) return true
  return [...(constantsByPermission[perm] ?? [])].some((name) => new RegExp('\\.' + name + '\\b').test(src))
}

// ── call sites ───────────────────────────────────────────────────
const files = ['components', 'pages', 'layouts', 'composables'].flatMap((d) => walk(join(FE, d), ['.vue', '.ts']))
const offenders = []
for (const file of files) {
  const src = readFileSync(file, 'utf8')
  const seen = new Set()
  for (const m of src.matchAll(/\$api\.(\w+)\.(\w+)\(/g)) {
    const info = apiMethods[`${m[1]}.${m[2]}`]
    if (!info || (!args.has('--include-reads') && !WRITE_METHODS.has(info.http))) continue
    for (const perm of info.route.perms) {
      if (seen.has(perm) || mentions(src, perm)) continue
      seen.add(perm)
      offenders.push({ file: relative(FE, file), permission: perm, call: `${m[1]}.${m[2]}`, route: `${info.http} ${info.route.uri}` })
    }
  }
}

const key = (o) => `${o.file}|${o.permission}`
if (args.has('--update-baseline')) {
  writeFileSync(BASELINE, JSON.stringify([...new Set(offenders.map(key))].sort(), null, 2) + '\n')
  console.log(`Baseline written: ${new Set(offenders.map(key)).size} entries`)
  process.exit(0)
}

const baseline = new Set(existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : [])
const fresh = offenders.filter((o) => !baseline.has(key(o)))

const byFile = {}
for (const o of offenders) (byFile[o.file] ??= []).push(o)
console.log(`${offenders.length} (file, permission) pairs where a protected ${args.has('--include-reads') ? 'call' : 'write'} is made without mentioning its permission, in ${Object.keys(byFile).length} files.`)
console.log(`Not in the baseline: ${fresh.length}\n`)

const list = args.has('--check') ? fresh : offenders
for (const [file, items] of Object.entries(byFile).sort((a, b) => b[1].length - a[1].length).slice(0, args.has('--all') ? 1e6 : 25)) {
  const shown = items.filter((o) => list.includes(o))
  if (!shown.length) continue
  console.log(`${String(shown.length).padStart(3)}  ${file}`)
  for (const o of shown.slice(0, 4)) console.log(`       ${o.permission}  <- ${o.call} (${o.route})`)
}

if (args.has('--check') && fresh.length) {
  console.error(`\n${fresh.length} new ungated action(s). Hide them with <Can permission="..."> / hasPermission, or add them to the baseline on purpose.`)
  process.exit(1)
}
