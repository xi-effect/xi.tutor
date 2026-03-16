import { BaseBoxShapeUtil, HTMLContainer, TLResizeInfo, resizeBox } from 'tldraw';
import { PDF_MAX_SIZE, PDF_MIN_SIZE, PdfShape, pdfShapeProps } from './PdfShape';
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
      pagesVisible: 1,
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
    const aspectRatio = shape.props.w / shape.props.h;
    let minWidth = PDF_MIN_SIZE;
    let minHeight = PDF_MIN_SIZE;
    if (aspectRatio > 1) {
      minWidth = Math.round(PDF_MIN_SIZE * aspectRatio);
    } else {
      minHeight = Math.round(PDF_MIN_SIZE / aspectRatio);
    }
    return resizeBox(shape, info, {
      minWidth,
      minHeight,
      maxWidth: PDF_MAX_SIZE,
      maxHeight: PDF_MAX_SIZE,
    });
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
