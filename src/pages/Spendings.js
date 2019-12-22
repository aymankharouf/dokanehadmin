import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const Spendings = props => {
  const { state } = useContext(StoreContext)
  const spendings = useMemo(() => [...state.spendings].sort((s1, s2) => s2.time.seconds - s1.time.seconds)
  , [state.spendings])
  return(
    <Page>
      <Navbar title={state.labels.spendings} backLink={state.labels.back} className="page-title" />
      <Block>
        <List mediaList>
          {spendings.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : spendings.map(s => {
              return (
                <ListItem
                  link={`/editSpending/${s.id}`}
                  title={state.spendingTypes.find(t => t.id === s.type).name}
                  after={(s.spendingAmount / 1000).toFixed(3)}
                  key={s.id}
                  className= "list-title"
                >
                  <div className="list-line1">{moment(s.time.toDate()).fromNow()}</div>
                </ListItem>
              )
            })
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" href="/addSpending/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Spendings
