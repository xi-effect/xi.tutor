/* eslint-disable @typescript-eslint/no-unused-vars */
export const parseEnv = <T>(
  value: string | null,
  parser: (v: string) => T,
  defaultValue?: T,
): T => {
  if (value === null || value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing environment variable.`);
  }

  try {
    return parser(value);
  } catch (error) {
    throw new Error(`Failed to parse environment variable: ${value}`);
  }
};
