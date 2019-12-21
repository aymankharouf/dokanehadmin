import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge } from 'framework7-react'
import { StoreContext } from '../data/Store';
import ReLogin from './ReLogin'

const Stock = props => {
  const { state, user } = useContext(StoreContext)
  const storePacks = useMemo(() => {
    let storePacks = state.storePacks.filter(p => p.storeId === 's')
    return storePacks.sort((p1, p2) => p1.time.seconds - p2.time.seconds)
    }, [state.storePacks])
  if (!user) return <ReLogin />
  return(
    <Page>
      <Navbar title={state.labels.stock} backLink={state.labels.back} className="page-title">
        <NavRight>
          <Link searchbarEnable=".searchbar" iconMaterial="search" />
        </NavRight>
        <Searchbar
          className="searchbar"
          searchContainer=".search-list"
          searchIn=".item-title, .item-subtitle"
          clearButton
          expandable
          placeholder={state.labels.search}
        ></Searchbar>
      </Navbar>
      <Block>
        <List className="searchbar-not-found">
          <ListItem title={state.labels.noData} />
        </List>
        <List mediaList className="search-list searchbar-found">
          {storePacks.length === 0 ? 
            <ListItem title={state.labels.noData} /> 
          : storePacks.map(p => {
              const packInfo = state.packs.find(pa => pa.id === p.packId)
              const productInfo = state.products.find(pr => pr.id === packInfo.productId)
              return (
                <ListItem
                  link={`/stockPackTrans/${p.packId}`}
                  title={productInfo.name}
                  after={(p.cost / 1000).toFixed(3)}
                  subtitle={packInfo.name}
                  text={`${state.labels.productOf} ${state.countries.find(c => c.id === productInfo.countryId).name}`}
                  key={p.id}
                >
                  <img slot="media" src={productInfo.imageUrl} className="img-list" alt={productInfo.name} />
                  {p.quantity > 0 ? <Badge slot="title" color="red">{p.quantity}</Badge> : ''}
                </ListItem>
              )
            })
          }
        </List>
      </Block>
      <Toolbar bottom>
        <Link href="/home/" iconMaterial="home" />
        <Link href="/stockTrans/" iconMaterial="layers" />
      </Toolbar>
    </Page>
  )
}

export default Stock
