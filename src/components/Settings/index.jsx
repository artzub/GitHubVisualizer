import { Fragment } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';

import ListItemAvatar from '@mui/material/ListItemAvatar';

import GithubIcon from 'mdi-react/GithubIcon';
import GitIcon from 'mdi-react/GitIcon';
import GitlabIcon from 'mdi-react/GitlabIcon';

import NavLink from '@/shared/components/NavLink';

import Collection from './Collection';
import GitHub from './Connection/GitHub';

const sxStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
};
const getConnectionItem = ({ key, title, icon }) => ({
  key,
  title,
  alignItems: 'center',
  body: <ListItemAvatar sx={sxStyle}>{icon}</ListItemAvatar>,
  component: NavLink,
  to: `./connection/${key}`,
  tabIndex: 0,
  primary: title,
});

const items = [
  {
    title: 'General',
    items: [],
  },
  {
    title: 'API Connections',
    items: [
      getConnectionItem({
        key: 'github',
        title: 'GitHub',
        icon: <GithubIcon />,
      }),
      getConnectionItem({
        key: 'gitlab',
        title: 'GitLab',
        icon: <GitlabIcon />,
      }),
      getConnectionItem({
        key: 'bitbucket',
        title: 'Bitbucket',
        icon: <GitIcon />,
      }),
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
          path="connection/github"
          element={<GitHub path="." />}
        />
        <Route path="*" />
      </Route>
    </Routes>
  );
};

export default Settings;
