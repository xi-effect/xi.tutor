import { describe, expect, it } from 'vitest';
import { getStatusColor } from '../statusColorMap';

describe('getStatusColor', () => {
  it('возвращает text-класс для известного статуса', () => {
    expect(getStatusColor('complete')).toBe('text-status-success-text bg-transparent');
  });

  it('возвращает text+bg для withBg', () => {
    expect(getStatusColor('wf_receiver_confirmation', true)).toBe(
      'text-text-link bg-status-info-background',
    );
  });

  it('возвращает пустую строку для неизвестного/пустого статуса', () => {
    expect(getStatusColor(undefined)).toBe('');
    expect(getStatusColor('unknown')).toBe('');
  });
});
