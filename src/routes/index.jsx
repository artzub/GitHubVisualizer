import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import Layout from '@/components/Layout';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" render={Layout} />
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
