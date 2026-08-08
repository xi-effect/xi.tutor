/**
 * Asset utils для createDrStore.
 *
 * @ibodr/draw по умолчанию валидирует image.props.src как URL (`T.srcUrl`).
 * У нас в Yjs хранится только storage file id — см. utils/storedFileSrc.ts.
 * BoardImageAssetUtil ослабляет валидатор до `T.string.nullable()`.
 */
import { BookmarkAssetUtil, ImageAssetUtil, VideoAssetUtil } from '@ibodr/draw';
import { imageAssetMigrations, imageAssetProps } from '@ibodr/schema';
import { T } from '@ibodr/validate';

/** props.src: storage file id (UUID), не обязательно http(s) URL */
const boardImageAssetProps = {
  ...imageAssetProps,
  src: T.string.nullable(),
};

export class BoardImageAssetUtil extends ImageAssetUtil {
  static override props = boardImageAssetProps;
  static override migrations = imageAssetMigrations;
}

/** Image + стандартные video/bookmark — image с кастомной схемой src */
export const boardAssetUtils = [BoardImageAssetUtil, VideoAssetUtil, BookmarkAssetUtil] as const;
