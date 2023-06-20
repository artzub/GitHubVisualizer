import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import SelectOrigin from '@mui/material/Select';
import useEventCallback from '@mui/material/utils/useEventCallback';

import GithubIcon from 'mdi-react/GithubIcon';
import GitIcon from 'mdi-react/GitIcon';
import GitlabIcon from 'mdi-react/GitlabIcon';

import { Services } from '@/models/Services';

import { useRouteMatches } from '@/shared/hooks/useRouteMatches';

import Item from './Item';

const Select = styled(SelectOrigin)`
  .MuiInput-input {
    display: flex;
    align-items: center;
  }

  :before,
  :after {
    content: none;
  }

  :hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Placeholder = styled.div`
  font-size: 12px;
  color: #999;
  font-style: italic;
  display: flex;
  align-items: center;
`;

const servicesMock = [
  {
    key: Services.Github,
    title: 'GitHub',
    icon: <GithubIcon />,
  },
  {
    key: Services.Gitlab,
    title: 'GitLab',
    icon: <GitlabIcon />,
    disabled: true,
  },
  {
    key: Services.Bitbucket,
    title: 'Bitbucket',
    icon: <GitIcon />,
    disabled: true,
  },
];

const placeholder = <Placeholder>Select a git service</Placeholder>;

const ServiceSelector = () => {
  const { service: currentService } = useRouteMatches();
  const navigate = useNavigate();
  const [value, setValue] = useState(currentService || '');

  useEffect(
    () => {
      setValue(currentService || '');
    },
    [currentService],
  );

  const services = useMemo(
    () => {
      servicesMock.forEach((service) => {
        service.value = service.key;
        servicesMock[service.key] = service;
      });
      return servicesMock;
    },
    [servicesMock],
  );

  const renderValue = useCallback(
    () => {
      if (!value) {
        document.title = 'VisGit';
        return placeholder;
      }

      const service = services[value];

      if (!service) {
        return value;
      }

      document.title = `VisGit ${service.title}`;

      return (
        <Item
          {...service}
          asValue
        />
      );
    },
    [value],
  );

  const onChange = useEventCallback((event) => {
    const { target: { value: newValue } } = event;

    setValue(newValue ?? '');

    if (newValue) {
      navigate(`/${newValue}`);
    }
  });

  return (
    <Select
      displayEmpty
      renderValue={renderValue}
      value={value}
      variant="standard"
      onChange={onChange}
    >
      {services.map(Item)}
    </Select>
  );
};

export default ServiceSelector;
