import { createElement, type ReactNode } from 'react';
import { DefaultDashStyle, PathBuilder, type PathBuilderOpts } from '@ibodr/draw';
import { dashDotStroke } from './dashDot';
import { buildWavyPathD, type WavyCommand } from './wavyPath';

/** Стили, которых нет в @ibodr/draw: регистрируем их в dash-энуме и рисуем сами. */
export const EXTRA_LINE_STYLES = ['dash-dot', 'wavy'] as const;

type StrokeCommand = {
  type: string;
  x: number;
  y: number;
  isClose: boolean;
  opts?: {
    mergeWithPrevious?: boolean;
    geometry?: { isFilled?: boolean } | false;
  };
};

type StrokeRun = {
  startIdx: number;
  endIdx: number;
  length: number;
};

const PATCH_FLAG = '__boardExtendedLineStyles';

function collectStrokeRuns(path: PathBuilder, onlyFilled?: boolean) {
  const commands = path.commands as unknown as StrokeCommand[];
  const info = path.getCommandInfo();
  const runs: StrokeRun[] = [];
  let current: StrokeRun | null = null;
  let skipping = false;

  const flush = () => {
    if (!current || current.length <= 0) {
      current = null;
      return;
    }
    runs.push(current);
    current = null;
  };

  for (let index = 0; index < commands.length; index += 1) {
    const command = commands[index];
    if (command.type === 'move') {
      flush();
      const geometry = command.opts?.geometry;
      const isFilled = geometry === false ? false : (geometry?.isFilled ?? false);
      skipping = Boolean(onlyFilled && !isFilled);
      continue;
    }
    if (skipping) continue;

    const segmentLength = info[index]?.length ?? 0;
    if (current && command.opts?.mergeWithPrevious) {
      current.length += segmentLength;
      current.endIdx = index;
      continue;
    }

    flush();
    current = { startIdx: index, endIdx: index, length: segmentLength };
  }

  flush();
  return runs;
}

function renderDashDot(path: PathBuilder, opts: PathBuilderOpts): ReactNode {
  const runs = collectStrokeRuns(path, opts.onlyFilled);
  if (runs.length === 0) return null;
  const paths = runs.map((run, index) => {
    const { strokeDasharray, strokeDashoffset } = dashDotStroke(run.length, opts.strokeWidth);
    return createElement('path', {
      key: index,
      d: path.toD({ startIdx: run.startIdx, endIdx: run.endIdx + 1 }),
      fill: 'none',
      strokeDasharray,
      strokeDashoffset,
      strokeLinecap: 'round',
    });
  });

  return createElement(
    'g',
    {
      strokeWidth: opts.strokeWidth,
      fill: 'none',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...opts.props,
    },
    paths,
  );
}

function renderWavy(path: PathBuilder, opts: PathBuilderOpts) {
  const d = buildWavyPathD(path.commands as unknown as WavyCommand[], opts.strokeWidth);
  if (!d) return null;
  return createElement('path', {
    ...opts.props,
    d,
    fill: 'none',
    strokeWidth: opts.strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  });
}

export function installExtendedLineStyles() {
  const style = DefaultDashStyle as unknown as { addValues: (...values: string[]) => void };
  style.addValues(...EXTRA_LINE_STYLES);

  const prototype = PathBuilder.prototype as PathBuilder & {
    [PATCH_FLAG]?: boolean;
  };
  if (prototype[PATCH_FLAG]) return;

  const originalToSvg = prototype.toSvg;
  prototype.toSvg = function patchedToSvg(this: PathBuilder, opts: PathBuilderOpts) {
    const lineStyle = String(opts.style);
    if (!opts.forceSolid && (lineStyle === 'wavy' || lineStyle === 'dash-dot')) {
      const rendered = lineStyle === 'wavy' ? renderWavy(this, opts) : renderDashDot(this, opts);
      if (rendered) return rendered;
      return originalToSvg.call(this, { ...opts, style: 'solid' });
    }
    return originalToSvg.call(this, opts);
  };
  prototype[PATCH_FLAG] = true;
}

installExtendedLineStyles();
