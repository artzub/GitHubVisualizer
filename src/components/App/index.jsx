import 'typeface-roboto';

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { StylesProvider, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { getTheme } from '@/themes';
import AppRouter from '@/routes';

const App = () => {
  const { theme, GlobalStyle } = getTheme('light');

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <GlobalStyle />
          <AppRouter />
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  );
};

export default App;
