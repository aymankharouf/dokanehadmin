import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Trademarks = props => {
  const { state } = useContext(StoreContext)
  const trademarks = useMemo(() => [...state.trademarks].sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1), [state.trademarks])

  return (
    <Page>
      <Navbar title={state.labels.trademarks} backLink={state.labels.back} />
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addTrademark/')}>
        <Icon material="add"></Icon>
      </Fab>
      <Block>
        <List>
          {trademarks && trademarks.map(rec =>
            <ListItem 
              link={`/editTrademark/${rec.id}`}
              title={rec.name} 
              key={rec.id} 
              badge={rec.isActive === false ? state.labels.inActive : ''}
              badgeColor='red' 
            />
          )}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Trademarks
