import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShoeColor, StandardAttributeKey } from '@shoe/shared';
import { useListingForm } from './useListingForm';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useListingForm', () => {
  it('converts form state into the listing mutation contract', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ listing: {} })
    });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useListingForm());

    act(() => {
      result.current.setField('title', 'Painted Runner');
      result.current.setField('description', 'A detailed hand-painted custom running shoe.');
      result.current.setField('price', '125.50');
      result.current.setField('color', ShoeColor.BLUE);
      result.current.images.update(0, 'https://example.com/shoe.jpg');
      result.current.attributes.update(0, 'key', 'Technique');
      result.current.attributes.update(0, 'value', 'Hand painted');
    });
    await act(async () => {
      expect(await result.current.save()).toBe(true);
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(request.body as string);
    expect(body).toMatchObject({
      title: 'Painted Runner',
      priceCents: 12550,
      images: ['https://example.com/shoe.jpg']
    });
    expect(body.attributes).toContainEqual({
      kind: 'STANDARD',
      key: StandardAttributeKey.COLOR,
      value: ShoeColor.BLUE
    });
    expect(body.attributes).toContainEqual({
      kind: 'CUSTOM',
      key: 'Technique',
      value: 'Hand painted'
    });
  });
});
