// Native Document PiP stub for WKWebView / WebView2.
// Runs as an init script so CompactView sees `documentPictureInPicture` before React.
// Desktop only — iOS/Android have no always-on-top mini window.
(function () {
  var os = window.__SOVLIUM_NATIVE_OS__;
  if (os === 'ios' || os === 'android') return;
  if (window.__sovliumNativePipShim) return;
  window.__sovliumNativePipShim = true;

  var HOST_ID = 'sovlium-native-call-pip';
  var STYLE_ID = 'sovlium-native-call-pip-style';
  var active = null;
  var leaving = false;

  // CompactView's `openPiP` swallows every rejection, so a broken bridge looks
  // exactly like "the button does nothing". Log loudly before we reject.
  function fail(reason) {
    var message = '[sovlium] call PiP unavailable: ' + reason;
    try {
      console.error(message);
    } catch (_) {}
    return new Error(message);
  }

  function invoke(cmd, args) {
    var internals = window.__TAURI_INTERNALS__;
    if (!internals || typeof internals.invoke !== 'function') {
      return Promise.reject(
        fail('__TAURI_INTERNALS__ missing (page is not IPC-enabled for this origin)'),
      );
    }
    return internals.invoke(cmd, args || {}).catch(function (err) {
      throw fail(cmd + ' -> ' + (err && err.message ? err.message : String(err)));
    });
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      'html[data-native-call-pip] #root{overflow:hidden}' +
      // Let the rounded corners of the host show the desktop, not the app page.
      'html[data-native-call-pip],html[data-native-call-pip] body{background:transparent!important}' +
      '#' + HOST_ID + '{position:fixed;inset:0;z-index:2147483646;display:flex;flex-direction:column;' +
      'background:var(--color-background-page,var(--xi-gray-0,#111318));color:inherit;overflow:hidden;border-radius:12px}' +
      // The strip must stay hit-testable: `data-tauri-drag-region` is driven by
      // mousedown, which never fires on a `pointer-events:none` element.
      '#' + HOST_ID + ' .sovlium-native-call-pip__chrome{position:absolute;top:0;left:0;right:0;height:28px;z-index:2;' +
      'display:flex;align-items:center;justify-content:flex-end;padding:0 6px;pointer-events:auto;cursor:grab;' +
      'background:linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,0))}' +
      '#' + HOST_ID + ' .sovlium-native-call-pip__chrome:active{cursor:grabbing}' +
      '#' + HOST_ID + ' .sovlium-native-call-pip__chrome button{pointer-events:auto;appearance:none;border:0;border-radius:8px;' +
      'width:22px;height:22px;font-size:13px;line-height:1;cursor:pointer;background:rgba(0,0,0,.45);color:#fff}' +
      '#' + HOST_ID + ' .sovlium-native-call-pip__body{flex:1;min-height:0;height:100%}';
    document.head.appendChild(style);
  }

  function mountHost() {
    ensureStyles();
    var existing = document.getElementById(HOST_ID);
    if (existing) existing.remove();

    var host = document.createElement('div');
    host.id = HOST_ID;

    var chrome = document.createElement('div');
    chrome.className = 'sovlium-native-call-pip__chrome';
    chrome.setAttribute('data-tauri-drag-region', '');

    var restore = document.createElement('button');
    restore.type = 'button';
    restore.title = 'Вернуть в приложение';
    restore.setAttribute('aria-label', 'Вернуть в приложение');
    restore.textContent = '↗';
    chrome.appendChild(restore);

    var body = document.createElement('div');
    body.className = 'sovlium-native-call-pip__body';

    host.appendChild(chrome);
    host.appendChild(body);
    document.body.appendChild(host);
    document.documentElement.setAttribute('data-native-call-pip', 'true');
    return { body: body, restore: restore };
  }

  function teardown(leaveNative) {
    if (leaving) return Promise.resolve();
    leaving = true;
    document.documentElement.removeAttribute('data-native-call-pip');
    var host = document.getElementById(HOST_ID);
    if (host) host.remove();
    active = null;
    var done = leaveNative
      ? invoke('call_pip_leave').catch(function () {})
      : Promise.resolve();
    return done.finally(function () {
      leaving = false;
    });
  }

  function createFake(body, size, onClose) {
    var width = size.width;
    var height = size.height;
    var closed = false;
    var resizeListeners = [];
    var pagehideListeners = [];

    var fake = {
      __sovliumNativePip: true,
      document: {
        documentElement: body,
        body: body,
        head: document.createElement('head'),
        styleSheets: document.styleSheets,
        fonts: document.fonts,
        createElement: document.createElement.bind(document),
      },
      get innerWidth() {
        return width;
      },
      get innerHeight() {
        return height;
      },
      resizeTo: function (nextWidth, nextHeight) {
        width = Math.round(nextWidth || width);
        height = Math.round(nextHeight || height);
        invoke('call_pip_resize', { width: width, height: height }).then(function (applied) {
          width = applied.width;
          height = applied.height;
          var event = new Event('resize');
          resizeListeners.forEach(function (fn) {
            fn(event);
          });
        });
      },
      addEventListener: function (type, listener) {
        if (type === 'resize') resizeListeners.push(listener);
        if (type === 'pagehide') pagehideListeners.push(listener);
      },
      removeEventListener: function (type, listener) {
        if (type === 'resize') {
          resizeListeners = resizeListeners.filter(function (fn) {
            return fn !== listener;
          });
        }
        if (type === 'pagehide') {
          pagehideListeners = pagehideListeners.filter(function (fn) {
            return fn !== listener;
          });
        }
      },
      close: function () {
        if (closed) return;
        closed = true;
        pagehideListeners.forEach(function (fn) {
          fn(new Event('pagehide'));
        });
        onClose();
      },
    };
    return fake;
  }

  var api = {
    get window() {
      return active;
    },
    requestWindow: function (options) {
      if (active) return Promise.resolve(active);
      var requested = {
        width: Math.round((options && options.width) || 380),
        height: Math.round((options && options.height) || 300),
      };
      return invoke('call_pip_enter', requested).then(function (applied) {
        var mounted = mountHost();
        var fake = createFake(mounted.body, applied, function () {
          teardown(true);
        });
        mounted.restore.addEventListener('click', function () {
          fake.close();
        });
        active = fake;
        return fake;
      });
    },
  };

  try {
    Object.defineProperty(window, 'documentPictureInPicture', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: api,
    });
  } catch (_) {
    window.documentPictureInPicture = api;
  }

  document.addEventListener(
    'visibilitychange',
    function (event) {
      if (!active) return;
      event.stopImmediatePropagation();
    },
    true,
  );
})();
