import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { ShoeColor, ShoeSize, ShoeStyle, UpperMaterial, type Listing } from '@shoe/shared';
import { api } from '../api';
import { Empty, ErrorAlert, ListingCard, Loading } from '../components';

export function AttributeFilter({
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
      slotProps={{ inputLabel: { shrink: true }, select: { native: true } }}
      fullWidth
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

type StandardFilter = 'price' | 'seller' | 'size' | 'color' | 'style' | 'upperMaterial';
interface CustomFilter {
  id: number;
  key: string;
  value: string;
}

const filterLabels: Record<StandardFilter, string> = {
  price: 'Price',
  seller: 'Seller',
  size: 'Size',
  color: 'Color',
  style: 'Style',
  upperMaterial: 'Upper material'
};

export function CatalogPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [seller, setSeller] = useState('');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [style, setStyle] = useState('');
  const [upperMaterial, setUpperMaterial] = useState('');
  const [activeFilters, setActiveFilters] = useState<StandardFilter[]>([]);
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [filterMenu, setFilterMenu] = useState<HTMLElement | null>(null);
  const nextCustomId = useRef(1);
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
      if (seller) params.set('seller', seller);
      if (size) params.set('size', size);
      if (color) params.set('color', color);
      if (style) params.set('style', style);
      if (upperMaterial) params.set('upperMaterial', upperMaterial);
      customFilters.forEach((filter) => {
        if (filter.key.trim() && filter.value.trim()) {
          params.append(`attr.${filter.key.trim()}`, filter.value.trim());
        }
      });
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
  const addStandardFilter = (filter: StandardFilter) => {
    setActiveFilters((current) => [...current, filter]);
    setFilterMenu(null);
  };
  const removeStandardFilter = (filter: StandardFilter) => {
    setActiveFilters((current) => current.filter((item) => item !== filter));
    if (filter === 'price') {
      setMin('');
      setMax('');
    } else if (filter === 'seller') setSeller('');
    else if (filter === 'size') setSize('');
    else if (filter === 'color') setColor('');
    else if (filter === 'style') setStyle('');
    else setUpperMaterial('');
  };
  const addCustomFilter = () => {
    setCustomFilters((current) => [...current, { id: nextCustomId.current++, key: '', value: '' }]);
    setFilterMenu(null);
  };
  const updateCustomFilter = (id: number, patch: Partial<CustomFilter>) => {
    setCustomFilters((current) =>
      current.map((filter) => (filter.id === id ? { ...filter, ...patch } : filter))
    );
  };
  const availableFilters = (Object.keys(filterLabels) as StandardFilter[]).filter(
    (filter) => !activeFilters.includes(filter)
  );
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
      <Box
        component="form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void load();
        }}
        sx={{
          mb: 4
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={(event: MouseEvent<HTMLButtonElement>) => setFilterMenu(event.currentTarget)}
            sx={{ minWidth: 132, minHeight: 56 }}
          >
            Add filter
          </Button>
          <Button type="submit" variant="contained" sx={{ minWidth: 110, minHeight: 56 }}>
            Search
          </Button>
        </Stack>
        <Menu anchorEl={filterMenu} open={Boolean(filterMenu)} onClose={() => setFilterMenu(null)}>
          {availableFilters.map((filter) => (
            <MenuItem key={filter} onClick={() => addStandardFilter(filter)}>
              {filterLabels[filter]}
            </MenuItem>
          ))}
          <MenuItem onClick={addCustomFilter}>Custom attribute</MenuItem>
        </Menu>
        {(activeFilters.length > 0 || customFilters.length > 0) && (
          <Box
            aria-label="Active filters"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: 1.5,
              mt: 1.5
            }}
          >
            {activeFilters.includes('price') && (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Min price"
                  type="number"
                  value={min}
                  onChange={(event) => setMin(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Max price"
                  type="number"
                  value={max}
                  onChange={(event) => setMax(event.target.value)}
                  fullWidth
                />
                <IconButton
                  aria-label="Remove price filter"
                  onClick={() => removeStandardFilter('price')}
                >
                  <Close />
                </IconButton>
              </Stack>
            )}
            {activeFilters.includes('size') && (
              <Stack direction="row" spacing={1} alignItems="center">
                <AttributeFilter
                  label="Size"
                  value={size}
                  onChange={setSize}
                  options={Object.values(ShoeSize)}
                />
                <IconButton
                  aria-label="Remove size filter"
                  onClick={() => removeStandardFilter('size')}
                >
                  <Close />
                </IconButton>
              </Stack>
            )}
            {activeFilters.includes('seller') && (
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Seller name"
                  value={seller}
                  onChange={(event) => setSeller(event.target.value)}
                  fullWidth
                />
                <IconButton
                  aria-label="Remove seller filter"
                  onClick={() => removeStandardFilter('seller')}
                >
                  <Close />
                </IconButton>
              </Stack>
            )}
            {activeFilters.includes('color') && (
              <Stack direction="row" spacing={1} alignItems="center">
                <AttributeFilter
                  label="Color"
                  value={color}
                  onChange={setColor}
                  options={Object.values(ShoeColor)}
                />
                <IconButton
                  aria-label="Remove color filter"
                  onClick={() => removeStandardFilter('color')}
                >
                  <Close />
                </IconButton>
              </Stack>
            )}
            {activeFilters.includes('style') && (
              <Stack direction="row" spacing={1} alignItems="center">
                <AttributeFilter
                  label="Style"
                  value={style}
                  onChange={setStyle}
                  options={Object.values(ShoeStyle)}
                />
                <IconButton
                  aria-label="Remove style filter"
                  onClick={() => removeStandardFilter('style')}
                >
                  <Close />
                </IconButton>
              </Stack>
            )}
            {activeFilters.includes('upperMaterial') && (
              <Stack direction="row" spacing={1} alignItems="center">
                <AttributeFilter
                  label="Upper material"
                  value={upperMaterial}
                  onChange={setUpperMaterial}
                  options={Object.values(UpperMaterial)}
                />
                <IconButton
                  aria-label="Remove upper material filter"
                  onClick={() => removeStandardFilter('upperMaterial')}
                >
                  <Close />
                </IconButton>
              </Stack>
            )}
            {customFilters.map((filter) => (
              <Stack key={filter.id} direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Attribute"
                  value={filter.key}
                  onChange={(event) => updateCustomFilter(filter.id, { key: event.target.value })}
                  fullWidth
                />
                <TextField
                  label="Value"
                  value={filter.value}
                  onChange={(event) => updateCustomFilter(filter.id, { value: event.target.value })}
                  fullWidth
                />
                <IconButton
                  aria-label="Remove custom filter"
                  onClick={() =>
                    setCustomFilters((current) => current.filter((item) => item.id !== filter.id))
                  }
                >
                  <Close />
                </IconButton>
              </Stack>
            ))}
          </Box>
        )}
      </Box>
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
