import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'


const Trademarks = props => {
  const { state } = useContext(StoreContext)
  const trademarks = useMemo(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1), [state.trademarks])

  return (
    <Page>
      <Navbar title={labels.trademarks} backLink={labels.back} />
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/addTrademark/">
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List>
          {trademarks.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : trademarks.map(t =>
              <ListItem 
                link={`/editTrademark/${t.id}`}
                title={t.name} 
                key={t.id} 
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
