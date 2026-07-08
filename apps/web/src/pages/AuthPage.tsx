import { useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Role } from '@shoe/shared';
import { api } from '../api';
import { useAuth } from '../auth';

export function AuthPage({ register = false }: { register?: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('BUYER');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(`/auth/${register ? 'register' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify(register ? { name, email, password, role } : { email, password })
      });
      await refresh();
      navigate(
        (location.state as { from?: string } | null)?.from ??
          (register && role === 'SELLER' ? '/seller' : '/')
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card sx={{ maxWidth: 480, mx: 'auto', mt: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Stack component="form" spacing={2.5} onSubmit={submit}>
          <Typography variant="h4">{register ? 'Create your account' : 'Welcome back'}</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {register && (
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText={register ? 'At least 8 characters' : undefined}
          />
          {register && (
            <FormControl>
              <InputLabel>Account type</InputLabel>
              <Select
                label="Account type"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <MenuItem value="BUYER">Buyer — discover shoes</MenuItem>
                <MenuItem value="SELLER">Seller — create shoes</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button type="submit" variant="contained" size="large" disabled={busy}>
            {busy ? 'Please wait…' : register ? 'Create account' : 'Log in'}
          </Button>
          <Typography color="text.secondary">
            {register ? 'Already registered?' : 'New here?'}{' '}
            <Link to={register ? '/login' : '/register'}>
              {register ? 'Log in' : 'Create an account'}
            </Link>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
