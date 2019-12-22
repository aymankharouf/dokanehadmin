import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';

const Prices = props => {
  const { state } = useContext(StoreContext)
  const stores = useMemo(() => [...state.stores].sort((s1, s2) => s1.name > s2.name ? 1 : -1)
  , [state.stores])

  return (
    <Page>
      <Navbar title={state.labels.prices} backLink={state.labels.back} />
      <Block>
        <List>
          {stores.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : stores.map(s =>
              <ListItem 
                link={`/storePacks/${s.id}`} 
                title={s.name} 
                key={s.id} 
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

export default Prices
