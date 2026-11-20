/** Те же ступени, что у панели масштаба доски. */
export const BOARD_ZOOM_STEPS = [0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3, 4, 8];

const BOARD_ZOOM_MIN = BOARD_ZOOM_STEPS[0];
const BOARD_ZOOM_MAX = BOARD_ZOOM_STEPS[BOARD_ZOOM_STEPS.length - 1];
const ZOOM_CHANGE_EPSILON = 1e-4;

export type FollowCamera = { x: number; y: number; z: number };

export type FollowView = {
  leaderCamera: FollowCamera;
  leaderScreen: { w: number; h: number };
  viewport: { w: number; h: number };
};

export type FollowCameraInput = FollowView & {
  /**
   * Абсолютный зум ученика.
   * `null` — вписать вид ведущего: на большом экране зум совпадает, на маленьком уменьшается.
   */
  zoom?: number | null;
};

export const clampBoardZoom = (zoom: number) => {
  if (!Number.isFinite(zoom) || zoom <= 0) return 1;
  return Math.min(BOARD_ZOOM_MAX, Math.max(BOARD_ZOOM_MIN, zoom));
};

const finitePositive = (value: number) => Number.isFinite(value) && value > 0;

/**
 * Камера ведомого: центр экрана совпадает с центром вида ведущего.
 * Без `zoom` масштаб такой, чтобы весь вид ведущего поместился в наш viewport.
 */
export const followCameraTarget = ({
  leaderCamera,
  leaderScreen,
  viewport,
  zoom,
}: FollowCameraInput): FollowCamera | null => {
  if (
    !finitePositive(leaderCamera.z) ||
    !finitePositive(leaderScreen.w) ||
    !finitePositive(leaderScreen.h) ||
    !finitePositive(viewport.w) ||
    !finitePositive(viewport.h)
  ) {
    return null;
  }

  const leaderPageW = leaderScreen.w / leaderCamera.z;
  const leaderPageH = leaderScreen.h / leaderCamera.z;
  if (!finitePositive(leaderPageW) || !finitePositive(leaderPageH)) return null;

  const centerX = -leaderCamera.x + leaderPageW / 2;
  const centerY = -leaderCamera.y + leaderPageH / 2;
  const fitZoom = Math.min(leaderCamera.z, viewport.w / leaderPageW, viewport.h / leaderPageH);
  const z = zoom == null ? fitZoom : clampBoardZoom(zoom);
  if (!finitePositive(z)) return null;

  return {
    x: -(centerX - viewport.w / (2 * z)),
    y: -(centerY - viewport.h / (2 * z)),
    z,
  };
};

export const followCamerasClose = (a: FollowCamera, b: FollowCamera) =>
  Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.z - b.z) < 0.001;

export type SnappedFollowCamera = {
  /** `keep` — жест не двигает камеру, `allow` — пропустить как есть, `replace` — подменить камеру. */
  mode: 'keep' | 'allow' | 'replace';
  camera: FollowCamera;
  zoomOverride: number | null;
};

/**
 * Во время презентации пан остаётся на ведущем, а изменение `z` запоминается
 * как локальный масштаб. Пока ученик сам не зумил, масштаб по-прежнему вписывает вид ведущего.
 */
export const snapFollowedCamera = ({
  previous,
  next,
  leader,
  zoomOverride,
}: {
  previous: FollowCamera;
  next: FollowCamera;
  leader: FollowView | null;
  zoomOverride: number | null;
}): SnappedFollowCamera => {
  const zoomChanged = Math.abs(previous.z - next.z) > ZOOM_CHANGE_EPSILON;
  const requested = zoomChanged ? clampBoardZoom(next.z) : null;

  if (!leader) {
    if (!requested) return { mode: 'allow', camera: next, zoomOverride };
    return { mode: 'replace', camera: { ...next, z: requested }, zoomOverride: requested };
  }

  const target = followCameraTarget({ ...leader, zoom: requested ?? zoomOverride });
  if (!target) {
    if (!requested) return { mode: 'allow', camera: next, zoomOverride };
    return { mode: 'replace', camera: { ...next, z: requested }, zoomOverride: requested };
  }

  if (!zoomChanged && followCamerasClose(previous, target)) {
    return { mode: 'keep', camera: previous, zoomOverride };
  }

  return {
    mode: 'replace',
    camera: target,
    zoomOverride: requested ?? zoomOverride,
  };
};

/** Сколько держать синхронизацию с ведущим, чтобы она не оборвала анимацию зума. */
export const nextZoomHoldUntil = (
  now: number,
  animationMs: number,
  animationSpeed: number,
  currentUntil = 0,
) => {
  const duration = animationSpeed > 0 ? animationMs / animationSpeed + 80 : 80;
  return Math.max(currentUntil, now + duration);
};
