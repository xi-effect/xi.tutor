/**
 * Check if a string is a valid URL
 * @param url String to check
 * @returns Boolean indicating if the string is a valid URL
 */
export const isUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a string is a valid image URL based on extension
 */
export const isImageUrl = (url: string): boolean => {
  if (!isUrl(url)) return false;
  const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  return extensions.some((ext) => url.toLowerCase().endsWith(ext));
};
