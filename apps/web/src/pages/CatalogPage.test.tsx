import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AttributeFilter, CatalogPage } from './CatalogPage';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('catalog filters', () => {
  it('keeps the label clear of the native select value', () => {
    render(<AttributeFilter label="Size" value="" options={['9', '10']} onChange={vi.fn()} />);

    expect(document.querySelector('label')).toHaveAttribute('data-shrink', 'true');
    expect(screen.getByRole('combobox', { name: 'Size' })).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Any' })).toBeInTheDocument();
  });

  it('offers unused standard filters and allows repeated custom filters', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ listings: [] })
      })
    );
    render(<CatalogPage />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add filter' }));
    expect(screen.getByRole('menuitem', { name: 'Seller' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Size' }));
    expect(screen.getByRole('combobox', { name: 'Size' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add filter' }));
    expect(screen.queryByRole('menuitem', { name: 'Size' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom attribute' }));

    fireEvent.click(screen.getByRole('button', { name: 'Add filter' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom attribute' }));
    expect(screen.getAllByLabelText('Attribute')).toHaveLength(2);
  });
});
