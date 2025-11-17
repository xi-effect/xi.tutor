export const checkVideoSupport = () => {
  const video = document.createElement('video');
  const support: Record<string, string> = {};

  support.HTMLVideoElement = typeof video.canPlayType === 'function' ? 'да' : 'нет';

  const formats: Record<string, string[]> = {
    MP4: ['video/mp4; codecs="avc1.42E01E"', 'video/mp4'],
    WebM: ['video/webm; codecs="vp8, vorbis"', 'video/webm'],
    HLS: ['application/vnd.apple.mpegurl', 'application/x-mpegURL'],
    MPD: ['application/dash+xml'],
    H264: ['video/mp4; codecs="avc1.42E01E"'],
    H265: ['video/mp4; codecs="hev1.1.6.L93.B0"'],
    'WebM with VP9': ['video/webm; codecs="vp9"'],
  };

  Object.entries(formats).forEach(([name, types]) => {
    const canPlay = types.some((type) => video.canPlayType(type));
    support[name] = canPlay ? 'да' : 'нет';
  });

  // Проверка MSE с поддержкой префиксов для Safari
  const hasMediaSource =
    'MediaSource' in window ||
    'WebKitMediaSource' in window ||
    typeof (window as Record<string, unknown>).MediaSource !== 'undefined';
  support.MSE = hasMediaSource ? 'да' : 'нет';

  const hasSourceBuffer =
    'SourceBuffer' in window ||
    typeof (window as Record<string, unknown>).SourceBuffer !== 'undefined';
  support.SourceBuffer = hasSourceBuffer ? 'да' : 'нет';

  // Проверка EME с поддержкой префиксов для Safari и Firefox
  const hasMediaKeys =
    'MediaKeys' in window ||
    'webkitMediaKeys' in window ||
    'mozMediaKeys' in window ||
    typeof (window as Record<string, unknown>).MediaKeys !== 'undefined';
  support.EME = hasMediaKeys ? 'да' : 'нет';
  if (support.EME === 'да') {
    try {
      const hasEME = navigator.requestMediaKeySystemAccess !== undefined;
      if (hasEME) {
        const keySystems = ['com.widevine.alpha', 'com.microsoft.playready', 'org.w3.clearkey'];
        support.EMESystems = keySystems.join(', ');
      } else {
        support.EMESystems = 'нет';
      }
    } catch {
      support.EMESystems = 'не определен';
    }
  } else {
    support.EMESystems = 'не определен';
  }

  return support;
};

export const checkAudioSupport = () => {
  const audio = document.createElement('audio');
  const support: Record<string, string> = {};

  const formats: Record<string, string[]> = {
    AAC: ['audio/mp4; codecs="mp4a.40.2"', 'audio/aac'],
    'EC-3': ['audio/mp4; codecs="ec-3"'],
    OPUS: ['audio/ogg; codecs="opus"', 'audio/webm; codecs="opus"'],
    FLAC: ['audio/flac', 'audio/x-flac'],
    ALAC: ['audio/mp4; codecs="alac"'],
  };

  Object.entries(formats).forEach(([name, types]) => {
    const canPlay = types.some((type) => audio.canPlayType(type));
    support[name] = canPlay ? 'да' : 'нет';
  });

  return support;
};

export const checkWebRTCSupport = (): Record<string, string> => {
  const support: Record<string, string> = {};

  const hasRTCPeerConnection =
    'RTCPeerConnection' in window ||
    'webkitRTCPeerConnection' in window ||
    'mozRTCPeerConnection' in window ||
    typeof (window as Record<string, unknown>).RTCPeerConnection !== 'undefined';

  support['WebRTC API support'] = hasRTCPeerConnection ? 'да' : 'нет';

  const hasGetDisplayMedia =
    navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function';

  support['getDisplayMedia support'] = hasGetDisplayMedia ? 'да' : 'нет';

  return support;
};
