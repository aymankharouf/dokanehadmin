import React, { useContext, useMemo } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge } from 'framework7-react'
import { StoreContext } from '../data/Store';
import ReLogin from './ReLogin'

const Stock = props => {
  const { state, user } = useContext(StoreContext)
  const storePacks = useMemo(() => {
    let storePacks = state.packs.filter(p => p.stores.find(s => s.storeId === 's'))
    storePacks = storePacks.map(p => {
      const productInfo = state.products.find(pr => pr.id === p.productId)
      const stockInfo = p.stores.find(s => s.storeId === 's')
      return {
        id: p.id,
        productName: productInfo.name,
        country: productInfo.country,
        name: p.name,
        quantity: stockInfo.quantity,
        price: stockInfo.price,
        purchasePrice: stockInfo.purchasePrice,
        time: stockInfo.time,
        imageUrl: productInfo.imageUrl
      }
    })
    return storePacks.sort((p1, p2) => p1.time.seconds - p2.time.seconds)
    }, [state.packs, state.products])
  if (!user) return <ReLogin callingPage="stock"/>
  return(
    <Page>
      <Navbar title={state.labels.stock} backLink={state.labels.back}>
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
          {storePacks.map(p => 
            <ListItem
              link={`/packTrans/${p.id}`}
              title={p.productName}
              after={(p.purchasePrice / 1000).toFixed(3)}
              subtitle={p.name}
              text={`${state.labels.productOf} ${state.countries.find(c => c.id === p.country).name}`}
              key={p.id}
            >
              <img slot="media" src={p.imageUrl} className="lazy lazy-fadeIn avatar" alt={p.productName} />
              {p.quantity > 0 ? <Badge slot="title" color="red">{p.quantity}</Badge> : ''}
            </ListItem>
          )}
          {storePacks.length === 0 ? <ListItem title={state.labels.noData} /> : ''}
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
