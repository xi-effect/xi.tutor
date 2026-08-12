import { TextShapeUtil as TextShapeUtilDraw } from '@ibodr/draw';

/**
 * Клик по ссылке внутри текстовой фигуры не должен открывать её — переход доступен только
 * через LinkHoverPreview (см. useLinkHoverPreview).
 */
export const TextShapeUtil = TextShapeUtilDraw.configure({ openLinksOnClick: false });
