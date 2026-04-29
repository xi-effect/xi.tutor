/** Параметры отмены одного вхождения для API планировщика (не всей серии). */
export type OccurrenceCancelApiTarget =
  | { kind: 'instance'; eventInstanceId: string }
  | { kind: 'virtual'; repetitionModeId: string; instanceIndex: number };

/**
 * Строит цель для отмены одного занятия по метаданным инстанса.
 * `repeated_virtual` — только repetition_mode_id + instance_index; id инстанса нет.
 */
export function buildOccurrenceCancellationParams(args: {
  instanceKind: 'sole' | 'repeated_virtual' | 'repeated_persistent';
  eventInstanceId?: string | undefined;
  repetitionModeId?: string | undefined;
  instanceIndex?: number | null | undefined;
}): OccurrenceCancelApiTarget | null {
  if (args.instanceKind === 'repeated_virtual') {
    const { repetitionModeId, instanceIndex } = args;
    if (
      repetitionModeId == null ||
      repetitionModeId === '' ||
      instanceIndex == null ||
      typeof instanceIndex !== 'number' ||
      Number.isNaN(instanceIndex)
    ) {
      return null;
    }
    return { kind: 'virtual', repetitionModeId, instanceIndex };
  }

  const id = args.eventInstanceId;
  if (id == null || id === '') {
    return null;
  }
  return { kind: 'instance', eventInstanceId: id };
}
