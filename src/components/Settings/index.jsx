import { Fragment } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';

import ListItemAvatar from '@mui/material/ListItemAvatar';

import GithubIcon from 'mdi-react/GithubIcon';
import GitIcon from 'mdi-react/GitIcon';
import GitlabIcon from 'mdi-react/GitlabIcon';

import { Services } from '@/models/Services';

import NavLink from '@/shared/components/NavLink';

import Collection from './Collection';
import GitHub from './Connection/GitHub';

const sxStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
};
const getConnectionItem = ({ key, title, icon, ...tail }) => ({
  key,
  title,
  alignItems: 'center',
  body: <ListItemAvatar sx={sxStyle}>{icon}</ListItemAvatar>,
  component: NavLink,
  to: `./connection/${key}`,
  tabIndex: 0,
  primary: title,
  ...tail,
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
        key: Services.Github,
        title: 'GitHub',
        icon: <GithubIcon />,
      }),
      getConnectionItem({
        key: Services.Gitlab,
        title: 'GitLab',
        icon: <GitlabIcon />,
        disabled: true,
      }),
      getConnectionItem({
        key: Services.Bitbucket,
        title: 'Bitbucket',
        icon: <GitIcon />,
        disabled: true,
      }),
    ],
  },
];

const Body = () => {
  return (
    <Fragment>
      <Collection items={items} />

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
          element={<GitHub parent="../.." />}
        />
        <Route path="*" />
      </Route>
    </Routes>
  );
};

export default Settings;
