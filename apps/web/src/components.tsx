import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import { Link, Navigate, useLocation } from 'react-router-dom';
import type { Listing, Role } from '@shoe/shared';
import { StandardAttributeKey } from '@shoe/shared';
import { useAuth } from './auth';

export const money = (cents: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
export function Loading() {
  return (
    <Box sx={{ py: 8, textAlign: 'center' }}>
      <CircularProgress />
    </Box>
  );
}
export function ErrorAlert({ error }: { error: unknown }) {
  return (
    <Alert severity="error">
      {error instanceof Error ? error.message : 'Something went wrong'}
    </Alert>
  );
}
export function Protected({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role === 'SELLER' ? '/seller' : '/'} replace />;
  return children;
}
export function ListingCard({ listing }: { listing: Listing }) {
  const standard = (key: StandardAttributeKey) =>
    listing.attributes.find((attribute) => attribute.kind === 'STANDARD' && attribute.key === key)
      ?.value;
  return (
    <Card>
      <CardActionArea component={Link} to={`/shoes/${listing.id}`}>
        <CardMedia
          component="img"
          height="220"
          image={listing.images[0]?.url ?? 'https://placehold.co/600x400?text=Shoe'}
          alt={listing.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="h6" noWrap>
            {listing.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            by {listing.seller?.name}
          </Typography>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={800}>{money(listing.priceCents)}</Typography>
            <Stack direction="row" spacing={0.5}>
              {[standard(StandardAttributeKey.STYLE), standard(StandardAttributeKey.COLOR)]
                .filter(Boolean)
                .map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
export function Empty({ title, action, to }: { title: string; action?: string; to?: string }) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
      <Typography variant="h5">{title}</Typography>
      {action && to && (
        <Button component={Link} to={to} variant="contained">
          {action}
        </Button>
      )}
    </Stack>
  );
}
