import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const Spendings = props => {
  const { state } = useContext(StoreContext)
  const spendings = useMemo(() => [...state.spendings].sort((rec1, rec2) => rec2.time.seconds - rec1.time.seconds), [state.costs])
  return(
    <Page>
      <Navbar title={state.labels.spendings} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {spendings && spendings.map(spending => {
            return (
              <ListItem
                link={`/editSpending/${spending.id}`}
                title={state.spendingTypes.find(rec => rec.id === spending.type).name}
                after={(spending.spendingAmount / 1000).toFixed(3)}
                subtitle={moment(spending.time.toDate()).fromNow()}
                key={spending.id}
              />
            )
          }
          )}
          {spendings.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" onClick={() => props.f7router.navigate('/addSpending/')}>
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Spendings
