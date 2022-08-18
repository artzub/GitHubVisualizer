import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Layout from '@/components/Layout';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
