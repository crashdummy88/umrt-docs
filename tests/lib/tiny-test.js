/** Minimal test runner (no deps). */
const tests = [];

export function test(name, fn) {
  tests.push({ name, fn });
}

export const assert = {
  equal(a, b, msg) {
    if (a !== b) throw new Error(msg || `expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  },
  ok(v, msg) {
    if (!v) throw new Error(msg || 'expected truthy');
  },
  match(s, re, msg) {
    if (!re.test(String(s))) throw new Error(msg || `${s} did not match ${re}`);
  },
};

export async function run() {
  let failed = 0;
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`ok  ${t.name}`);
    } catch (err) {
      failed += 1;
      console.error(`not ok  ${t.name}`);
      console.error(`  ${err.message}`);
    }
  }
  console.log(`${tests.length - failed}/${tests.length} passed`);
  if (failed) process.exit(1);
}
