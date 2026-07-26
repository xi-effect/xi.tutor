import { getDateLocale } from 'common.ui';
import { getCookies, getLocalStorageData, getSessionStorageData } from './technicalInfo/storage';
import { getBrowserInfo } from './technicalInfo/browser';
import { checkVideoSupport, checkAudioSupport, checkWebRTCSupport } from './technicalInfo/media';
import { getPermissions } from './technicalInfo/permissions';
import { getGPUInfo } from './technicalInfo/gpu';
import { getIPAddresses, getNetworkInfo, getPerformanceMemory } from './technicalInfo/network';
import {
  collectScreenShareDiagnostics,
  type ScreenShareDiagnostics,
  type ScreenShareDiagnosticsParams,
} from './technicalInfo/screenShareDiagnostics';
import { tProfile } from './tProfile';

export type ReportSection = {
  title?: string;
  data: Record<string, string | number | boolean | null | undefined>;
};

export type CollectTechnicalInfoOptions = {
  app?: ScreenShareDiagnosticsParams['app'];
};

function diagnosticsToSections(d: ScreenShareDiagnostics): ReportSection[] {
  const sections: ReportSection[] = [];

  // Только то, чего нет в остальных секциях: PWA, iframe, iPad-под-Mac, Service Worker, причины Screen Share
  sections.push({
    title: tProfile('report.sections.pwa'),
    data: {
      displayMode: d.displayMode,
      isStandalone: d.isStandalone,
      isStandaloneIOSLegacy: d.isStandaloneIOSLegacy,
      hasOpener: d.hasOpener,
      isInIframe: d.isInIframe,
      isTopLevel: d.isTopLevel,
      looksLikeIPad: d.looksLikeIPad,
    },
  });

  sections.push({
    title: tProfile('report.sections.serviceWorker'),
    data: {
      hasServiceWorker: d.hasServiceWorker,
      hasSWController: d.hasSWController,
    },
  });

  const avail = d.screenShareAvailability;
  sections.push({
    title: tProfile('report.sections.screenShareUnavailable'),
    data: {
      canAttempt: avail.canAttempt,
      reasons: avail.reasons.join(', ') || '—',
    },
  });

  if (d.app) {
    const appData: ReportSection['data'] = {};
    if (d.app.buildId != null) appData.buildId = d.app.buildId;
    if (d.app.version != null) appData.version = d.app.version;
    if (d.app.gitSha != null) appData.gitSha = d.app.gitSha;
    if (Object.keys(appData).length > 0) {
      sections.push({ title: tProfile('report.sections.app'), data: appData });
    }
  }

  return sections;
}

export const collectTechnicalInfo = async (
  options?: CollectTechnicalInfoOptions,
): Promise<ReportSection[]> => {
  const sections: ReportSection[] = [];
  const dateLocale = getDateLocale();

  const now = new Date();
  const timezoneOffset = -now.getTimezoneOffset();
  const timezoneSign = timezoneOffset >= 0 ? '+' : '-';
  const timezoneHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const timezoneMinutes = Math.abs(timezoneOffset) % 60;
  const timezoneString = `UTC ${timezoneSign}${String(timezoneHours).padStart(2, '0')}:${String(timezoneMinutes).padStart(2, '0')}`;

  const browserInfo = getBrowserInfo();
  const osFamily = browserInfo.OSFamily;
  const browserName = browserInfo.BrowserName;
  const browserVersion = browserInfo.BrowserVersion;
  const browserEngine = browserInfo.BrowserEngine;
  const browserEngineVersion = browserInfo.BrowserEngineVersion;

  const { ipv4, ipv6 } = await getIPAddresses();

  sections.push({
    title: tProfile('report.sections.main'),
    data: {
      [tProfile('report.labels.domain')]: window.location.origin,
      href: window.location.href,
      secure: window.isSecureContext,
      [tProfile('report.labels.date')]: now.toLocaleDateString(dateLocale),
      [tProfile('report.labels.time')]: now.toLocaleTimeString(dateLocale),
      [tProfile('report.labels.timezone')]: timezoneString,
      [tProfile('report.labels.ipv4')]: ipv4,
      [tProfile('report.labels.ipv6')]: ipv6,
      [tProfile('report.labels.browser')]:
        `${browserName} ${browserVersion} (${browserEngine} ${browserEngineVersion})`,
      [tProfile('report.labels.os')]: osFamily,
    },
  });

  sections.push({
    title: tProfile('report.sections.screen'),
    data: {
      [tProfile('report.labels.screenResolution')]: `${screen.width}x${screen.height}`,
      [tProfile('report.labels.colorDepth')]: tProfile('report.labels.colorDepthValue', {
        depth: screen.colorDepth,
      }),
    },
  });

  const cookies = getCookies();
  if (Object.keys(cookies).length > 0) {
    sections.push({
      title: tProfile('report.sections.cookies'),
      data: cookies,
    });
  } else {
    sections.push({
      title: tProfile('report.sections.cookies'),
      data: { [tProfile('report.labels.noCookies')]: tProfile('report.labels.absent') },
    });
  }

  sections.push({
    title: tProfile('report.sections.browser'),
    data: browserInfo,
  });

  const permissions = await getPermissions();
  sections.push({
    title: tProfile('report.sections.permissions'),
    data: permissions,
  });

  const videoSupport = checkVideoSupport();
  sections.push({
    title: tProfile('report.sections.video'),
    data: videoSupport,
  });

  const audioSupport = checkAudioSupport();
  sections.push({
    title: tProfile('report.sections.audio'),
    data: audioSupport,
  });

  const webrtcSupport = checkWebRTCSupport();
  sections.push({
    title: tProfile('report.sections.webrtc'),
    data: webrtcSupport,
  });

  const gpuInfo = getGPUInfo();
  if (Object.keys(gpuInfo).length > 0) {
    sections.push({
      data: gpuInfo,
    });
  }

  const localStorageData = getLocalStorageData();
  sections.push({
    title: tProfile('report.sections.localStorage'),
    data:
      Object.keys(localStorageData).length > 0
        ? localStorageData
        : { [tProfile('report.labels.noData')]: tProfile('report.labels.absent') },
  });

  const sessionStorageData = getSessionStorageData();
  sections.push({
    title: tProfile('report.sections.sessionStorage'),
    data:
      Object.keys(sessionStorageData).length > 0
        ? sessionStorageData
        : { [tProfile('report.labels.noData')]: tProfile('report.labels.absent') },
  });

  const networkInfo = getNetworkInfo();
  sections.push({
    title: tProfile('report.sections.additional'),
    data: networkInfo,
  });

  const performanceMemory = getPerformanceMemory();
  if (Object.keys(performanceMemory).length > 0) {
    sections.push({
      title: tProfile('report.sections.memory'),
      data: performanceMemory,
    });
  }

  const screenShareDiagnostics = await collectScreenShareDiagnostics({ app: options?.app });
  sections.push(...diagnosticsToSections(screenShareDiagnostics));

  return sections;
};

export const formatReport = (sections: ReportSection[]): string => {
  return sections
    .map(({ title, data }) => {
      const titleLine = title ? `${title}\n` : '';
      const dataLines = Object.entries(data)
        .map(([key, value]) => `${key}:${value}`)
        .join('\n');
      return `${titleLine}${dataLines}`;
    })
    .join('\n\n')
    .trim();
};
