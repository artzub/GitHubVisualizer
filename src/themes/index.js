import { createGlobalStyle } from 'styled-components';

import { createTheme } from '@mui/material/styles';

import dark from './dark';
import light from './light';

const themes = {};
export const addTheme = (name, theme) => {
  themes[name] = theme;
};

addTheme(light.name, light);
addTheme(dark.name, dark);

const GlobalStyle = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    font-size: 14px;
  }

  *:not(#id_fake_for_hack) {
    -webkit-font-feature-settings: "liga" on, "calt" on;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    font-family: 'JetBrains Mono', monospace;
  }

  button:not(#id_fake_for_hack) {
    outline: 0;
  }

  .hovered {
    cursor: pointer;
  }

  .draggable {
    cursor: grab;
  }

  .dragging {
    cursor: grabbing;
  }

  [disabled] {
    pointer-events: none;
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

export const getTheme = (name) => {
  const theme = createTheme(themes[name] || themes.dark);

  return {
    theme,
    GlobalStyle,
  };
};
