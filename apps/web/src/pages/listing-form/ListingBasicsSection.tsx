import { TextField } from '@mui/material';
import type { ListingFormState, SetListingField } from './types';

export function ListingBasicsSection({
  state,
  setField
}: {
  state: ListingFormState;
  setField: SetListingField;
}) {
  return (
    <>
      <TextField
        label="Name / title"
        value={state.title}
        onChange={(event) => setField('title', event.target.value)}
        required
        inputProps={{ maxLength: 120 }}
      />
      <TextField
        label="Description"
        value={state.description}
        onChange={(event) => setField('description', event.target.value)}
        required
        multiline
        minRows={5}
      />
      <TextField
        label="Price (CAD)"
        type="number"
        value={state.price}
        onChange={(event) => setField('price', event.target.value)}
        required
        inputProps={{ min: 0.01, step: 0.01 }}
      />
    </>
  );
}
