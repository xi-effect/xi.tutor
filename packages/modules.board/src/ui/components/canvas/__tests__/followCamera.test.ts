import { describe, expect, it } from 'vitest';
import {
  clampBoardZoom,
  followCameraTarget,
  nextZoomHoldUntil,
  snapFollowedCamera,
  type FollowCamera,
  type FollowView,
} from '../followCamera';

const view: FollowView = {
  leaderCamera: { x: -100, y: -50, z: 1 },
  leaderScreen: { w: 1000, h: 800 },
  viewport: { w: 1000, h: 800 },
};

const centerOf = (camera: FollowCamera, viewport: { w: number; h: number }) => ({
  x: -camera.x + viewport.w / (2 * camera.z),
  y: -camera.y + viewport.h / (2 * camera.z),
});

const leaderCenter = (leaderCamera: FollowCamera, leaderScreen: { w: number; h: number }) => ({
  x: -leaderCamera.x + leaderScreen.w / leaderCamera.z / 2,
  y: -leaderCamera.y + leaderScreen.h / leaderCamera.z / 2,
});

describe('followCameraTarget', () => {
  it('повторяет камеру ведущего, если экраны совпадают', () => {
    expect(followCameraTarget(view)).toEqual({ x: -100, y: -50, z: 1 });
  });

  it('на большом экране не приближает сильнее ведущего', () => {
    const viewport = { w: 2000, h: 1600 };
    const camera = followCameraTarget({ ...view, viewport });
    expect(camera?.z).toBe(1);
    expect(centerOf(camera!, viewport)).toEqual(leaderCenter(view.leaderCamera, view.leaderScreen));
  });

  it('на маленьком экране уменьшает масштаб, чтобы видеть весь кадр ведущего', () => {
    const viewport = { w: 500, h: 400 };
    const camera = followCameraTarget({ ...view, viewport });
    expect(camera?.z).toBe(0.5);
    expect(centerOf(camera!, viewport)).toEqual(leaderCenter(view.leaderCamera, view.leaderScreen));
  });

  it('сохраняет центр кадра ведущего при своём масштабе', () => {
    const camera = followCameraTarget({ ...view, zoom: 2 });
    expect(camera?.z).toBe(2);
    expect(centerOf(camera!, view.viewport)).toEqual(
      leaderCenter(view.leaderCamera, view.leaderScreen),
    );
  });

  it('ограничивает локальный масштаб ступенями доски', () => {
    expect(followCameraTarget({ ...view, zoom: 40 })?.z).toBe(8);
    expect(followCameraTarget({ ...view, zoom: 0.001 })?.z).toBe(0.05);
    expect(clampBoardZoom(Number.NaN)).toBe(1);
  });

  it('возвращает null для пустого экрана ведущего', () => {
    expect(followCameraTarget({ ...view, leaderScreen: { w: 0, h: 800 } })).toBeNull();
  });
});

describe('snapFollowedCamera', () => {
  const fitted = followCameraTarget(view)!;

  it('не даёт сдвинуть кадр с центра презентации', () => {
    const snapped = snapFollowedCamera({
      previous: fitted,
      next: { ...fitted, x: fitted.x - 80, y: fitted.y + 40 },
      leader: view,
      zoomOverride: null,
    });

    expect(snapped.mode).toBe('keep');
    expect(snapped.zoomOverride).toBeNull();
  });

  it('запоминает масштаб ученика и оставляет центр на ведущем', () => {
    const snapped = snapFollowedCamera({
      previous: fitted,
      next: { ...fitted, z: 2, x: 10, y: 10 },
      leader: view,
      zoomOverride: null,
    });

    expect(snapped.mode).toBe('replace');
    expect(snapped.zoomOverride).toBe(2);
    expect(snapped.camera.z).toBe(2);
    expect(centerOf(snapped.camera, view.viewport)).toEqual(
      leaderCenter(view.leaderCamera, view.leaderScreen),
    );
  });

  it('после выбора масштаба пан не сбрасывает его и не уводит центр', () => {
    const zoomed = followCameraTarget({ ...view, zoom: 2 })!;
    const snapped = snapFollowedCamera({
      previous: zoomed,
      next: { ...zoomed, x: zoomed.x + 30 },
      leader: view,
      zoomOverride: 2,
    });

    expect(snapped.mode).toBe('keep');
    expect(snapped.zoomOverride).toBe(2);
  });

  it('пока ученик не зумил, продолжает вписывать новый кадр ведущего', () => {
    const movedLeader: FollowView = {
      ...view,
      leaderCamera: { x: -240, y: -80, z: 2 },
    };
    const snapped = snapFollowedCamera({
      previous: fitted,
      next: { ...fitted, x: fitted.x - 15 },
      leader: movedLeader,
      zoomOverride: null,
    });
    const expected = followCameraTarget(movedLeader)!;

    expect(snapped.mode).toBe('replace');
    expect(snapped.zoomOverride).toBeNull();
    expect(snapped.camera).toEqual(expected);
  });
});

describe('nextZoomHoldUntil', () => {
  it('держит синхронизацию до конца анимации масштаба', () => {
    expect(nextZoomHoldUntil(1_000, 320, 1)).toBe(1_400);
  });

  it('при выключенной анимации ждёт только короткий хвост', () => {
    expect(nextZoomHoldUntil(1_000, 320, 0)).toBe(1_080);
  });

  it('продлевает уже начатое удержание', () => {
    expect(nextZoomHoldUntil(1_000, 320, 1, 1_500)).toBe(1_500);
  });
});
