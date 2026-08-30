#import <AVFoundation/AVFoundation.h>
#import <Foundation/Foundation.h>
#if TARGET_OS_OSX
#import <CoreGraphics/CoreGraphics.h>
#endif

enum {
  SOVLIUM_MEDIA_CAMERA = 0,
  SOVLIUM_MEDIA_MICROPHONE = 1
};

enum {
  SOVLIUM_PERM_GRANTED = 0,
  SOVLIUM_PERM_DENIED = 1,
  SOVLIUM_PERM_PROMPT = 2,
  SOVLIUM_PERM_UNSUPPORTED = 3
};

static AVMediaType sovlium_media_type(int kind) {
  return kind == SOVLIUM_MEDIA_CAMERA ? AVMediaTypeVideo : AVMediaTypeAudio;
}

static int sovlium_map_av_status(AVAuthorizationStatus status) {
  switch (status) {
    case AVAuthorizationStatusAuthorized:
      return SOVLIUM_PERM_GRANTED;
    case AVAuthorizationStatusDenied:
    case AVAuthorizationStatusRestricted:
      return SOVLIUM_PERM_DENIED;
    case AVAuthorizationStatusNotDetermined:
    default:
      return SOVLIUM_PERM_PROMPT;
  }
}

int sovlium_media_permission_status(int kind) {
  AVAuthorizationStatus status =
      [AVCaptureDevice authorizationStatusForMediaType:sovlium_media_type(kind)];
  return sovlium_map_av_status(status);
}

int sovlium_media_permission_request(int kind) {
  int current = sovlium_media_permission_status(kind);
  if (current != SOVLIUM_PERM_PROMPT) {
    return current;
  }

  dispatch_semaphore_t sema = dispatch_semaphore_create(0);
  __block int result = SOVLIUM_PERM_DENIED;
  [AVCaptureDevice requestAccessForMediaType:sovlium_media_type(kind)
                           completionHandler:^(BOOL granted) {
                             result = granted ? SOVLIUM_PERM_GRANTED : SOVLIUM_PERM_DENIED;
                             dispatch_semaphore_signal(sema);
                           }];
  dispatch_semaphore_wait(sema, DISPATCH_TIME_FOREVER);
  return result;
}

int sovlium_screen_permission_status(void) {
#if TARGET_OS_OSX
  return CGPreflightScreenCaptureAccess() ? SOVLIUM_PERM_GRANTED : SOVLIUM_PERM_PROMPT;
#else
  return SOVLIUM_PERM_UNSUPPORTED;
#endif
}

int sovlium_screen_permission_request(void) {
#if TARGET_OS_OSX
  __block BOOL granted = NO;
  if ([NSThread isMainThread]) {
    granted = CGRequestScreenCaptureAccess();
  } else {
    dispatch_sync(dispatch_get_main_queue(), ^{
      granted = CGRequestScreenCaptureAccess();
    });
  }
  return granted ? SOVLIUM_PERM_GRANTED : SOVLIUM_PERM_DENIED;
#else
  return SOVLIUM_PERM_UNSUPPORTED;
#endif
}
