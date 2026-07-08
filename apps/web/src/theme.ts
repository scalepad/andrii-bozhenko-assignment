import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#ff5a36' },
    secondary: { main: '#17324d' },
    background: { default: '#f7f4ef' }
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 750 },
    button: { fontWeight: 700, textTransform: 'none' }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { border: '1px solid #e5e0d8', boxShadow: 'none' } } }
  }
});
