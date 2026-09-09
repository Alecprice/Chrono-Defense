const DEFAULT_ORIGIN = 'https://chrono-defense.vercel.app';
const origin = (process.argv[2] || process.env.CHRONO_PRODUCTION_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, '');
const expectedCommit = process.env.CHRONO_EXPECT_COMMIT || '';
const attempts = Math.max(1, Number.parseInt(process.env.CHRONO_SMOKE_ATTEMPTS || '8', 10));
const delayMs = Math.max(0, Number.parseInt(process.env.CHRONO_SMOKE_DELAY_MS || '5000', 10));
const timeoutMs = Math.max(1000, Number.parseInt(process.env.CHRONO_SMOKE_TIMEOUT_MS || '8000', 10));

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function get(path, { json = false } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${origin}${path}${path.includes('?') ? '&' : '?'}ts=${Date.now()}`, {
      headers: { 'cache-control': 'no-cache', pragma: 'no-cache' },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
    return { response, body: json ? await response.json() : await response.text() };
  } finally {
    clearTimeout(timeout);
  }
}

async function verify() {
  const root = await get('/');
  if (!root.body.includes('id="root"')) throw new Error('production shell is missing the React root');

  const build = await get('/build-info.json', { json: true });
  if (build.body?.service !== 'chrono-defense') throw new Error(`unexpected service identity: ${build.body?.service}`);
  if (build.body?.version !== '0.1.0') throw new Error(`unexpected deployed version: ${build.body?.version}`);
  if (expectedCommit && build.body?.commit !== expectedCommit) {
    throw new Error(`deployed commit ${build.body?.commit || 'unknown'} does not match expected ${expectedCommit}`);
  }
  const cacheControl = build.response.headers.get('cache-control') || '';
  if (!/no-store/i.test(cacheControl)) throw new Error(`build-info.json must be no-store; got ${cacheControl || 'no header'}`);

  const manifest = await get('/precache-manifest.json', { json: true });
  if (!Array.isArray(manifest.body) || !manifest.body.includes('/index.html')) throw new Error('precache manifest is missing /index.html');
  if (manifest.body.includes('/build-info.json')) throw new Error('build identity must not be frozen into the offline shell cache');

  console.log(`PASS: Chrono Defense production shell is healthy at ${origin}`);
  console.log(`PASS: deployed build ${build.body.commit || 'local/unknown'} · version ${build.body.version}`);
}

let lastError;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  try {
    await verify();
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.error(`Production smoke attempt ${attempt}/${attempts} failed: ${error.message}`);
    if (attempt < attempts) await sleep(delayMs);
  }
}
throw lastError;
