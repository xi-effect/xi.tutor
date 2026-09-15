import {
  createShapeId,
  DefaultColorStyle,
  DefaultFontStyle,
  DefaultSizeStyle,
  toRichText,
  type DrShapeId,
  type Editor,
} from '@ibodr/draw';
import type { VisualizationRenderContext } from './types';

export function createBoardText(
  editor: Editor,
  context: VisualizationRenderContext,
  x: number,
  y: number,
  text: string,
  width = 160,
  size?: 's' | 'm' | 'l' | 'xl',
): DrShapeId {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('text').getDefaultProps();
  editor.createShape({
    id,
    type: 'text',
    x,
    y,
    parentId: context.parentId,
    props: {
      ...defaults,
      richText: toRichText(text),
      autoSize: true,
      w: width,
      color: editor.getStyleForNextShape(DefaultColorStyle),
      size: size ?? editor.getStyleForNextShape(DefaultSizeStyle),
      font: editor.getStyleForNextShape(DefaultFontStyle),
    },
  });
  return id;
}

export function createBoardEllipse(
  editor: Editor,
  context: VisualizationRenderContext,
  x: number,
  y: number,
  size = 14,
  fill: 'solid' | 'none' = 'solid',
): DrShapeId {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('xi-geo').getDefaultProps();
  editor.createShape({
    id,
    type: 'xi-geo',
    x,
    y,
    parentId: context.parentId,
    props: {
      ...defaults,
      geo: 'ellipse',
      w: size,
      h: size,
      fill,
      color: editor.getStyleForNextShape(DefaultColorStyle),
    },
  });
  return id;
}

export function createBoardCircle(
  editor: Editor,
  context: VisualizationRenderContext,
  x: number,
  y: number,
  diameter: number,
): DrShapeId {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('xi-geo').getDefaultProps();
  editor.createShape({
    id,
    type: 'xi-geo',
    x,
    y,
    parentId: context.parentId,
    props: {
      ...defaults,
      geo: 'ellipse',
      w: diameter,
      h: diameter,
      fill: 'none',
      color: editor.getStyleForNextShape(DefaultColorStyle),
      size: editor.getStyleForNextShape(DefaultSizeStyle),
    },
  });
  return id;
}

export function createBoardRectangle(
  editor: Editor,
  context: VisualizationRenderContext,
  x: number,
  y: number,
  w: number,
  h: number,
  label?: string,
): DrShapeId {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('xi-geo').getDefaultProps();
  editor.createShape({
    id,
    type: 'xi-geo',
    x,
    y,
    parentId: context.parentId,
    props: {
      ...defaults,
      geo: 'rectangle',
      w,
      h,
      fill: 'semi',
      text: '',
      richText: toRichText(label ?? ''),
      color: editor.getStyleForNextShape(DefaultColorStyle),
    },
  });
  return id;
}

export function createBoardArrow(
  editor: Editor,
  context: VisualizationRenderContext,
  x: number,
  y: number,
  start: { x: number; y: number },
  end: { x: number; y: number },
): DrShapeId {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('arrow').getDefaultProps();
  editor.createShape({
    id,
    type: 'arrow',
    x,
    y,
    parentId: context.parentId,
    props: {
      ...defaults,
      start,
      end,
      arrowheadStart: 'none',
      arrowheadEnd: 'arrow',
      kind: 'arc',
      bend: 0,
      color: editor.getStyleForNextShape(DefaultColorStyle),
      size: editor.getStyleForNextShape(DefaultSizeStyle),
    },
  });
  return id;
}

export function createBoardSegment(
  editor: Editor,
  context: VisualizationRenderContext,
  x: number,
  y: number,
  start: { x: number; y: number },
  end: { x: number; y: number },
  bend = 0,
): DrShapeId {
  const id = createShapeId();
  const defaults = editor.getShapeUtil('arrow').getDefaultProps();
  editor.createShape({
    id,
    type: 'arrow',
    x,
    y,
    parentId: context.parentId,
    props: {
      ...defaults,
      start,
      end,
      arrowheadStart: 'none',
      arrowheadEnd: 'none',
      kind: 'arc',
      bend,
      color: editor.getStyleForNextShape(DefaultColorStyle),
      size: editor.getStyleForNextShape(DefaultSizeStyle),
    },
  });
  return id;
}
