import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, NavRight, Link, Searchbar} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/Store';


const CustomersList = props => {
  const { state } = useContext(StoreContext)
  const typeName = useMemo(() => props.id === 'a' ? state.labels.allCustomers : state.customerTypes.find(rec => rec.id === props.id).name, [state.customerTypes])
  const customers = useMemo(() => {
    let customers = state.customers.filter(rec => props.id === 'a' ? true : rec.type === props.id)
    customers = customers.map(customer => {
      const userInfo = state.users.find(rec => rec.id === customer.id)
      return {
        ...customer,
        name: userInfo.name,
        mobile: userInfo.mobile,
        time: userInfo.time
      }
    })
    return customers.sort((rec1, rec2) => rec2.time.seconds - rec1.time.seconds)
  }, [state.customers, state.users]) 
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
          {customers && customers.map(customer => 
            <ListItem
              link={`/customer/${customer.id}`}
              title={`${customer.name} - ${customer.mobile}`}
              subtitle={moment(customer.time.toDate()).fromNow()}
              key={customer.id}
              badge={customer.isActive === false ? state.labels.inActive : ''}
              badgeColor='red' 
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
