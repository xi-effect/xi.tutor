/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { NodeEntry } from 'slate';
import Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-html';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-yaml';
import { normalizeTokens } from '../utils/normalizeTokens';
import { useCodeLanguage } from './useCodeLanguage';

export const useDecorateCode = () => {
  const { getLanguage } = useCodeLanguage();

  return useCallback(
    ([node, path]: NodeEntry<any>) => {
      const ranges: any[] = [];

      if (!node) {
        return ranges;
      }

      if (node.type === 'code') {
        const language = getLanguage(node);

        if (!language) return ranges;

        if (!Prism.languages[language]) {
          return ranges;
        }

        const tokens = Prism.tokenize(node.children[0].text, Prism.languages[language]);
        const normalizedTokens = normalizeTokens(tokens);

        for (const token of normalizedTokens) {
          ranges.push({
            anchor: { path: [...path, 0], offset: token.startIndex },
            focus: { path: [...path, 0], offset: token.endIndex },
            className: token.classNames,
            prism: true,
          });
        }
      }

      return ranges;
    },
    [getLanguage],
  );
};
