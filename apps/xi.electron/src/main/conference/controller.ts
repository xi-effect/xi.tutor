import { BrowserWindow, WebContentsView, type Rectangle } from 'electron';
import { FLOATING_CONFERENCE } from '../../shared/constants';
import { EVENTS } from '../../shared/channels';
import type { ConferenceState, SlotBounds } from '../../shared/types';
import { getAppOrigin, getDevRendererUrl, getRemoteRendererUrl, isBundledWebMode } from '../config';
import { installNavigationGuard } from '../navigation';
import { sendToRenderer } from '../send';
import { createWebPreferences, showMainWindow } from '../windows/main-window';
export class ConferenceController {
  private view: WebContentsView | null = null;
  private floating: BrowserWindow | null = null;
  private classroomId: string | null = null;
  private slot: SlotBounds | null = null;
  private presentation: ConferenceState['presentation'] = 'hidden';

  constructor(private readonly getMainWindow: () => BrowserWindow | null) {}

  getState(): ConferenceState {
    return {
      active: Boolean(this.view),
      classroomId: this.classroomId,
      presentation: this.presentation,
      floating: false,
    };
  }

  isActive(): boolean {
    return Boolean(this.view);
  }

  isFloating(): boolean {
    return false;
  }

  private broadcast(): void {
    const state = this.getState();
    for (const window of BrowserWindow.getAllWindows()) {
      sendToRenderer(window.webContents, EVENTS.conferenceState, state);
    }
    sendToRenderer(this.view?.webContents, EVENTS.conferenceState, state);
  }

  private conferenceUrl(classroomId: string): string {
    const path = `/desktop/conference/${encodeURIComponent(classroomId)}?sovlium_surface=conference`;
    const remote = getRemoteRendererUrl();
    if (remote) return `${remote}${path}`;
    if (isBundledWebMode()) return `${getAppOrigin()}${path}`;
    return `${getDevRendererUrl()}${path}`;
  }

  private ensureView(): WebContentsView {
    if (this.view) return this.view;
    const view = new WebContentsView({
      webPreferences: createWebPreferences('conference'),
    });
    installNavigationGuard(view.webContents);
    this.view = view;
    return view;
  }

  private detach(): void {
    const view = this.view;
    if (!view) return;
    const main = this.getMainWindow();
    if (main && !main.isDestroyed()) {
      try {
        main.contentView.removeChildView(view);
      } catch {
        // already detached
      }
    }
    if (this.floating && !this.floating.isDestroyed()) {
      try {
        this.floating.contentView.removeChildView(view);
      } catch {
        // already detached
      }
    }
  }

  private applySlotBounds(): void {
    const main = this.getMainWindow();
    const view = this.view;
    if (!main || main.isDestroyed() || !view || this.presentation !== 'inline') return;
    const zoom = main.webContents.zoomFactor || 1;
    if (!this.slot || this.slot.width < 8 || this.slot.height < 8) {
      view.setVisible(false);
      return;
    }
    const next: Rectangle = {
      x: Math.round(this.slot.x * zoom),
      y: Math.round(this.slot.y * zoom),
      width: Math.max(1, Math.round(this.slot.width * zoom)),
      height: Math.max(1, Math.round(this.slot.height * zoom)),
    };
    view.setBounds(next);
    view.setVisible(true);
  }

  async start(classroomId: string): Promise<ConferenceState> {
    const id = classroomId.trim();
    if (!id) throw new Error('classroomId is required');

    const main = this.getMainWindow();
    if (!main || main.isDestroyed()) throw new Error('main window is missing');

    if (this.classroomId === id && this.view) {
      if (this.presentation === 'hidden') {
        this.attachToMain();
      }
      this.broadcast();
      return this.getState();
    }

    await this.destroy();
    this.classroomId = id;
    const view = this.ensureView();
    await view.webContents.loadURL(this.conferenceUrl(id));
    this.attachToMain();
    this.broadcast();
    return this.getState();
  }

  private attachToMain(): void {
    const main = this.getMainWindow();
    const view = this.view;
    if (!main || main.isDestroyed() || !view) return;
    this.detach();
    if (this.floating && !this.floating.isDestroyed()) {
      this.floating.hide();
    }
    main.contentView.addChildView(view);
    this.presentation = 'inline';
    this.applySlotBounds();
    showMainWindow(main);
  }

  setSlotBounds(bounds: SlotBounds | null): void {
    this.slot = bounds;
    this.applySlotBounds();
  }

  /** The call overlay is a renderer `window.open` popup (see call-pip.ts); main windows never shrink. */
  async enterFloatingMode(size?: {
    width: number;
    height: number;
  }): Promise<{ width: number; height: number }> {
    return {
      width: size?.width ?? FLOATING_CONFERENCE.width,
      height: size?.height ?? FLOATING_CONFERENCE.height,
    };
  }

  async exitFloatingMode(): Promise<void> {
    if (!this.view) return;
    this.attachToMain();
    this.broadcast();
  }

  async resizeFloating(size: {
    width: number;
    height: number;
  }): Promise<{ width: number; height: number }> {
    return size;
  }

  async leave(): Promise<void> {
    await this.destroy();
    this.broadcast();
  }

  async destroy(): Promise<void> {
    this.detach();
    if (this.view) {
      this.view.webContents.close();
      this.view = null;
    }
    if (this.floating && !this.floating.isDestroyed()) {
      this.floating.removeAllListeners('closed');
      this.floating.close();
    }
    this.floating = null;
    this.classroomId = null;
    this.slot = null;
    this.presentation = 'hidden';
  }

  handleMainResize(): void {
    this.applySlotBounds();
  }
}
