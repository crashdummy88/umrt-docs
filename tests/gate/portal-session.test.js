import { assert, test, run } from '../lib/tiny-test.js';
import {
  signSessionId,
  resolveRawSessionId,
  getSessionUser,
  parseCookies,
} from '../../functions/_lib/auth.js';
import { onRequest as requirePortal } from '../../functions/_lib/require-portal.js';

const CENTRAL = 'central-secret-for-tests-only';
const LOCAL = 'session-secret-for-tests-only';

function req(url, cookie) {
  return {
    url,
    headers: new Headers(cookie ? { Cookie: cookie } : {}),
  };
}

test('resolveRawSessionId: UUID token needs CENTRAL_SESSION_SECRET', async () => {
  const raw = '11111111-1111-4111-8111-111111111111';
  const token = await signSessionId(raw, CENTRAL);
  assert.equal(await resolveRawSessionId(token, { CENTRAL_SESSION_SECRET: CENTRAL }), raw);
  assert.equal(await resolveRawSessionId(token, { SESSION_SECRET: LOCAL }), null);
  assert.equal(await resolveRawSessionId(token, {}), null);
});

test('resolveRawSessionId: legacy token needs SESSION_SECRET', async () => {
  const raw = 'legacyLocalSessionId0001';
  const token = await signSessionId(raw, LOCAL);
  assert.equal(await resolveRawSessionId(token, { SESSION_SECRET: LOCAL }), raw);
  assert.equal(await resolveRawSessionId(token, { CENTRAL_SESSION_SECRET: CENTRAL }), null);
});

test('resolveRawSessionId: bad hmac / missing cookie fail closed', async () => {
  const raw = '11111111-1111-4111-8111-111111111111';
  const token = await signSessionId(raw, CENTRAL);
  assert.equal(await resolveRawSessionId(token.slice(0, -2) + 'xx', { CENTRAL_SESSION_SECRET: CENTRAL }), null);
  assert.equal(await resolveRawSessionId('', { CENTRAL_SESSION_SECRET: CENTRAL }), null);
  assert.equal(await resolveRawSessionId(null, { CENTRAL_SESSION_SECRET: CENTRAL }), null);
});

test('getSessionUser: no DB or unknown row → null', async () => {
  assert.equal(await getSessionUser({}, req('https://docs.unitedmobilerv.com/sop/')), null);
  const raw = '11111111-1111-4111-8111-111111111111';
  const token = await signSessionId(raw, CENTRAL);
  const env = {
    CENTRAL_SESSION_SECRET: CENTRAL,
    DB: {
      prepare() {
        return { bind() { return { first: async () => null, run: async () => ({}) }; } };
      },
    },
  };
  assert.equal(await getSessionUser(env, req('https://docs.unitedmobilerv.com/sop/', `umrt_session=${token}`)), null);
});

test('getSessionUser: expired central row is deleted and returns null', async () => {
  let deleted = false;
  const raw = '11111111-1111-4111-8111-111111111111';
  const token = await signSessionId(raw, CENTRAL);
  const env = {
    CENTRAL_SESSION_SECRET: CENTRAL,
    DB: {
      prepare(sql) {
        return {
          bind() {
            return {
              first: async () => ({
                id: 'u1',
                email: 'mattc2896@gmail.com',
                name: 'Matt',
                picture: null,
                provider: 'google',
                expires_at: '2000-01-01T00:00:00.000Z',
              }),
              run: async () => {
                if (/DELETE/.test(sql)) deleted = true;
                return {};
              },
            };
          },
        };
      },
    },
  };
  assert.equal(await getSessionUser(env, req('https://docs.unitedmobilerv.com/sop/', `umrt_session=${token}`)), null);
  assert.equal(deleted, true);
});

test('require-portal: no session → 302 portal account with allowlisted next', async () => {
  const res = await requirePortal({
    env: {},
    request: req('https://docs.unitedmobilerv.com/estimates/'),
  });
  assert.equal(res.status, 302);
  const loc = res.headers.get('Location');
  assert.match(loc, /^https:\/\/portal\.unitedmobilerv\.com\/account\/\?next=/);
  assert.equal(new URL(loc).searchParams.get('next'), 'https://docs.unitedmobilerv.com/estimates/');
});

test('require-portal: valid central session calls next and no-stores', async () => {
  const raw = '11111111-1111-4111-8111-111111111111';
  const token = await signSessionId(raw, CENTRAL);
  const env = {
    CENTRAL_SESSION_SECRET: CENTRAL,
    DB: {
      prepare() {
        return {
          bind() {
            return {
              first: async () => ({
                id: 'u1',
                email: 'mattc2896@gmail.com',
                name: 'Matt',
                picture: null,
                provider: 'google',
                expires_at: new Date(Date.now() + 86400000).toISOString(),
              }),
            };
          },
        };
      },
    },
  };
  const res = await requirePortal({
    env,
    request: req('https://docs.unitedmobilerv.com/sop/', `umrt_session=${encodeURIComponent(token)}`),
    next: async () => new Response('ok', { status: 200 }),
  });
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'ok');
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
  assert.match(res.headers.get('X-Robots-Tag'), /noindex/);
});

test('parseCookies decodes umrt_session', () => {
  const cookies = parseCookies({ headers: new Headers({ Cookie: 'umrt_session=abc%2Edef; other=1' }) });
  assert.equal(cookies.umrt_session, 'abc.def');
});

await run();
