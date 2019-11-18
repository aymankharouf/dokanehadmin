import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const Locations = props => {
  const { state } = useContext(StoreContext)
  const locations = useMemo(() => [...state.locations].sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1)
  , [state.locations])

  return (
    <Page>
      <Navbar title={state.labels.locations} backLink={state.labels.back} />
      <Block>
        <List>
          {locations && locations.map(rec =>
            <ListItem
              link={`/editLocation/${rec.id}`}
              title={rec.name}
              after={(rec.deliveryFees / 1000).toFixed(3)}
              key={rec.id}
            />
          )}
          {locations.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addLocation/')}>
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Locations
