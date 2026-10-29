import { useState, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import {
  activateLockedWithinLimit,
  fitActiveClassroomCount,
  getMonetizationOverride,
  hasMonetizationOverride,
  initialMonetizationOverride,
  loadAllTutorClassrooms,
  lockActiveClassrooms,
  monetizationEndsAt,
  tallyClassroomStatuses,
  useMonetizationDevStore,
  type MonetizationOverride,
  type MonetizationPaymentPreview,
  type MonetizationPlanMode,
  type MonetizationSubscriptionMode,
} from 'common.services';
import {
  MB,
  TARIFFS,
  requestClassroomLimitDialog,
  requestImageUpgradeDialog,
  requestProFeatureDialog,
  requestStorageLimitDialog,
  useSubscriptionStore,
  useSubscriptionUiStore,
} from 'common.subscription';
import { useTranslation } from 'react-i18next';

const fieldClass =
  'border-border-default bg-background-page text-text-primary h-8 w-full rounded-lg border px-2 text-xs outline-none';

const presetOverride = (patch: Partial<MonetizationOverride>): MonetizationOverride => ({
  ...initialMonetizationOverride(),
  ...patch,
  enabled: true,
});

export const SubscriptionDebugPanel = () => {
  const { t } = useTranslation('subscription');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [classroomPending, setClassroomPending] = useState(false);
  const [classroomError, setClassroomError] = useState(false);
  const override = useMonetizationDevStore((state) => state.override);
  const patchOverride = useMonetizationDevStore((state) => state.patchOverride);
  const replaceOverride = useMonetizationDevStore((state) => state.replaceOverride);
  const resetOverride = useMonetizationDevStore((state) => state.resetOverride);
  const mock = useSubscriptionStore((state) => state.mock);
  const patchMock = useSubscriptionStore((state) => state.patchMock);
  const testing = hasMonetizationOverride(override);
  const basic = TARIFFS.basic;
  const pro = TARIFFS.pro;
  const classroomLimit =
    override.maxActiveClassrooms ??
    (override.plan === 'pro' ? pro.maxActiveClassrooms : basic.maxActiveClassrooms);
  const storageLimit =
    override.maxStorageBytes ?? (override.plan === 'pro' ? pro.storageBytes : basic.storageBytes);
  const catalogCounts = override.classroomCatalog
    ? tallyClassroomStatuses(override.classroomCatalog)
    : null;

  const applyClassrooms = async (scenario: 'limit' | 'upgrade' | 'downgrade') => {
    setClassroomPending(true);
    setClassroomError(false);

    try {
      const source = getMonetizationOverride().classroomCatalog ?? (await loadAllTutorClassrooms());

      if (scenario === 'upgrade') {
        patchOverride({
          plan: 'pro',
          maxActiveClassrooms: pro.maxActiveClassrooms,
          maxStorageBytes: pro.storageBytes,
          classroomCatalog: activateLockedWithinLimit(source, pro.maxActiveClassrooms),
          activeClassrooms: null,
          subscription: 'active',
          endsAt: override.endsAt ?? monetizationEndsAt(30),
          autoRenewal: true,
          keepActiveRequested: false,
        });
      } else if (scenario === 'downgrade') {
        patchOverride({
          plan: 'basic',
          maxActiveClassrooms: basic.maxActiveClassrooms,
          maxStorageBytes: basic.storageBytes,
          classroomCatalog: lockActiveClassrooms(source),
          activeClassrooms: null,
          subscription: 'ended',
          endsAt: monetizationEndsAt(-1),
          autoRenewal: false,
          keepActiveRequested: true,
        });
      } else {
        patchOverride({
          plan: 'basic',
          maxActiveClassrooms: basic.maxActiveClassrooms,
          maxStorageBytes: override.maxStorageBytes ?? basic.storageBytes,
          classroomCatalog: fitActiveClassroomCount(source, basic.maxActiveClassrooms),
          activeClassrooms: null,
          keepActiveRequested: false,
        });
      }

      void navigate({ to: '/classrooms' });
    } catch {
      setClassroomError(true);
    } finally {
      setClassroomPending(false);
    }
  };

  const setActiveCount = (activeClassrooms: number | null) => {
    if (override.classroomCatalog && activeClassrooms !== null) {
      patchOverride({
        classroomCatalog: fitActiveClassroomCount(override.classroomCatalog, activeClassrooms),
        activeClassrooms: null,
      });
      return;
    }

    patchOverride({ activeClassrooms });
  };

  const applyPlan = (plan: MonetizationPlanMode) => {
    if (plan === 'real') {
      patchOverride({ plan, maxActiveClassrooms: null, maxStorageBytes: null });
      return;
    }

    const tariff = plan === 'pro' ? pro : basic;
    patchOverride({
      plan,
      maxActiveClassrooms: tariff.maxActiveClassrooms,
      maxStorageBytes: tariff.storageBytes,
    });
  };

  const applySubscription = (subscription: MonetizationSubscriptionMode) => {
    if (subscription === 'real' || subscription === 'never') {
      patchOverride({ subscription, endsAt: null, autoRenewal: false });
      return;
    }

    const days = subscription === 'ended' ? -7 : subscription === 'ending' ? 3 : 30;
    patchOverride({
      subscription,
      endsAt: monetizationEndsAt(days),
      autoRenewal: subscription === 'active',
    });
  };

  const openSubscription = (screen: 'pro' | 'checkout' | 'manage') => {
    const ui = useSubscriptionUiStore.getState();
    if (screen === 'pro') ui.openCompare(true);
    else if (screen === 'checkout') ui.openCheckout();
    else ui.openManage();
    ui.requestSettingsOpen();
  };

  const openPayment = (paymentPreview: MonetizationPaymentPreview) => {
    patchOverride({ paymentPreview });
    void navigate({
      to: '/settings/subscription/payment-result',
      search: { payment_id: 'devtools' },
    });
  };

  const openCancelRenewal = () => {
    patchOverride({
      subscription: 'active',
      autoRenewal: true,
      endsAt: override.endsAt ?? monetizationEndsAt(30),
      cancelDialogRequested: true,
    });
    openSubscription('manage');
  };

  return (
    <div className="pointer-events-none fixed right-3 bottom-20 z-50 flex flex-col items-end gap-2 max-[960px]:bottom-28">
      {open ? (
        <div className="bg-background-surface border-border-default pointer-events-auto flex max-h-[min(72vh,680px)] w-[340px] flex-col overflow-hidden rounded-2xl border shadow-lg">
          <div className="flex items-center justify-between gap-2 px-3 pt-3">
            <p className="text-text-primary text-sm font-semibold">{t('debug.title')}</p>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                testing
                  ? 'bg-status-warning-background text-status-warning-text'
                  : 'bg-background-subtle text-text-secondary',
              )}
            >
              {testing ? t('debug.testing') : t('debug.realData')}
            </span>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto px-3 py-3">
            <Section title={t('debug.presets')}>
              <div className="flex flex-wrap gap-1">
                <PresetButton
                  label={t('debug.presetNew')}
                  onClick={() =>
                    replaceOverride(
                      presetOverride({
                        plan: 'basic',
                        maxActiveClassrooms: basic.maxActiveClassrooms,
                        maxStorageBytes: basic.storageBytes,
                        activeClassrooms: 0,
                        storageUsedBytes: Math.round(basic.storageBytes * 0.05),
                        subscription: 'never',
                        autoRenewal: false,
                      }),
                    )
                  }
                />
                <PresetButton
                  label={t('debug.presetBasicActive')}
                  onClick={() =>
                    replaceOverride(
                      presetOverride({
                        plan: 'basic',
                        maxActiveClassrooms: basic.maxActiveClassrooms,
                        maxStorageBytes: basic.storageBytes,
                        activeClassrooms: Math.max(0, basic.maxActiveClassrooms - 1),
                        storageUsedBytes: Math.round(basic.storageBytes * 0.8),
                        subscription: 'never',
                      }),
                    )
                  }
                />
                <PresetButton
                  label={t('debug.presetBasicLimit')}
                  onClick={() =>
                    replaceOverride(
                      presetOverride({
                        plan: 'basic',
                        maxActiveClassrooms: basic.maxActiveClassrooms,
                        maxStorageBytes: basic.storageBytes,
                        activeClassrooms: basic.maxActiveClassrooms,
                        storageUsedBytes: basic.storageBytes,
                        subscription: 'never',
                      }),
                    )
                  }
                />
                <PresetButton
                  label={t('debug.presetPro')}
                  onClick={() =>
                    replaceOverride(
                      presetOverride({
                        plan: 'pro',
                        maxActiveClassrooms: pro.maxActiveClassrooms,
                        maxStorageBytes: pro.storageBytes,
                        activeClassrooms: Math.round(pro.maxActiveClassrooms * 0.2),
                        storageUsedBytes: Math.round(pro.storageBytes * 0.15),
                        subscription: 'active',
                        endsAt: monetizationEndsAt(30),
                        autoRenewal: true,
                      }),
                    )
                  }
                />
                <PresetButton
                  label={t('debug.presetProOff')}
                  onClick={() =>
                    replaceOverride(
                      presetOverride({
                        plan: 'pro',
                        maxActiveClassrooms: pro.maxActiveClassrooms,
                        maxStorageBytes: pro.storageBytes,
                        activeClassrooms: Math.round(pro.maxActiveClassrooms * 0.2),
                        storageUsedBytes: Math.round(pro.storageBytes * 0.15),
                        subscription: 'active',
                        endsAt: monetizationEndsAt(30),
                        autoRenewal: false,
                      }),
                    )
                  }
                />
                <PresetButton
                  label={t('debug.presetProEnding')}
                  onClick={() =>
                    replaceOverride(
                      presetOverride({
                        plan: 'pro',
                        maxActiveClassrooms: pro.maxActiveClassrooms,
                        maxStorageBytes: pro.storageBytes,
                        activeClassrooms: Math.round(pro.maxActiveClassrooms * 0.2),
                        storageUsedBytes: Math.round(pro.storageBytes * 0.15),
                        subscription: 'ending',
                        endsAt: monetizationEndsAt(3),
                        autoRenewal: false,
                      }),
                    )
                  }
                />
                <PresetButton
                  label={t('debug.presetEnded')}
                  onClick={() =>
                    replaceOverride(
                      presetOverride({
                        plan: 'basic',
                        maxActiveClassrooms: basic.maxActiveClassrooms,
                        maxStorageBytes: basic.storageBytes,
                        activeClassrooms: 1,
                        storageUsedBytes: Math.round(basic.storageBytes * 0.1),
                        subscription: 'ended',
                        endsAt: monetizationEndsAt(-10),
                        autoRenewal: false,
                      }),
                    )
                  }
                />
                <PresetButton
                  label={t('debug.presetDowngrade')}
                  onClick={() =>
                    replaceOverride(
                      presetOverride({
                        plan: 'basic',
                        maxActiveClassrooms: basic.maxActiveClassrooms,
                        maxStorageBytes: basic.storageBytes,
                        activeClassrooms: basic.maxActiveClassrooms + 3,
                        storageUsedBytes: Math.round(basic.storageBytes * 1.4),
                        subscription: 'ended',
                        endsAt: monetizationEndsAt(-10),
                        autoRenewal: false,
                      }),
                    )
                  }
                />
              </div>
            </Section>

            <Section title={t('debug.classrooms')}>
              <div className="flex flex-wrap gap-1">
                <PresetButton
                  label={t('debug.classroomLimitScenario')}
                  onClick={() => void applyClassrooms('limit')}
                />
                <PresetButton
                  label={t('debug.classroomUpgrade')}
                  onClick={() => void applyClassrooms('upgrade')}
                />
                <PresetButton
                  label={t('debug.classroomDowngrade')}
                  onClick={() => void applyClassrooms('downgrade')}
                />
              </div>
              {classroomPending ? (
                <p className="text-text-secondary text-[11px]">{t('debug.classroomLoading')}</p>
              ) : null}
              {classroomError ? (
                <p className="text-status-error-text text-[11px]">{t('debug.classroomError')}</p>
              ) : null}
              {catalogCounts ? (
                <p className="text-text-secondary text-[11px] leading-4">
                  {t('debug.classroomStatuses', catalogCounts)}
                </p>
              ) : null}
            </Section>

            <Section title={t('debug.plan')}>
              <Choices
                value={override.plan}
                options={[
                  ['real', t('debug.real')],
                  ['basic', t('debug.basic')],
                  ['pro', t('debug.proPlan')],
                ]}
                onChange={applyPlan}
              />
            </Section>

            <Section title={t('debug.limits')}>
              <Field label={t('debug.classroomLimit')}>
                <input
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={override.maxActiveClassrooms ?? ''}
                  placeholder={String(classroomLimit)}
                  onChange={(event) =>
                    patchOverride({ maxActiveClassrooms: readNumber(event.target.value) })
                  }
                />
              </Field>
              <Field label={t('debug.storageLimit')}>
                <input
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={
                    override.maxStorageBytes === null
                      ? ''
                      : bytesToMbInput(override.maxStorageBytes)
                  }
                  placeholder={String(bytesToMbInput(storageLimit))}
                  onChange={(event) =>
                    patchOverride({
                      maxStorageBytes: readMegabytes(event.target.value),
                    })
                  }
                />
              </Field>
            </Section>

            <Section title={t('debug.usage')}>
              <Field label={t('debug.classroomsUsed')}>
                <input
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={catalogCounts ? catalogCounts.active : (override.activeClassrooms ?? '')}
                  onChange={(event) => setActiveCount(readNumber(event.target.value))}
                />
                <Choices
                  value={catalogCounts ? catalogCounts.active : override.activeClassrooms}
                  options={[
                    [0, t('debug.usageZero')],
                    [Math.max(0, classroomLimit - 1), t('debug.usageAlmost')],
                    [classroomLimit, t('debug.usageFull')],
                    [classroomLimit + 1, t('debug.usageOver')],
                  ]}
                  onChange={setActiveCount}
                />
              </Field>
              <Field label={t('debug.storageUsed')}>
                <input
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={
                    override.storageUsedBytes === null
                      ? ''
                      : bytesToMbInput(override.storageUsedBytes)
                  }
                  onChange={(event) =>
                    patchOverride({ storageUsedBytes: readMegabytes(event.target.value) })
                  }
                />
                <Choices
                  value={override.storageUsedBytes}
                  options={[
                    [Math.round(storageLimit * 0.05), t('debug.usageEmpty')],
                    [Math.round(storageLimit * 0.5), t('debug.usageHalf')],
                    [Math.round(storageLimit * 0.9), t('debug.usageAlmost')],
                    [storageLimit, t('debug.usageFull')],
                    [Math.round(storageLimit * 1.2), t('debug.usageOver')],
                  ]}
                  onChange={(storageUsedBytes) => patchOverride({ storageUsedBytes })}
                />
              </Field>
            </Section>

            <Section title={t('debug.subscription')}>
              <Choices
                value={override.subscription}
                options={[
                  ['real', t('debug.subReal')],
                  ['never', t('debug.subNever')],
                  ['active', t('debug.subActive')],
                  ['ending', t('debug.subEnding')],
                  ['ended', t('debug.subEnded')],
                ]}
                onChange={applySubscription}
              />
              {override.subscription === 'active' ||
              override.subscription === 'ending' ||
              override.subscription === 'ended' ? (
                <>
                  <Field label={t('debug.endsAt')}>
                    <input
                      type="datetime-local"
                      className={fieldClass}
                      value={toLocalInput(override.endsAt)}
                      onChange={(event) =>
                        patchOverride({
                          endsAt: event.target.value
                            ? new Date(event.target.value).toISOString()
                            : null,
                        })
                      }
                    />
                  </Field>
                  <Field label={t('debug.autoRenew')}>
                    <Choices
                      value={override.autoRenewal}
                      options={[
                        [true, t('debug.on')],
                        [false, t('debug.off')],
                      ]}
                      onChange={(autoRenewal) => patchOverride({ autoRenewal })}
                    />
                  </Field>
                </>
              ) : null}
            </Section>

            <Section title={t('debug.openUi')}>
              <div className="flex flex-wrap gap-1">
                <PresetButton label={t('debug.openPro')} onClick={() => openSubscription('pro')} />
                <PresetButton
                  label={t('debug.openCheckout')}
                  onClick={() => openSubscription('checkout')}
                />
                <PresetButton
                  label={t('debug.openClassroom')}
                  onClick={requestClassroomLimitDialog}
                />
                <PresetButton label={t('debug.openStorage')} onClick={requestStorageLimitDialog} />
                <PresetButton label={t('debug.openImage')} onClick={requestImageUpgradeDialog} />
                <PresetButton
                  label={t('debug.openProFeature')}
                  onClick={() => requestProFeatureDialog()}
                />
                <PresetButton label={t('debug.openCancel')} onClick={openCancelRenewal} />
                <PresetButton
                  label={t('debug.openPayPending')}
                  onClick={() => openPayment('pending')}
                />
                <PresetButton
                  label={t('debug.openPaySuccess')}
                  onClick={() => openPayment('success')}
                />
                <PresetButton
                  label={t('debug.openPayCancelled')}
                  onClick={() => openPayment('cancelled')}
                />
                <PresetButton
                  label={t('debug.openPayError')}
                  onClick={() => openPayment('error')}
                />
              </div>
            </Section>

            <Section title={t('debug.other')}>
              <Field label={t('debug.boardLimit')}>
                <Choices
                  value={mock.boardAtLimit}
                  options={[
                    [false, t('debug.underLimit')],
                    [true, t('debug.atLimit')],
                  ]}
                  onChange={(boardAtLimit) => patchMock({ boardAtLimit })}
                />
              </Field>
              <Field label={t('debug.oversized')}>
                <Choices
                  value={mock.forceOversizedFile}
                  options={[
                    [false, t('debug.fileOk')],
                    [true, t('debug.fileOver')],
                  ]}
                  onChange={(forceOversizedFile) => patchMock({ forceOversizedFile })}
                />
              </Field>
            </Section>
          </div>
          <div className="border-border-default border-t p-3">
            <Button
              type="button"
              variant="ghost"
              size="s"
              className="text-text-danger h-8 w-full"
              onClick={resetOverride}
            >
              {t('debug.reset')}
            </Button>
          </div>
        </div>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        size="s"
        className={cn(
          'pointer-events-auto h-8 rounded-full px-3 text-xs',
          testing && 'border-status-warning-text',
        )}
        onClick={() => setOpen((value) => !value)}
      >
        {testing ? t('debug.testing') : t('debug.open')}
      </Button>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-text-secondary text-xs font-medium">{title}</span>
    {children}
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="flex flex-col gap-1">
    <span className="text-text-secondary text-[11px]">{label}</span>
    {children}
  </label>
);

const PresetButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    className="bg-background-subtle text-text-primary rounded-md px-2 py-1 text-xs"
    onClick={onClick}
  >
    {label}
  </button>
);

const Choices = <T extends string | number | boolean>({
  value,
  options,
  onChange,
}: {
  value: T | null;
  options: Array<[T, string]>;
  onChange: (value: T) => void;
}) => (
  <div className="flex flex-wrap gap-1">
    {options.map(([option, label]) => (
      <button
        key={`${label}-${String(option)}`}
        type="button"
        className={cn(
          'rounded-md px-2 py-1 text-xs',
          value === option
            ? 'bg-status-info-background text-text-link'
            : 'bg-background-subtle text-text-secondary',
        )}
        onClick={() => onChange(option)}
      >
        {label}
      </button>
    ))}
  </div>
);

const readNumber = (value: string): number | null => {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.round(parsed));
};

const readMegabytes = (value: string): number | null => {
  const megabytes = readNumber(value);
  return megabytes === null ? null : megabytes * MB;
};

const bytesToMbInput = (bytes: number): number => Math.max(0, Math.round(bytes / MB));

const toLocalInput = (iso: string | null): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
