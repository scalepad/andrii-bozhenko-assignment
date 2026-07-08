import { useState, type FormEvent, type MouseEvent } from 'react';
import { Box, Button, InputAdornment, Menu, MenuItem, Stack, TextField } from '@mui/material';
import Add from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { ActiveFilters } from './ActiveFilters';
import { filterLabels } from './types';
import type { CatalogFiltersController } from './useCatalogFilters';

export function CatalogFilters({
  filters,
  onSearch
}: {
  filters: CatalogFiltersController;
  onSearch: () => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearch();
  };
  const addStandard = (filter: Parameters<typeof filters.addStandard>[0]) => {
    filters.addStandard(filter);
    setMenuAnchor(null);
  };
  const addCustom = () => {
    filters.addCustom();
    setMenuAnchor(null);
  };
  return (
    <Box component="form" onSubmit={submit} sx={{ mb: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          fullWidth
          placeholder="Search shoes"
          value={filters.state.values.search}
          onChange={(event) => filters.setValue('search', event.target.value)}
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
          onClick={(event: MouseEvent<HTMLButtonElement>) => setMenuAnchor(event.currentTarget)}
          sx={{ minWidth: 132, minHeight: 56 }}
        >
          Add filter
        </Button>
        <Button type="submit" variant="contained" sx={{ minWidth: 110, minHeight: 56 }}>
          Search
        </Button>
      </Stack>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {filters.available.map((filter) => (
          <MenuItem key={filter} onClick={() => addStandard(filter)}>
            {filterLabels[filter]}
          </MenuItem>
        ))}
        <MenuItem onClick={addCustom}>Custom attribute</MenuItem>
      </Menu>
      {(filters.state.active.length > 0 || filters.state.custom.length > 0) && (
        <Box
          aria-label="Active filters"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 1.5,
            mt: 1.5
          }}
        >
          <ActiveFilters filters={filters} />
        </Box>
      )}
    </Box>
  );
}
