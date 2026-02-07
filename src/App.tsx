import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ReceiveStock from './pages/ReceiveStock';
import ShipStock from './pages/ShipStock';
import StockLookup from './pages/StockLookup';
import Products from './pages/Products';
import StockDocuments from './pages/StockDocuments';
import Warehouses from './pages/Warehouses';
import StorageLocations from './pages/StorageLocations';
import UnitsOfMeasure from './pages/UnitsOfMeasure';
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
            <Route path="/products" element={<Products />} />
            <Route path="/documents" element={<StockDocuments />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/locations" element={<StorageLocations />} />
            <Route path="/uoms" element={<UnitsOfMeasure />} />
            <Route path="/receive" element={<ReceiveStock />} />
            <Route path="/ship" element={<ShipStock />} />
            <Route path="/lookup" element={<StockLookup />} />
          </Routes>
        </Layout>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
