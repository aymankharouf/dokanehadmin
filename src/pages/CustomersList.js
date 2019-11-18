import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Link, Searchbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const CustomersList = props => {
  const { state } = useContext(StoreContext)
  const typeName = useMemo(() => props.id === 'a' ? state.labels.allCustomers : state.customerTypes.find(t => t.id === props.id).name
  , [state.customerTypes, state.labels, props.id])
  const customers = useMemo(() => {
    let customers = state.customers.filter(c => props.id === 'a' ? true : c.type === props.id)
    customers = customers.map(c => {
      const userInfo = state.users.find(u => u.id === c.id)
      return {
        ...c,
        name: userInfo.name,
        mobile: userInfo.mobile,
        time: userInfo.time
      }
    })
    return customers.sort((c1, c2) => c2.time.seconds - c1.time.seconds)
  }, [state.customers, state.users, props.id]) 
  return(
    <Page>
      <Navbar title={`${state.labels.customers} - ${typeName}`} backLink={state.labels.back} >
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
          {customers && customers.map(c => 
            <ListItem
              link={`/customer/${c.id}`}
              title={`${c.name} - ${c.mobile}`}
              subtitle={moment(c.time.toDate()).fromNow()}
              key={c.id}
            />
          )}
          {customers.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
        </List>
      </Block>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default CustomersList
