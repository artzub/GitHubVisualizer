import { Fragment } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';

import ListItemAvatar from '@mui/material/ListItemAvatar';

import GithubIcon from 'mdi-react/GithubIcon';

import NavLink from '@/shared/components/NavLink';

import Auth from './Auth';
import { Collection } from './Collection';

const items = [
  {
    title: 'General',
    items: [],
  },
  {
    title: 'API Connections',
    items: [
      {
        key: 'github',
        title: 'GitHub',
        alignItems: 'center',
        body: (
          <ListItemAvatar
            sx={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <GithubIcon />
          </ListItemAvatar>
        ),
        component: NavLink,
        to: './auth/github',
        tabIndex: 0,
        primary: 'GitHub',
      },
    ],
  },
];

const Body = () => {
  return (
    <Fragment>
      <Collection
        items={items}
        path="."
      />

      <Outlet />
    </Fragment>
  );
};

const Settings = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Body />}
      >
        <Route
          path="auth/*"
          element={<Auth path="." />}
        />
      </Route>
    </Routes>
  );
};

export default Settings;
