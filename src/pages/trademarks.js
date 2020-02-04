import React, { useContext, useState, useEffect } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const Trademarks = props => {
  const { state } = useContext(StoreContext)
  const [trademarks, setTrademarks] = useState([])
  useEffect(() => {
    setTrademarks(() => {
      const trademarks = state.lookups.find(l => l.id === 't')?.values || []
      return trademarks.sort((t1, t2) => t1 > t2 ? 1 : -1)
    })
  }, [state.lookups])
  let i = 0
  return (
    <Page>
      <Navbar title={labels.trademarks} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-trademark/">
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List>
          {trademarks.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : trademarks.map(t =>
              <ListItem 
                link={`/edit-trademark/${t}`}
                title={t} 
                key={i++} 
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Trademarks
