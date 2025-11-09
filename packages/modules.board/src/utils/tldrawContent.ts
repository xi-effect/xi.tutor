/* eslint-disable @typescript-eslint/no-explicit-any */
import * as lz from 'lz-string';
import type { TLContent } from 'tldraw';

export function serializeTldrawContent(content: TLContent): string {
  const { assets, ...otherData } = content as any;

  const clipboardData = {
    type: 'application/tldraw',
    kind: 'content',
    version: 3,
    data: {
      assets: assets || [],
      otherCompressed: lz.compressToBase64(JSON.stringify(otherData)),
    },
  };

  return `<div data-tldraw>${JSON.stringify(clipboardData)}</div>`;
}

export function deserializeTldrawContent(htmlText: string): TLContent | null {
  let match = htmlText.match(/<div data-tldraw[^>]*>(.*?)<\/div>/s);
  if (!match) {
    match = htmlText.match(/\{"type":"application\/tldraw".*?\}/s);
  }
  if (!match || !match[1]) return null;

  try {
    const parsed = JSON.parse(match[1]);
    const other = JSON.parse(lz.decompressFromBase64(parsed.data.otherCompressed));
    return {
      ...other,
      assets: parsed.data.assets || [],
    };
  } catch (error) {
    console.error('Failed to deserialize TLDraw content:', error);
    return null;
  }
}
