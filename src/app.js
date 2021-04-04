import { App, Panel, View } from 'framework7-react'
import routes from './routes'
import Store from './data/store'

const f7params = {
  id: 'io.framework7.dokaneh', 
  name: 'Dokkaneh', 
  theme: 'ios',
  routes,
}
const app = () => {
  return (
    <Store>
      <App {...f7params}>
        <Panel right reveal themeDark>
          <View url="/panel/"/>
        </Panel>
        <View id="main-view" url="/" main className="safe-areas" browserHistory={true}/>
      </App>
    </Store>
  )
}

export default app