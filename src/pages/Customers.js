import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Link, Searchbar, Badge } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const Customers = props => {
  const { state } = useContext(StoreContext)
  const customers = useMemo(() => [...state.customers].sort((c1, c2) => c2.time.seconds - c1.time.seconds)
  , [state.customers]) 
  return(
    <Page>
      <Navbar title={state.labels.customers} backLink={state.labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-title, .item-subtitle"
          clearButton
          expandable
          placeholder={state.labels.search}
        />
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={state.labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {customers.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : customers.map(c => {
              const userInfo = state.users.find(u => u.id === c.id)
              return (
                <ListItem
                  link={`/customer/${c.id}/full/1`}
                  title={`${state.labels.user}: ${userInfo.name}`}
                  key={c.id}
                >
                  <div className="list-line1">{`${state.labels.mobile}: ${userInfo.mobile}`}</div>
                  <div className="list-line2">{moment(c.time.toDate()).fromNow()}</div>
                  {c.isBlocked ? <Badge slot="after" color='red'>{state.labels.isBlocked}</Badge> : ''}
                </ListItem>
              )
            })
          }
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default Customers
