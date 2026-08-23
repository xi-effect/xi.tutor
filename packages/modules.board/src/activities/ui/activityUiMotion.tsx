import { motion, type HTMLMotionProps, type Transition, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

export const activityItemTransition: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 28,
};

export const activityStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.03 },
  },
};

export const activityItemVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export const activityHover = {
  scale: 1.02,
  y: -1,
};

export const activityTap = {
  scale: 0.98,
};

export const randomCardTransition: Transition = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
  mass: 0.9,
};

export const randomCardVariants: Variants = {
  enter: (direction: number) => ({
    x: direction * 160,
    rotateY: direction * -62,
    rotateZ: direction * 10,
    opacity: 0,
    scale: 0.88,
  }),
  center: {
    x: 0,
    rotateY: 0,
    rotateZ: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction * -200,
    rotateY: direction * 48,
    rotateZ: direction * -14,
    opacity: 0,
    scale: 0.86,
  }),
};

type ListProps = HTMLMotionProps<'div'> & { children: ReactNode };

export function ActivityMotionList({ children, ...rest }: ListProps) {
  return (
    <motion.div variants={activityStagger} initial="hidden" animate="show" {...rest}>
      {children}
    </motion.div>
  );
}

type ItemProps = HTMLMotionProps<'div'> & {
  children: ReactNode;
  hover?: boolean;
};

export function ActivityMotionItem({ children, hover = true, ...rest }: ItemProps) {
  return (
    <motion.div
      variants={activityItemVariants}
      transition={activityItemTransition}
      whileHover={hover ? activityHover : undefined}
      whileTap={hover ? activityTap : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
