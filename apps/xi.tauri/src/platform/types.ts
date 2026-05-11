export type PlatformKind = 'desktop' | 'mobile' | 'web';

export interface PlatformCapabilities {
  /** Whether the in-app updater is available on this platform. False on mobile
   *  (App Store / Play Store mandate store updates) and on web. */
  updater: boolean;
  /** Whether OS-level notifications can be requested from the runtime. */
  notifications: boolean;
  /** Whether deep-link handling is wired in. */
  deepLinks: boolean;
  /** Whether the user can drag the window chrome (desktop only). */
  windowChrome: boolean;
}

export interface PlatformModule {
  readonly kind: PlatformKind;
  readonly capabilities: PlatformCapabilities;
  /** One-shot initialisation. Must be idempotent. */
  init(): Promise<void>;
}
