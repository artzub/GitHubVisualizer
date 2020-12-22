import { createGlobalStyle } from 'styled-components';
import light from './light';
import dark from './dark';
import { createMuiTheme } from '@material-ui/core/styles';

const themes = {};
export const addTheme = (name, theme) => {
  themes[name] = theme;
};

addTheme(light.name, light);
addTheme(dark.name, dark);

export const getTheme = (name) => {
  const theme = createMuiTheme(themes[name] || themes.dark);

  const GlobalStyle = createGlobalStyle`
    html,
    body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    //body {
    //  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    //    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    //    sans-serif;
    //  -webkit-font-smoothing: antialiased;
    //  -moz-osx-font-smoothing: grayscale;
    //}
    //
    //code {
    //  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    //}
  `;

  return {
    theme,
    GlobalStyle,
  };
};
