export type StandardFilter = 'price' | 'seller' | 'size' | 'color' | 'style' | 'upperMaterial';

export interface CustomFilter {
  id: number;
  key: string;
  value: string;
}

export interface CatalogFilterValues {
  search: string;
  minPrice: string;
  maxPrice: string;
  seller: string;
  size: string;
  color: string;
  style: string;
  upperMaterial: string;
}

export interface CatalogFilterState {
  values: CatalogFilterValues;
  active: StandardFilter[];
  custom: CustomFilter[];
  nextCustomId: number;
}

export const filterLabels: Record<StandardFilter, string> = {
  price: 'Price',
  seller: 'Seller',
  size: 'Size',
  color: 'Color',
  style: 'Style',
  upperMaterial: 'Upper material'
};
