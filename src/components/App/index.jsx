import { useMemo } from 'react';
import { Provider } from 'react-redux';

import { ThemeProvider } from 'styled-components';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/styles';

import { store } from '@/redux';
import AppRouter from '@/routes';
import { getTheme } from '@/themes';

const App = () => {
  const { theme, GlobalStyle } = useMemo(
    () => getTheme('dark'),
    []
  );

  return (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <CssBaseline />
          <AppRouter />
        </ThemeProvider>
      </MuiThemeProvider>
    </Provider>
  );
};

export default App;
