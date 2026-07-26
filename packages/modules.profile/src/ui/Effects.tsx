import { useCallback, useRef } from 'react';
import { Conference, WhiteBoard } from '@xipkg/icons';
import { Slider } from '@xipkg/slider';
import { Toggle } from '@xipkg/toggle';
import { useMediaQuery } from '@xipkg/utils';
import { useSoundEffectsStore, SOUND_DEFAULTS, type SoundKey } from 'common.ui';
import { useTranslation } from 'react-i18next';

type SoundItemProps = {
  label: string;
  soundKey: SoundKey;
  volume: number;
  onVolumeChange: (key: SoundKey, volume: number) => void;
  minVolume?: number;
  disableable?: boolean;
  /** Шкала 0–100, зона слева до этого процента недоступна (Slider restrictedMin). */
  restrictedMinPercent?: number;
};

const SoundItem = ({
  label,
  soundKey,
  volume,
  onVolumeChange,
  minVolume = 0,
  disableable = true,
  restrictedMinPercent,
}: SoundItemProps) => {
  const savedVolumeRef = useRef<number>(SOUND_DEFAULTS[soundKey]);

  const isEnabled = volume > 0;

  const handleSliderChange = useCallback(
    (values: number[]) => {
      const raw = values[0];
      const newVolume =
        restrictedMinPercent !== undefined
          ? (raw ?? Math.round(volume * 100)) / 100
          : (raw ?? volume);
      onVolumeChange(soundKey, newVolume);
      if (newVolume > 0) {
        savedVolumeRef.current = newVolume;
      }
    },
    [soundKey, volume, onVolumeChange, restrictedMinPercent],
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
        <span className="text-text-primary text-sm">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-text-secondary text-sm tabular-nums">
            {Math.round(volume * 100)}%
          </span>
          {disableable && <Toggle checked={isEnabled} size="s" onCheckedChange={handleToggle} />}
        </div>
      </div>
      {restrictedMinPercent !== undefined ? (
        <Slider
          value={[Math.round(volume * 100)]}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={1}
          restrictedMin={restrictedMinPercent}
          className="w-full"
        />
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
  <div className="border-border-control rounded-2xl border p-4">
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <span className="dark:text-text-primary text-base font-semibold">{title}</span>
    </div>
    <div className="flex flex-col">{children}</div>
  </div>
);

export const Effects = () => {
  const { t } = useTranslation('profile');
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
      {!isMobile && (
        <h1 className="dark:text-text-primary mb-4 text-3xl font-semibold">{t('effects.title')}</h1>
      )}

      <div className="flex flex-col gap-4">
        <Category
          icon={<Conference className="fill-icon-brand h-5 w-5" />}
          title={t('effects.videoConferences')}
        >
          <SoundItem
            label={t('effects.chatMessage')}
            soundKey="chatMessage"
            volume={chatMessageVolume}
            onVolumeChange={setSoundVolume}
          />
          <SoundItem
            label={t('effects.handRaise')}
            soundKey="handRaise"
            volume={handRaiseVolume}
            onVolumeChange={setSoundVolume}
          />
          <SoundItem
            label={t('effects.userJoin')}
            soundKey="userJoin"
            volume={userJoinVolume}
            onVolumeChange={setSoundVolume}
          />
          <SoundItem
            label={t('effects.userLeft')}
            soundKey="userLeft"
            volume={userLeftVolume}
            onVolumeChange={setSoundVolume}
          />
        </Category>

        <Category
          icon={<WhiteBoard className="fill-icon-brand h-5 w-5" />}
          title={t('effects.board')}
        >
          <SoundItem
            label={t('effects.boardTimerEnd')}
            soundKey="boardTimerEnd"
            volume={boardTimerEndVolume}
            onVolumeChange={setSoundVolume}
            disableable={false}
            restrictedMinPercent={20}
          />
          <SoundItem
            label={t('effects.boardTimerWarn')}
            soundKey="boardTimerWarn"
            volume={boardTimerWarnVolume}
            onVolumeChange={setSoundVolume}
          />
        </Category>
      </div>
    </>
  );
};
