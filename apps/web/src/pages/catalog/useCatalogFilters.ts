import { useReducer } from 'react';
import type { CatalogFilterState, CatalogFilterValues, StandardFilter } from './types';
import { filterLabels } from './types';

type Action =
  | { type: 'set'; field: keyof CatalogFilterValues; value: string }
  | { type: 'add-standard'; filter: StandardFilter }
  | { type: 'remove-standard'; filter: StandardFilter }
  | { type: 'add-custom' }
  | { type: 'update-custom'; id: number; field: 'key' | 'value'; value: string }
  | { type: 'remove-custom'; id: number };

const initialState: CatalogFilterState = {
  values: {
    search: '',
    minPrice: '',
    maxPrice: '',
    seller: '',
    size: '',
    color: '',
    style: '',
    upperMaterial: ''
  },
  active: [],
  custom: [],
  nextCustomId: 1
};

const fieldsByFilter: Record<StandardFilter, Array<keyof CatalogFilterValues>> = {
  price: ['minPrice', 'maxPrice'],
  seller: ['seller'],
  size: ['size'],
  color: ['color'],
  style: ['style'],
  upperMaterial: ['upperMaterial']
};

function reducer(state: CatalogFilterState, action: Action): CatalogFilterState {
  if (action.type === 'set')
    return { ...state, values: { ...state.values, [action.field]: action.value } };
  if (action.type === 'add-standard') {
    return state.active.includes(action.filter)
      ? state
      : { ...state, active: [...state.active, action.filter] };
  }
  if (action.type === 'remove-standard') {
    const values = { ...state.values };
    fieldsByFilter[action.filter].forEach((field) => {
      values[field] = '';
    });
    return { ...state, values, active: state.active.filter((filter) => filter !== action.filter) };
  }
  if (action.type === 'add-custom') {
    return {
      ...state,
      custom: [...state.custom, { id: state.nextCustomId, key: '', value: '' }],
      nextCustomId: state.nextCustomId + 1
    };
  }
  if (action.type === 'update-custom') {
    return {
      ...state,
      custom: state.custom.map((filter) =>
        filter.id === action.id ? { ...filter, [action.field]: action.value } : filter
      )
    };
  }
  return { ...state, custom: state.custom.filter((filter) => filter.id !== action.id) };
}

function toQueryString(state: CatalogFilterState) {
  const params = new URLSearchParams();
  const { values } = state;
  if (values.search) params.set('search', values.search);
  if (values.minPrice) params.set('minPrice', String(Math.round(Number(values.minPrice) * 100)));
  if (values.maxPrice) params.set('maxPrice', String(Math.round(Number(values.maxPrice) * 100)));
  (['seller', 'size', 'color', 'style', 'upperMaterial'] as const).forEach((field) => {
    if (values[field]) params.set(field, values[field]);
  });
  state.custom.forEach((filter) => {
    if (filter.key.trim() && filter.value.trim())
      params.append(`attr.${filter.key.trim()}`, filter.value.trim());
  });
  return params.toString();
}

export function useCatalogFilters() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return {
    state,
    available: (Object.keys(filterLabels) as StandardFilter[]).filter(
      (filter) => !state.active.includes(filter)
    ),
    setValue: (field: keyof CatalogFilterValues, value: string) =>
      dispatch({ type: 'set', field, value }),
    addStandard: (filter: StandardFilter) => dispatch({ type: 'add-standard', filter }),
    removeStandard: (filter: StandardFilter) => dispatch({ type: 'remove-standard', filter }),
    addCustom: () => dispatch({ type: 'add-custom' }),
    updateCustom: (id: number, field: 'key' | 'value', value: string) =>
      dispatch({ type: 'update-custom', id, field, value }),
    removeCustom: (id: number) => dispatch({ type: 'remove-custom', id }),
    toQueryString: () => toQueryString(state)
  };
}

export type CatalogFiltersController = ReturnType<typeof useCatalogFilters>;
