import { Divider, Stack, TextField, Typography } from '@mui/material';
import { ShoeColor, ShoeSize, ShoeStyle, UpperMaterial } from '@shoe/shared';
import type { ListingFormState, SetListingField } from './types';

function SelectField({
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
      fullWidth
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ inputLabel: { shrink: true }, select: { native: true } }}
    >
      <option value="">Not specified</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </TextField>
  );
}

export function StandardAttributesSection({
  state,
  setField
}: {
  state: ListingFormState;
  setField: SetListingField;
}) {
  return (
    <>
      <Divider />
      <Typography variant="h6">Shoe details</Typography>
      <Typography color="text.secondary">
        Standard details are optional and make the listing easier to filter.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <SelectField
          label="US size"
          value={state.size}
          options={Object.values(ShoeSize)}
          onChange={(value) => setField('size', value as ShoeSize | '')}
        />
        <SelectField
          label="Primary color"
          value={state.color}
          options={Object.values(ShoeColor)}
          onChange={(value) => setField('color', value as ShoeColor | '')}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <SelectField
          label="Style"
          value={state.style}
          options={Object.values(ShoeStyle)}
          onChange={(value) => setField('style', value as ShoeStyle | '')}
        />
        <SelectField
          label="Upper material"
          value={state.upperMaterial}
          options={Object.values(UpperMaterial)}
          onChange={(value) => setField('upperMaterial', value as UpperMaterial | '')}
        />
      </Stack>
    </>
  );
}
