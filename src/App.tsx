// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ServiceWeekForm from './pages/ServiceWeekForm';
import { ServiceWeekLayout } from './component/Layout/ServiceWeekLayout';
import ServiceWeekPage from './pages/ServiceWeekPage';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to service week page */}
        <Route path="/" element={<Navigate to="/staff/service-week" replace />} />
        
        {/* Layout Wrapped Routes */}
        <Route element={<ServiceWeekLayout />}>
          <Route path="/staff/service-week" element={<ServiceWeekPage />} />
          <Route path="/staff/service-week/new" element={<ServiceWeekForm />} />
          <Route path="/staff/service-week/:id/edit" element={<ServiceWeekForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;