import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography
} from '@mui/material';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: '1px solid #e5e0d8' }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            component={Link}
            to="/"
            variant="h5"
            sx={{ color: 'secondary.main', textDecoration: 'none', fontWeight: 900, flexGrow: 1 }}
          >
            SOLE<span style={{ color: '#ff5a36' }}>CRAFT</span>
          </Typography>
          {user?.role === 'SELLER' && (
            <Button component={Link} to="/seller">
              My studio
            </Button>
          )}
          {user?.role === 'BUYER' && (
            <IconButton component={Link} to="/cart" aria-label="Cart">
              <Badge color="primary">
                <ShoppingBagOutlined />
              </Badge>
            </IconButton>
          )}
          {user ? (
            <>
              <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>{user.name}</Typography>
              <Button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login">
                Log in
              </Button>
              <Button component={Link} to="/register" variant="contained">
                Join
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box component="main">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </>
  );
}
