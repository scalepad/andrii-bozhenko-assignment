import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ShoeColor,
  ShoeSize,
  ShoeStyle,
  StandardAttributeKey,
  UpperMaterial,
  type Listing,
  type ListingInput,
  type StandardAttribute
} from '@shoe/shared';
import { api } from '../api';
import { Loading } from '../components';

const blank = { key: '', value: '' };
export function ListingFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState<ShoeSize | ''>('');
  const [color, setColor] = useState<ShoeColor | ''>('');
  const [style, setStyle] = useState<ShoeStyle | ''>('');
  const [upperMaterial, setUpperMaterial] = useState<UpperMaterial | ''>('');
  const [images, setImages] = useState(['']);
  const [attributes, setAttributes] = useState([{ ...blank }]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    api<{ listing: Listing }>(`/listings/${id}`)
      .then(({ listing }) => {
        setTitle(listing.title);
        setDescription(listing.description);
        setPrice(String(listing.priceCents / 100));
        const standardValue = (key: StandardAttributeKey) =>
          listing.attributes.find(
            (attribute) => attribute.kind === 'STANDARD' && attribute.key === key
          )?.value ?? '';
        setSize(standardValue(StandardAttributeKey.SIZE) as ShoeSize | '');
        setColor(standardValue(StandardAttributeKey.COLOR) as ShoeColor | '');
        setStyle(standardValue(StandardAttributeKey.STYLE) as ShoeStyle | '');
        setUpperMaterial(standardValue(StandardAttributeKey.UPPER_MATERIAL) as UpperMaterial | '');
        setImages(listing.images.map((i) => i.url));
        setAttributes(
          listing.attributes
            .filter((attribute) => attribute.kind === 'CUSTOM')
            .map(({ key, value }) => ({ key, value }))
        );
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load'))
      .finally(() => setLoading(false));
  }, [id]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const standardAttributes: StandardAttribute[] = [];
    if (size)
      standardAttributes.push({
        kind: 'STANDARD',
        key: StandardAttributeKey.SIZE,
        value: size
      });
    if (color)
      standardAttributes.push({
        kind: 'STANDARD',
        key: StandardAttributeKey.COLOR,
        value: color
      });
    if (style)
      standardAttributes.push({
        kind: 'STANDARD',
        key: StandardAttributeKey.STYLE,
        value: style
      });
    if (upperMaterial)
      standardAttributes.push({
        kind: 'STANDARD',
        key: StandardAttributeKey.UPPER_MATERIAL,
        value: upperMaterial
      });
    const input: ListingInput = {
      title,
      description,
      priceCents: Math.round(Number(price) * 100),
      images: images.filter(Boolean),
      attributes: [
        ...standardAttributes,
        ...attributes
          .filter((attribute) => attribute.key && attribute.value)
          .map((attribute) => ({ kind: 'CUSTOM' as const, ...attribute }))
      ]
    };
    try {
      await api(`/listings${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(input)
      });
      navigate('/seller');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save');
      setSaving(false);
    }
  };
  if (loading) return <Loading />;
  return (
    <Card sx={{ maxWidth: 760, mx: 'auto' }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Stack component="form" spacing={3} onSubmit={submit}>
          <Typography variant="h3">{id ? 'Edit listing' : 'Create a shoe'}</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Name / title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            inputProps={{ maxLength: 120 }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            multiline
            minRows={5}
          />
          <TextField
            label="Price (CAD)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            inputProps={{ min: 0.01, step: 0.01 }}
          />
          <Divider />
          <Typography variant="h6">Shoe details</Typography>
          <Typography color="text.secondary">
            Standard details are optional and make the listing easier to filter.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              label="US size"
              value={size}
              onChange={(e) => setSize(e.target.value as ShoeSize | '')}
              slotProps={{ select: { native: true } }}
            >
              <option value="">Not specified</option>
              {Object.values(ShoeSize).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Primary color"
              value={color}
              onChange={(e) => setColor(e.target.value as ShoeColor | '')}
              slotProps={{ select: { native: true } }}
            >
              <option value="">Not specified</option>
              {Object.values(ShoeColor).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              label="Style"
              value={style}
              onChange={(e) => setStyle(e.target.value as ShoeStyle | '')}
              slotProps={{ select: { native: true } }}
            >
              <option value="">Not specified</option>
              {Object.values(ShoeStyle).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Upper material"
              value={upperMaterial}
              onChange={(e) => setUpperMaterial(e.target.value as UpperMaterial | '')}
              slotProps={{ select: { native: true } }}
            >
              <option value="">Not specified</option>
              {Object.values(UpperMaterial).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </TextField>
          </Stack>
          <Divider />
          <Typography variant="h6">Images</Typography>
          {images.map((image, index) => (
            <Stack key={index} direction="row">
              <TextField
                fullWidth
                label={`Image URL ${index + 1}`}
                type="url"
                value={image}
                onChange={(e) =>
                  setImages((all) => all.map((v, i) => (i === index ? e.target.value : v)))
                }
                required={index === 0}
              />
              <IconButton
                aria-label="Remove image"
                disabled={images.length === 1}
                onClick={() => setImages((all) => all.filter((_, i) => i !== index))}
              >
                <DeleteOutline />
              </IconButton>
            </Stack>
          ))}
          <Button
            startIcon={<Add />}
            onClick={() => setImages((all) => [...all, ''])}
            disabled={images.length >= 8}
          >
            Add image
          </Button>
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
                onChange={(e) =>
                  setAttributes((all) =>
                    all.map((a, i) => (i === index ? { ...a, key: e.target.value } : a))
                  )
                }
              />
              <TextField
                label="Value"
                value={attribute.value}
                onChange={(e) =>
                  setAttributes((all) =>
                    all.map((a, i) => (i === index ? { ...a, value: e.target.value } : a))
                  )
                }
              />
              <IconButton
                aria-label="Remove attribute"
                onClick={() => setAttributes((all) => all.filter((_, i) => i !== index))}
              >
                <DeleteOutline />
              </IconButton>
            </Stack>
          ))}
          <Button
            startIcon={<Add />}
            onClick={() => setAttributes((all) => [...all, { ...blank }])}
          >
            Add attribute
          </Button>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button onClick={() => navigate('/seller')}>Cancel</Button>
            <Button type="submit" variant="contained" size="large" disabled={saving}>
              {saving ? 'Saving…' : 'Save listing'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
