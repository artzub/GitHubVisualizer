import { Fragment, useState } from 'react';
import { useLocalStorage } from 'react-use';

import styled from 'styled-components';

import { Box, Button, TextField, Link } from '@mui/material';
import useEventCallback from '@mui/material/utils/useEventCallback';

import GithubIcon from 'mdi-react/GithubIcon';
import OpenInNewIconOrigin from 'mdi-react/OpenInNewIcon';

import Group from '@/components/Settings/Collection/Group';
import RouteModal from '@/shared/components/RouteModal';
import { appNameVersion } from '@/shared/utils';

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OpenInNewIcon = styled(OpenInNewIconOrigin)`
  margin-top: -4px;
`;

const GenerateButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Row = styled(Box)`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Space = styled.div`
  flex: 1;
`;

const title = (
  <Title>
    <GithubIcon />
    <span>GitHub Connection</span>
  </Title>
);

const queryParams = new URLSearchParams(
  `description=${appNameVersion}&scopes=repo,read:user,user:email`,
);
const linkToGithub = `https://github.com/settings/tokens/new?${queryParams}`;

const Form = () => {
  const [token, setToken, removeToken] = useLocalStorage('githubToken', '', {
    raw: true,
  });
  const [newToken, setNewToken] = useState(token);

  const onChange = useEventCallback((event) => {
    setNewToken(event.target.value);
  });

  const onSave = useEventCallback(() => {
    if (newToken) {
      setToken(newToken);
    }
  });

  const onClear = useEventCallback(() => {
    removeToken();
    setNewToken('');
  });

  return (
    <Fragment>
      <Row>
        <TextField
          label="GitHub token"
          placeholder="Insert your GitHub token"
          onChange={onChange}
          value={newToken}
          autoComplete="off"
        />
        <GenerateButton
          component={Link}
          href={linkToGithub}
          target="_blank"
        >
          <span>Generate</span>
          <OpenInNewIcon size={16} />
        </GenerateButton>
      </Row>
      <Row>
        <Button
          variant="contained"
          disabled={!newToken || newToken === token}
          onClick={onSave}
        >
          Save
        </Button>
        <Space />
        <Button
          onClick={onClear}
          disabled={!token}
        >
          Clear
        </Button>
      </Row>
    </Fragment>
  );
};

const items = [
  {
    key: 'token',
    body: <Form />,
    sx: {
      paddingTop: '20px',
      flexDirection: 'column',
      gap: '10px',
      alignItems: 'flex-start',
    },
    $isInteractive: false,
  },
];

const GitHub = (props) => (
  <RouteModal {...props}>
    <Group
      title={title}
      items={items}
    />
  </RouteModal>
);

export default GitHub;
