import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Fab, Icon, Toolbar } from 'framework7-react'
import Footer from './footer'
import { StateContext } from '../data/state-provider'
import labels from '../data/labels'


const Trademarks = () => {
  const { state } = useContext(StateContext)
  const [trademarks, setTrademarks] = useState(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  useEffect(() => {
    setTrademarks(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1))
  }, [state.trademarks])
  let i = 0
  return (
    <Page>
      <Navbar title={labels.trademarks} backLink={labels.back} />
      <Block>
        <List>
          {trademarks.length === 0 ? 
            <ListItem title={labels.noData} />
          : trademarks.map(t =>
              <ListItem
                link={`/edit-trademark/${t.id}`}
                title={t.name} 
                key={i++}
              />
            )
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-trademark/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Trademarks
