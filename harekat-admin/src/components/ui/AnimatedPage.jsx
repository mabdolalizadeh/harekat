import { motion } from 'motion/react';

/**
 * AnimatedPage wrapper for smooth page transitions and stagger containers
 */
export default function AnimatedPage({ children, className = '', style = {}, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.32,
        delay,
        ease: [0.16, 1, 0.3, 1],
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
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
