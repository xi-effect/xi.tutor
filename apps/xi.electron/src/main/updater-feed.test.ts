import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  feedDirectoryUrl,
  isNewerStableVersion,
  isReleasePageUrl,
  pickLatestElectronReleaseTag,
  pickLatestElectronTag,
  publishedStableTagNames,
  releasePageUrl,
} from './updater-feed.ts';

const atom = `
  <entry>
    <link href="https://github.com/xi-effect/xi.tutor/releases/tag/v0.9.0"/>
  </entry>
  <entry>
    <link href="https://github.com/xi-effect/xi.tutor/releases/tag/electron-v0.1.0"/>
  </entry>
  <entry>
    <link href="https://github.com/xi-effect/xi.tutor/releases/tag/electron-v0.1.1"/>
  </entry>
  <entry>
    <link href="https://github.com/xi-effect/xi.tutor/releases/tag/electron-v0.2.0-beta.1"/>
  </entry>
`;

describe('electron release feed', () => {
  it('picks the newest stable electron tag and skips other releases', () => {
    assert.equal(pickLatestElectronReleaseTag(atom), 'electron-v0.1.1');
  });

  it('returns null when the feed has no electron release', () => {
    assert.equal(
      pickLatestElectronReleaseTag(
        '<link href="https://github.com/xi-effect/xi.tutor/releases/tag/v1.0.0"/>',
      ),
      null,
    );
  });

  it('builds a release page and feed directory only for stable versions', () => {
    assert.equal(
      releasePageUrl('0.1.1'),
      'https://github.com/xi-effect/xi.tutor/releases/tag/electron-v0.1.1',
    );
    assert.equal(releasePageUrl('0.1.1-beta.1'), null);
    assert.equal(
      isReleasePageUrl('https://github.com/xi-effect/xi.tutor/releases/tag/electron-v0.1.1'),
      true,
    );
    assert.equal(isReleasePageUrl('https://github.com/xi-effect/xi.tutor/releases/latest'), false);
    assert.equal(
      feedDirectoryUrl('electron-v0.1.1'),
      'https://github.com/xi-effect/xi.tutor/releases/download/electron-v0.1.1',
    );
    assert.equal(feedDirectoryUrl('v0.1.1'), null);
  });

  it('ignores drafts and pre-releases when choosing the feed tag', () => {
    const tag = pickLatestElectronTag(
      publishedStableTagNames([
        { tag_name: 'electron-v0.9.0', draft: true, prerelease: false },
        { tag_name: 'electron-v0.8.0', draft: false, prerelease: true },
        { tag_name: 'electron-v0.2.0-beta.1', draft: false, prerelease: false },
        { tag_name: 'v1.0.0', draft: false, prerelease: false },
        { tag_name: 'electron-v0.1.0', draft: false, prerelease: false },
        { tag_name: 'electron-v0.1.1', draft: false, prerelease: false },
      ]),
    );
    assert.equal(tag, 'electron-v0.1.1');
    assert.equal(
      feedDirectoryUrl(tag ?? ''),
      'https://github.com/xi-effect/xi.tutor/releases/download/electron-v0.1.1',
    );
  });

  it('treats 0.1.1 as an update for an installed 0.1.0', () => {
    assert.equal(isNewerStableVersion('0.1.0', '0.1.1'), true);
    assert.equal(isNewerStableVersion('0.1.1', '0.1.1'), false);
    assert.equal(isNewerStableVersion('0.1.1', '0.1.0'), false);
    assert.equal(isNewerStableVersion('0.1.1', '0.1.1-beta.1'), false);
  });
});
