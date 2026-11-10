import { describe, expect, it } from 'vitest';
import {
  demoBoardLayout,
  demoBoardTopLevelBoxes,
  layoutOverlaps,
  layoutOverflows,
} from '../demoBoardLayout';

describe('раскладка демонстрационной доски', () => {
  it('рамки и упражнение не наезжают друг на друга', () => {
    expect(layoutOverlaps(demoBoardTopLevelBoxes(), 32)).toEqual([]);
  });

  it('содержимое рамок остаётся внутри и не пересекается', () => {
    for (const section of [
      demoBoardLayout.welcome,
      demoBoardLayout.elements,
      demoBoardLayout.workflow,
      demoBoardLayout.pdf,
    ]) {
      expect(layoutOverflows(section.frame, section.children, 24)).toEqual([]);
      expect(layoutOverlaps(section.children, 32)).toEqual([]);
    }
  });
});
