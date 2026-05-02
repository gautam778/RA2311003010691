import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import AllNotificationsPage from './pages/AllNotificationsPage';
import PriorityInboxPage from './pages/PriorityInboxPage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#6C63FF' },
    secondary:  { main: '#00BFA5' },
    background: { default: '#0A0A12', paper: '#12121E' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard:    { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiButton:  { styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } } },
    MuiChip:    { styleOverrides: { root: { borderRadius: 6 } } },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{
        position: 'fixed', inset: 0, zIndex: -1,
        background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(108,99,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/"              element={<Navigate to="/notifications" replace />} />
          <Route path="/notifications" element={<AllNotificationsPage />} />
          <Route path="/priority"      element={<PriorityInboxPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
