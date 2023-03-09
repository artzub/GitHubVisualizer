import { useLocation } from 'react-router-dom';

import styled from 'styled-components';

import IconButton from '@mui/material/IconButton';

import GearIcon from 'mdi-react/GearIcon';

import NavLinkOrigin from '@/shared/components/NavLink';

import ServiceSelector from './ServiceSelector';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  padding: 0 10px;
  height: 40px;
`;

const Space = styled.div`
  flex: 1 1 auto;
`;

const NavLink = styled(NavLinkOrigin)`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const Menu = () => {
  const { pathname } = useLocation();

  return (
    <Container>
      <span>Visualization</span>
      <ServiceSelector />
      <Space />
      <IconButton
        component={NavLink}
        to="/settings"
        title="Settings"
        state={{ from: pathname }}
      >
        <GearIcon size={16} />
      </IconButton>
    </Container>
  );
};

export default Menu;
