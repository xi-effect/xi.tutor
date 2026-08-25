const EN_LAYOUT = '`qwertyuiop[]asdfghjkl;\'zxcvbnm,./~QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>?';
const RU_LAYOUT = 'ёйцукенгшщзхъфывапролджэячсмитьбю.ЁЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ,';

const EN_TO_RU = new Map<string, string>();
const RU_TO_EN = new Map<string, string>();

for (let index = 0; index < EN_LAYOUT.length; index += 1) {
  const enChar = EN_LAYOUT[index];
  const ruChar = RU_LAYOUT[index];
  EN_TO_RU.set(enChar, ruChar);
  RU_TO_EN.set(ruChar, enChar);
}

export const switchKeyboardLayout = (value: string): string =>
  [...value].map((char) => EN_TO_RU.get(char) ?? RU_TO_EN.get(char) ?? char).join('');

export const getSearchQueryVariants = (query: string): string[] => {
  const normalized = query.toLowerCase();
  const switched = switchKeyboardLayout(normalized);

  if (!normalized || switched === normalized) {
    return [normalized];
  }

  return [normalized, switched];
};

export const matchesSearchQuery = (text: string | null | undefined, query: string): boolean => {
  if (!query) return true;
  if (!text) return false;

  const haystack = text.toLowerCase();
  return getSearchQueryVariants(query).some((variant) => haystack.includes(variant));
};
