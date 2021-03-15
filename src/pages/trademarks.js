import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, Fab, Icon } from 'framework7-react'
import Footer from './footer'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const Trademarks = () => {
  const { state } = useContext(StoreContext)
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
      <Footer/>
    </Page>
  )
}

export default Trademarks
