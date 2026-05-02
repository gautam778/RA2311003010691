import { AppBar, Toolbar, Typography, Box, Button, useMediaQuery, useTheme } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(15,15,25,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: { xs: 56, sm: 64 } }}>
        <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2,
            background: 'linear-gradient(135deg, #6C63FF, #3ECFCF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <NotificationsIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          {!isMobile && (
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5, color: '#fff' }}>
              Campus<span style={{ color: '#6C63FF' }}>Notify</span>
            </Typography>
          )}
        </Box>
        <Box display="flex" gap={1}>
          <Button
            component={NavLink}
            to="/notifications"
            startIcon={<NotificationsIcon />}
            sx={{
              color: '#aaa', textTransform: 'none', borderRadius: 2, px: 2,
              '&.active': {
                color: '#fff',
                background: 'rgba(108,99,255,0.15)',
                border: '1px solid rgba(108,99,255,0.4)',
              },
              '&:hover': { background: 'rgba(255,255,255,0.06)' },
            }}
          >
            {isMobile ? '' : 'All Notifications'}
          </Button>

          <Button
            component={NavLink}
            to="/priority"
            startIcon={<StarIcon />}
            sx={{
              color: '#aaa', textTransform: 'none', borderRadius: 2, px: 2,
              '&.active': {
                color: '#fff',
                background: 'rgba(255,193,7,0.12)',
                border: '1px solid rgba(255,193,7,0.4)',
              },
              '&:hover': { background: 'rgba(255,255,255,0.06)' },
            }}
          >
            {isMobile ? '' : 'Priority Inbox'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
