import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link } from 'framework7-react'
import { StoreContext } from '../data/store'
import ReLogin from './relogin'
import PackImage from './pack-image'
import { quantityText } from '../data/actions'
import labels from '../data/labels'

const Stock = props => {
  const { state, user } = useContext(StoreContext)
  const storePacks = useMemo(() => {
    let storePacks = state.storePacks.filter(p => p.storeId === 's')
    return storePacks.sort((p1, p2) => p1.time.seconds - p2.time.seconds)
    }, [state.storePacks])
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={labels.stock} backLink={labels.back}>
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search" />
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-title, .item-subtitle"
          clearButton
          expandable
          placeholder={labels.search}
        ></Searchbar>
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {storePacks.length === 0 ? 
            <ListItem title={labels.noData} /> 
          : storePacks.map(p => {
              const packInfo = state.packs.find(pa => pa.id === p.packId)
              const productInfo = state.products.find(pr => pr.id === packInfo.productId)
              return (
                <ListItem
                  link={`/stock-pack-trans/${p.packId}`}
                  title={productInfo.name}
                  subtitle={packInfo.name}
                  text={`${labels.productOf} ${state.countries.find(c => c.id === productInfo.countryId).name}`}
                  footer={`${labels.quantity}: ${quantityText(p.quantity)}`}
                  after={(p.cost / 1000).toFixed(3)}
                  key={p.id}
                >
                  <PackImage slot="media" pack={packInfo} type="list" />
                </ListItem>
              )
            })
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link href="/stock-trans/" iconMaterial="layers" />
      </Toolbar>
    </Page>
  )
}

export default Stock
