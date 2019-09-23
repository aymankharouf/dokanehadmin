import React, { useContext } from 'react'
import { Block, Fab, Icon, Page, Navbar, List, ListItem, Toolbar, Searchbar, NavRight, Link, Badge, FabButton, FabButtons } from 'framework7-react'
import BottomToolbar from './BottomToolbar';
import { StoreContext } from '../data/Store';
import moment from 'moment'
import 'moment/locale/ar'

const StorePacks = props => {
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
              link={`/storePack/${store.id}/pack/${pack.id}`}
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
      <Fab position="left-bottom" slot="fixed" color="orange">
        <Icon ios="f7:chevron_up" aurora="f7:chevron_up" md="material:keyboard_arrow_up"></Icon>
        <Icon ios="f7:close" aurora="f7:close" md="material:close"></Icon>
        <FabButtons position="top">
          <FabButton color="blue" onClick={() => props.f7router.navigate(`/editStore/${props.id}`)}>
            <Icon ios="f7:edit" aurora="f7:edit" md="material:edit"></Icon>
          </FabButton>
          <FabButton color="green" onClick={() => props.f7router.navigate(`/addStorePack/${props.id}`)}>
            <Icon ios="f7:add" aurora="f7:add" md="material:add"></Icon>
          </FabButton>
        </FabButtons>
      </Fab>

      <Toolbar bottom>
        <BottomToolbar/>
      </Toolbar>
    </Page>
  )
}

export default StorePacks
