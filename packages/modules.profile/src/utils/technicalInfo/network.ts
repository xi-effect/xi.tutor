export const getIPAddresses = async (): Promise<{ ipv4: string; ipv6: string }> => {
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
    const ipData = ipResponse ? await ipResponse.json().catch(() => null) : null;
    const ipv4 = ipData?.ip || 'не определен';

    const ipv6Response = await fetch('https://api64.ipify.org?format=json').catch(() => null);
    const ipv6Data = ipv6Response ? await ipv6Response.json().catch(() => null) : null;
    const ipv6 = ipv6Data?.ip && ipv6Data.ip !== ipv4 ? ipv6Data.ip : 'не определен';

    return { ipv4, ipv6 };
  } catch {
    return { ipv4: 'не определен', ipv6: 'не определен' };
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

  const networkInfo: Record<string, string> = {
    'Язык браузера': navigator.language,
    'Языки браузера': navigator.languages?.join(', ') || '',
    'Поддержка cookies': navigator.cookieEnabled ? 'да' : 'нет',
    'Онлайн статус': navigator.onLine ? 'да' : 'нет',
    'Количество ядер CPU': String(navigator.hardwareConcurrency || 'не определено'),
    'Память устройства': navigatorInfo.deviceMemory
      ? `${navigatorInfo.deviceMemory} GB`
      : 'не определено',
    'Максимальные точки касания': String(navigator.maxTouchPoints || 0),
  };

  const connection =
    navigatorInfo.connection || navigatorInfo.mozConnection || navigatorInfo.webkitConnection;

  if (connection) {
    networkInfo['Тип соединения'] = connection.effectiveType || 'не определен';
    networkInfo['Скорость загрузки'] = connection.downlink
      ? `${connection.downlink} Mbps`
      : 'не определена';
    networkInfo['RTT (latency)'] = connection.rtt ? `${connection.rtt} ms` : 'не определен';
    networkInfo['Режим экономии данных'] = connection.saveData ? 'включен' : 'выключен';
  } else {
    networkInfo['Тип соединения'] = 'не поддерживается';
    networkInfo['Скорость загрузки'] = 'не поддерживается';
    networkInfo['RTT (latency)'] = 'не поддерживается';
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
      if (bytes === undefined) return 'не определено';
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(2)} MB`;
    };

    memoryInfo['Лимит JS Heap'] = formatBytes(memory.jsHeapSizeLimit);
    memoryInfo['Общий размер JS Heap'] = formatBytes(memory.totalJSHeapSize);
    memoryInfo['Используемый JS Heap'] = formatBytes(memory.usedJSHeapSize);
  } else {
    memoryInfo['Информация о памяти'] = 'не поддерживается (только Chrome/Edge)';
  }

  return memoryInfo;
};
