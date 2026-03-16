import { Label } from '@xipkg/label';
import { Switch } from '@xipkg/switcher';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@xipkg/select';
import type { UseNoiseCancellationResult } from '../../../hooks/useNoiseCancellation';
import type { NoiseCancellationMode } from '../../../types/noiseCancellation';
import { NOISE_CANCELLATION_MODES } from '../../../types/noiseCancellation';

const MODE_LABELS: Record<NoiseCancellationMode, string> = {
  off: 'Выключено',
  webrtc: 'Стандартное',
  krisp: 'Усиленное',
};

type NoiseCancellationSettingsProps = {
  nc: UseNoiseCancellationResult;
  /** Скрыть опцию «Выключено», когда тумблер вкл — только webrtc/krisp. */
  hideOffOption?: boolean;
};

export function NoiseCancellationSettings({
  nc,
  hideOffOption = false,
}: NoiseCancellationSettingsProps) {
  const options = hideOffOption
    ? (NOISE_CANCELLATION_MODES.filter(
        (m) => m !== 'off' && (m !== 'krisp' || nc.allowKrisp),
      ) as readonly ('webrtc' | 'krisp')[])
    : NOISE_CANCELLATION_MODES.filter((m) => m !== 'krisp' || nc.allowKrisp);

  const selectValue = hideOffOption
    ? nc.mode === 'off' || (nc.mode === 'krisp' && !nc.allowKrisp)
      ? 'webrtc'
      : nc.mode
    : nc.isEnabled
      ? nc.mode
      : 'off';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="font-medium text-gray-100">Шумоподавление</Label>
        <Switch
          checked={nc.isEnabled}
          onCheckedChange={nc.setEnabled}
          disabled={nc.isApplying}
          data-umami-event="noise_cancellation_toggle"
          data-umami-event-state={nc.isEnabled ? 'on' : 'off'}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-gray-80 text-sm">Режим</Label>
        <Select
          value={selectValue}
          onValueChange={(value) => nc.setMode(value as NoiseCancellationMode)}
          disabled={nc.isApplying || !nc.isEnabled}
          data-umami-event="noise_cancellation_mode_select"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Стандартное">
              {MODE_LABELS[selectValue as NoiseCancellationMode]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options.map((mode) => {
              const isKrispDisabled = mode === 'krisp' && !nc.allowKrisp;
              const isUnsupported = mode === 'krisp' && nc.isKrispSupported === false;
              const disabled =
                isKrispDisabled || (mode === 'krisp' && nc.isKrispSupported === false);
              return (
                <SelectItem key={mode} value={mode} disabled={disabled} className="h-auto">
                  {MODE_LABELS[mode]}
                  {mode === 'krisp' && (isKrispDisabled || isUnsupported) && ' (недоступно)'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <p className="text-gray-60 text-xs">
        Усиленное шумоподавление может быть недоступно в некоторых браузерах.
      </p>
      {nc.lastError && (
        <p className="text-red-90 text-sm" role="alert">
          {nc.lastError}
        </p>
      )}
    </div>
  );
}
