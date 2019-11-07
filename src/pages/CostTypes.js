import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';


const CostTypes = props => {
  const { state } = useContext(StoreContext)
  const costTypes = useMemo(() => [...state.costTypes].sort((rec1, rec2) => rec1.name > rec2.name ? 1 : -1), [state.countries])

  return (
    <Page>
      <Navbar title={state.labels.costTypes} backLink={state.labels.back} />
      <Block>
        <List>
          {costTypes && costTypes.map(rec =>
            <ListItem
              link={`/editCostType/${rec.id}`}
              title={rec.name} 
              key={rec.id}
            />
          )}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addCostType/')}>
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default CostTypes
