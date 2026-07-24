import { tProfile } from '../tProfile';

export const getIPAddresses = async (): Promise<{ ipv4: string; ipv6: string }> => {
  const undefinedValue = tProfile('report.values.undefined');
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
    const ipData = ipResponse ? await ipResponse.json().catch(() => null) : null;
    const ipv4 = ipData?.ip || undefinedValue;

    const ipv6Response = await fetch('https://api64.ipify.org?format=json').catch(() => null);
    const ipv6Data = ipv6Response ? await ipv6Response.json().catch(() => null) : null;
    const ipv6 = ipv6Data?.ip && ipv6Data.ip !== ipv4 ? ipv6Data.ip : undefinedValue;

    return { ipv4, ipv6 };
  } catch {
    return { ipv4: undefinedValue, ipv6: undefinedValue };
  }
};

export const getNetworkInfo = (): Record<string, string> => {
  type NetworkInformation = {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };

  const navigatorInfo = navigator as Navigator & {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
    deviceMemory?: number;
  };

  const yes = tProfile('report.values.yes');
  const no = tProfile('report.values.no');
  const undefinedValue = tProfile('report.values.undefined');
  const undefinedFem = tProfile('report.values.undefinedFem');
  const undefinedNeut = tProfile('report.values.undefinedNeut');
  const unsupported = tProfile('report.values.unsupported');

  const networkInfo: Record<string, string> = {
    [tProfile('report.labels.browserLanguage')]: navigator.language,
    [tProfile('report.labels.browserLanguages')]: navigator.languages?.join(', ') || '',
    [tProfile('report.labels.cookiesSupport')]: navigator.cookieEnabled ? yes : no,
    [tProfile('report.labels.onlineStatus')]: navigator.onLine ? yes : no,
    [tProfile('report.labels.cpuCores')]: String(navigator.hardwareConcurrency || undefinedNeut),
    [tProfile('report.labels.deviceMemory')]: navigatorInfo.deviceMemory
      ? `${navigatorInfo.deviceMemory} GB`
      : undefinedNeut,
    [tProfile('report.labels.maxTouchPoints')]: String(navigator.maxTouchPoints || 0),
  };

  const connection =
    navigatorInfo.connection || navigatorInfo.mozConnection || navigatorInfo.webkitConnection;

  if (connection) {
    networkInfo[tProfile('report.labels.connectionType')] =
      connection.effectiveType || undefinedValue;
    networkInfo[tProfile('report.labels.downloadSpeed')] = connection.downlink
      ? `${connection.downlink} Mbps`
      : undefinedFem;
    networkInfo[tProfile('report.labels.rtt')] = connection.rtt
      ? `${connection.rtt} ms`
      : undefinedValue;
    networkInfo[tProfile('report.labels.dataSaver')] = connection.saveData
      ? tProfile('report.values.enabled')
      : tProfile('report.values.disabled');
  } else {
    networkInfo[tProfile('report.labels.connectionType')] = unsupported;
    networkInfo[tProfile('report.labels.downloadSpeed')] = unsupported;
    networkInfo[tProfile('report.labels.rtt')] = unsupported;
  }

  return networkInfo;
};

export const getPerformanceMemory = (): Record<string, string> => {
  const memoryInfo: Record<string, string> = {};

  const performanceInfo = performance as Performance & {
    memory?: {
      jsHeapSizeLimit?: number;
      totalJSHeapSize?: number;
      usedJSHeapSize?: number;
    };
  };

  const { memory } = performanceInfo;

  if (memory) {
    const formatBytes = (bytes?: number): string => {
      if (bytes === undefined) return tProfile('report.values.undefinedNeut');
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(2)} MB`;
    };

    memoryInfo[tProfile('report.labels.jsHeapLimit')] = formatBytes(memory.jsHeapSizeLimit);
    memoryInfo[tProfile('report.labels.jsHeapTotal')] = formatBytes(memory.totalJSHeapSize);
    memoryInfo[tProfile('report.labels.jsHeapUsed')] = formatBytes(memory.usedJSHeapSize);
  } else {
    memoryInfo[tProfile('report.labels.memoryInfo')] = tProfile(
      'report.values.unsupportedChromeOnly',
    );
  }

  return memoryInfo;
};
