import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#edf1f7' }}>
        <CircularProgress />
      </Box>
    );
  }

  return children;
}
