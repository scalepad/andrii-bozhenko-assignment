import { IconButton, Stack, TextField } from '@mui/material';
import Close from '@mui/icons-material/Close';
import { ShoeColor, ShoeSize, ShoeStyle, UpperMaterial } from '@shoe/shared';
import { AttributeFilter } from './AttributeFilter';
import type { CatalogFiltersController } from './useCatalogFilters';
import type { StandardFilter } from './types';

const selectFilters = {
  size: { label: 'Size', options: Object.values(ShoeSize) },
  color: { label: 'Color', options: Object.values(ShoeColor) },
  style: { label: 'Style', options: Object.values(ShoeStyle) },
  upperMaterial: { label: 'Upper material', options: Object.values(UpperMaterial) }
} as const;

function FilterRow({
  label,
  onRemove,
  children
}: {
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {children}
      <IconButton aria-label={`Remove ${label.toLowerCase()} filter`} onClick={onRemove}>
        <Close />
      </IconButton>
    </Stack>
  );
}

export function ActiveFilters({ filters }: { filters: CatalogFiltersController }) {
  const { state, setValue, removeStandard } = filters;
  return (
    <>
      {state.active.includes('price') && (
        <FilterRow label="Price" onRemove={() => removeStandard('price')}>
          <TextField
            label="Min price"
            type="number"
            value={state.values.minPrice}
            onChange={(event) => setValue('minPrice', event.target.value)}
            fullWidth
          />
          <TextField
            label="Max price"
            type="number"
            value={state.values.maxPrice}
            onChange={(event) => setValue('maxPrice', event.target.value)}
            fullWidth
          />
        </FilterRow>
      )}
      {state.active.includes('seller') && (
        <FilterRow label="Seller" onRemove={() => removeStandard('seller')}>
          <TextField
            label="Seller name"
            value={state.values.seller}
            onChange={(event) => setValue('seller', event.target.value)}
            fullWidth
          />
        </FilterRow>
      )}
      {(Object.keys(selectFilters) as Array<keyof typeof selectFilters>).map(
        (filter) =>
          state.active.includes(filter as StandardFilter) && (
            <FilterRow
              key={filter}
              label={selectFilters[filter].label}
              onRemove={() => removeStandard(filter)}
            >
              <AttributeFilter
                label={selectFilters[filter].label}
                value={state.values[filter]}
                onChange={(value) => setValue(filter, value)}
                options={[...selectFilters[filter].options]}
              />
            </FilterRow>
          )
      )}
      {state.custom.map((filter) => (
        <FilterRow key={filter.id} label="Custom" onRemove={() => filters.removeCustom(filter.id)}>
          <TextField
            label="Attribute"
            value={filter.key}
            onChange={(event) => filters.updateCustom(filter.id, 'key', event.target.value)}
            fullWidth
          />
          <TextField
            label="Value"
            value={filter.value}
            onChange={(event) => filters.updateCustom(filter.id, 'value', event.target.value)}
            fullWidth
          />
        </FilterRow>
      ))}
    </>
  );
}
