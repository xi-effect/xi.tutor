export const getGPUInfo = () => {
  const info: Record<string, string> = {};
  try {
    const canvas = document.createElement('canvas');
    // Поддержка различных префиксов для Safari и старых браузеров
    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl') ||
      canvas.getContext('webkit-3d') ||
      canvas.getContext('moz-webgl')) as WebGLRenderingContext | null;

    if (gl) {
      // Поддержка префиксов для Safari (WEBKIT) и Firefox (MOZ)
      const debugInfo =
        gl.getExtension('WEBGL_debug_renderer_info') ||
        gl.getExtension('WEBKIT_WEBGL_debug_renderer_info') ||
        gl.getExtension('MOZ_WEBGL_debug_renderer_info');

      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        info['GPU Vendor'] = String(vendor || 'не определен');
        info['GPU Renderer'] = String(renderer || 'не определен');
      } else {
        info['GPU Vendor'] = 'не определен';
        info['GPU Renderer'] = 'не определен';
      }
    } else {
      info['GPU Vendor'] = 'не определен';
      info['GPU Renderer'] = 'не определен';
    }
  } catch {
    info['GPU Vendor'] = 'не определен';
    info['GPU Renderer'] = 'не определен';
  }
  return info;
};
