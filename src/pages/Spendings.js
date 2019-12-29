import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './BottomToolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'


const Spendings = props => {
  const { state } = useContext(StoreContext)
  const spendings = useMemo(() => [...state.spendings].sort((s1, s2) => s2.time.seconds - s1.time.seconds)
  , [state.spendings])
  return(
    <Page>
      <Navbar title={state.labels.spendings} backLink={state.labels.back} />
      <Block>
        <List mediaList>
          {spendings.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : spendings.map(s => {
              return (
                <ListItem
                  link={`/editSpending/${s.id}`}
                  title={state.spendingTypes.find(t => t.id === s.type).name}
                  subtitle={moment(s.time.toDate()).fromNow()}
                  after={(s.spendingAmount / 1000).toFixed(3)}
                  key={s.id}
                />
              )
            })
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/addSpending/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Spendings
