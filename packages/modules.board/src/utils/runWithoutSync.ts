let skipSync = false;

export const runWithoutSync = (fn: () => void) => {
  skipSync = true;
  try {
    fn();
  } finally {
    skipSync = false;
  }
};

export const shouldSkipSync = () => skipSync;
