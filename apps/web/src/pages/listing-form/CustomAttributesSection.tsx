import { Button, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import type { CustomAttributeDraft } from './types';

export function CustomAttributesSection({
  attributes,
  update,
  add,
  remove
}: {
  attributes: CustomAttributeDraft[];
  update: (index: number, field: keyof CustomAttributeDraft, value: string) => void;
  add: () => void;
  remove: (index: number) => void;
}) {
  return (
    <>
      <Divider />
      <Typography variant="h6">Custom attributes</Typography>
      <Typography color="text.secondary">
        Add details outside the standard fields, such as Technique / Hand painted.
      </Typography>
      {attributes.map((attribute, index) => (
        <Stack key={index} direction="row" spacing={1}>
          <TextField
            label="Attribute"
            value={attribute.key}
            onChange={(event) => update(index, 'key', event.target.value)}
          />
          <TextField
            label="Value"
            value={attribute.value}
            onChange={(event) => update(index, 'value', event.target.value)}
          />
          <IconButton aria-label="Remove attribute" onClick={() => remove(index)}>
            <DeleteOutline />
          </IconButton>
        </Stack>
      ))}
      <Button startIcon={<Add />} onClick={add}>
        Add attribute
      </Button>
    </>
  );
}
