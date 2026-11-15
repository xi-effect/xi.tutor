import { describe, expect, it } from 'vitest';
import { cameraCenteredOnBounds, DEMO_BOARD_GUIDE_ZOOM } from '../demoBoardGuideCamera';

describe('cameraCenteredOnBounds', () => {
  it('ставит центр блока в центр экрана на 45%', () => {
    const camera = cameraCenteredOnBounds(
      { x: 100, y: 40, w: 200, h: 80 },
      { w: 900, h: 600 },
      DEMO_BOARD_GUIDE_ZOOM,
    );

    expect(camera.z).toBe(0.45);
    expect(camera.x).toBeCloseTo(-(200 - 900 / (2 * 0.45)));
    expect(camera.y).toBeCloseTo(-(80 - 600 / (2 * 0.45)));
  });
});
