import { Box, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

export default function Logo({ sx, onClick }) {
  return (
    <Box
      component={NavLink}
      to="/overview"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        color: '#171715',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
        '&:hover': { opacity: 0.85 },
        ...sx
      }}
    >
      {/* Harekat Brand Icon */}
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '10px',
          backgroundColor: '#f47c20',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(244, 124, 32, 0.3)'
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 800"
          width="22"
          height="22"
          fill="currentColor"
        >
          <g transform="translate(0.000000,800.000000) scale(0.100000,-0.100000)" stroke="none">
            <path d="M4375 6476 c-36 -18 -119 -92 -305 -275 -485 -478 -901 -896 -925 -931 -99 -143 -18 -341 157 -387 29 -7 74 -13 101 -13 75 0 195 -28 274 -65 216 -100 363 -267 435 -495 22 -73 23 -85 23 -450 0 -413 1 -402 -64 -469 -51 -52 -101 -71 -188 -71 -94 0 -142 20 -195 78 -62 69 -68 105 -68 437 0 327 -4 351 -67 425 -76 88 -199 115 -301 64 -56 -28 -90 -63 -125 -128 -21 -39 -22 -56 -27 -366 -5 -321 -5 -326 -30 -374 -28 -55 -66 -90 -130 -120 -44 -21 -59 -21 -885 -26 -708 -4 -845 -7 -870 -20 -134 -65 -195 -211 -137 -331 42 -85 102 -130 203 -149 31 -6 366 -10 851 -10 847 0 863 1 993 48 63 23 147 66 202 103 23 16 50 29 61 29 10 0 48 -19 83 -42 142 -92 287 -138 433 -138 196 0 399 80 545 215 89 82 179 234 214 360 37 136 46 650 16 880 -56 417 -276 741 -665 975 -46 28 -84 57 -84 63 0 6 175 187 389 402 421 421 441 446 441 545 0 60 -47 159 -92 193 -90 69 -178 83 -263 43z" />
            <path d="M5380 5381 c-118 -39 -195 -139 -193 -251 0 -67 20 -115 67 -168 54 -59 107 -80 233 -92 126 -11 197 -28 290 -70 172 -78 323 -239 392 -420 49 -126 52 -166 49 -546 l-3 -351 -30 -49 c-45 -72 -109 -108 -201 -112 -40 -2 -88 1 -107 7 -55 19 -114 67 -139 113 -22 41 -23 55 -29 368 -4 239 -9 335 -19 364 -22 59 -101 141 -157 160 -88 30 -167 18 -238 -36 -49 -37 -80 -79 -97 -129 -8 -23 -14 -202 -18 -544 -8 -555 -5 -527 -70 -699 -114 -302 -352 -516 -690 -621 -113 -36 -140 -48 -178 -80 -124 -104 -96 -316 52 -390 88 -44 213 -29 421 51 316 122 545 305 727 579 49 75 158 281 158 301 0 3 9 26 21 51 15 33 25 44 37 40 144 -47 169 -51 312 -51 137 0 150 1 232 30 289 103 480 329 532 629 12 67 16 161 16 371 0 428 -30 604 -141 826 -179 361 -487 604 -878 694 -112 26 -308 40 -351 25z" />
            <path d="M1185 4331 c-57 -26 -101 -66 -133 -120 -23 -38 -27 -57 -27 -116 1 -109 45 -178 148 -233 l52 -27 575 0 575 0 51 27 c121 64 179 189 140 305 -21 62 -65 116 -124 151 l-47 27 -585 2 c-550 3 -587 2 -625 -16z" />
          </g>
        </svg>
      </Box>

      {/* Brand Name Typography */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.25rem',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#171715',
            fontFamily: '"Baloo Bhaijaan 2", "Alan Sans", "Vazirmatn", sans-serif'
          }}
        >
          حرکت مدیا
        </Typography>
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: '#f47c20',
            alignSelf: 'flex-end',
            mb: 0.6
          }}
        />
      </Box>
    </Box>
  );
}
