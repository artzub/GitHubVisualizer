import React from 'react';
import Header from '@/components/Header';
import Main from '@/components/Main';
import Progress from "@/components/Progress";

const Layout = () => (
  <React.Fragment>
    <Progress />
    <Header />
    <Main />
  </React.Fragment>
);

export default Layout;
