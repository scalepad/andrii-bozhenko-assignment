import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import EditOutlined from '@mui/icons-material/EditOutlined';
import { Link } from 'react-router-dom';
import type { Listing } from '@shoe/shared';
import { api } from '../api';
import { Empty, ErrorAlert, Loading, money } from '../components';

export function SellerPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const load = () =>
    api<{ listings: Listing[] }>('/listings/mine')
      .then((r) => setListings(r.listings))
      .catch(setError)
      .finally(() => setLoading(false));
  useEffect(() => {
    void load();
  }, []);
  const remove = async (listing: Listing) => {
    if (!window.confirm(`Delete “${listing.title}”?`)) return;
    await api(`/listings/${listing.id}`, { method: 'DELETE' });
    setListings((all) => all.filter((item) => item.id !== listing.id));
  };
  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <div>
          <Typography variant="h3">Your studio</Typography>
          <Typography color="text.secondary">
            Create and manage your custom shoe listings.
          </Typography>
        </div>
        <Button component={Link} to="/seller/new" variant="contained" startIcon={<Add />}>
          New listing
        </Button>
      </Stack>
      {error ? (
        <ErrorAlert error={error} />
      ) : loading ? (
        <Loading />
      ) : !listings.length ? (
        <Empty title="Your studio is empty" action="Create your first listing" to="/seller/new" />
      ) : (
        <Grid container spacing={2}>
          {listings.map((listing) => (
            <Grid key={listing.id} size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ sm: 'center' }}
                  >
                    <img
                      src={listing.images[0]?.url}
                      width="100"
                      height="80"
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Stack flexGrow={1}>
                      <Typography variant="h6">{listing.title}</Typography>
                      <Typography color="text.secondary">{money(listing.priceCents)}</Typography>
                    </Stack>
                    <Button
                      component={Link}
                      to={`/seller/${listing.id}/edit`}
                      startIcon={<EditOutlined />}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      startIcon={<DeleteOutline />}
                      onClick={() => void remove(listing)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {!error && !loading && listings.length > 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Your listings appear immediately in the public marketplace.
        </Alert>
      )}
    </>
  );
}
