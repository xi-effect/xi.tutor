import type { Transition } from 'motion/react';

export const previewFullscreenTransition: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 38,
  mass: 0.85,
};
