import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Locations = props => {
  const { state } = useContext(StoreContext)
  const locations = useMemo(() => [...state.locations].sort((l1, l2) => l1.sorting - l2.sorting)
  , [state.locations])

  return (
    <Page>
      <Navbar title={state.labels.locations} backLink={state.labels.back} className="page-title" />
      <Block>
        <List>
          {locations && locations.map(l =>
            <ListItem
              link={`/editLocation/${l.id}`}
              title={l.name}
              after={(l.deliveryFees / 1000).toFixed(3)}
              key={l.id}
            />
          )}
          {locations.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" href="/addLocation/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Locations
