import React, { useContext } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge} from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const StoreProducts = props => {
  const { state } = useContext(StoreContext)
  let storePacks = state.packs.filter(pack => pack.stores.find(store => store.id === props.id))
  storePacks = storePacks.map(pack => {
    const productInfo = state.products.find(rec => rec.id === pack.productId)
    return {
      id: pack.id,
      productName: productInfo.name,
      name: pack.name,
      isNew: productInfo.isNew,
      isOffer: pack.isOffer,
      price: pack.stores.find(rec => rec.id === props.id).price,
      time: pack.stores.find(rec => rec.id === props.id).time,
      imageUrl: productInfo.imageUrl
    }
  })
  storePacks.sort((pack1, pack2) => pack2.time.seconds - pack1.time.seconds)
  const store = state.stores.find(store => store.id === props.id)
  return(
    <Page>
      <Navbar title={`${store.name}`} backLink="Back">
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
              link={`/storeProduct/${store.id}/pack/${pack.id}`}
              title={pack.productName}
              after={(pack.price / 1000).toFixed(3)}
              subtitle={pack.name}
              text={moment(pack.time.toDate()).fromNow()}
              key={pack.id}
            >
              <img slot="media" src={pack.imageUrl} width="80" className="lazy lazy-fadeIn demo-lazy" alt=""/>
              {pack.isNew ? <Badge slot="title" color='red'>{state.labels.new}</Badge> : null}
              {pack.isOffer ? <Badge slot="title" color='green'>{state.labels.offer}</Badge> : null}
            </ListItem>
          )}
          {storePacks.length === 0 ? <ListItem title={state.labels.noData} /> : null}
        </List>
      </Block>
      <Fab position="right-bottom" slot="fixed" color="pink" onClick={() => props.f7router.navigate(`/addStorePack/${props.id}`)}>
        <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
      </Fab>
      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StoreProducts
