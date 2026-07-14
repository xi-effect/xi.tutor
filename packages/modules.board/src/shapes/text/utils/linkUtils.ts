export const normalizeLink = (link: string): string => {
  const normalizedLink = link.trim();
  const hasProtocol = /^[a-z]+:\/\//i.test(link);

  if (hasProtocol) return link;

  return `https://${normalizedLink}`;
};
