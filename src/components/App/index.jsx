import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { ThemeProvider } from 'styled-components';

import CssBaseline from '@material-ui/core/CssBaseline';
import { StylesProvider, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import { store } from '@/redux';
import AppRouter from '@/routes';
import { getTheme } from '@/themes';

const App = () => {
  const { theme, GlobalStyle } = getTheme('dark');

  return (
    <Provider store={store}>
      <BrowserRouter>
        <StylesProvider injectFirst>
          <MuiThemeProvider theme={theme}>
            <ThemeProvider theme={theme}>
              <GlobalStyle />
              <CssBaseline />
              <AppRouter />
            </ThemeProvider>
          </MuiThemeProvider>
        </StylesProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
