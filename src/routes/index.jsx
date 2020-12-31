import React from 'react';
import Layout from '@/components/Layout';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" render={() => <Layout />} />
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
