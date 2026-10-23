import { EmbedShapeUtil, type DrEmbedShape } from '@ibodr/draw';
import { EmbedLoadingFrame } from './EmbedLoadingFrame';

export class BoardEmbedShapeUtil extends EmbedShapeUtil {
  override component(shape: DrEmbedShape) {
    const content = super.component(shape);
    if (!content) return null;

    return (
      <EmbedLoadingFrame key={shape.props.url} w={shape.props.w} h={shape.props.h}>
        {content}
      </EmbedLoadingFrame>
    );
  }
}
