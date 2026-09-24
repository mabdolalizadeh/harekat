import { motion } from 'motion/react';

/**
 * AnimatedPage wrapper for smooth page transitions and stagger containers
 */
export default function AnimatedPage({ children, className = '', style = {}, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.16, 1, 0.3, 1], // Smooth custom cubic bezier
      }}
      className={className}
      style={{ width: '100%', ...style }}
    >
      {children}
    </motion.div>
  );
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
