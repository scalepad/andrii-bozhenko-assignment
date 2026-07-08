import { type FormEvent } from 'react';
import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Loading } from '../components';
import { CustomAttributesSection } from './listing-form/CustomAttributesSection';
import { ImageFieldsSection } from './listing-form/ImageFieldsSection';
import { ListingBasicsSection } from './listing-form/ListingBasicsSection';
import { StandardAttributesSection } from './listing-form/StandardAttributesSection';
import { useListingForm } from './listing-form/useListingForm';

export function ListingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const form = useListingForm(id);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await form.save()) navigate('/seller');
  };

  if (form.state.loading) return <Loading />;
  return (
    <Card sx={{ maxWidth: 760, mx: 'auto' }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Stack component="form" spacing={3} onSubmit={submit}>
          <Typography variant="h3">{id ? 'Edit listing' : 'Create a shoe'}</Typography>
          {form.state.error && <Alert severity="error">{form.state.error}</Alert>}
          <ListingBasicsSection state={form.state} setField={form.setField} />
          <StandardAttributesSection state={form.state} setField={form.setField} />
          <ImageFieldsSection images={form.state.images} {...form.images} />
          <CustomAttributesSection attributes={form.state.attributes} {...form.attributes} />
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={() => navigate('/seller')}>Cancel</Button>
            <Button type="submit" variant="contained" size="large" disabled={form.state.saving}>
              {form.state.saving ? 'Saving…' : 'Save listing'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
