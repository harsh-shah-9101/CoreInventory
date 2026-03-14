import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ManagerDashboard from './components/ManagerDashboard';
import WarehouseDashboard from './components/WarehouseDashboard';
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/"          element={<Navigate to="/login" replace />} />
          <Route path="/signup"    element={<Signup />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/manager"   element={<ManagerDashboard />} />
          <Route path="/warehouse" element={<WarehouseDashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
