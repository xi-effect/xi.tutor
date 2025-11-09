import { getCookies, getLocalStorageData, getSessionStorageData } from './technicalInfo/storage';
import { getBrowserInfo } from './technicalInfo/browser';
import { checkVideoSupport, checkAudioSupport } from './technicalInfo/media';
import { getPermissions } from './technicalInfo/permissions';
import { getGPUInfo } from './technicalInfo/gpu';
import { getIPAddresses, getNetworkInfo } from './technicalInfo/network';

export type ReportSection = {
  title?: string;
  data: Record<string, string | number | boolean | null | undefined>;
};

export const collectTechnicalInfo = async (): Promise<ReportSection[]> => {
  const sections: ReportSection[] = [];

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
    title: 'Техническая информация',
    data: {
      Домен: window.location.origin,
      Дата: now.toLocaleDateString('ru-RU'),
      Время: now.toLocaleTimeString('ru-RU'),
      'Часовой пояс': timezoneString,
      'IPv4-адрес': ipv4,
      'IPv6-адрес': ipv6,
      Браузер: `${browserName} ${browserVersion} (${browserEngine} ${browserEngineVersion})`,
      'Операционная система': osFamily,
    },
  });

  sections.push({
    title: 'Информация об экране',
    data: {
      'Разрешение экрана': `${screen.width}x${screen.height}`,
      'Глубина цвета': `${screen.colorDepth} бит`,
    },
  });

  const cookies = getCookies();
  if (Object.keys(cookies).length > 0) {
    sections.push({
      title: 'Cookie браузера',
      data: cookies,
    });
  } else {
    sections.push({
      title: 'Cookie браузера',
      data: { 'нет cookies': 'отсутствуют' },
    });
  }

  sections.push({
    title: 'Информация о браузере',
    data: browserInfo,
  });

  const permissions = await getPermissions();
  sections.push({
    title: 'Разрешения',
    data: permissions,
  });

  const videoSupport = checkVideoSupport();
  sections.push({
    title: 'Поддержка видео',
    data: videoSupport,
  });

  const audioSupport = checkAudioSupport();
  sections.push({
    title: 'Поддержка аудио',
    data: audioSupport,
  });

  const gpuInfo = getGPUInfo();
  if (Object.keys(gpuInfo).length > 0) {
    sections.push({
      data: gpuInfo,
    });
  }

  const localStorageData = getLocalStorageData();
  sections.push({
    title: 'localStorage',
    data:
      Object.keys(localStorageData).length > 0 ? localStorageData : { 'нет данных': 'отсутствуют' },
  });

  const sessionStorageData = getSessionStorageData();
  sections.push({
    title: 'sessionStorage',
    data:
      Object.keys(sessionStorageData).length > 0
        ? sessionStorageData
        : { 'нет данных': 'отсутствуют' },
  });

  const networkInfo = getNetworkInfo();
  sections.push({
    title: 'Дополнительная информация',
    data: networkInfo,
  });

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
