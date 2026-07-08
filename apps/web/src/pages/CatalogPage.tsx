import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { CatalogFilters } from './catalog/CatalogFilters';
import { CatalogResults } from './catalog/CatalogResults';
import { useCatalogFilters } from './catalog/useCatalogFilters';
import { useListings } from './catalog/useListings';

export { AttributeFilter } from './catalog/AttributeFilter';

export function CatalogPage() {
  const filters = useCatalogFilters();
  const listings = useListings();

  useEffect(() => {
    void listings.search(filters.toQueryString());
  }, []);

  return (
    <>
      <Box sx={{ py: { xs: 3, md: 7 }, maxWidth: 760 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '2.7rem', md: '4.5rem' }, lineHeight: 1 }}>
          Wear something nobody else owns.
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          One-of-one shoes, handcrafted by independent creators.
        </Typography>
      </Box>
      <CatalogFilters filters={filters} onSearch={() => listings.search(filters.toQueryString())} />
      <CatalogResults {...listings} />
    </>
  );
}
