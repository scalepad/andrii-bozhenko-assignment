import { Grid } from '@mui/material';
import type { Listing } from '@shoe/shared';
import { Empty, ErrorAlert, ListingCard, Loading } from '../../components';

export function CatalogResults({
  items,
  loading,
  error
}: {
  items: Listing[];
  loading: boolean;
  error: unknown;
}) {
  if (error) return <ErrorAlert error={error} />;
  if (loading) return <Loading />;
  if (!items.length) return <Empty title="No shoes match those filters" />;
  return (
    <Grid container spacing={3}>
      {items.map((listing) => (
        <Grid key={listing.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <ListingCard listing={listing} />
        </Grid>
      ))}
    </Grid>
  );
}
