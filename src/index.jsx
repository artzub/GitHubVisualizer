import React from 'react';
import App from '@/components/App';
// import * as PIXI from 'pixijs';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';

// PIXI.settings.ROUND_PIXELS = true;

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
