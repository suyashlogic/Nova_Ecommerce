import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminProductForm from './AdminProductForm';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import NotFound from '../NotFound';

// Everything under /admin lives in this ONE file so App.jsx can load it lazily:
// shoppers never download the admin code, only admins who open /admin do.
// Paths here are relative to /admin.
export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
