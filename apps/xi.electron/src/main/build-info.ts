const FULL_SHA = /^[0-9a-f]{40}$/;
const SHORT_SHA = /^[0-9a-f]{7}$/;

/** Short commit SHA baked in at build time. Missing or invalid values become `dev`. */
export function formatBuildSha(raw: string | undefined): string {
  const value = (raw ?? '').trim().toLowerCase();
  if (FULL_SHA.test(value)) return value.slice(0, 7);
  if (SHORT_SHA.test(value)) return value;
  return 'dev';
}

/**
 * Build id for the packaged shell.
 * `scripts/build-main.mjs` inlines `SOVLIUM_BUILD_SHA` or `GITHUB_SHA`.
 * Packaged runtime does not call git.
 */
export function getBuildSha(): string {
  return formatBuildSha(process.env.SOVLIUM_BUILD_SHA);
}
