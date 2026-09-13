import { BrowserWindow, WebContentsView, type Rectangle } from 'electron';
import { COMPACT_CONFERENCE, FLOATING_CONFERENCE } from '../../shared/constants';
import { EVENTS } from '../../shared/channels';
import type { ConferenceState, SlotBounds } from '../../shared/types';
import { getAppOrigin, getDevRendererUrl, getRemoteRendererUrl, isBundledWebMode } from '../config';
import { installNavigationGuard } from '../navigation';
import { createWebPreferences, showMainWindow } from '../windows/main-window';
import { createFloatingConferenceWindow } from '../windows/conference-window';

function clampSize(width: number, height: number): { width: number; height: number } {
  return {
    width: Math.max(FLOATING_CONFERENCE.minWidth, Math.round(width)),
    height: Math.max(FLOATING_CONFERENCE.minHeight, Math.round(height)),
  };
}

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
      floating: this.presentation === 'floating',
    };
  }

  isActive(): boolean {
    return Boolean(this.view);
  }

  isFloating(): boolean {
    return this.presentation === 'floating';
  }

  private broadcast(): void {
    const state = this.getState();
    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send(EVENTS.conferenceState, state);
      }
    }
    this.view?.webContents.send(EVENTS.conferenceState, state);
  }

  private conferenceUrl(classroomId: string): string {
    const path = `/desktop/conference/${encodeURIComponent(classroomId)}`;
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
    const bounds = this.slot ?? {
      x: Math.max(16, main.getContentSize()[0] - COMPACT_CONFERENCE.width - 16),
      y: Math.max(16, main.getContentSize()[1] - COMPACT_CONFERENCE.height - 16),
      width: COMPACT_CONFERENCE.width,
      height: COMPACT_CONFERENCE.height,
    };
    const next: Rectangle = {
      x: Math.round(bounds.x * zoom),
      y: Math.round(bounds.y * zoom),
      width: Math.max(1, Math.round(bounds.width * zoom)),
      height: Math.max(1, Math.round(bounds.height * zoom)),
    };
    view.setBounds(next);
    view.setVisible(next.width > 4 && next.height > 4);
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

  async enterFloatingMode(size?: {
    width: number;
    height: number;
  }): Promise<{ width: number; height: number }> {
    const view = this.ensureView();
    if (!this.classroomId) throw new Error('conference is not active');

    this.detach();
    if (!this.floating || this.floating.isDestroyed()) {
      this.floating = createFloatingConferenceWindow();
      this.floating.setBackgroundColor('#111318');
      this.floating.on('resize', () => {
        if (!this.floating || this.floating.isDestroyed() || !this.view) return;
        const [width, height] = this.floating.getContentSize();
        this.view.setBounds({ x: 0, y: 0, width, height });
      });
      this.floating.on('closed', () => {
        this.floating = null;
        if (this.view && this.presentation === 'floating') {
          this.attachToMain();
          this.broadcast();
          this.emitPipRestored();
        }
      });
    }

    const next = clampSize(
      size?.width ?? FLOATING_CONFERENCE.width,
      size?.height ?? FLOATING_CONFERENCE.height,
    );
    this.floating.setSize(next.width, next.height);
    this.floating.contentView.addChildView(view);
    view.setBounds({ x: 0, y: 0, width: next.width, height: next.height });
    view.setVisible(true);
    this.presentation = 'floating';
    this.floating.show();
    this.floating.focus();
    this.broadcast();
    return next;
  }

  async exitFloatingMode(): Promise<void> {
    if (!this.view) return;
    this.attachToMain();
    this.broadcast();
    this.emitPipRestored();
  }

  async resizeFloating(size: {
    width: number;
    height: number;
  }): Promise<{ width: number; height: number }> {
    if (!this.floating || this.floating.isDestroyed() || this.presentation !== 'floating') {
      return size;
    }
    const next = clampSize(size.width, size.height);
    this.floating.setSize(next.width, next.height);
    this.view?.setBounds({ x: 0, y: 0, width: next.width, height: next.height });
    return next;
  }

  async leave(): Promise<void> {
    await this.destroy();
    this.broadcast();
  }

  private emitPipRestored(): void {
    const main = this.getMainWindow();
    main?.webContents.send(EVENTS.callPipRestored);
    this.view?.webContents.send(EVENTS.callPipRestored);
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
