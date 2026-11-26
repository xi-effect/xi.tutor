import { describe, expect, it } from 'vitest';
import { asClassroomId, firstClassroomId } from '../classroomId';

describe('asClassroomId', () => {
  it('оставляет числовой id кабинета строкой', () => {
    expect(asClassroomId('42')).toBe('42');
    expect(asClassroomId(42)).toBe('42');
    expect(asClassroomId(' 42 ')).toBe('42');
    expect(asClassroomId('"42"')).toBe('42');
  });

  it('отбрасывает id материала и пустые значения', () => {
    expect(asClassroomId('6f0c1b7e-1c3a-4a1e-9c2d-0a1b2c3d4e5f')).toBeUndefined();
    expect(asClassroomId('undefined')).toBeUndefined();
    expect(asClassroomId('')).toBeUndefined();
    expect(asClassroomId(0)).toBeUndefined();
    expect(asClassroomId(null)).toBeUndefined();
  });
});

describe('firstClassroomId', () => {
  it('берёт первый настоящий id кабинета, пропуская uuid доски', () => {
    expect(firstClassroomId('6f0c1b7e-1c3a-4a1e-9c2d-0a1b2c3d4e5f', undefined, 15)).toBe('15');
  });
});
