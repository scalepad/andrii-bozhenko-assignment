import { useEffect, useState, type FormEvent } from 'react';
import { Box, Button, Grid, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ShoeColor, ShoeSize, ShoeStyle, UpperMaterial, type Listing } from '@shoe/shared';
import { api } from '../api';
import { Empty, ErrorAlert, ListingCard, Loading } from '../components';

function AttributeFilter({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ select: { native: true } }}
      sx={{ minWidth: { md: 125 } }}
    >
      <option value="">Any</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </TextField>
  );
}

export function CatalogPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [style, setStyle] = useState('');
  const [upperMaterial, setUpperMaterial] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (min) params.set('minPrice', String(Math.round(Number(min) * 100)));
      if (max) params.set('maxPrice', String(Math.round(Number(max) * 100)));
      if (size) params.set('size', size);
      if (color) params.set('color', color);
      if (style) params.set('style', style);
      if (upperMaterial) params.set('upperMaterial', upperMaterial);
      const data = await api<{ listings: Listing[] }>(`/listings?${params}`);
      setListings(data.listings);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
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
      <Stack
        component="form"
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void load();
        }}
        sx={{ mb: 4 }}
      >
        <TextField
          fullWidth
          placeholder="Search shoes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }
          }}
        />
        <TextField
          label="Min $"
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          sx={{ width: { md: 130 } }}
        />
        <TextField
          label="Max $"
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          sx={{ width: { md: 130 } }}
        />
        <AttributeFilter
          label="Size"
          value={size}
          onChange={setSize}
          options={Object.values(ShoeSize)}
        />
        <AttributeFilter
          label="Color"
          value={color}
          onChange={setColor}
          options={Object.values(ShoeColor)}
        />
        <AttributeFilter
          label="Style"
          value={style}
          onChange={setStyle}
          options={Object.values(ShoeStyle)}
        />
        <AttributeFilter
          label="Material"
          value={upperMaterial}
          onChange={setUpperMaterial}
          options={Object.values(UpperMaterial)}
        />
        <Button type="submit" variant="contained">
          Search
        </Button>
      </Stack>
      {error ? (
        <ErrorAlert error={error} />
      ) : loading ? (
        <Loading />
      ) : !listings.length ? (
        <Empty title="No shoes match those filters" />
      ) : (
        <Grid container spacing={3}>
          {listings.map((listing) => (
            <Grid key={listing.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ListingCard listing={listing} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
