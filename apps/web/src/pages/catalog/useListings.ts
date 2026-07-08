import { useCallback, useState } from 'react';
import type { Listing } from '@shoe/shared';
import { api } from '../../api';

export function useListings() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const search = useCallback(async (query: string) => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await api<{ listings: Listing[] }>(`/listings?${query}`);
      setItems(data.listings);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);
  return { items, loading, error, search };
}
