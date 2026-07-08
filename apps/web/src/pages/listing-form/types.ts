import type { ShoeColor, ShoeSize, ShoeStyle, UpperMaterial } from '@shoe/shared';

export interface CustomAttributeDraft {
  key: string;
  value: string;
}

export interface ListingFormState {
  title: string;
  description: string;
  price: string;
  size: ShoeSize | '';
  color: ShoeColor | '';
  style: ShoeStyle | '';
  upperMaterial: UpperMaterial | '';
  images: string[];
  attributes: CustomAttributeDraft[];
  loading: boolean;
  saving: boolean;
  error: string;
}

export type SetListingField = <K extends keyof ListingFormState>(
  field: K,
  value: ListingFormState[K]
) => void;
