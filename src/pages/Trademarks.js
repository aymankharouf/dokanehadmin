import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Trademarks = props => {
  const { state } = useContext(StoreContext)
  const trademarks = useMemo(() => [...state.trademarks].sort((t1, t2) => t1.name > t2.name ? 1 : -1), [state.trademarks])

  return (
    <Page>
      <Navbar title={state.labels.trademarks} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="green" href="/addTrademark/">
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List>
          {trademarks && trademarks.map(t =>
            <ListItem 
              link={`/editTrademark/${t.id}`}
              title={t.name} 
              key={t.id} 
            />
          )}
          {trademarks.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Trademarks
