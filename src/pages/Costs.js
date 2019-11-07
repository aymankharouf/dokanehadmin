import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const Costs = props => {
  const { state } = useContext(StoreContext)
  const costs = useMemo(() => state.costs.sort((rec1, rec2) => rec2.time.seconds - rec1.time.seconds), [state.costs])
  return(
    <Page>
      <Navbar title={state.labels.costs} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {costs && costs.map(cost => {
            return (
              <ListItem
                link={`/editCost/${cost.id}`}
                title={state.costTypes.find(rec => rec.id === cost.type).name}
                after={(cost.value / 1000).toFixed(3)}
                subtitle={moment(cost.time.toDate()).fromNow()}
                key={cost.id}
              />
            )
          }
          )}
          {costs.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addCost/')}>
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Costs
