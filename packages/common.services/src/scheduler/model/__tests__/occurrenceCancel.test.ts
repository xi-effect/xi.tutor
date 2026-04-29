import { describe, expect, it } from 'vitest';
import { buildOccurrenceCancellationParams } from '../occurrenceCancel';

describe('buildOccurrenceCancellationParams', () => {
  it('sole: по uuid инстанса', () => {
    expect(
      buildOccurrenceCancellationParams({
        instanceKind: 'sole',
        eventInstanceId: 'uuid-one',
      }),
    ).toEqual({ kind: 'instance', eventInstanceId: 'uuid-one' });
  });

  it('repeated_persistent: по uuid инстанса', () => {
    expect(
      buildOccurrenceCancellationParams({
        instanceKind: 'repeated_persistent',
        eventInstanceId: 'uuid-persisted',
        repetitionModeId: 'mode',
        instanceIndex: 3,
      }),
    ).toEqual({ kind: 'instance', eventInstanceId: 'uuid-persisted' });
  });

  it('repeated_virtual: по mode + index, без event_instance_id', () => {
    expect(
      buildOccurrenceCancellationParams({
        instanceKind: 'repeated_virtual',
        repetitionModeId: 'mode-uuid',
        instanceIndex: 7,
      }),
    ).toEqual({ kind: 'virtual', repetitionModeId: 'mode-uuid', instanceIndex: 7 });
  });

  it('repeated_virtual: null при отсутствии mode или index', () => {
    expect(
      buildOccurrenceCancellationParams({
        instanceKind: 'repeated_virtual',
        repetitionModeId: '',
        instanceIndex: 1,
      }),
    ).toBeNull();
    expect(
      buildOccurrenceCancellationParams({
        instanceKind: 'repeated_virtual',
        repetitionModeId: 'm',
        instanceIndex: null,
      }),
    ).toBeNull();
  });

  it('sole/persistent: null без uuid', () => {
    expect(
      buildOccurrenceCancellationParams({
        instanceKind: 'sole',
        eventInstanceId: '',
      }),
    ).toBeNull();
  });
});
