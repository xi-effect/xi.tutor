import { BaseBoxShapeUtil, HTMLContainer, TLResizeInfo, resizeBox } from 'tldraw';
import { PdfShape, pdfShapeProps } from './PdfShape';
import { PdfViewer } from './PdfViewer';

export class PdfShapeUtil extends BaseBoxShapeUtil<PdfShape> {
  static override type = 'pdf' as const;
  static override props = pdfShapeProps;

  override getDefaultProps(): PdfShape['props'] {
    return {
      src: '',
      fileName: '',
      totalPages: 0,
      currentPage: 1,
      w: 400,
      h: 565,
      studentCanFlip: true,
    };
  }

  override canEdit() {
    return false;
  }

  override canResize() {
    return true;
  }

  override isAspectRatioLocked() {
    return true;
  }

  override onResize(shape: PdfShape, info: TLResizeInfo<PdfShape>) {
    return resizeBox(shape, info);
  }

  override component(shape: PdfShape) {
    return (
      <HTMLContainer
        className="bg-gray-5 border-gray-10 overflow-hidden rounded-xl border shadow-md"
        style={{ width: shape.props.w, height: shape.props.h }}
      >
        <PdfViewer shape={shape} />
      </HTMLContainer>
    );
  }

  override indicator(shape: PdfShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={12} ry={12} />;
  }
}
