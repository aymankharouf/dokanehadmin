import React from 'react';
import { App, Panel, View } from 'framework7-react';
import routes from './routes';
import Store from './data/Store';

const app = props => {
  const f7params = {
    id: 'io.framework7.harees',
    name: 'Harees',
    theme: 'ios', 
    routes,
  };

  return (
    <Store>
      <App params={f7params}>
        <Panel right reveal themeDark>
          <View url="/panel/"/>
        </Panel>
          <View id="main-view" url="/" main className="safe-areas"/>
      </App>
    </Store>
  );
}

export default app
