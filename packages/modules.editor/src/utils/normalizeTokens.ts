interface PrismToken {
  type: string;
  content: string | PrismToken[];
}

interface NormalizedToken {
  text: string;
  types: string[];
  startIndex: number;
  endIndex: number;
  classNames: string;
}

/**
 * Recursively flattens token structure from Prism and returns a flat array of token info
 * @param tokens Prism tokens
 * @param parentTypes Parent token types for recursion
 * @param startIndex Starting index in the string
 * @returns Array of flattened token information
 */
export const normalizeTokens = (
  tokens: Array<PrismToken | string>,
  parentTypes: string[] = [],
  startIndex = 0,
): NormalizedToken[] => {
  let currentIndex = startIndex;
  const flattenedTokens: NormalizedToken[] = [];

  tokens.forEach((token) => {
    if (typeof token === 'string') {
      // Plain text tokens
      flattenedTokens.push({
        text: token,
        types: parentTypes,
        startIndex: currentIndex,
        endIndex: currentIndex + token.length,
        classNames: parentTypes.join(' '),
      });
      currentIndex += token.length;
    } else {
      // Nested token structures
      let types: string[];
      let content: (string | PrismToken)[];

      if (typeof token.content === 'string') {
        types = [...parentTypes, token.type];
        content = [token.content];
      } else {
        types = [...parentTypes, token.type];
        content = token.content;
      }

      // Process nested tokens recursively
      const nestedTokens = normalizeTokens(content, types, currentIndex);
      flattenedTokens.push(...nestedTokens);

      // Update current index based on the processed tokens
      if (nestedTokens.length > 0) {
        const lastNestedToken = nestedTokens[nestedTokens.length - 1];
        currentIndex = lastNestedToken.endIndex;
      }
    }
  });

  return flattenedTokens;
};
