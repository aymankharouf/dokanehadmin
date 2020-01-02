import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Fab, Icon } from 'framework7-react'
import BottomToolbar from './bottom-toolbar'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'
import { spendingTypes } from '../data/config'

const Spendings = props => {
  const { state } = useContext(StoreContext)
  const spendings = useMemo(() => {
    const spendings = state.spendings.map(s => {
      const spendingTypeInfo = spendingTypes.find(t => t.id === s.type)
      return {
        ...s,
        spendingTypeInfo
      }
    })
    return spendings.sort((s1, s2) => s2.time.seconds - s1.time.seconds)
  }, [state.spendings])
  return(
    <Page>
      <Navbar title={labels.spendings} backLink={labels.back} />
      <Block>
        <List mediaList>
          {spendings.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : spendings.map(s => {
              return (
                <ListItem
                  link={`/edit-spending/${s.id}`}
                  title={s.spendingTypeInfo.name}
                  subtitle={moment(s.time.toDate()).fromNow()}
                  after={(s.spendingAmount / 1000).toFixed(3)}
                  key={s.id}
                />
              )
            })
          }
        </List>
      </Block>
      <Fab position="left-top" slot="fixed" color="green" className="top-fab" href="/add-spending/">
        <Icon material="add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Spendings
