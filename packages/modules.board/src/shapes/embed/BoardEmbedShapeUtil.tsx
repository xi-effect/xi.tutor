import { EmbedShapeUtil, HTMLContainer, type DrEmbedShape } from '@ibodr/draw';
import { EmbedLoadingFrame } from './EmbedLoadingFrame';

export class BoardEmbedShapeUtil extends EmbedShapeUtil {
  override canEdit() {
    return false;
  }

  override component(shape: DrEmbedShape) {
    return (
      <HTMLContainer style={{ width: shape.props.w, height: shape.props.h, pointerEvents: 'none' }}>
        <EmbedLoadingFrame url={shape.props.url} w={shape.props.w} h={shape.props.h} />
      </HTMLContainer>
    );
  }
}
