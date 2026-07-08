import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { Link } from 'react-router-dom';
import type { Cart, Order } from '@shoe/shared';
import { api } from '../api';
import { Empty, ErrorAlert, Loading, money } from '../components';

export function CartPage() {
  const [cart, setCart] = useState<Cart>();
  const [order, setOrder] = useState<Order>();
  const [error, setError] = useState<unknown>();
  const [checkingOut, setCheckingOut] = useState(false);
  const load = () =>
    api<{ cart: Cart }>('/cart')
      .then((r) => setCart(r.cart))
      .catch(setError);
  useEffect(() => {
    void load();
  }, []);
  const update = async (id: string, quantity?: number) => {
    const response = await api<{ cart: Cart }>(
      `/cart/items/${id}`,
      quantity ? { method: 'PATCH', body: JSON.stringify({ quantity }) } : { method: 'DELETE' }
    );
    setCart(response.cart);
  };
  const checkout = async () => {
    setCheckingOut(true);
    try {
      const response = await api<{ order: Order }>('/orders/checkout', { method: 'POST' });
      setOrder(response.order);
      setCart({ items: [], totalCents: 0 });
    } catch (e) {
      setError(e);
    } finally {
      setCheckingOut(false);
    }
  };
  if (error) return <ErrorAlert error={error} />;
  if (!cart) return <Loading />;
  if (order)
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
        <Alert severity="success">Your mock payment was successful.</Alert>
        <Typography variant="h3">Order confirmed</Typography>
        <Typography>Order {order.id}</Typography>
        <Typography variant="h5">Total: {money(order.totalCents)}</Typography>
        <Button component={Link} to="/" variant="contained">
          Keep browsing
        </Button>
      </Stack>
    );
  if (!cart.items.length)
    return <Empty title="Your cart is empty" action="Browse custom shoes" to="/" />;
  return (
    <Stack spacing={3}>
      <Typography variant="h3">Your cart</Typography>
      {cart.items.map((item) => (
        <Card key={item.id}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <img
                src={item.listing.images[0]?.url}
                width="100"
                height="90"
                style={{ objectFit: 'cover', borderRadius: 8 }}
              />
              <Stack flexGrow={1}>
                <Typography variant="h6">{item.listing.title}</Typography>
                <Typography>{money(item.listing.priceCents)}</Typography>
              </Stack>
              <Select
                size="small"
                value={item.quantity}
                onChange={(e) => void update(item.id, Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
              <IconButton aria-label="Remove item" onClick={() => void update(item.id)}>
                <DeleteOutline />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      ))}
      <Divider />
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">Total</Typography>
        <Typography variant="h5" fontWeight={800}>
          {money(cart.totalCents)}
        </Typography>
      </Stack>
      <Typography color="text.secondary">
        This is a demonstration checkout. No payment information is collected.
      </Typography>
      <Button
        variant="contained"
        size="large"
        disabled={checkingOut}
        onClick={() => void checkout()}
      >
        {checkingOut ? 'Completing order…' : 'Complete mock checkout'}
      </Button>
    </Stack>
  );
}
