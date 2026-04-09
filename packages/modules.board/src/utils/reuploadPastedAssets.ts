/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TLContent, Editor } from 'tldraw';
import { uploadImageRequest, uploadFileRequest } from 'common.services';
import { getFileUrl } from 'common.api';
import { resolveAssetUrl } from './resolveAssetUrl';
import { getRegisteredTokens } from './tokenRegistry';

/**
 * Re-uploads files from pasted content to the current board.
 *
 * Uses the token registry (localStorage) to try all recently-visited board
 * tokens when the direct fetch fails — this handles cross-board and cross-tab
 * paste without any clipboard hacking.
 *
 * Deduplication: identical files (by meta.originalSrc) are uploaded only once.
 *
 * Same-board optimisation: if the asset already exists in the editor, we restore
 * the original file-ID src instead of re-uploading.
 */
export async function reuploadPastedAssets(
  content: TLContent,
  editor: Editor,
  token: string,
): Promise<void> {
  const remapped = new Map<string, string>();
  const contentAny = content as any;

  const isSameBoard = (contentAny.assets ?? []).some((a: any) => !!editor.getAsset(a.id));

  for (const asset of contentAny.assets ?? []) {
    if (editor.getAsset(asset.id)) {
      const originalSrc = asset.meta?.originalSrc;
      if (originalSrc) {
        (asset.props as any).src = originalSrc;
      }
      continue;
    }

    await reuploadSrc(asset.props, asset.meta, asset.id, remapped, token, true);
  }

  for (const shape of contentAny.shapes ?? []) {
    if (shape.type !== 'audio' && shape.type !== 'pdf') continue;

    if (isSameBoard && shape.meta?.originalSrc) {
      (shape.props as any).src = shape.meta.originalSrc;
      continue;
    }

    await reuploadSrc(shape.props, shape.meta, shape.id, remapped, token, false);
  }
}

async function reuploadSrc(
  props: Record<string, any>,
  meta: Record<string, any> | undefined,
  id: string,
  remapped: Map<string, string>,
  destToken: string,
  canBeImage: boolean,
): Promise<void> {
  const src: string | undefined = props.src;
  if (!src) return;

  const dedupKey = meta?.originalSrc ?? src;

  if (remapped.has(dedupKey)) {
    props.src = remapped.get(dedupKey)!;
    return;
  }

  let blob: Blob | null = null;

  // 1. Try direct fetch (works for data: URLs, blob: URLs)
  try {
    blob = await fetchBlob(src);
  } catch {
    blob = null;
  }

  // 2. Primary fallback: use sourceToken from clipboard meta
  if (!blob && meta?.sourceToken) {
    const fileRef = meta.originalSrc ?? src;
    try {
      const blobUrl = await resolveAssetUrl(fileRef, meta.sourceToken);
      blob = await fetchBlob(blobUrl);
    } catch {
      blob = null;
    }
  }

  // 3. Secondary fallback: try all tokens from the registry
  if (!blob) {
    const fileRef = meta?.originalSrc ?? src;
    for (const altToken of getRegisteredTokens()) {
      if (altToken === destToken) continue;
      try {
        const blobUrl = await resolveAssetUrl(fileRef, altToken);
        blob = await fetchBlob(blobUrl);
        if (blob) break;
      } catch {
        continue;
      }
    }
  }

  if (!blob) {
    if (meta?.originalSrc) props.src = meta.originalSrc;
    return;
  }

  try {
    const name: string = props.fileName || props.name || `file-${id}`;
    const file = new File([blob], name, { type: blob.type });

    const isImage = canBeImage && blob.type.startsWith('image/');
    const fileId = isImage
      ? await uploadImageRequest({ file, token: destToken })
      : await uploadFileRequest({ file, token: destToken });
    const newSrc = isImage ? getFileUrl(fileId) : fileId;

    remapped.set(dedupKey, newSrc);
    props.src = newSrc;
  } catch (error) {
    console.warn('[reuploadPastedAssets] re-upload failed:', id, error);
    if (meta?.originalSrc) props.src = meta.originalSrc;
  }
}

async function fetchBlob(src: string): Promise<Blob | null> {
  const response = await fetch(src);
  if (!response.ok) return null;
  return response.blob();
}
