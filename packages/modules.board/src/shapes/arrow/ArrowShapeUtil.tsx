import { ArrowShapeUtil as ArrowShapeUtilDraw } from '@ibodr/draw';

/**
 * Клик по ссылке внутри лейбла стрелки не должен открывать её — переход доступен только
 * через LinkHoverPreview (см. useLinkHoverPreview).
 */
export const ArrowShapeUtil = ArrowShapeUtilDraw.configure({ openLinksOnClick: false });
