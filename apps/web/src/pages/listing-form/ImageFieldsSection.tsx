import { Button, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';

export function ImageFieldsSection({
  images,
  update,
  add,
  remove
}: {
  images: string[];
  update: (index: number, value: string) => void;
  add: () => void;
  remove: (index: number) => void;
}) {
  return (
    <>
      <Divider />
      <Typography variant="h6">Images</Typography>
      {images.map((image, index) => (
        <Stack key={index} direction="row">
          <TextField
            fullWidth
            label={`Image URL ${index + 1}`}
            type="url"
            value={image}
            onChange={(event) => update(index, event.target.value)}
            required={index === 0}
          />
          <IconButton
            aria-label="Remove image"
            disabled={images.length === 1}
            onClick={() => remove(index)}
          >
            <DeleteOutline />
          </IconButton>
        </Stack>
      ))}
      <Button startIcon={<Add />} onClick={add} disabled={images.length >= 8}>
        Add image
      </Button>
    </>
  );
}
