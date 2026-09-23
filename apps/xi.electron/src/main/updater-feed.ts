import { ELECTRON_GITHUB_RELEASE } from '../shared/constants.ts';

const STABLE_VERSION = /^(\d+)\.(\d+)\.(\d+)$/;
const STABLE_TAG = new RegExp(`^${ELECTRON_GITHUB_RELEASE.tagPrefix}(\\d+\\.\\d+\\.\\d+)$`);
const RELEASE_TAG = new RegExp(
  `/releases/tag/(${ELECTRON_GITHUB_RELEASE.tagPrefix}(\\d+\\.\\d+\\.\\d+))(?![\\w.-])`,
  'g',
);

function compareStable(left: string, right: string): number {
  const a = STABLE_VERSION.exec(left);
  const b = STABLE_VERSION.exec(right);
  if (!a || !b) return 0;
  for (let index = 1; index <= 3; index += 1) {
    const delta = Number(a[index]) - Number(b[index]);
    if (delta !== 0) return delta;
  }
  return 0;
}

/** Newest stable `electron-vX.Y.Z` tag. Tauri tags and prereleases are ignored. */
export function pickLatestElectronTag(tags: Iterable<string>): string | null {
  const versions = new Map<string, string>();
  for (const tag of tags) {
    const match = STABLE_TAG.exec(tag);
    const version = match?.[1];
    if (!match || !version || !STABLE_VERSION.test(version)) continue;
    versions.set(version, tag);
  }
  const latest = [...versions.keys()].sort(compareStable).at(-1);
  return latest ? (versions.get(latest) ?? null) : null;
}

/**
 * Newest published `electron-vX.Y.Z` tag in the public GitHub releases Atom feed.
 * Drafts are absent from that feed.
 */
export function pickLatestElectronReleaseTag(atomXml: string): string | null {
  const tags: string[] = [];
  for (const match of atomXml.matchAll(RELEASE_TAG)) {
    const tag = match[1];
    if (tag) tags.push(tag);
  }
  return pickLatestElectronTag(tags);
}

export function releasesApiUrl(page: number): string {
  const { owner, repo } = ELECTRON_GITHUB_RELEASE;
  return `https://api.github.com/repos/${owner}/${repo}/releases?per_page=100&page=${page}`;
}

export function releasePageUrl(version: string): string | null {
  if (!STABLE_VERSION.test(version)) return null;
  const { owner, repo, tagPrefix } = ELECTRON_GITHUB_RELEASE;
  return `https://github.com/${owner}/${repo}/releases/tag/${tagPrefix}${version}`;
}

export function isReleasePageUrl(url: string): boolean {
  const { owner, repo, tagPrefix } = ELECTRON_GITHUB_RELEASE;
  const match = new RegExp(
    `^https://github\\.com/${owner}/${repo}/releases/tag/${tagPrefix}(\\d+\\.\\d+\\.\\d+)$`,
  ).exec(url);
  if (!match?.[1]) return false;
  return releasePageUrl(match[1]) === url;
}

/** Directory that contains `latest.yml` / `latest-mac.yml` for one Electron release. */
export function feedDirectoryUrl(tag: string): string | null {
  const { owner, repo, tagPrefix } = ELECTRON_GITHUB_RELEASE;
  if (!new RegExp(`^${tagPrefix}\\d+\\.\\d+\\.\\d+$`).test(tag)) return null;
  return `https://github.com/${owner}/${repo}/releases/download/${tag}`;
}
