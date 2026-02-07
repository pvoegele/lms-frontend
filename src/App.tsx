import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReceiveStock from './pages/ReceiveStock';
import ShipStock from './pages/ShipStock';
import StockLookup from './pages/StockLookup';
import AdminDashboard from './pages/admin/AdminDashboard';
import WarehouseAdmin from './pages/admin/WarehouseAdmin';
import StorageLocationAdmin from './pages/admin/StorageLocationAdmin';
import ProductAdmin from './pages/admin/ProductAdmin';
import UOMAdmin from './pages/admin/UOMAdmin';
import { Toaster } from '@/components/ui/sonner';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/receive" element={<ReceiveStock />} />
            <Route path="/ship" element={<ShipStock />} />
            <Route path="/lookup" element={<StockLookup />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/warehouses" element={<WarehouseAdmin />} />
            <Route path="/admin/locations" element={<StorageLocationAdmin />} />
            <Route path="/admin/products" element={<ProductAdmin />} />
            <Route path="/admin/uoms" element={<UOMAdmin />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
