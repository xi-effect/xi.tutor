import { useCallback, useRef } from 'react';
import { Conference, WhiteBoard } from '@xipkg/icons';
import { Slider } from '@xipkg/slider';
import { Toggle } from '@xipkg/toggle';
import { useMediaQuery } from '@xipkg/utils';
import { useSoundEffectsStore, SOUND_DEFAULTS, type SoundKey } from 'common.ui';

/** Доля слева (0–100), визуально «заблокирована»; слайдер только справа от границы. */
const FORBIDDEN_ZONE_PERCENT = 20;

type SoundItemProps = {
  label: string;
  soundKey: SoundKey;
  volume: number;
  onVolumeChange: (key: SoundKey, volume: number) => void;
  minVolume?: number;
  disableable?: boolean;
  /** Шкала 0–100% по всей ширине, левая часть недоступна для выбора (см. FORBIDDEN_ZONE_PERCENT). */
  scaleWithForbiddenLeading?: boolean;
};

const SoundItem = ({
  label,
  soundKey,
  volume,
  onVolumeChange,
  minVolume = 0,
  disableable = true,
  scaleWithForbiddenLeading = false,
}: SoundItemProps) => {
  const savedVolumeRef = useRef<number>(SOUND_DEFAULTS[soundKey]);

  const isEnabled = volume > 0;

  const handleSliderChange = useCallback(
    (values: number[]) => {
      let newVolume = values[0] ?? volume;
      if (scaleWithForbiddenLeading && minVolume > 0) {
        newVolume = Math.max(newVolume, minVolume);
      }
      onVolumeChange(soundKey, newVolume);
      if (newVolume > 0) {
        savedVolumeRef.current = newVolume;
      }
    },
    [soundKey, volume, onVolumeChange, scaleWithForbiddenLeading, minVolume],
  );

  const handleToggle = useCallback(
    (checked: boolean) => {
      if (!disableable) return;
      if (checked) {
        const restored =
          savedVolumeRef.current > 0 ? savedVolumeRef.current : SOUND_DEFAULTS[soundKey];
        onVolumeChange(soundKey, restored);
      } else {
        savedVolumeRef.current = volume > 0 ? volume : SOUND_DEFAULTS[soundKey];
        onVolumeChange(soundKey, 0);
      }
    },
    [soundKey, volume, onVolumeChange, disableable],
  );

  return (
    <div className="space-y-2.5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-80 text-sm">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-60 text-sm tabular-nums">{Math.round(volume * 100)}%</span>
          {disableable && <Toggle checked={isEnabled} size="s" onCheckedChange={handleToggle} />}
        </div>
      </div>
      {scaleWithForbiddenLeading && minVolume > 0 ? (
        <div className="relative w-full">
          <Slider
            value={[volume]}
            onValueChange={handleSliderChange}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
          {/* Заблокированная зона 0–20%: полоса поверх трека, пропускает клики к слайдеру */}
          <div
            className="bg-gray-40 dark:bg-gray-60 pointer-events-none absolute top-1/2 left-0 z-10 flex h-1 -translate-y-1/2 items-center overflow-hidden rounded-l-full"
            style={{ width: `${FORBIDDEN_ZONE_PERCENT}%` }}
            aria-hidden
          >
            <svg className="h-full w-full opacity-30" preserveAspectRatio="none">
              <defs>
                <pattern
                  id="disabled-hatch"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="6"
                    className="dark:stroke-gray-0 stroke-gray-100"
                    strokeWidth="1.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#disabled-hatch)" />
            </svg>
          </div>
        </div>
      ) : (
        <Slider
          value={[volume]}
          onValueChange={handleSliderChange}
          min={minVolume}
          max={1}
          step={0.01}
          className="w-full"
        />
      )}
    </div>
  );
};

type CategoryProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

const Category = ({ icon, title, children }: CategoryProps) => (
  <div className="border-gray-30 rounded-2xl border p-4">
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <span className="text-base font-semibold dark:text-gray-100">{title}</span>
    </div>
    <div className="flex flex-col">{children}</div>
  </div>
);

export const Effects = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  const chatMessageVolume = useSoundEffectsStore((s) => s.chatMessageVolume);
  const handRaiseVolume = useSoundEffectsStore((s) => s.handRaiseVolume);
  const userJoinVolume = useSoundEffectsStore((s) => s.userJoinVolume);
  const userLeftVolume = useSoundEffectsStore((s) => s.userLeftVolume);
  const boardTimerEndVolume = useSoundEffectsStore((s) => s.boardTimerEndVolume);
  const boardTimerWarnVolume = useSoundEffectsStore((s) => s.boardTimerWarnVolume);
  const setSoundVolume = useSoundEffectsStore((s) => s.setSoundVolume);

  return (
    <>
      {!isMobile && <h1 className="mb-4 text-3xl font-semibold dark:text-gray-100">Эффекты</h1>}

      <div className="flex flex-col gap-4">
        <Category icon={<Conference className="fill-brand-80 h-5 w-5" />} title="Видеоконференции">
          <SoundItem
            label="Новое сообщение в чате"
            soundKey="chatMessage"
            volume={chatMessageVolume}
            onVolumeChange={setSoundVolume}
          />
          <SoundItem
            label="Поднятие руки"
            soundKey="handRaise"
            volume={handRaiseVolume}
            onVolumeChange={setSoundVolume}
          />
          <SoundItem
            label="Подключение участника"
            soundKey="userJoin"
            volume={userJoinVolume}
            onVolumeChange={setSoundVolume}
          />
          <SoundItem
            label="Отключение участника"
            soundKey="userLeft"
            volume={userLeftVolume}
            onVolumeChange={setSoundVolume}
          />
        </Category>

        <Category icon={<WhiteBoard className="fill-brand-80 h-5 w-5" />} title="Доска">
          <SoundItem
            label="Окончание таймера"
            soundKey="boardTimerEnd"
            volume={boardTimerEndVolume}
            onVolumeChange={setSoundVolume}
            minVolume={0.2}
            disableable={false}
            scaleWithForbiddenLeading
          />
          <SoundItem
            label="Предупреждение таймера"
            soundKey="boardTimerWarn"
            volume={boardTimerWarnVolume}
            onVolumeChange={setSoundVolume}
          />
        </Category>
      </div>
    </>
  );
};
