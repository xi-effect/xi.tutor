/* eslint-disable @typescript-eslint/no-explicit-any */
export const isMac = (() => {
  if ('userAgentData' in navigator) {
    const uaData = (navigator as any).userAgentData;
    if (uaData && typeof uaData.platform === 'string') {
      return uaData.platform === 'macOS';
    }
  }
  return /Mac/i.test(navigator.userAgent);
})();
