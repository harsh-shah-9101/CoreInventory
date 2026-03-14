import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ManagerDashboard from './components/ManagerDashboard';
import WarehouseDashboard from './components/WarehouseDashboard';

// Layout & Pages
import Layout from './components/Layout';
import Products from './pages/Products';
import StockByLocation from './pages/StockByLocation';
import ProductCategories from './pages/ProductCategories';
import ReorderingRules from './pages/ReorderingRules';
import Receipts from './pages/Receipts';
import DeliveryOrders from './pages/DeliveryOrders';
import InventoryAdjustment from './pages/InventoryAdjustment';
import MoveHistory from './pages/MoveHistory';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/"          element={<Navigate to="/login" replace />} />
          <Route path="/signup"    element={<Signup />} />
          <Route path="/login"     element={<Login />} />
          
          {/* Authenticated Routes wrapped in Layout */}
          <Route path="/manager"   element={<Layout><ManagerDashboard /></Layout>} />
          <Route path="/warehouse" element={<Layout><WarehouseDashboard /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          
          {/* Products */}
          <Route path="/products"            element={<Layout><Products /></Layout>} />
          <Route path="/products/stock"      element={<Layout><StockByLocation /></Layout>} />
          <Route path="/products/categories" element={<Layout><ProductCategories /></Layout>} />
          <Route path="/products/reorder"    element={<Layout><ReorderingRules /></Layout>} />
          
          {/* Operations */}
          <Route path="/operations/receipts"    element={<Layout><Receipts /></Layout>} />
          <Route path="/operations/deliveries" element={<Layout><DeliveryOrders /></Layout>} />
          <Route path="/operations/adjustments" element={<Layout><InventoryAdjustment /></Layout>} />
          <Route path="/operations/history"     element={<Layout><MoveHistory /></Layout>} />
          
          {/* Settings & Profile */}
          <Route path="/settings/warehouse" element={<Layout><Settings /></Layout>} />
          <Route path="/profile"            element={<Layout><Profile /></Layout>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
