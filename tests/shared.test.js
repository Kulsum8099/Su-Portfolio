import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isSafeUrl, passwordProblem, slugify } from '../shared/content.js';
import { normalizeProfileInput, normalizeProjectInput } from '../shared/normalize.js';

describe('slugify', () => {
  it('builds URL-safe slugs', () => {
    assert.equal(slugify('Medi-Connect: Healthcare'), 'medi-connect-healthcare');
    assert.equal(slugify('  Café & Crème  '), 'cafe-and-creme');
    assert.equal(slugify('My   Trip -- Mates!!'), 'my-trip-mates');
    assert.equal(slugify('🌸'), '');
  });

  it('never ends with a hyphen after truncation', () => {
    const slug = slugify(`${'a'.repeat(79)} b`);
    assert.ok(slug.length <= 80);
    assert.ok(!slug.endsWith('-'));
  });
});

describe('isSafeUrl', () => {
  it('accepts http(s) and site-relative paths', () => {
    assert.ok(isSafeUrl('https://example.com/a.png'));
    assert.ok(isSafeUrl('http://localhost:5173/x'));
    assert.ok(isSafeUrl('/api/images/0123456789abcdef01234567'));
  });

  it('rejects script and other schemes', () => {
    for (const value of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,hi', 'vbscript:x', 'ftp://x']) {
      assert.equal(isSafeUrl(value), false, value);
    }
  });

  it('rejects protocol-relative, backslash and whitespace tricks', () => {
    for (const value of ['//evil.example', '/\\evil.example', 'https://exa mple.com', ' https://x.com', '']) {
      assert.equal(isSafeUrl(value), false, JSON.stringify(value));
    }
  });

  it('can require absolute URLs', () => {
    assert.equal(isSafeUrl('/relative', { allowRelative: false }), false);
    assert.ok(isSafeUrl('https://x.com', { allowRelative: false }));
  });
});

describe('passwordProblem', () => {
  it('enforces a minimum length and rejects trivial passwords', () => {
    assert.match(passwordProblem('short'), /at least 12/);
    assert.match(passwordProblem('aaaaaaaaaaaaaaa'), /repeating/);
    assert.match(passwordProblem('me@example.com', 'me@example.com'), /email/);
    assert.equal(passwordProblem('correct horse battery staple'), null);
  });
});

describe('normalizeProjectInput', () => {
  it('keeps only known fields and trims text', () => {
    const result = normalizeProjectInput({
      title: '  Finwise  ',
      isAdmin: true,
      $where: 'sleep(1000)',
      caseStudy: { problem: '  Too many apps \r\n', hacked: 'x' },
    });
    assert.equal(result.title, 'Finwise');
    assert.equal(result.slug, 'finwise');
    assert.equal(result.caseStudy.problem, 'Too many apps');
    assert.equal('isAdmin' in result, false);
    assert.equal('$where' in result, false);
    assert.equal('hacked' in result.caseStudy, false);
  });

  it('coerces flags and status strictly', () => {
    assert.equal(normalizeProjectInput({ featured: 'true' }).featured, false);
    assert.equal(normalizeProjectInput({ featured: true }).featured, true);
    assert.equal(normalizeProjectInput({ status: 'published' }).status, 'published');
    assert.equal(normalizeProjectInput({ status: { $ne: 'draft' } }).status, 'draft');
  });

  it('drops empty rows and duplicate strings, keeps partly filled rows', () => {
    const result = normalizeProjectInput({
      technologies: ['Figma', ' Figma ', '', 'Maze'],
      links: [{ label: '', url: '' }, { label: 'Live', url: 'https://x.com' }, { label: 'No URL' }],
      caseStudy: {
        goals: ['  ', 'Faster booking'],
        features: [{ title: '', description: '' }, { title: 'Search' }],
        gallery: [{ url: '', alt: '', caption: '', width: 100 }, { url: '/a.png', width: '640', height: 480.5 }],
      },
    });
    assert.deepEqual(result.technologies, ['Figma', 'Maze']);
    assert.deepEqual(result.links, [
      { label: 'Live', url: 'https://x.com' },
      { label: 'No URL', url: '' },
    ]);
    assert.deepEqual(result.caseStudy.goals, ['Faster booking']);
    assert.deepEqual(result.caseStudy.features, [{ title: 'Search', description: '' }]);
    assert.deepEqual(result.caseStudy.gallery, [{ url: '/a.png', alt: '', caption: '', width: 640, height: null }]);
  });

  it('ignores non-object input safely', () => {
    for (const value of [null, undefined, 'x', 42, ['a']]) {
      const result = normalizeProjectInput(value);
      assert.equal(result.title, '');
      assert.deepEqual(result.caseStudy.outcomes, []);
    }
  });
});

describe('normalizeProfileInput', () => {
  it('normalizes contact details and resume rows', () => {
    const result = normalizeProfileInput({
      name: ' Kulsum ',
      email: ' Me@Example.COM ',
      experience: [{ title: 'Designer', organization: 'Studio', period: '2024', extra: 'x' }, {}],
      tools: [{ name: 'Figma', icon: 'figma' }, { color: '#fff' }],
      skills: ['UX', 'UX', ''],
    });
    assert.equal(result.name, 'Kulsum');
    assert.equal(result.email, 'me@example.com');
    assert.deepEqual(result.experience, [{ title: 'Designer', organization: 'Studio', period: '2024' }]);
    assert.deepEqual(result.tools, [{ name: 'Figma', icon: 'figma', abbr: '', color: '#8B5CF6' }]);
    assert.deepEqual(result.skills, ['UX']);
  });
});
