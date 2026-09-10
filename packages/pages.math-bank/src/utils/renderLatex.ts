import katex from 'katex';
import 'katex/dist/katex.min.css';

export const renderLatexHtml = (latex: string, displayMode = false) => {
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch {
    return latex;
  }
};
