import 'typeface-roboto';

import React from 'react';
import AppRouter from '@/routes';
import { getTheme } from '@/themes';
import CssBaseline from '@material-ui/core/CssBaseline';
import { StylesProvider, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';

const App = () => {
  const { theme, GlobalStyle } = getTheme('dark');

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <CssBaseline />
          <AppRouter />
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  );
};

export default App;
