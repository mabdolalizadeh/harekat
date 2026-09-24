import { useRef, useState } from 'react';
import { Card } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * SpotlightCard - React Bits inspired spotlight hover effect for Admin Panel
 */
export default function SpotlightCard({
  children,
  spotlightColor,
  sx = {},
  onClick,
  ...props
}) {
  const divRef = useRef(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const defaultSpotlight = isDark
    ? 'rgba(59, 130, 246, 0.12)'
    : 'rgba(37, 99, 235, 0.08)';

  const activeColor = spotlightColor || defaultSpotlight;

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <Card
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          opacity,
          transition: 'opacity 0.25s ease-in-out',
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, ${activeColor}, transparent 75%)`,
          zIndex: 1,
        },
        ...sx,
      }}
      {...props}
    >
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </Card>
  );
}
