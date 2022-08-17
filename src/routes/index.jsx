import { Routes, Route } from 'react-router-dom';

import Layout from '@/components/Layout';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="*" element={<Layout />} />
    </Routes>
  );
};

export default AppRouter;
