import { useContext, useState, useEffect } from 'react'
import { Page, Block, Navbar, List, ListItem, NavRight, Link, Searchbar, Toolbar } from 'framework7-react'
import Footer from './footer'
import moment from 'moment'
import 'moment/locale/ar'
import { StoreContext } from '../data/store'
import labels from '../data/labels'

const Customers = () => {
  const { state, user } = useContext(StoreContext)
  const [customers, setCustomers] = useState([])
  useEffect(() => {
    setCustomers(() => [...state.customers].sort((c1, c2) => c2.time.seconds - c1.time.seconds))
  }, [state.customers])

  if (!user) return <Page><h3 className="center"><a href="/login/">{labels.relogin}</a></h3></Page>
  return(
    <Page>
      <Navbar title={labels.customers} backLink={labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-inner"
          clearButton
          expandable
          placeholder={labels.search}
        />
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {customers.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : customers.map(c => 
              <ListItem
                link={`/customer-details/${c.id}`}
                title={c.name}
                subtitle={moment(c.time.toDate()).fromNow()}
                badge={c.isBlocked ? labels.isBlocked : ''}
                badgeColor="red"
                key={c.id}
              />
            )
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Footer/>
      </Toolbar>
    </Page>
  )
}

export default Customers
