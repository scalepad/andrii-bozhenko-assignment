import { useEffect, useState } from 'react';
import {
  StandardAttributeKey,
  type Listing,
  type ListingInput,
  type ShoeColor,
  type ShoeSize,
  type ShoeStyle,
  type StandardAttribute,
  type UpperMaterial
} from '@shoe/shared';
import { api } from '../../api';
import type { CustomAttributeDraft, ListingFormState } from './types';

const blankAttribute = (): CustomAttributeDraft => ({ key: '', value: '' });
const initialState = (loading: boolean): ListingFormState => ({
  title: '',
  description: '',
  price: '',
  size: '',
  color: '',
  style: '',
  upperMaterial: '',
  images: [''],
  attributes: [blankAttribute()],
  loading,
  saving: false,
  error: ''
});

function stateFromListing(listing: Listing): ListingFormState {
  const standardValue = (key: StandardAttributeKey) =>
    listing.attributes.find((attribute) => attribute.kind === 'STANDARD' && attribute.key === key)
      ?.value ?? '';
  return {
    title: listing.title,
    description: listing.description,
    price: String(listing.priceCents / 100),
    size: standardValue(StandardAttributeKey.SIZE) as ShoeSize | '',
    color: standardValue(StandardAttributeKey.COLOR) as ShoeColor | '',
    style: standardValue(StandardAttributeKey.STYLE) as ShoeStyle | '',
    upperMaterial: standardValue(StandardAttributeKey.UPPER_MATERIAL) as UpperMaterial | '',
    images: listing.images.map((image) => image.url),
    attributes: listing.attributes
      .filter((attribute) => attribute.kind === 'CUSTOM')
      .map(({ key, value }) => ({ key, value })),
    loading: false,
    saving: false,
    error: ''
  };
}

function toInput(state: ListingFormState): ListingInput {
  const standard: StandardAttribute[] = [];
  if (state.size)
    standard.push({ kind: 'STANDARD', key: StandardAttributeKey.SIZE, value: state.size });
  if (state.color)
    standard.push({ kind: 'STANDARD', key: StandardAttributeKey.COLOR, value: state.color });
  if (state.style)
    standard.push({ kind: 'STANDARD', key: StandardAttributeKey.STYLE, value: state.style });
  if (state.upperMaterial)
    standard.push({
      kind: 'STANDARD',
      key: StandardAttributeKey.UPPER_MATERIAL,
      value: state.upperMaterial
    });
  return {
    title: state.title,
    description: state.description,
    priceCents: Math.round(Number(state.price) * 100),
    images: state.images.filter(Boolean),
    attributes: [
      ...standard,
      ...state.attributes
        .filter(({ key, value }) => key && value)
        .map((attribute) => ({ kind: 'CUSTOM' as const, ...attribute }))
    ]
  };
}

export function useListingForm(id?: string) {
  const [state, setState] = useState(() => initialState(Boolean(id)));
  useEffect(() => {
    if (!id) return;
    api<{ listing: Listing }>(`/listings/${id}`)
      .then(({ listing }) => setState(stateFromListing(listing)))
      .catch((error) =>
        setState((current) => ({
          ...current,
          loading: false,
          error: error instanceof Error ? error.message : 'Unable to load'
        }))
      );
  }, [id]);
  const setField = <K extends keyof ListingFormState>(field: K, value: ListingFormState[K]) =>
    setState((current) => ({ ...current, [field]: value }));
  const save = async () => {
    setState((current) => ({ ...current, saving: true, error: '' }));
    try {
      await api(`/listings${id ? `/${id}` : ''}`, {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(toInput(state))
      });
      return true;
    } catch (error) {
      setState((current) => ({
        ...current,
        saving: false,
        error: error instanceof Error ? error.message : 'Unable to save'
      }));
      return false;
    }
  };
  return {
    state,
    setField,
    save,
    images: {
      update: (index: number, value: string) =>
        setState((current) => ({
          ...current,
          images: current.images.map((image, itemIndex) => (itemIndex === index ? value : image))
        })),
      add: () => setState((current) => ({ ...current, images: [...current.images, ''] })),
      remove: (index: number) =>
        setState((current) => ({
          ...current,
          images: current.images.filter((_, itemIndex) => itemIndex !== index)
        }))
    },
    attributes: {
      update: (index: number, field: keyof CustomAttributeDraft, value: string) =>
        setState((current) => ({
          ...current,
          attributes: current.attributes.map((attribute, itemIndex) =>
            itemIndex === index ? { ...attribute, [field]: value } : attribute
          )
        })),
      add: () =>
        setState((current) => ({
          ...current,
          attributes: [...current.attributes, blankAttribute()]
        })),
      remove: (index: number) =>
        setState((current) => ({
          ...current,
          attributes: current.attributes.filter((_, itemIndex) => itemIndex !== index)
        }))
    }
  };
}
