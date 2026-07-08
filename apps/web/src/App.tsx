import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth';
import { Protected } from './components';
import { Layout } from './layout';
import { AuthPage } from './pages/AuthPage';
import { CartPage } from './pages/CartPage';
import { CatalogPage } from './pages/CatalogPage';
import { ListingFormPage } from './pages/ListingFormPage';
import { ListingPage } from './pages/ListingPage';
import { SellerPage } from './pages/SellerPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CatalogPage />} />
            <Route path="shoes/:id" element={<ListingPage />} />
            <Route path="login" element={<AuthPage />} />
            <Route path="register" element={<AuthPage register />} />
            <Route
              path="cart"
              element={
                <Protected role="BUYER">
                  <CartPage />
                </Protected>
              }
            />
            <Route
              path="seller"
              element={
                <Protected role="SELLER">
                  <SellerPage />
                </Protected>
              }
            />
            <Route
              path="seller/new"
              element={
                <Protected role="SELLER">
                  <ListingFormPage />
                </Protected>
              }
            />
            <Route
              path="seller/:id/edit"
              element={
                <Protected role="SELLER">
                  <ListingFormPage />
                </Protected>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
