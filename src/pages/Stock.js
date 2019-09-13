import React, { useContext } from 'react'
import { Block, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge, Icon } from 'framework7-react'
import { StoreContext } from '../data/Store';
import ReLogin from './ReLogin'

const Stock = props => {
  const { state, user } = useContext(StoreContext)
  if (!user) return <ReLogin callingPage="stock"/>
  let storePacks = state.packs.filter(pack => pack.stores.find(store => store.id === 's'))
  storePacks = storePacks.map(pack => {
    const productInfo = state.products.find(rec => rec.id === pack.productId)
    return {
      id: pack.id,
      productName: productInfo.name,
      country: productInfo.country,
      name: pack.name,
      quantity: pack.stores.find(rec => rec.id === 's').quantity,
      price: pack.stores.find(rec => rec.id === 's').price,
      purchasePrice: pack.stores.find(rec => rec.id === 's').purchasePrice,
      time: pack.stores.find(rec => rec.id === 's').time,
      imageUrl: productInfo.imageUrl
    }
  })
  storePacks.sort((pack1, pack2) => pack1.time.seconds - pack2.time.seconds)
  return(
    <Page>
      <Navbar title={state.labels.stock} backLink="Back">
        <NavRight>
          <Link searchbarEnable=".searchbar-demo" iconIos="f7:search" iconAurora="f7:search" iconMd="material:search"></Link>
        </NavRight>
        <Searchbar
          className="searchbar-demo"
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
          {storePacks.map(pack => 
            <ListItem
              link={`/packTrans/${pack.id}`}
              title={pack.productName}
              after={(pack.purchasePrice / 1000).toFixed(3)}
              subtitle={pack.name}
              text={`${state.labels.productOf} ${state.countries.find(rec => rec.id === pack.country).name}`}
              key={pack.id}
            >
              <img slot="media" src={pack.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
              <Badge slot="title" color="red">{pack.quantity}</Badge>
            </ListItem>
          )}
          {storePacks.length === 0 ? <ListItem title={state.labels.noData} /> : null}
        </List>
      </Block>
      <Toolbar bottom>
      <Link href='/home/'>
          <Icon ios='f7:home' aurora='f7:home' md='material:home' />
        </Link>
        <Link href='/stockTrans/'>
          <Icon ios='f7:layers_alt_fill' aurora='f7:layers_alt_fill' md='material:layers' />
        </Link>
      </Toolbar>
    </Page>
  )
}

export default Stock
