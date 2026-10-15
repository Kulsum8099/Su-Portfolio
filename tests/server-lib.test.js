import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveDbName } from '../server/db.js';
import { parseCookies } from '../server/lib/cookies.js';
import { detectImageType, uploadedImageId } from '../server/lib/images.js';
import { hashPassword, needsRehash, verifyPassword } from '../server/lib/password.js';
import { isAllowedOrigin } from '../server/middleware/security.js';

describe('password hashing', () => {
  it('verifies the right password and rejects others', async () => {
    const hash = await hashPassword('correct horse battery staple');
    assert.match(hash, /^scrypt\$32768\$8\$3\$/);
    assert.equal(await verifyPassword('correct horse battery staple', hash), true);
    assert.equal(await verifyPassword('correct horse battery stapl', hash), false);
    assert.equal(await verifyPassword('', hash), false);
  });

  it('salts every hash', async () => {
    assert.notEqual(await hashPassword('same password here'), await hashPassword('same password here'));
  });

  it('treats malformed hashes as non-matching instead of throwing', async () => {
    assert.equal(await verifyPassword('x', 'not-a-hash'), false);
    assert.equal(await verifyPassword('x', null), false);
    assert.equal(needsRehash('scrypt$16384$8$1$AAAA$AAAA'), true);
  });
});

describe('parseCookies', () => {
  it('parses values and keeps the first duplicate', () => {
    const cookies = parseCookies('a=1; b=hello%20world; a=2; c="quoted"');
    assert.equal(cookies.a, '1');
    assert.equal(cookies.b, 'hello world');
    assert.equal(cookies.c, 'quoted');
  });

  it('is immune to prototype pollution', () => {
    const cookies = parseCookies('__proto__=polluted; constructor=x');
    assert.equal(Object.getPrototypeOf(cookies), null);
    assert.equal({}.polluted, undefined);
  });

  it('handles missing or malformed headers', () => {
    assert.deepEqual({ ...parseCookies(undefined) }, {});
    assert.equal(parseCookies('bad=%E0%A4%A').bad, '%E0%A4%A');
  });
});

describe('detectImageType', () => {
  const pad = (bytes) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(16)]);
  it('recognizes images by their bytes, not their name', () => {
    assert.equal(detectImageType(pad([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
    assert.equal(detectImageType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
    assert.equal(detectImageType(pad([...Buffer.from('GIF89a')])), 'image/gif');
    assert.equal(detectImageType(Buffer.from('RIFF\x00\x00\x00\x00WEBPVP8 ', 'latin1')), 'image/webp');
    assert.equal(detectImageType(Buffer.from('\x00\x00\x00\x1cftypavif\x00\x00', 'latin1')), 'image/avif');
  });

  it('rejects SVG, HTML and other files', () => {
    assert.equal(detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')), null);
    assert.equal(detectImageType(Buffer.from('<!doctype html><script>alert(1)</script>')), null);
    assert.equal(detectImageType(Buffer.alloc(4)), null);
  });
});

describe('uploadedImageId', () => {
  it('only matches this API’s image URLs', () => {
    const id = '0123456789abcdef0123456789abcdef';
    assert.equal(uploadedImageId(`/api/images/${id}`), id);
    assert.equal(uploadedImageId(`https://cdn.example/api/images/${id}`), null);
    assert.equal(uploadedImageId('/api/images/0123456789abcdef01234567'), null, 'old ObjectId-style ids are not uploads');
    assert.equal(uploadedImageId('/images/projects/finwise.webp'), null);
  });
});

describe('isAllowedOrigin', () => {
  it('allows same-host origins and configured ones only', () => {
    assert.ok(isAllowedOrigin('https://site.example', { host: 'site.example', allowed: [] }));
    assert.ok(isAllowedOrigin('http://localhost:5173', { host: 'localhost:5173', allowed: [] }));
    assert.ok(isAllowedOrigin('https://proxy.example', { host: 'api.internal', forwardedHost: 'proxy.example', allowed: [] }));
    assert.ok(isAllowedOrigin('https://www.custom.example/', { host: 'x', allowed: ['https://www.custom.example'] }));
    assert.equal(isAllowedOrigin('https://evil.example', { host: 'site.example', allowed: [] }), false);
    assert.equal(isAllowedOrigin('null', { host: 'site.example', allowed: [] }), false);
  });
});

describe('resolveDbName', () => {
  it('prefers MONGODB_DB_NAME, then the URI path, then the default', () => {
    assert.equal(resolveDbName('mongodb+srv://u:p@c.mongodb.net/?retryWrites=true', ''), 'su_portfolio');
    assert.equal(resolveDbName('mongodb+srv://u:p@c.mongodb.net/portfolio?retryWrites=true', ''), 'portfolio');
    assert.equal(resolveDbName('mongodb://127.0.0.1:27017', ''), 'su_portfolio');
    assert.equal(resolveDbName('mongodb://127.0.0.1:27017/fromuri', 'explicit'), 'explicit');
  });
});
