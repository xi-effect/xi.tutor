import { BaseBoxShapeUtil, HTMLContainer, TLResizeInfo, resizeBox } from 'tldraw';
import { EmbedShape, embedShapeProps } from './EmbedShape';
import { EmbedViewer } from './EmbedViewer';

const DEFAULT_EMBED_WIDTH = 640;
const DEFAULT_EMBED_HEIGHT = 360;

export class EmbedShapeUtil extends BaseBoxShapeUtil<EmbedShape> {
  static override type = 'embedUrl' as const;
  static override props = embedShapeProps;

  override getDefaultProps(): EmbedShape['props'] {
    return {
      url: '',
      title: '',
      html: '',
      w: DEFAULT_EMBED_WIDTH,
      h: DEFAULT_EMBED_HEIGHT,
    };
  }

  override canEdit() {
    return false;
  }

  /** Обрабатываем двойной клик сами: включаем режим взаимодействия с iframe и возвращаем no-op, чтобы tldraw не создавал текстовую фигуру */
  override onDoubleClick(shape: EmbedShape) {
    (this.editor as unknown as { emit: (name: string, data: unknown) => void }).emit(
      'embedurl:enter-interact',
      { shapeId: shape.id },
    );
    return { id: shape.id, type: 'embedUrl' as const, props: { ...shape.props } };
  }

  override canResize() {
    return true;
  }

  override isAspectRatioLocked() {
    return false;
  }

  override onResize(shape: EmbedShape, info: TLResizeInfo<EmbedShape>) {
    return resizeBox(shape, info);
  }

  override component(shape: EmbedShape) {
    return (
      <HTMLContainer
        className="bg-gray-5 border-gray-10 overflow-hidden rounded-xl border shadow-md"
        style={{ width: shape.props.w, height: shape.props.h }}
      >
        <EmbedViewer shape={shape} />
      </HTMLContainer>
    );
  }

  override indicator(shape: EmbedShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={12} ry={12} />;
  }
}
