import { motion } from 'motion/react';
import { Card } from '@mui/material';

/**
 * InteractiveCard - Wraps MUI Card with Motion.dev physics (whileHover, whileTap) for Admin Panel
 */
export default function InteractiveCard({
  children,
  onClick,
  hoverScale = 1.015,
  hoverY = -2,
  tapScale = 0.985,
  sx = {},
  ...props
}) {
  return (
    <motion.div
      whileHover={onClick ? { scale: hoverScale, y: hoverY } : { y: hoverY }}
      whileTap={onClick ? { scale: tapScale } : undefined}
      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          ...sx,
        }}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
}
