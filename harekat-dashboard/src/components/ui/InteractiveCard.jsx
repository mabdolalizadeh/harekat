import { motion } from 'motion/react';
import { Card } from '@mui/material';

/**
 * InteractiveCard - Wraps MUI Card with Motion.dev physics (whileHover, whileTap)
 */
export default function InteractiveCard({
  children,
  onClick,
  hoverScale = 1.015,
  hoverY = -3,
  tapScale = 0.985,
  sx = {},
  ...props
}) {
  return (
    <motion.div
      whileHover={onClick ? { scale: hoverScale, y: hoverY } : { y: hoverY }}
      whileTap={onClick ? { scale: tapScale } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
