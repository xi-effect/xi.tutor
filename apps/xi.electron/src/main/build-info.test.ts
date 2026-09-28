import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatBuildSha } from './build-info.ts';

describe('build sha', () => {
  it('shortens a GitHub SHA and keeps an existing short id', () => {
    assert.equal(formatBuildSha(`4392F07${'a'.repeat(33)}`), '4392f07');
    assert.equal(formatBuildSha('aa69dbc'), 'aa69dbc');
  });

  it('uses dev when the build did not receive a commit SHA', () => {
    assert.equal(formatBuildSha(undefined), 'dev');
    assert.equal(formatBuildSha(''), 'dev');
    assert.equal(formatBuildSha('not-a-sha'), 'dev');
  });
});
