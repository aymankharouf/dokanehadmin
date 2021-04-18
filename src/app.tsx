import { App, Panel, View } from 'framework7-react'
import routes from './routes'
import StateProvider from './data/state-provider'

const f7params = {
  id: 'io.framework7.dokaneh', 
  name: 'Dokkaneh', 
  theme: 'ios',
  routes,
}
const app = () => {
  return (
    <StateProvider>
      <App {...f7params}>
        <Panel right reveal themeDark>
          <View url="/panel/"/>
        </Panel>
        <View id="main-view" url="/" main className="safe-areas" browserHistory={true}/>
      </App>
    </StateProvider>
  )
}

export default app