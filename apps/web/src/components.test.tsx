import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ShoeColor, StandardAttributeKey } from '@shoe/shared';
import { ListingCard, money } from './components';
describe('presentation helpers', () => {
  it('formats cents as Canadian currency', () => expect(money(12999)).toContain('129.99'));
  it('renders listing information', () => {
    render(
      <MemoryRouter>
        <ListingCard
          listing={{
            id: '1',
            sellerId: 's',
            title: 'Painted High Tops',
            description: 'Custom',
            priceCents: 12000,
            createdAt: '',
            updatedAt: '',
            seller: { id: 's', name: 'Studio' },
            images: [{ url: 'https://example.com/shoe.jpg' }],
            attributes: [
              { kind: 'STANDARD', key: StandardAttributeKey.COLOR, value: ShoeColor.BLUE }
            ]
          }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText('Painted High Tops')).toBeInTheDocument();
    expect(screen.getByText('by Studio')).toBeInTheDocument();
  });
});
