import { BaseBoxShapeUtil, HTMLContainer, DrResizeInfo, resizeBox } from '@ibodr/draw';
import { PDF_MAX_SIZE, PDF_MIN_SIZE, PdfShape, pdfShapeProps } from './PdfShape';
import { PdfViewer } from './PdfViewer';
import { renderPdfShapeToDataUrl } from './renderPdfShapeToDataUrl';
import {
  getBoardStorageToken,
  getSvgExportRasterScale,
  SVG_CARD,
} from '../../utils/shapeSvgExport';

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

  override onResize(shape: PdfShape, info: DrResizeInfo<PdfShape>) {
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
        className="bg-background-page border-border-default overflow-hidden rounded-xl border shadow-md"
        style={{ width: shape.props.w, height: shape.props.h }}
      >
        <PdfViewer shape={shape} />
      </HTMLContainer>
    );
  }

  override async toSvg(shape: PdfShape, ctx: { scale?: number; pixelRatio?: number | null }) {
    const { w, h, src, currentPage, pagesVisible, fileName } = shape.props;
    const token = getBoardStorageToken();
    const rasterScale = getSvgExportRasterScale(ctx);

    let dataUrl: string | null = null;
    if (src && token) {
      try {
        dataUrl = await renderPdfShapeToDataUrl({
          src,
          token,
          startPage: Math.max(1, currentPage || 1),
          pagesVisible: Math.max(1, pagesVisible || 1),
          width: w,
          height: h,
          qualityScale: rasterScale,
        });
      } catch (error) {
        console.error('[PdfShapeUtil.toSvg] render failed:', error);
      }
    }

    if (dataUrl) {
      return (
        <g>
          <rect
            width={w}
            height={h}
            rx={12}
            ry={12}
            fill={SVG_CARD.bg}
            stroke={SVG_CARD.border}
            strokeWidth={1}
          />
          <image href={dataUrl} width={w} height={h} preserveAspectRatio="xMidYMid meet" />
        </g>
      );
    }

    return (
      <g>
        <rect
          width={w}
          height={h}
          rx={12}
          ry={12}
          fill={SVG_CARD.bg}
          stroke={SVG_CARD.border}
          strokeWidth={1}
        />
        <text
          x={w / 2}
          y={h / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={SVG_CARD.muted}
          fontSize={14}
          fontFamily="system-ui, sans-serif"
        >
          {fileName || 'PDF'}
        </text>
      </g>
    );
  }

  override getIndicatorPath(shape: PdfShape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
