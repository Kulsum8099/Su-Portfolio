// End-to-end API tests against a real MongoDB database. They only run when
// TEST_MONGODB_URI points at a disposable database — it is wiped first:
//
//   TEST_MONGODB_URI="mongodb://127.0.0.1:27017" npm test
//
// (database "su_portfolio_test" unless TEST_MONGODB_DB_NAME says otherwise)
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

const TEST_URI = process.env.TEST_MONGODB_URI;
const ADMIN = { email: 'admin@example.com', password: 'correct horse battery staple' };
// A 1×1 transparent PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

describe('API', { skip: !TEST_URI && 'set TEST_MONGODB_URI to run the API integration tests' }, () => {
  let server;
  let base;
  let mongoose;
  let models;
  let cookie;

  const request = async (method, path, { body, raw, cookie: jar, headers = {} } = {}) => {
    const response = await fetch(base + path, {
      method,
      redirect: 'manual',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(jar ? { Cookie: jar } : {}),
        // Browsers send Origin with every state-changing request.
        ...(method !== 'GET' && method !== 'HEAD' ? { Origin: base } : {}),
        ...headers,
      },
      body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    let json = null;
    try {
      json = JSON.parse(buffer.toString('utf8'));
    } catch {
      // not JSON (images, empty bodies)
    }
    return { status: response.status, headers: response.headers, json, buffer };
  };

  const sessionCookieFrom = (response) => {
    const header = response.headers.getSetCookie().find((value) => value.startsWith('su_admin_session='));
    return header?.split(';')[0];
  };

  const login = async (password = ADMIN.password, email = ADMIN.email) => {
    const response = await request('POST', '/api/auth/login', { body: { email, password } });
    return { response, cookie: sessionCookieFrom(response) };
  };

  const fullProject = (overrides = {}) => ({
    title: 'Test Project',
    subtitle: 'A subtitle',
    category: 'Web App',
    accent: 'green',
    summary: 'Summary text.',
    coverImage: { url: '', alt: '' },
    technologies: ['Figma'],
    links: [{ label: 'Live', url: 'https://example.com' }],
    caseStudy: {
      overview: 'Overview.',
      problem: 'Problem.',
      goals: ['Goal one'],
      features: [{ title: 'Feature', description: 'Does things.' }],
      process: [{ title: 'Research', description: 'Interviews.' }],
      gallery: [],
      outcomes: ['40% faster'],
    },
    ...overrides,
  });

  before(async () => {
    process.env.MONGODB_URI = TEST_URI;
    process.env.MONGODB_DB_NAME = process.env.TEST_MONGODB_DB_NAME || 'su_portfolio_test';
    ({ default: mongoose } = await import('mongoose'));
    const { connectToDatabase } = await import('../server/db.js');
    const { hashPassword } = await import('../server/lib/password.js');
    const { createApp } = await import('../server/app.js');
    models = await import('../server/models/index.js');

    await connectToDatabase();
    await mongoose.connection.dropDatabase();
    for (const model of models.allModels) await model.createIndexes();
    await models.Admin.create({ email: ADMIN.email, name: 'Admin', passwordHash: await hashPassword(ADMIN.password) });

    await new Promise((resolve) => {
      server = createApp().listen(0, '127.0.0.1', resolve);
    });
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
    if (mongoose) {
      await mongoose.connection.dropDatabase().catch(() => {});
      const { disconnectFromDatabase } = await import('../server/db.js');
      await disconnectFromDatabase();
    }
  });

  it('reports a healthy database connection', async () => {
    const { status, json } = await request('GET', '/api/health');
    assert.equal(status, 200);
    assert.equal(json.database, 'connected');
  });

  it('serves empty public content before anything is created', async () => {
    assert.deepEqual((await request('GET', '/api/projects')).json, { projects: [] });
    assert.deepEqual((await request('GET', '/api/profile')).json, { profile: null });
    assert.equal((await request('GET', '/api/projects/nothing-here')).status, 404);
  });

  it('keeps admin routes behind authentication', async () => {
    for (const [method, path] of [
      ['GET', '/api/admin/projects'],
      ['POST', '/api/admin/projects'],
      ['PUT', '/api/admin/profile'],
      ['POST', '/api/admin/uploads'],
      ['POST', '/api/auth/password'],
    ]) {
      const { status, headers } = await request(method, path, method === 'GET' ? {} : { body: {} });
      assert.equal(status, 401, `${method} ${path}`);
      assert.equal(headers.get('cache-control'), 'no-store');
    }
    // "Who am I" answers without an error when nobody is signed in.
    const me = await request('GET', '/api/auth/me');
    assert.equal(me.status, 200);
    assert.equal(me.json.admin, null);
  });

  it('rejects malformed and injected sign-in attempts', async () => {
    assert.equal((await request('POST', '/api/auth/login', { body: {} })).status, 400);
    const injected = await request('POST', '/api/auth/login', {
      body: { email: { $gt: '' }, password: { $gt: '' } },
    });
    assert.equal(injected.status, 400);
    const wrong = await login('not the password');
    assert.equal(wrong.response.status, 401);
    assert.equal(wrong.response.json.error.code, 'invalid_credentials');
    assert.equal(wrong.cookie, undefined);
  });

  it('signs in with a hardened session cookie', async () => {
    const { response, cookie: sessionCookie } = await login();
    assert.equal(response.status, 200);
    assert.equal(response.json.admin.email, ADMIN.email);
    assert.equal('passwordHash' in response.json.admin, false);
    const header = response.headers.getSetCookie().find((value) => value.startsWith('su_admin_session='));
    assert.match(header, /HttpOnly/i);
    assert.match(header, /SameSite=Strict/i);
    assert.match(header, /Path=\//i);
    cookie = sessionCookie;

    const me = await request('GET', '/api/auth/me', { cookie });
    assert.equal(me.status, 200);
    assert.equal(me.json.admin.email, ADMIN.email);

    // Only a hash of the token is stored.
    const stored = await models.Session.findOne().lean();
    assert.notEqual(stored._id, cookie.split('=')[1]);
  });

  it('blocks cross-site state-changing requests even with a valid cookie', async () => {
    const foreign = await request('POST', '/api/admin/projects', {
      cookie,
      body: fullProject(),
      headers: { Origin: 'https://evil.example' },
    });
    assert.equal(foreign.status, 403);
    const crossSite = await request('POST', '/api/admin/projects', {
      cookie,
      body: fullProject(),
      headers: { 'Sec-Fetch-Site': 'cross-site' },
    });
    assert.equal(crossSite.status, 403);
  });

  it('validates project input with field-level errors', async () => {
    const empty = await request('POST', '/api/admin/projects', { cookie, body: { title: '' } });
    assert.equal(empty.status, 400);
    assert.ok(empty.json.error.fields.title);

    const xss = await request('POST', '/api/admin/projects', {
      cookie,
      body: fullProject({
        links: [{ label: 'Click', url: 'javascript:alert(1)' }],
        coverImage: { url: 'data:text/html;base64,PHNjcmlwdD4=', alt: '' },
      }),
    });
    assert.equal(xss.status, 400);
    assert.ok(xss.json.error.fields['links.0.url']);
    assert.ok(xss.json.error.fields['coverImage.url']);

    const badRow = await request('POST', '/api/admin/projects', {
      cookie,
      body: fullProject({ caseStudy: { features: [{ title: '', description: 'No title' }] } }),
    });
    assert.equal(badRow.status, 400);
    assert.ok(badRow.json.error.fields['caseStudy.features.0.title']);
  });

  let first;
  let second;

  it('creates drafts that stay private until published', async () => {
    const created = await request('POST', '/api/admin/projects', { cookie, body: fullProject() });
    assert.equal(created.status, 201);
    first = created.json.project;
    assert.equal(first.slug, 'test-project');
    assert.equal(first.status, 'draft');
    assert.equal(first.order, 0);

    const duplicate = await request('POST', '/api/admin/projects', { cookie, body: fullProject() });
    assert.equal(duplicate.status, 409);
    assert.ok(duplicate.json.error.fields.slug);

    assert.deepEqual((await request('GET', '/api/projects')).json.projects, []);
    assert.equal((await request('GET', `/api/projects/${first.slug}`)).status, 404);
    const preview = await request('GET', `/api/admin/preview/projects/${first.slug}`, { cookie });
    assert.equal(preview.status, 200);
    assert.equal(preview.json.project.title, 'Test Project');
  });

  it('publishes, features and orders projects', async () => {
    const published = await request('PATCH', `/api/admin/projects/${first.id}`, {
      cookie,
      body: { status: 'published', featured: true },
    });
    assert.equal(published.status, 200);
    assert.ok(published.json.project.publishedAt);

    const another = await request('POST', '/api/admin/projects', {
      cookie,
      body: fullProject({ title: 'Second One', status: 'published' }),
    });
    assert.equal(another.status, 201);
    second = another.json.project;
    assert.equal(second.order, 1);

    const list = await request('GET', '/api/projects');
    assert.deepEqual(list.json.projects.map((project) => project.slug), ['test-project', 'second-one']);
    assert.equal(list.headers.get('cache-control'), 'no-cache', 'browsers always revalidate');
    assert.match(list.headers.get('cdn-cache-control'), /max-age=30/);
    assert.equal('caseStudy' in list.json.projects[0], false, 'list responses stay small');

    const detail = await request('GET', '/api/projects/test-project');
    assert.equal(detail.status, 200);
    assert.equal(detail.json.project.caseStudy.features[0].title, 'Feature');
    assert.equal(detail.json.next.slug, 'second-one');

    const reorder = await request('PUT', '/api/admin/projects/order', { cookie, body: { ids: [second.id, first.id] } });
    assert.equal(reorder.status, 200);
    const reordered = await request('GET', '/api/projects');
    assert.deepEqual(reordered.json.projects.map((project) => project.slug), ['second-one', 'test-project']);

    assert.equal((await request('PUT', '/api/admin/projects/order', { cookie, body: { ids: ['nope'] } })).status, 400);
  });

  it('uploads images, serves them, and cleans up replaced ones', async () => {
    const upload = await request('POST', '/api/admin/uploads', {
      cookie,
      raw: PNG,
      headers: { 'Content-Type': 'image/png', 'X-File-Name': 'dot.png' },
    });
    assert.equal(upload.status, 201);
    const { url } = upload.json.image;
    assert.match(url, /^\/api\/images\/[a-f0-9]{32}$/, 'unguessable 128-bit ids');

    const image = await request('GET', url);
    assert.equal(image.status, 200);
    assert.equal(image.headers.get('content-type'), 'image/png');
    assert.match(image.headers.get('cache-control'), /immutable/);
    assert.ok(image.buffer.equals(PNG));
    const cached = await request('GET', url, { headers: { 'If-None-Match': image.headers.get('etag') } });
    assert.equal(cached.status, 304);

    const fake = await request('POST', '/api/admin/uploads', {
      cookie,
      raw: Buffer.from('<svg onload="alert(1)"></svg>'),
      headers: { 'Content-Type': 'image/svg+xml' },
    });
    assert.equal(fake.status, 415);

    const withCover = await request('PUT', `/api/admin/projects/${first.id}`, {
      cookie,
      body: fullProject({ status: 'published', coverImage: { url, alt: 'Dot', width: 1, height: 1 } }),
    });
    assert.equal(withCover.status, 200);
    assert.deepEqual(withCover.json.project.coverImage, { url, alt: 'Dot', width: 1, height: 1 });

    const withoutCover = await request('PUT', `/api/admin/projects/${first.id}`, {
      cookie,
      body: fullProject({ status: 'published' }),
    });
    assert.equal(withoutCover.status, 200);
    assert.equal((await request('GET', url)).status, 404, 'the replaced upload was deleted');
  });

  it('stores the profile with validation', async () => {
    const invalid = await request('PUT', '/api/admin/profile', {
      cookie,
      body: { name: 'Kulsum', email: 'not-an-email', website: 'javascript:alert(1)' },
    });
    assert.equal(invalid.status, 400);
    assert.ok(invalid.json.error.fields.email);
    assert.ok(invalid.json.error.fields.website);

    const saved = await request('PUT', '/api/admin/profile', {
      cookie,
      body: {
        name: 'Umme Kulsum Suriya',
        email: 'hello@example.com',
        skills: ['UX Research'],
        tools: [{ name: 'Figma', icon: 'figma', color: '#A259FF' }],
      },
    });
    assert.equal(saved.status, 200);
    const publicProfile = await request('GET', '/api/profile');
    assert.equal(publicProfile.json.profile.name, 'Umme Kulsum Suriya');
    assert.equal('key' in publicProfile.json.profile, false);
  });

  it('rate-limits repeated failed sign-ins', async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      assert.equal((await login('wrong password!', 'target@example.com')).response.status, 401);
    }
    const limited = await login('wrong password!', 'target@example.com');
    assert.equal(limited.response.status, 429);
    assert.ok(Number(limited.response.headers.get('retry-after')) > 0);
    // Other accounts are unaffected.
    assert.equal((await login()).response.status, 200);
  });

  it('changes the password and signs out other sessions', async () => {
    const other = await login();
    assert.equal(other.response.status, 200);

    const wrongCurrent = await request('POST', '/api/auth/password', {
      cookie,
      body: { currentPassword: 'nope', newPassword: 'another long passphrase' },
    });
    assert.equal(wrongCurrent.status, 400);
    assert.ok(wrongCurrent.json.error.fields.currentPassword);

    const weak = await request('POST', '/api/auth/password', {
      cookie,
      body: { currentPassword: ADMIN.password, newPassword: 'short' },
    });
    assert.equal(weak.status, 400);
    assert.ok(weak.json.error.fields.newPassword);

    const changed = await request('POST', '/api/auth/password', {
      cookie,
      body: { currentPassword: ADMIN.password, newPassword: 'another long passphrase' },
    });
    assert.equal(changed.status, 200);
    assert.equal((await request('GET', '/api/auth/me', { cookie })).json.admin.email, ADMIN.email, 'this session stays');
    assert.equal((await request('GET', '/api/auth/me', { cookie: other.cookie })).json.admin, null, 'others are signed out');
    assert.equal((await login(ADMIN.password)).response.status, 401);
    assert.equal((await login('another long passphrase')).response.status, 200);
  });

  it('expires sessions server-side', async () => {
    const { cookie: shortLived } = await login('another long passphrase');
    await models.Session.updateMany({}, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    const expired = await request('GET', '/api/admin/projects', { cookie: shortLived });
    assert.equal(expired.status, 401);
    assert.match(expired.json.error.message, /expired/);
    assert.equal((await request('GET', '/api/auth/me', { cookie: shortLived })).json.admin, null);
    ({ cookie } = await login('another long passphrase'));
  });

  it('deletes projects and handles bad ids', async () => {
    assert.equal((await request('GET', '/api/admin/projects/not-an-id', { cookie })).status, 404);
    const removed = await request('DELETE', `/api/admin/projects/${second.id}`, { cookie });
    assert.equal(removed.status, 204);
    assert.equal((await request('GET', '/api/projects/second-one')).status, 404);
  });

  it('answers unknown routes and bad JSON with JSON errors', async () => {
    const missing = await request('GET', '/api/does-not-exist');
    assert.equal(missing.status, 404);
    assert.equal(missing.json.error.code, 'not_found');
    const badJson = await request('PUT', '/api/admin/profile', {
      cookie,
      raw: '{"name": ',
      headers: { 'Content-Type': 'application/json' },
    });
    assert.equal(badJson.status, 400);
    assert.equal(badJson.json.error.code, 'invalid_json');
  });

  it('signs out', async () => {
    const response = await request('POST', '/api/auth/logout', { cookie });
    assert.equal(response.status, 204);
    assert.match(response.headers.getSetCookie().join(';'), /su_admin_session=;/);
    assert.equal((await request('GET', '/api/auth/me', { cookie })).json.admin, null);
    assert.equal((await request('GET', '/api/admin/projects', { cookie })).status, 401);
  });
});
