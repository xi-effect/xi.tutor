export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const info: Record<string, string | boolean> = {};

  let browserName = 'Неизвестный';
  let browserVersion = 'Неизвестно';
  let browserBase = '';
  let browserBaseVersion = '';
  let browserEngine = '';
  let browserEngineVersion = '';

  if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browserName = 'Chrome';
    const match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/) || ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Неизвестно';
    browserBase = 'Chromium';
    browserBaseVersion = browserVersion;
    browserEngine = 'WebKit';
    const webkitMatch = ua.match(/AppleWebKit\/(\d+\.\d+)/);
    browserEngineVersion = webkitMatch ? webkitMatch[1] : 'Неизвестно';
  } else if (ua.includes('Firefox')) {
    browserName = 'Firefox';
    const match = ua.match(/Firefox\/(\d+\.\d+)/) || ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Неизвестно';
    browserBase = 'Firefox';
    browserBaseVersion = browserVersion;
    browserEngine = 'Gecko';
    const geckoMatch = ua.match(/rv:(\d+\.\d+)/);
    browserEngineVersion = geckoMatch ? geckoMatch[1] : 'Неизвестно';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    const match = ua.match(/Version\/(\d+\.\d+)/) || ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Неизвестно';
    browserBase = 'WebKit';
    browserBaseVersion = browserVersion;
    browserEngine = 'WebKit';
    const webkitMatch = ua.match(/AppleWebKit\/(\d+\.\d+)/);
    browserEngineVersion = webkitMatch ? webkitMatch[1] : 'Неизвестно';
  } else if (ua.includes('Edg')) {
    browserName = 'Edge';
    const match = ua.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/) || ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Неизвестно';
    browserBase = 'Chromium';
    browserBaseVersion = browserVersion;
    browserEngine = 'WebKit';
    const webkitMatch = ua.match(/AppleWebKit\/(\d+\.\d+)/);
    browserEngineVersion = webkitMatch ? webkitMatch[1] : 'Неизвестно';
  }

  info.BrowserBase = browserBase;
  info.BrowserBaseVersion = browserBaseVersion;
  info.BrowserEngine = browserEngine;
  info.BrowserEngineVersion = browserEngineVersion;
  info.BrowserName = browserName;
  info.BrowserVersion = browserVersion;

  info.CSPSupport = 'SecurityPolicyViolationEvent' in window ? 'true' : 'false';

  const getOSFamily = (): string => {
    const userAgentData = (navigator as Navigator & { userAgentData?: { platform: string } })
      .userAgentData;
    if (userAgentData?.platform) {
      const platform = userAgentData.platform.toLowerCase();
      if (platform.includes('win')) return 'Windows';
      if (platform.includes('mac')) return 'macOS';
      if (platform.includes('linux')) return 'Linux';
    }

    const uaLower = ua.toLowerCase();
    if (uaLower.includes('win')) return 'Windows';
    if (uaLower.includes('mac')) return 'macOS';
    if (uaLower.includes('linux') || uaLower.includes('x11')) return 'Linux';
    if (uaLower.includes('android')) return 'Android';
    if (uaLower.includes('iphone') || uaLower.includes('ipad')) return 'iOS';

    return 'Неизвестно';
  };
  info.OSFamily = getOSFamily();
  info.SVGSupport = 'SVGSVGElement' in window ? 'true' : 'false';
  info.SameSiteSupport = 'true';
  info.WebPSupport = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0 ? 'true' : 'false';
  })();
  info.isMobile = /Mobile|Android|iPhone|iPad/.test(ua) ? 'true' : 'false';
  info.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 ? 'true' : 'false';
  info.localStorageSupport =
    typeof Storage !== 'undefined' && 'localStorage' in window ? 'true' : 'false';
  info.x64 = ua.includes('x64') || ua.includes('Win64') ? 'true' : 'false';
  info.language = navigator.language;
  info.platform = navigator.platform;
  info.userAgent = navigator.userAgent;

  const getVendor = (): string => {
    const userAgentData = (navigator as Navigator & { userAgentData?: { brand: string } })
      .userAgentData;
    if (userAgentData?.brand) {
      return userAgentData.brand;
    }

    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Google Inc.';
    if (ua.includes('Firefox')) return 'Mozilla';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Apple Computer, Inc.';
    if (ua.includes('Edg')) return 'Microsoft Corporation';
    return 'Неизвестно';
  };
  info.vendor = getVendor();

  return info;
};
