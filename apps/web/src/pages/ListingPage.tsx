import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import ShoppingBag from '@mui/icons-material/ShoppingBag';
import { Link, useParams } from 'react-router-dom';
import { StandardAttributeKey, type Listing } from '@shoe/shared';
import { api } from '../api';
import { useAuth } from '../auth';
import { ErrorAlert, Loading, money } from '../components';

export function ListingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing>();
  const [error, setError] = useState<unknown>();
  const [added, setAdded] = useState(false);
  useEffect(() => {
    api<{ listing: Listing }>(`/listings/${id}`)
      .then((r) => setListing(r.listing))
      .catch(setError);
  }, [id]);
  if (error) return <ErrorAlert error={error} />;
  if (!listing) return <Loading />;
  const standard = (key: StandardAttributeKey) =>
    listing.attributes.find((attribute) => attribute.kind === 'STANDARD' && attribute.key === key)
      ?.value;
  const add = async () => {
    await api('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ listingId: listing.id, quantity: 1 })
    });
    setAdded(true);
  };
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box
          component="img"
          src={listing.images[0]?.url}
          alt={listing.title}
          sx={{ width: '100%', maxHeight: 600, objectFit: 'cover', borderRadius: 3 }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Stack spacing={2}>
          <Typography color="text.secondary">Custom made by {listing.seller?.name}</Typography>
          <Typography variant="h2">{listing.title}</Typography>
          <Typography variant="h4" color="primary.main">
            {money(listing.priceCents)}
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{listing.description}</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {standard(StandardAttributeKey.SIZE) && (
              <Chip label={`US size: ${standard(StandardAttributeKey.SIZE)}`} />
            )}
            {standard(StandardAttributeKey.COLOR) && (
              <Chip label={`Color: ${standard(StandardAttributeKey.COLOR)}`} />
            )}
            {standard(StandardAttributeKey.STYLE) && (
              <Chip label={`Style: ${standard(StandardAttributeKey.STYLE)}`} />
            )}
            {standard(StandardAttributeKey.UPPER_MATERIAL) && (
              <Chip label={`Upper: ${standard(StandardAttributeKey.UPPER_MATERIAL)}`} />
            )}
            {listing.attributes
              .filter((attribute) => attribute.kind === 'CUSTOM')
              .map((a) => (
                <Chip key={a.id ?? `${a.key}${a.value}`} label={`${a.key}: ${a.value}`} />
              ))}
          </Stack>
          {added && <Alert severity="success">Added to your cart.</Alert>}
          {user?.role === 'BUYER' ? (
            <Button
              size="large"
              variant="contained"
              startIcon={<ShoppingBag />}
              onClick={() => void add()}
            >
              Add to cart
            </Button>
          ) : !user ? (
            <Button component={Link} to="/login" variant="contained">
              Log in to purchase
            </Button>
          ) : null}
        </Stack>
      </Grid>
    </Grid>
  );
}
