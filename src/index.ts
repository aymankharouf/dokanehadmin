import {createElement} from 'react'

// Import ReactDOM
import ReactDOM from 'react-dom';

// Import F7 Bundle
import Framework7 from 'framework7/lite-bundle';

// Import F7-React Plugin
import Framework7React from 'framework7-react';

// Import Framework7 Styles
import 'framework7/framework7-bundle-rtl.css';

// Icons
import './css/icons.css'

// // Custom app styles
import './css/app.css'

import App from './app';

// Init F7-React Plugin
Framework7.use(Framework7React);

ReactDOM.render(
  createElement(App),
  document.getElementById('app')
)
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.register()